import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
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
export class AccountMasterService {

  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'AccountMaster/';
  constructor(private httpClient: HttpClient) { }
 
  //#region AccountCategory

  getAccountCategoryMaster(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterAccountCategory/${status}`, httpOptions);
  }
  getAccountCategoryById(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getAccountCategoryId/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  addAccountCategoryMaster(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addAccountCategory', formData)
      .pipe(catchError(this.handleError));
  }
  archiveAccountCategory(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archiveAccountCategory/`, jobType, httpOptions);
  }

  //#endregion


  //#region AccountSubCategory

  getAccountSubCategory(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterAccountSubCategory/${status}`, httpOptions);
  }
  getAccountSubCategoryId(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getAccountSubCategoryId/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  addAccountSubCategory(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addAccountSubCategory', formData)
      .pipe(catchError(this.handleError));
  }
  archiveAccountSubCategory(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archiveAccountSubCategory/`, jobType, httpOptions);
  }

  //#endregion


    //#region AccountHead

    getAccountHead(status): Observable<any> {
      return this.httpClient.get<any[]>(`${this.linkurl}filterAccountHead/${status}`, httpOptions);
    }
    getAccountHeadId(id): Observable<any> {
      return this.httpClient.get<any>(this.linkurl + 'getAccountHeadId/' + id, httpOptions)
        .pipe(catchError(this.handleError));
    }
    addAccountHead(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurl + 'addAccountHead', formData)
        .pipe(catchError(this.handleError));
    }
    archiveAccountHead(jobType: any[]): Observable<string> {
      return this.httpClient.post<string>(`${this.linkurl}archiveAccountHead/`, jobType, httpOptions);
    }
  
    //#endregion

        //#region AccountCode

        getAccountCode(status): Observable<any> {
          return this.httpClient.get<any[]>(`${this.linkurl}filterAccountCode/${status}`, httpOptions);
        }
        getAccountCodeId(id): Observable<any> {
          return this.httpClient.get<any>(this.linkurl + 'getAccountCodeId/' + id, httpOptions)
            .pipe(catchError(this.handleError));
        }
        addAccountCode(formData): Observable<any> {
          return this.httpClient.post<any>(this.linkurl + 'addAccountCode', formData)
            .pipe(catchError(this.handleError));
        }
        archiveAccountCode(jobType: any[]): Observable<string> {
          return this.httpClient.post<string>(`${this.linkurl}archiveAccountCode/`, jobType, httpOptions);
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
