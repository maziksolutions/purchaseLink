import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorMasterRoutingModule } from './vendor-master-routing.module';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
import { SharedModule } from '../Shared/shared.module';


@NgModule({
  declarations: [
    VendorDetailsComponent,
    VendorRegistrationComponent,
  ],
  imports: [
    CommonModule,
    VendorMasterRoutingModule,   
    SharedModule
  ]
})
export class VendorMasterModule { }
