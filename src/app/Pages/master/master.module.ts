import { NgModule } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MasterRoutingModule } from './master-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModule } from '../../app.material.module';
import { DirectivesModule } from 'src/app/directives.module';
import { OrdertypeComponent } from './ordertype/ordertype.component';
import { MaterialQualityComponent } from './material-quality/material-quality.component';
import { ServicetypeComponent } from './servicetype/servicetype.component';
import { ServiceCategoryComponent } from './service-category/service-category.component';
import { ProjectnameComponent } from './projectname/projectname.component';
import { PriorityComponent } from './priority/priority.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { EmailComponent } from './email/email.component';





@NgModule({
  declarations: [       
  
    OrdertypeComponent, ServicetypeComponent,
     ServiceCategoryComponent,
     PriorityComponent,
     ServiceCategoryComponent,MaterialQualityComponent,
     ProjectnameComponent,EmailComponent
  ],
  imports: [
    CommonModule,  FormsModule,HttpClientModule,AppMaterialModule,
    ReactiveFormsModule,
    MasterRoutingModule,DirectivesModule,CommonModule,
    NgMultiSelectDropDownModule.forRoot() 
  ]
})
export class MasterModule { }
