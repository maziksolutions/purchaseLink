import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app.material.module';
import { HttpClientModule } from '@angular/common/http';
import { AdministrationRoutingModule } from './administration-routing.module';
import { UsersComponent } from './users/users.component';
import { AdmLocationMenuComponent } from './adm-location-menu/adm-location-menu.component';
import { CountryMasterComponent } from './country-master/country-master.component';
import { FunctionClassifiersComponent } from './function-classifiers/function-classifiers.component';
import { CodeListComponent } from './code-list/code-list.component';
import { CompanyTypeComponent } from './company-type/company-type.component';
import { DesignationRolesComponent } from './designation-roles/designation-roles.component';
import { DepartmentComponent } from './department/department.component';
import { CompanyComponent } from './company/company.component';
import { AddcompanyComponent } from './Addcompany/addcompany.component';
import { DirectivesModule } from 'src/app/directives.module';
import { PositionComponent } from './position/position.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EngineTypeComponent } from './engine-type/engine-type.component';
import { EngineSubTypeComponent } from './engine-sub-type/engine-sub-type.component';
import { EngineModelComponent } from './engine-model/engine-model.component';
import { ShipTypeComponent } from './ship-type/ship-type.component';
import { ECDISComponent } from './ecdis/ecdis.component';
import { VesselRegisterComponent } from './vessel-register/vessel-register.component';
import { AddVesselComponent } from './add-vessel/add-vessel.component';
import { MatTreeModule} from '@angular/material/tree';
import { PageCategoryComponent } from './page-category/page-category.component';
import { PagesComponent } from './pages/pages.component';
import { UserBasedAccessRightsComponent } from './user-based-access-rights/user-based-access-rights.component';
import { RoleBasedAccessRightsComponent } from './role-based-access-rights/role-based-access-rights.component';
import { AlertConfigComponent } from './alert-config/alert-config.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSummernoteModule } from 'ngx-summernote';
import { AlertConfigurationComponent } from './alert-configuration/alert-configuration.component';
@NgModule({
  declarations: [ 
    UsersComponent,AdmLocationMenuComponent,
    CountryMasterComponent,
    FunctionClassifiersComponent,
    CodeListComponent,
    PositionComponent,
    CompanyTypeComponent,
    DesignationRolesComponent,
    DepartmentComponent,
    CompanyComponent,
    AddcompanyComponent,
    AddUserComponent,
    EngineTypeComponent,
    EngineSubTypeComponent,
    EngineModelComponent,
    ShipTypeComponent,
    ECDISComponent,
    VesselRegisterComponent,
    AddVesselComponent,
    PageCategoryComponent,
    PagesComponent,
    UserBasedAccessRightsComponent,
    RoleBasedAccessRightsComponent,
    AlertConfigComponent,
    AlertConfigurationComponent,
  ],
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule,HttpClientModule,AppMaterialModule,
    AdministrationRoutingModule,DirectivesModule,  NgMultiSelectDropDownModule.forRoot(),CommonModule, MatTreeModule
    ,DirectivesModule, NgxSummernoteModule,   
    MatTreeModule
  ]
})
export class AdministrationModule { }
