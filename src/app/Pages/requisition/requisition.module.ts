import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequisitionRoutingModule } from './requisition-routing.module';
import { RequisitionslistComponent } from './requisitionslist/requisitionslist.component';
import { RequisitionNewComponent } from './requisition-new/requisition-new.component';
import { SidenaviRightComponent } from './sidenavi-right/sidenavi-right.component';
import { SideNavService } from './sidenavi-right/sidenavi-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DirectivesModule } from 'src/app/directives.module';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModule } from 'src/app/app.material.module';
import { RfqlistComponent } from './rfqlist/rfqlist.component';
import { RequisitionTrackingComponent } from './requisition-tracking/requisition-tracking.component';
import { OrderRefPopUpViewComponent } from './requisition-new/common/order-ref-pop-up-view/order-ref-pop-up-view.component';
import { OrderRefDirectPopUpComponent } from './requisition-new/common/order-ref-direct-pop-up/order-ref-direct-pop-up.component';
import { EditReqQtyComponent } from './requisition-new/common/edit-req-qty/edit-req-qty.component';
import { MatTreeModule } from '@angular/material/tree';

@NgModule({
  declarations: [
    RequisitionslistComponent,
    RequisitionNewComponent,
    SidenaviRightComponent,
    RfqlistComponent,
    RequisitionTrackingComponent,
    OrderRefPopUpViewComponent,
    OrderRefDirectPopUpComponent,
    EditReqQtyComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RequisitionRoutingModule,
    MatTreeModule,
    FormsModule, ReactiveFormsModule, DirectivesModule, HttpClientModule, AppMaterialModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [
    SideNavService
  ]
})
export class RequisitionModule { }
