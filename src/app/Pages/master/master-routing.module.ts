import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteLayoutComponent } from '../../_layout/site-layout/site-layout.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OrdertypeComponent } from './ordertype/ordertype.component';
import { ServicetypeComponent } from './servicetype/servicetype.component';
const routes: Routes = [
  {
     path: '', component: SiteLayoutComponent,
children:[
  {path: 'order-type',component: OrdertypeComponent,pathMatch:'full'}, 
  {path: 'service-type',component: ServicetypeComponent,pathMatch:'full'}, 
]}
];

@NgModule({
  imports: [RouterModule.forChild(routes),NgMultiSelectDropDownModule.forRoot()],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
