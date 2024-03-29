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
  getEventByCompany(companyId): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}getEventByCompany/${companyId}`, httpOptions);
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
  getGroupByCompany(companyId): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}getGroupByCompany/${companyId}`, httpOptions);
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


  //#region WorkFlow

  getWorkFlow(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterWorkFlow/${status}`, httpOptions);
  }
  getWorkFlowById(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getWorkFlowId/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  addWorkFlow(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addWorkFlow', formData)
      .pipe(catchError(this.handleError));
  }
  archiveWorkFlow(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archiveWorkFlow/`, jobType, httpOptions);
  }

  //#endregion

  //#region WorkQueueState

  getWorkQueueState(id): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterWorkQueueState/${id}`, httpOptions);
  }
  getWorkQueueStatefull(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}WorkQueueState/${status}`, httpOptions);
  }
  getWorkQueueStateId(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getWorkQueueStateId/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  addWorkQueueState(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addWorkQueueState', formData)
      .pipe(catchError(this.handleError));
  }
  archiveWorkQueueState(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archiveWorkQueueState/`, jobType, httpOptions);
  }

  //#endregion

    //#region WorkQueueState

    getWorkQueueStateRole(id): Observable<any> {
      return this.httpClient.get<any[]>(`${this.linkurl}filterWorkQueueStateRole/${id}`, httpOptions);
    }

    getWorkQSRId(id): Observable<any> {
      return this.httpClient.get<any>(this.linkurl + 'getWorkQueueStateRoleId/' + id, httpOptions)
        .pipe(catchError(this.handleError));
    }
    addWorkQueueStateRole(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurl + 'addWorkQueueStateRole', formData)
        .pipe(catchError(this.handleError));
    }
    archiveWorkQSR(jobType: any[]): Observable<string> {
      return this.httpClient.post<string>(`${this.linkurl}archiveWorkQueueStateRole/`, jobType, httpOptions);
    }

    multiAddPosition(jobType: any[]): Observable<string> {
      return this.httpClient.post<string>(`${this.linkurl}multiAddPosition/`, jobType, httpOptions);
    }
  
    //#endregion

        //#region WorkQueueTransition

        getWorkQueueTransition(id): Observable<any> {
          return this.httpClient.get<any[]>(`${this.linkurl}filterWorkQueueTransition/${id}`, httpOptions);
        }
    
        getWorkQueueTransitionId(id): Observable<any> {
          return this.httpClient.get<any>(this.linkurl + 'getWorkQueueTransitionId/' + id, httpOptions)
            .pipe(catchError(this.handleError));
        }
        addWorkQueueTransition(formData): Observable<any> {
          return this.httpClient.post<any>(this.linkurl + 'addWorkQueueTransition', formData)
            .pipe(catchError(this.handleError));
        }
        archiveWorkQueueTransition(jobType: any[]): Observable<string> {
          return this.httpClient.post<string>(`${this.linkurl}archiveWorkQueueTransition/`, jobType, httpOptions);
        }
      
        //#endregion


    //#region WorkQueueTransitionRole

    getWorkQueueTransitionRole(id): Observable<any> {
      return this.httpClient.get<any[]>(`${this.linkurl}filterWorkQueueTransitionRole/${id}`, httpOptions);
    }

    getWorkQTRId(id): Observable<any> {
      return this.httpClient.get<any>(this.linkurl + 'getWorkQueueTransitionRoleId/' + id, httpOptions)
        .pipe(catchError(this.handleError));
    }
    addWorkQueueTransitionRole(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurl + 'addWorkQueueTransitionRole', formData)
        .pipe(catchError(this.handleError));
    }
    archiveWorkQTR(jobType: any[]): Observable<string> {
      return this.httpClient.post<string>(`${this.linkurl}archiveWorkQueueTransitionRole/`, jobType, httpOptions);
    }

    multiAddPositioninTransition(jobType: any[]): Observable<string> {
      return this.httpClient.post<string>(`${this.linkurl}multiAddPositioninTransition/`, jobType, httpOptions);
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
