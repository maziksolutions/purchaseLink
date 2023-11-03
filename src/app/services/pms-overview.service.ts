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
export class PmsOverviewService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'PmsOverview/';
  constructor(private httpClient: HttpClient) { }


//#region  Counter Master

GetCounterMasterlist(formData): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}filterCounterMastersss?Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}

//#endregion

}
