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


@NgModule({
  declarations: [
    RequisitionslistComponent,
    RequisitionNewComponent,
    SidenaviRightComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RequisitionRoutingModule,
    FormsModule,ReactiveFormsModule,DirectivesModule,HttpClientModule,AppMaterialModule,
    NgMultiSelectDropDownModule.forRoot() 
  ],
  providers:[
    SideNavService    
  ]
})
export class RequisitionModule { }
