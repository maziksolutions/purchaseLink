import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Pages/login/login.component';
import { PageNotFoundComponent } from './Pages/page-not-found/page-not-found.component';
import { WelcomeComponent } from './Pages/welcome/welcome.component';
import { AuthGuardService as Guard } from 'src/app/services/guards/auth-guard.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: '', component: LoginComponent ,canActivate:[Guard]}, 
  { path: 'welcome', component: WelcomeComponent,canActivate:[Guard]},
  { path: 'Requisition', loadChildren: () => import('./Pages/requisition/requisition.module').then(m => m.RequisitionModule) },
  { path: 'master', loadChildren: () => import('./Pages/master/master.module').then(m => m.MasterModule) },
  { path: 'Account', loadChildren: () => import('./Pages/account/account.module').then(m => m.AccountModule) },
  { path: 'administration', loadChildren: () => import('./Pages/administration/administration.module').then(m => m.AdministrationModule) },
{ path: '**', component: PageNotFoundComponent,pathMatch: 'full' ,canActivate:[Guard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
