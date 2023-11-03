import { Directive } from '@angular/core';
import {
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';

@Directive({
  selector: '[noWhiteSpace]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: NoWhitespaceDirective, multi: true },
  ],
})
export class NoWhitespaceDirective implements Validator {
  constructor() {}

  validate(control: AbstractControl): ValidationErrors {
    if (!control.value || control.value.trim() == '') {
      return { required: true };
    }
    return null as any;
  }
}