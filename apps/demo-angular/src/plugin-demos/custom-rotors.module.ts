import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { CustomRotorsComponent } from './custom-rotors.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: CustomRotorsComponent }])],
  declarations: [CustomRotorsComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CustomRotorsModule {}
