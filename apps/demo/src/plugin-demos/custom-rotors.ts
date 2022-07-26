import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedCustomRotors } from '@demo/shared';
import {} from '@nativescript/custom-rotors';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedCustomRotors {}
