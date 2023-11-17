import { NgModule } from '@angular/core';
import { UppercaseDirective } from './uppercase.directive';
import { NoWhitespaceDirective } from './no-whitespace.directive';
import { NumberOnlyDirective } from './number-only.directive';


@NgModule({
  imports: [],
  declarations: [UppercaseDirective,NoWhitespaceDirective,NumberOnlyDirective],
  exports: [UppercaseDirective,NoWhitespaceDirective,NumberOnlyDirective]
})
export class DirectivesModule { }