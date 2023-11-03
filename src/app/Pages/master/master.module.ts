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




@NgModule({
  declarations: [       
  
    OrdertypeComponent, ServicetypeComponent,
     ServiceCategoryComponent,MaterialQualityComponent
  ],
  imports: [
    CommonModule,  FormsModule,HttpClientModule,AppMaterialModule,
    ReactiveFormsModule,
    MasterRoutingModule,DirectivesModule,CommonModule
  ]
})
export class MasterModule { }
