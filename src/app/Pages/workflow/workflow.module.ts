import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { WfeventComponent } from './wfevent/wfevent.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app.material.module';
import { WfgroupComponent } from './wfgroup/wfgroup.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { WfWorkflowComponent } from './wf-workflow/wf-workflow.component';
import { PagesComponent } from './pages/pages.component';
import { PageCategoryComponent } from './page-category/page-category.component';


@NgModule({
  declarations: [
    WfeventComponent,
    WfgroupComponent,
    WfWorkflowComponent,
    PagesComponent,
    PageCategoryComponent
  ],
  imports: [
    CommonModule,
    WorkflowRoutingModule,AppMaterialModule,  FormsModule,ReactiveFormsModule, NgMultiSelectDropDownModule.forRoot() 


  
    
 
  ]
})
export class WorkflowModule { }
