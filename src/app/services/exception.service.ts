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
export class ExceptionService {

  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'PMException/';
  constructor(private httpClient: HttpClient) { }

    //#region PMException

    getException(status): Observable<any> {
      return this.httpClient.get<any[]>(`${this.linkurl}filterException/${status}`, httpOptions);
    }
    getExceptionById(id): Observable<any> {
      return this.httpClient.get<any>(this.linkurl + 'getExceptionId/' + id, httpOptions)
        .pipe(catchError(this.handleError));
    }
    addException(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurl + 'addException', formData)
        .pipe(catchError(this.handleError));
    }
    archiveException(jobType: any[]): Observable<string> {
      return this.httpClient.post<string>(`${this.linkurl}archiveException/`, jobType, httpOptions);
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
