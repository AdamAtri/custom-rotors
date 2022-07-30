import { Page, NavigatedData, GridLayout, View, ContentView, LayoutBase } from '@nativescript/core';

export function navigatingTo(d: NavigatedData): void {
  const page = d.object as Page;
  page.rotorGroupCallbacks.set('group1', highlightSelected.bind(null, page));
  page.rotorGroupCallbacks.set('group2', highlightSelected.bind(null, page));
  page.rotorGroupCallbacks.set('group3', highlightSelected.bind(null, page));
  page.rotorGroupCallbacks.set('rating', ({ forward }) => {
    clearSelected(page);
    console.log('rating rotorgroup callback ', forward, 'hmm');
    incrementOrDecrementRating(d.object as any, forward);
  });
}

let rating = 0;
function incrementOrDecrementRating(page: Page, increment: boolean): void {
  rating = increment ? Math.min(rating + 1, 5) : Math.max(0, rating - 1);
  const ratingBar = page.getViewById('rating-bar') as GridLayout;
  for (let i = 0; i < ratingBar.getChildrenCount(); i++) {
    const view = ratingBar.getChildAt(i);
    view.backgroundColor = i < rating ? 'green' : 'transparent';
  }
}

function clearSelected(view: View): boolean {
  if (view instanceof ContentView) clearSelected(view.content);
  else if (view instanceof LayoutBase) {
    view.eachChildView((v) => clearSelected(v));
  } else if (view) view.deletePseudoClass('selected');
  return true;
}

function highlightSelected(page: Page, { newView }): void {
  clearSelected(page);
  if (newView) (<View>newView).addPseudoClass('selected');
}
