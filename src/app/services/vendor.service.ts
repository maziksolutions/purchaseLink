import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
}
