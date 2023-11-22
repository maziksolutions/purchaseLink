import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequisitionRoutingModule } from './requisition-routing.module';
import { RequisitionslistComponent } from './requisitionslist/requisitionslist.component';
import { RequisitionNewComponent } from './requisition-new/requisition-new.component';
import { SidenaviRightComponent } from './sidenavi-right/sidenavi-right.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SideNavService } from './sidenavi-right/sidenavi-service';


@NgModule({
  declarations: [
    RequisitionslistComponent,
    RequisitionNewComponent,
    SidenaviRightComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RequisitionRoutingModule
  ],
  providers:[
    SideNavService
  ]
})
export class RequisitionModule { }
