import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteLayoutComponent } from 'src/app/_layout/site-layout/site-layout.component';
import { RequisitionslistComponent } from './requisitionslist/requisitionslist.component';
import { RequisitionNewComponent } from './requisition-new/requisition-new.component';
import { RfqlistComponent } from './rfqlist/rfqlist.component';
import { RequisitionTrackingComponent } from './requisition-tracking/requisition-tracking.component';

const routes: Routes = [
  {
    path: '', component: SiteLayoutComponent,
    children: [
      { path: 'Requisitionslist', component: RequisitionslistComponent },
      { path: 'RequisitionsNew', component: RequisitionNewComponent },
      {
        path: 'RequisitionsNew/:requisitionId',
        component: RequisitionNewComponent
      },
      { path: 'Rfqlist', component: RfqlistComponent },
      { path: 'RequisitionTracking', component: RequisitionTrackingComponent }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequisitionRoutingModule { }
