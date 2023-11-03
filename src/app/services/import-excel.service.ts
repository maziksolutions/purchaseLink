import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})

export class ImportExcelService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'ImportExcel/';
  private linkurlpms = this.baseUrl + 'pmsgroup/';
  private linkurlshippms = this.baseUrl + 'ShipMaster/';
  constructor(private httpClient: HttpClient) { }

  importdepartment(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'importdepartment', formData)
    .pipe(catchError(this.handleError));
  }

  importpmsgroupdata(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurlpms + 'importPMSGroup', formData)
    .pipe(catchError(this.handleError));
  }
  importmaintenancemaster(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurlpms + 'importmaintenancemaster', formData)
    .pipe(catchError(this.handleError));
  }
  importcomponentMaster(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurlpms + 'importcomponentMaster', formData)
    .pipe(catchError(this.handleError));
  }
  importSparePartsMaster(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurlpms + 'ImportSpareMaster', formData)
    .pipe(catchError(this.handleError));
  }
  importstoremaster(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurlpms + 'importstoremaster', formData)
    .pipe(catchError(this.handleError));
  }
  importclassificationSurvey(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurlpms + 'importclassificationSurvey', formData)
    .pipe(catchError(this.handleError));
  }
  //Import ship Pms master
  importShipPMSMaster(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurlshippms + 'importshipPMS', formData)
    .pipe(catchError(this.handleError));
  }
    //Import ship Maintenances
    importShipJobsmaster(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurlshippms + 'importshipjobs', formData)
      .pipe(catchError(this.handleError));
    }
    //Import ship spares master
    importShipsparesmaster(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurlshippms + 'importshipspares', formData)
      .pipe(catchError(this.handleError));
    }
//Import Position Master data
importPositionMasterdata(formData): Observable<any> {
      return this.httpClient.post<any>(this.linkurlshippms + 'importPositionMasterdata', formData)
      .pipe(catchError(this.handleError));
    }
  //handler
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
