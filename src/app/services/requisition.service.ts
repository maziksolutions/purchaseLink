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
export class RequisitionService {

  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'PMRequisitionMaster/'; 
  constructor(private httpClient: HttpClient) { }

  //Get Maintenance Type data
getOrderTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterOrderType/${status}`, httpOptions);
}
getOrderTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getOrderTypeById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addRequisitionMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addRequisitionMaster', formData)
  .pipe(catchError(this.handleError));
}
archiveOrderType(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveOrderType/`, jobType, httpOptions);  
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
