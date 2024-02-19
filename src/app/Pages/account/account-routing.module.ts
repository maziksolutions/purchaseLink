import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteLayoutComponent } from 'src/app/_layout/site-layout/site-layout.component';
import { AccountcodeNameComponent } from './accountcode-name/accountcode-name.component';
import { AccountTypeComponent } from './account-type/account-type.component';
import { CurrencyMasterComponent } from './currency-master/currency-master.component';
import { PMExceptionComponent } from './pmexception/pmexception.component';
import { AddCurrencyComponent } from './add-currency/add-currency.component';

const routes: Routes = [
  {
    path: '', component: SiteLayoutComponent,
    children: [
      { path: 'accountcode-name', component: AccountcodeNameComponent, pathMatch: 'full' },
      { path: 'accountType', component: AccountTypeComponent, pathMatch: 'full' },
      { path: 'currencyMaster', component: CurrencyMasterComponent, pathMatch: 'full' },
      { path: 'pmexception', component: PMExceptionComponent, pathMatch: 'full' },
      { path: 'addCurrency', component: AddCurrencyComponent, pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
