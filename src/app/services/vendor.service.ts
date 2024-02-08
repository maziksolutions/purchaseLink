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
  getVenforInfo(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterVendorInfoMaster/${status}`, httpOptions);
  }

  //#endregion

  //#region Vendor Business Info
  addbusinessInfo(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addBusinessInfo', formData)
      .pipe(catchError(this.handleError));
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
