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
  private linkurl = this.baseUrl + 'pmpurchaseMaster/'; 
  constructor(private httpClient: HttpClient) { }

  //#region Maintenance Type Master

//Get Maintenance Type data
getServiceCategories(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filter/${status}`, httpOptions);
}
getJobTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getSCategoryById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addJobType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addServieCategory', formData)
  .pipe(catchError(this.handleError));
}
archiveJobType(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveServiceCategory/`, jobType, httpOptions);  
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
