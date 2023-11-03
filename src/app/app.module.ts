import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { AppMaterialModule } from './app.material.module';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './Pages/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SiteLayoutComponent } from './_layout/site-layout/site-layout.component';
import { HeaderComponent } from './_layout/header/header.component';
import { FooterComponent } from './_layout/footer/footer.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PageNotFoundComponent } from './Pages/page-not-found/page-not-found.component';
import { ImportDataComponent } from './Pages/common/import-data/import-data.component';
import { WelcomeComponent } from './Pages/welcome/welcome.component';
import { AdministrationLayoutComponent } from './_layout/administration-layout/administration-layout.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { VesselmanagementLayoutComponent } from './_layout/vesselmanagement-layout/vesselmanagement-layout.component';
import { JwtModule } from '@auth0/angular-jwt';
import { Keys } from './Pages/Shared/localKeys';
import { AuthInterceptorService } from './services/guards/auth-interceptor.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {
  NgxUiLoaderModule,
  NgxUiLoaderConfig,
  SPINNER,
  POSITION,
  PB_DIRECTION,
  NgxUiLoaderRouterModule,
  NgxUiLoaderHttpModule,
} from 'ngx-ui-loader';
import { NgxSummernoteModule } from 'ngx-summernote';

export function tokenGetter() {
  return localStorage.getItem(Keys.token);
}
const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  // "bgsColor": "white",
  // "bgsOpacity": 0.5,
  // "bgsPosition": "bottom-right",
  // "bgsSize": 70,
  // "bgsType": "square-loader",
  // "blur": 5,
  // "fgsColor": "#1c2a48",
  // "fgsPosition": "center-center",
  // "fgsSize": 30,
  // "fgsType": "square-loader",
  // "gap": 20,
  // "logoPosition": "center-center",
  // //"logoSize": 140,
  // // "logoUrl": "assets/images/crewlink-loader.png",
  // "masterLoaderId": "master",
  // "overlayBorderRadius": "0",
  // "overlayColor": "rgba(62, 69, 81, .7)",
  // "pbColor": "white",
  // "pbDirection": "ltr",
  // "pbThickness": 3,
  // "hasProgressBar": true,
  // "text": "",
  // "textColor": "#FFFFFF"

  fgsColor: 'Info',
  fgsPosition: POSITION.centerCenter,
  fgsSize: 50,
  // fgsType: SPINNER.rectangleBounce, // background spinner type
  fgsType: SPINNER.rectangleBounce, // foreground spinner type
  pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
  pbThickness: 5 // progress bar thickness


}
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SiteLayoutComponent,
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent,
    ImportDataComponent,
    WelcomeComponent,
    AdministrationLayoutComponent,
    
  ],
  imports: [
    BrowserModule,AppMaterialModule,CommonModule,
    AppRoutingModule,FormsModule,HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,MatDatepickerModule,MatNativeDateModule,NgMultiSelectDropDownModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:4200"],
        disallowedRoutes: []
      }
    }),
    NgxUiLoaderModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderRouterModule,
  ],
  entryComponents:[
    ImportDataComponent
  ],  
  providers: [ DatePipe,{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },],
  bootstrap: [AppComponent],
  exports:[]
})
export class AppModule { }
