import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenaviRightComponent } from './sidenavi-right/sidenavi-right.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/directives.module';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModule } from 'src/app/app.material.module';



@NgModule({
  declarations: [
    SidenaviRightComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule, DirectivesModule, HttpClientModule, AppMaterialModule,
  ],
  exports:[
    SidenaviRightComponent
  ]
})
export class SharedModule { }
