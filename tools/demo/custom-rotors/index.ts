import { DemoSharedBase } from '../utils';
import { EventData } from '@nativescript/core';

export class DemoSharedCustomRotors extends DemoSharedBase {
  testIt(e: EventData) {
    console.log((<any>e.object).text);
  }
}
