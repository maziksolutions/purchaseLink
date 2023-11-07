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

//Get Maintenance Type data
getOrderTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterOrderType/${status}`, httpOptions);
}
getOrderTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getOrderTypeById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addOrderType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addOrderType', formData)
  .pipe(catchError(this.handleError));
}
archiveOrderType(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveOrderType/`, jobType, httpOptions);  
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
addServiceType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addvendorservicetype', formData)
  .pipe(catchError(this.handleError));
}
archiveServiceType(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteServiceType/`, jobType, httpOptions);  
}  
//#endregion Service Type Master


  //#region Priority Master

  GetPreferenceType(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}filterPreferenceType/${status}`, httpOptions);
  }
  GetPreferenceById(id):Observable<any>{  
    return  this.httpClient.get<any>(this.linkurl + 'getPreferencebyid/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }
  
  // AddPreference(formData): Observable<any> {
  //   return this.httpClient.post<any>(this.linkurl + 'addPreference', formData)
  //   .pipe(catchError(this.handleError));
  // }

  AddPreference(formData): Observable<any> {
    return this.httpClient.post(this.linkurl + 'addPreference', formData).pipe(catchError(this.handleError));
  }

  archivePreference(jobType: any[]): Observable < string > {   
    return this.httpClient.post<string> (`${this.linkurl}deletePreference/`, jobType, httpOptions);  
  }  
  //#endregion Priority Master



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
//#region Project Name / Code
//Get Maintenance Type data
getprojectname(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterprojectname/${status}`, httpOptions);
}
getProjectnameById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getprojectnamebyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
addProjectname(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addprojectname', formData)
  .pipe(catchError(this.handleError));
}
archiveProjectname(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveProjectNameCodeGroup/`, jobType, httpOptions);  
}  
//#endregion Project Name / Code

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
