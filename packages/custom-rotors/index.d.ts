import { CustomRotorsCommon } from './common';

export declare class CustomRotors extends CustomRotorsCommon {}

export declare function initializeCustomRotors(): void;

export declare module '@nativescript/core/ui/core/view-base' {
  export interface ViewBase {
    rotorGroup: string;
  }
}
export declare module '@nativescript/core/ui/layouts/layout-base' {
  export interface LayoutBase {
    rotorContainer: boolean;
  }
}
