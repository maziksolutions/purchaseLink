import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
import { SiteLayoutComponent } from 'src/app/_layout/site-layout/site-layout.component';

const routes: Routes = [
  {
    path: '', component: SiteLayoutComponent,
    children: [
      { path: 'VendorDetails', component: VendorDetailsComponent },
      { path: 'VendorRegistration', component: VendorRegistrationComponent },
      {
        path: 'VendorRegistration/:vendorId', component: VendorRegistrationComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorMasterRoutingModule { }
