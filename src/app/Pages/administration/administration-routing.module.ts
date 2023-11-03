import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { AdministrationLayoutComponent } from '../../_layout/administration-layout/administration-layout.component';
//import { LocationmasterComponent } from './locationmaster/locationmaster.component';
import { CountryMasterComponent } from './country-master/country-master.component';
import { FunctionClassifiersComponent } from './function-classifiers/function-classifiers.component';
import { CodeListComponent } from './code-list/code-list.component';
import { CompanyTypeComponent } from './company-type/company-type.component';
import { DesignationRolesComponent } from './designation-roles/designation-roles.component';
import { DepartmentComponent } from './department/department.component';
import { CompanyComponent } from './company/company.component';
import { AddcompanyComponent } from './Addcompany/addcompany.component';
import { PositionComponent } from './position/position.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EngineTypeComponent } from './engine-type/engine-type.component';
import { EngineSubTypeComponent } from './engine-sub-type/engine-sub-type.component';
import { EngineModelComponent } from './engine-model/engine-model.component';
import { ShipTypeComponent } from './ship-type/ship-type.component';
import { ECDISComponent } from './ecdis/ecdis.component';
import { VesselRegisterComponent } from './vessel-register/vessel-register.component';
import { AddVesselComponent } from './add-vessel/add-vessel.component';
import { AuthGuardService as Guard } from 'src/app/services/guards/auth-guard.service';
import { PageCategoryComponent } from './page-category/page-category.component';
import { PagesComponent } from './pages/pages.component';
import { UserBasedAccessRightsComponent } from './user-based-access-rights/user-based-access-rights.component';
import { RoleBasedAccessRightsComponent } from './role-based-access-rights/role-based-access-rights.component';
import { AlertConfigComponent } from './alert-config/alert-config.component';
import { AlertConfigurationComponent } from './alert-configuration/alert-configuration.component';

const routes: Routes = [
 {path: '', component: AdministrationLayoutComponent,
  children:[
  { path: '', component: UsersComponent ,canActivate:[Guard]},
  {path: 'countryMaster',component: CountryMasterComponent,canActivate:[Guard]},
  {path: 'functionClassifier',component: FunctionClassifiersComponent,canActivate:[Guard]},
  {path: 'codeList',component: CodeListComponent,canActivate:[Guard]},
  {path: 'companyType',component: CompanyTypeComponent,canActivate:[Guard]},
    {path: 'designationRoles',component: DesignationRolesComponent,canActivate:[Guard]},
    {path: 'department',component: DepartmentComponent,canActivate:[Guard]},
    {path: 'company/:id',component: CompanyComponent,canActivate:[Guard]},
    // {path: 'addcompany',component: AddcompanyComponent},
    {path: 'position',component: PositionComponent,canActivate:[Guard]},
    {path: 'users/:id',component: UsersComponent,canActivate:[Guard]},
   // {path: 'addUsers',component: AddUserComponent},
    { path: "addUsers/:id", component: AddUserComponent ,canActivate:[Guard]},
    { path: "addcompany/:id", component: AddcompanyComponent ,canActivate:[Guard]},
    { path: 'engineType', component:  EngineTypeComponent,canActivate:[Guard]},
    { path: 'engineSubType', component:  EngineSubTypeComponent,canActivate:[Guard]},
    { path: 'engineModel', component:  EngineModelComponent,canActivate:[Guard]},
    { path: 'shipType', component:  ShipTypeComponent,canActivate:[Guard]},
    { path: 'eCDIS', component:  ECDISComponent,canActivate:[Guard]},
    { path: 'vesselRegister', component:  VesselRegisterComponent,canActivate:[Guard]},
    { path: "addvessel/:id", component: AddVesselComponent ,canActivate:[Guard]},
    { path: "adminstrationPageCategory", component: PageCategoryComponent,canActivate:[Guard]},
    { path: "adminstrationPages", component: PagesComponent,canActivate:[Guard]},
    { path: "userAcess", component: UserBasedAccessRightsComponent,canActivate:[Guard]},
    { path: "roleAccess", component: RoleBasedAccessRightsComponent,canActivate:[Guard]},
    { path: "alert", component: AlertConfigComponent,canActivate:[Guard]},
    { path: "alertConfiguration", component: AlertConfigurationComponent,canActivate:[Guard]},
    
    
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
