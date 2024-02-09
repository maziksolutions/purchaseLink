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
export class VendorService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'VendorMaster/';
  constructor(private httpClient: HttpClient) { }

  //#region Vendor Master Info
  getVendorInfo(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterVendorInfoMaster/${status}`, httpOptions);
  }

  getVendorInfoById(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getVendorInfoById/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }

  addvendorInfo(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addVendorMaster', formData)
      .pipe(catchError(this.handleError));
  }

  addBranchoffice(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addVendorMaster', formData)
      .pipe(catchError(this.handleError));
  }

  //#endregion

  //#region Vendor Business Info
  addbusinessInfo(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addBusinessInfo', formData)
      .pipe(catchError(this.handleError));
  }
  getBusinessInfoByVendorId(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getBusinessInfoByVendorId/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  //#endregion

  //#region  Vendor Sales Department
  addSalesInfo(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addSalesInfo', formData)
      .pipe(catchError(this.handleError));
  }
  getSalesInfoById(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getSalesInfoById/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  getSalesInfoByVendorId(vendorId): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getSalesInfoByVendorId/' + vendorId, httpOptions)
      .pipe(catchError(this.handleError));
  }
  archiveSalesInfo(id): Observable<any> {
    return this.httpClient.delete<any>(`${this.linkurl}removeSalesInfo/` + id, httpOptions);
  }
  //#endregion

  //#region Vendor Service Department
  addServiceInfo(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addServiceInfo', formData)
      .pipe(catchError(this.handleError));
  }
  getServiceInfoById(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getServiceInfoById/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  getServiceInfoByVendorId(vendorId): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getServiceInfoByVendorId/' + vendorId, httpOptions)
      .pipe(catchError(this.handleError));
  }
  archiveServiceInfo(id): Observable<any> {
    return this.httpClient.delete<any>(`${this.linkurl}removeServiceInfo/` + id, httpOptions);
  }
  //#endregion

  //#region Vendor Account Department
  addAccountInfo(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addAccountInfo', formData)
      .pipe(catchError(this.handleError));
  }
  getAccountInfoById(id): Observable<any> {
    debugger
    return this.httpClient.get<any>(this.linkurl + 'getAccountInfoById/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  getAccountInfoByVendorId(vendorId): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getAccountInfoByVendorId/' + vendorId, httpOptions)
      .pipe(catchError(this.handleError));
  }
  archiveAccountInfo(id): Observable<any> {
    return this.httpClient.delete<any>(`${this.linkurl}removeAccountInfo/` + id, httpOptions);
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
