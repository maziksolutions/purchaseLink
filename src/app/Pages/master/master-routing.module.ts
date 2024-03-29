import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteLayoutComponent } from '../../_layout/site-layout/site-layout.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OrdertypeComponent } from './ordertype/ordertype.component';
import { MaterialQualityComponent } from './material-quality/material-quality.component';
import { ServicetypeComponent } from './servicetype/servicetype.component';
import { ServiceCategoryComponent } from './service-category/service-category.component';
import { ProjectnameComponent } from './projectname/projectname.component';
import { EmailComponent } from './email/email.component';

import { PriorityComponent } from './priority/priority.component';
import { AttachmentTypeComponent } from './attachment-type/attachment-type.component';
const routes: Routes = [
  {
     path: '', component: SiteLayoutComponent,
   children:[
  {path: 'order-type',component: OrdertypeComponent,pathMatch:'full'}, 
  { path: 'MaterialQuality', component: MaterialQualityComponent},
 
  {path: 'service-type',component: ServicetypeComponent,pathMatch:'full'}, 
  {path: 'service-category',component: ServiceCategoryComponent,pathMatch:'full'}, 
  {path: 'project-name',component: ProjectnameComponent,pathMatch:'full'}, 
  {path: 'priority',component: PriorityComponent,pathMatch:'full'},
  { path: 'email', component: EmailComponent, pathMatch: 'full' },
  { path: 'attachmentType', component: AttachmentTypeComponent, pathMatch: 'full' },
]}
];

@NgModule({
  imports: [RouterModule.forChild(routes), NgMultiSelectDropDownModule.forRoot()],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
