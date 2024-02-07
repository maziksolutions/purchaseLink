import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorMasterRoutingModule } from './vendor-master-routing.module';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
import { SharedModule } from '../Shared/shared.module';
import { MatTreeModule } from '@angular/material/tree';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/directives.module';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModule } from 'src/app/app.material.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@NgModule({
  declarations: [
    VendorDetailsComponent,
    VendorRegistrationComponent,
  ],
  imports: [
    CommonModule,
    MatTreeModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatInputModule,
    VendorMasterRoutingModule,   
    SharedModule,
    FormsModule, HttpClientModule, AppMaterialModule,
    NgMultiSelectDropDownModule.forRoot()
  ]
})
export class VendorMasterModule { }
