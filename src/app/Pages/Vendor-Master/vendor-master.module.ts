import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorMasterRoutingModule } from './vendor-master-routing.module';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
import { SharedModule } from '../Shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModule } from 'src/app/app.material.module';
import { DirectivesModule } from 'src/app/directives.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [
    VendorDetailsComponent,
    VendorRegistrationComponent,
  ],
  imports: [
    CommonModule,
    VendorMasterRoutingModule,   
    SharedModule,

     FormsModule,HttpClientModule,AppMaterialModule,
    ReactiveFormsModule,
  DirectivesModule,
    NgMultiSelectDropDownModule.forRoot() 
  ]
})
export class VendorMasterModule { }
