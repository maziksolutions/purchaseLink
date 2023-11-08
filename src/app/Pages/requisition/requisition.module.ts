import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequisitionRoutingModule } from './requisition-routing.module';
import { RequisitionslistComponent } from './requisitionslist/requisitionslist.component';
import { RequisitionNewComponent } from './requisition-new/requisition-new.component';


@NgModule({
  declarations: [
    RequisitionslistComponent,
    RequisitionNewComponent
  ],
  imports: [
    CommonModule,
    RequisitionRoutingModule
  ]
})
export class RequisitionModule { }
