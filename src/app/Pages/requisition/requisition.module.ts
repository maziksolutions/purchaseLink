import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { RequisitionRoutingModule } from './requisition-routing.module';
import { RequisitionslistComponent } from './requisitionslist/requisitionslist.component';
import { RequisitionNewComponent } from './requisition-new/requisition-new.component';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { SideNavService } from 'src/app/services/sidenavi-service';
import { SharedModule } from '../Shared/shared.module';
import { ModifyColumnsPopUpComponent } from './requisition-new/common/modify-columns-pop-up/modify-columns-pop-up.component';

@NgModule({
  declarations: [
    RequisitionslistComponent,
    RequisitionNewComponent,
    RfqlistComponent,
    RequisitionTrackingComponent,
    OrderRefPopUpViewComponent,
    OrderRefDirectPopUpComponent,
    EditReqQtyComponent,
    ModifyColumnsPopUpComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RequisitionRoutingModule,
    MatTreeModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatInputModule,
    SharedModule,
    FormsModule, DirectivesModule, HttpClientModule, AppMaterialModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [
    SideNavService
  ]
})
export class RequisitionModule { }
