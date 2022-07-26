import { Component, NgZone } from '@angular/core';
import { DemoSharedCustomRotors } from '@demo/shared';
import {} from '@nativescript/custom-rotors';

@Component({
  selector: 'demo-custom-rotors',
  templateUrl: 'custom-rotors.component.html',
})
export class CustomRotorsComponent {
  demoShared: DemoSharedCustomRotors;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedCustomRotors();
  }
}
