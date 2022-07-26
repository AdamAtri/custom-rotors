import { Application } from '@nativescript/core';
import { initializeCustomRotors } from '@nativescript/custom-rotors';

initializeCustomRotors();

Application.run({ moduleName: 'app-root' });
