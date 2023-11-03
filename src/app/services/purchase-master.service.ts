import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { response } from '../Pages/Models/response-model';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class PurchaseMasterService {

  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'pmPurchaseMaster/'; 
  constructor(private httpClient: HttpClient) { }

  //#region Maintenance Type Master
//Get Maintenance Type data
getServiceCategories(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterServiceCategory/${status}`, httpOptions);
}
getSCategoryById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getSCategoryById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addServieCategory(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addServieCategory', formData)
  .pipe(catchError(this.handleError));
}
archiveServiceCategory(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveServiceCategory/`, jobType, httpOptions);  
}  
//#endregion


  //#region Service Type Master
//Get Maintenance Type data
getServicetypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filtervendorServiceType/${status}`, httpOptions);
}
getServiceTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getServiceTypebyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addServiceType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addvendorservicetype', formData)
  .pipe(catchError(this.handleError));
}
archiveServiceType(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteServiceType/`, jobType, httpOptions);  
}  
//#endregion Service Type Master



//#region  materialquality

getmaterialquality(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterMaterialQuality/${status}`, httpOptions);
}
getmaterialqualityId(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getMaterialQualitybyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addmaterialquality(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addMaterialQuality', formData)
  .pipe(catchError(this.handleError));
}
archivematerialquality(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteMaterialType/`, jobType, httpOptions);  
}  


//#endregion
private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(
      `Backend returned code ${error.status}, ` +
      `body was: ${error.error}`);
  }
  return throwError("Some thing went wrong.Please check with administrator.");
}

}
