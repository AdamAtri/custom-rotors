import { Observable } from '@nativescript/core';

export class CustomRotorsCommon extends Observable {}

import { ContentView, isIOS, LayoutBase, Property, View, ViewBase } from '@nativescript/core';

export type RotorContainerView = ContentView | LayoutBase;

type Class = new (...args: any[]) => {};

/**
 * @override
 * Add `rotorGroup` property to ViewBase.
 * Set the name of the rotorGroup that this view is a part of
 */

export const rotorGroupProperty = new Property<ViewBase, string>({
  name: 'rotorGroup',
  defaultValue: undefined,
});
rotorGroupProperty.register(ViewBase);
export const rotorOrderProperty = new Property<ViewBase, number>({
  name: 'rotorOrder',
  defaultValue: -1,
});
rotorOrderProperty.register(ViewBase);

/**
 * @override
 * Add `rotorContainer` property to ContentView
 * Mark any ContentView, specifically Page, as a "rotorContainer"
 */
export const lb_rotorContainerProperty = new Property<LayoutBase, boolean>({
  name: 'rotorContainer',
  defaultValue: false,
  valueConverter: (value: string): boolean => {
    return value?.toLowerCase() === 'true';
  },
});
lb_rotorContainerProperty.register(LayoutBase);
export const cv_rotorContainerProperty = new Property<ContentView, boolean>({
  name: 'rotorContainer',
  defaultValue: false,
  valueConverter: (value: string): boolean => {
    return value?.toLowerCase() === 'true';
  },
});
cv_rotorContainerProperty.register(ContentView);

/**
 * @function initializeCustomRotors
 * This is the ONLY function that needs to be called.
 * MUST be called in app.ts
 */
export function initializeCustomRotors(): void {
  // define 'rotorGroup' on ViewBase
  Object.defineProperty(ViewBase.prototype, 'rotorGroup', {
    value: undefined,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(ViewBase.prototype, 'rotorOrder', {
    value: -1,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  // define the {N} property for 'rotorGroup'
  ViewBase.prototype[rotorGroupProperty.setNative] = function rotorGroupPropSetNative(value: string): void {
    if (!isIOS) return;
    const iosView = this.nativeViewProtected as UIView;
    iosView.setValueForKey(value, 'rotorGroup');
  };

  // define 'rotorContainer' on LayoutBase
  function removeRotorItem(item: ViewBase): boolean {
    if (!this.rotorGroups || !this.rotorGroups[item.rotorGroup]) return false;
    const group = this.rotorGroups[item.rotorGroup] as Array<ViewBase>;
    if (group.indexOf(item) < 0) return false;
    group.splice(group.indexOf(item), 1);
    return true;
  }
  function insertRotorItem(item: ViewBase, index: number = 0): boolean {
    if (!this.rotorGroups || !this.rotorGroups[item.rotorGroup]) return false;
    const group = this.rotorGroups[item.rotorGroup] as Array<ViewBase>;
    if (group.indexOf(item) > -1) return false;
    else group.splice(index, 0, item);
    return true;
  }
  const containerName = 'rotorContainer';
  const containerProp = {
    value: false,
    enumerable: true,
    configurable: true,
    writable: true,
  };
  const groupsName = 'rotorGroups';
  const groupsProp = {
    value: undefined,
    enumerable: true,
    configurable: true,
    writable: true,
  };
  const removeFun = 'removeRotorItem';
  const insertFun = 'insertRotorItem';

  Object.defineProperty(LayoutBase.prototype, containerName, containerProp);
  Object.defineProperty(LayoutBase.prototype, groupsName, groupsProp);
  LayoutBase.prototype[removeFun] = removeRotorItem;
  LayoutBase.prototype[insertFun] = insertRotorItem;

  Object.defineProperty(ContentView.prototype, containerName, containerProp);
  Object.defineProperty(ContentView.prototype, groupsName, groupsProp);
  ContentView.prototype[removeFun] = removeRotorItem;
  ContentView.prototype[insertFun] = insertRotorItem;

  /**
   * @override
   * Override the "onLoaded" function of LayoutBase to create the custom rotor actions
   */
  function prototypeAsRotorContainer(cls: Class): void {
    const _onLoaded = cls.prototype.onLoaded;
    Object.defineProperty(cls.prototype, 'onLoaded', {
      value: function onLoaded(): void {
        _onLoaded.call(this);
        setTimeout(() => {
          // console.log(this.constructor.name, this.rotorContainer);
          if (!isIOS || !this.rotorContainer) return;
          setupRotorGroups(this);
          const nativeContent = this.nativeViewProtected as UIView;
          nativeContent.isAccessibilityElement = false;
          setTimeout(() => {
            UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, nativeContent);
          });
        });
      },
    });
  }
  prototypeAsRotorContainer(ContentView);
  prototypeAsRotorContainer(LayoutBase);
}

/**
 * @function setupRotorGroups
 * Creates rotor groups for descrete navigation
 */
function setupRotorGroups(container: RotorContainerView): void {
  const rotorGroups = {};
  recurseChildrenForRotorGroups(container, rotorGroups);
  recurseParentsForPrevious(container, rotorGroups);
  sortRotorGroups(rotorGroups);
  container.rotorGroups = rotorGroups;
  //console.log(Object.keys(rotorGroups));

  const rotors: NSMutableArray<UIAccessibilityCustomRotor> = NSMutableArray.new();
  Object.keys(rotorGroups).forEach((key) => {
    const rotor = UIAccessibilityCustomRotor.alloc().initWithNameItemSearchBlock(key, (predicate: UIAccessibilityCustomRotorSearchPredicate): UIAccessibilityCustomRotorItemResult => {
      const rotorItems = (<Array<View>>container.rotorGroups[key]).filter((item: View) => item.visibility === 'visible').map((item) => item.nativeViewProtected);
      if (rotorItems.length <= 0) return null;
      const forward = predicate.searchDirection == UIAccessibilityCustomRotorDirection.Next;
      const currentView = predicate.currentItem.targetElement as UIView;
      const currentIndex = rotorItems.indexOf(currentView);
      let nextIndex = forward ? currentIndex + 1 : currentIndex - 1;
      let target;
      if (nextIndex > rotorItems.length || nextIndex < 0) target = null;
      else target = rotorItems[nextIndex];
      return UIAccessibilityCustomRotorItemResult.alloc().initWithTargetElementTargetRange(target, null);
    });
    rotors.addObject(rotor);
  });
  (<UIView>container.nativeViewProtected).accessibilityCustomRotors = rotors;
}
/**
 * @function recurseChildrenForRotorGroups
 * recursive function to find all children in a ContentView that belong to a rotorGroup
 */
function recurseChildrenForRotorGroups(vb: ViewBase, rotorGroups: any): boolean {
  if (vb?.rotorGroup) {
    // console.log('add to rotorGroup', vb.constructor.name, vb.rotorGroup);
    if (rotorGroups[vb.rotorGroup] == undefined) rotorGroups[vb.rotorGroup] = [];
    rotorGroups[vb.rotorGroup].push(vb);
  }
  if (vb instanceof LayoutBase) vb.eachChild((child) => recurseChildrenForRotorGroups(child, rotorGroups));
  else if (vb instanceof ContentView) {
    recurseChildrenForRotorGroups(vb.content, rotorGroups);
  }
  return true;
}
function recurseParentsForPrevious(vb: ViewBase, rotorGroups: any): boolean {
  let parent = vb.parent;
  while (parent) {
    if (parent instanceof LayoutBase && parent.rotorContainer) {
      rotorGroups['previous'] = [parent];
      return true;
    }
    parent = parent.parent;
  }
  return false;
}
/***
 * @function sortRotorGroups
 */
function sortRotorGroups(rotorGroups: any): void {
  Object.keys(rotorGroups).forEach((key) => {
    const group = rotorGroups[key] as Array<ViewBase>;
    group.sort((v1, v2) => {
      if (v1.rotorOrder > v2.rotorOrder) return 1;
      if (v1.rotorOrder < v2.rotorOrder) return -1;
      return 0;
    });
  });
}
