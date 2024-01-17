import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'WFEvent/';
  constructor(private httpClient: HttpClient) { }

    //#region WFEvent

    getWFEvent(status): Observable<any> {
      return this.httpClient.get<any[]>(`${this.linkurl}filterWFEvent/${status}`, httpOptions);
    }
    getWFEventById(id): Observable<any> {
      return this.httpClient.get<any>(this.linkurl + 'getWFEventId/' + id, httpOptions)
        .pipe(catchError(this.handleError));
    }
    addWFEvent(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurl + 'addWFEvent', formData)
        .pipe(catchError(this.handleError));
    }
    archiveWFEvent(jobType: any[]): Observable<string> {
      return this.httpClient.post<string>(`${this.linkurl}archiveWFEvent/`, jobType, httpOptions);
    }
  
    //#endregion

       //#region WFGroup

       getWFGroup(status): Observable<any> {
        return this.httpClient.get<any[]>(`${this.linkurl}filterWFGroup/${status}`, httpOptions);
      }
      getWFGroupById(id): Observable<any> {
        return this.httpClient.get<any>(this.linkurl + 'getWFGroupId/' + id, httpOptions)
          .pipe(catchError(this.handleError));
      }
      addWFGroup(formData): Observable<any> {
        return this.httpClient.post<any>(this.linkurl + 'addWFGroup', formData)
          .pipe(catchError(this.handleError));
      }
      archiveWFGroup(jobType: any[]): Observable<string> {
        return this.httpClient.post<string>(`${this.linkurl}archiveWFGroup/`, jobType, httpOptions);
      }
    
      //#endregion

             //#region EventGroupLinking

             getEventLink(status): Observable<any> {
              return this.httpClient.get<any[]>(`${this.linkurl}filterEventLink/${status}`, httpOptions);
            }
            getEventLinkById(id): Observable<any> {
              return this.httpClient.get<any>(this.linkurl + 'getEventLinkId/' + id, httpOptions)
                .pipe(catchError(this.handleError));
            }
            addEventLink(formData): Observable<any> {
              return this.httpClient.post<any>(this.linkurl + 'addEventLink', formData)
                .pipe(catchError(this.handleError));
            }
            archiveEventLink(jobType: any[]): Observable<string> {
              return this.httpClient.post<string>(`${this.linkurl}archiveEventLink/`, jobType, httpOptions);
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
