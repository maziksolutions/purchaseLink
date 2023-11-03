import { NgModule } from '@angular/core';
import { UppercaseDirective } from './uppercase.directive';
import { NoWhitespaceDirective } from './no-whitespace.directive';

@NgModule({
  imports: [],
  declarations: [UppercaseDirective,NoWhitespaceDirective],
  exports: [UppercaseDirective,NoWhitespaceDirective]
})
export class DirectivesModule { }