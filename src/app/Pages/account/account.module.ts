import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { AccountcodeNameComponent } from './accountcode-name/accountcode-name.component';
import { AccountTypeComponent } from './account-type/account-type.component';
import { CurrencyMasterComponent } from './currency-master/currency-master.component';


@NgModule({
  declarations: [
    AccountcodeNameComponent,
    AccountTypeComponent,
    CurrencyMasterComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
