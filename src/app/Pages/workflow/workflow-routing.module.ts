import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteLayoutComponent } from 'src/app/_layout/site-layout/site-layout.component';
import { WfeventComponent } from './wfevent/wfevent.component';
import { WfgroupComponent } from './wfgroup/wfgroup.component';
import { WfWorkflowComponent } from './wf-workflow/wf-workflow.component';
import { PagesComponent } from './pages/pages.component';
import { PageCategoryComponent } from './page-category/page-category.component';

const routes: Routes = [
  {
    path: '', component: SiteLayoutComponent,
    children: [
      { path: 'wfevent', component: WfeventComponent },
      { path: 'wfgroup', component: WfgroupComponent },
      { path: 'wfworkflow', component: WfWorkflowComponent },
      { path: 'pages', component: PagesComponent },
      { path: 'page-category', component: PageCategoryComponent }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule { }
