import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteLayoutComponent } from '../../_layout/site-layout/site-layout.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OrdertypeComponent } from './ordertype/ordertype.component';
import { MaterialQualityComponent } from './material-quality/material-quality.component';
const routes: Routes = [
  {
     path: '', component: SiteLayoutComponent,
   children:[
  {path: 'order-type',component: OrdertypeComponent,pathMatch:'full'}, 
  { path: 'MaterialQuality', component: MaterialQualityComponent},
 
]}
];

@NgModule({
  imports: [RouterModule.forChild(routes),NgMultiSelectDropDownModule.forRoot()],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
