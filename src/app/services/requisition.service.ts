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
export class RequisitionService {

  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'PMRequisitionMaster/';
  constructor(private httpClient: HttpClient) { }

  //Get Maintenance Type data
  getRequisitionMaster(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterRequisitionMaster/${status}`, httpOptions);
  }

  filterRequisitionMasterwithvessel(vesselId): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}GetRequisitionMasterWithVessel/${vesselId}`, httpOptions);
  }
  getOrderTypeById(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getOrderTypeById/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  // Add New unit
  addRequisitionMaster(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addRequisitionMaster', formData)
      .pipe(catchError(this.handleError));
  }
  archiveOrderType(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archiveOrderType/`, jobType, httpOptions);
  }
  //#endregion

  //#region   
  // Add New unit
  addComments(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addReqComments', formData)
      .pipe(catchError(this.handleError));
  }
  getComments(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterCommentsInfo/${status}`, httpOptions);
  }
  addDeliveryAddress(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addDeliveryInfo', formData)
      .pipe(catchError(this.handleError));
  }
  //#endregion

  //#region  Delivery Info
  GetPortList(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterPortInfo/${status}`, httpOptions);
  }
  //#endregion

  getRequisitionById(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getRequisitionMasterById/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }
  getTempNumber(status):Observable<any>{
    return this.httpClient.get<any[]>(`${this.linkurl}getTempHeaderNum/${status}`, httpOptions);
  }

  getDeliveryInfoByReqId(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getDeliveryInfoByReqId/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }

  getItemsInfo(data:string): Observable<any> {
    debugger
    return this.httpClient.get<any[]>(`${this.linkurl}getItems/${data}`, httpOptions);
  }
  getGroupsInfo(data:string): Observable<any> {
    
    return this.httpClient.get<any[]>(`${this.linkurl}getGroups/${data}`, httpOptions);
  }
  getItemInfoByGroups(data:string):Observable<any> {
    
    return this.httpClient.get<any[]>(`${this.linkurl}getItemsByGroups/${data}`, httpOptions);
  }

  getDisplayItems(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterItemsInfo/${status}`, httpOptions);
  }

  getSpareItemsById(ids): Observable<any> {
   
    const params = new HttpParams().set('ids', ids.join(','));
    return this.httpClient.get<any>(this.linkurl + 'getItems/', {params})
      .pipe(catchError(this.handleError));
  }  

  getAllSpareitems(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterItemsInfo/${status}`, httpOptions);
  }

  addItemsInfo(items: any[]): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addItemsInfo', items)
      .pipe(catchError(this.handleError));
  }

  deleteItemsInfo(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archivePMItemsMaster/`, jobType, httpOptions);
  }

  getItemsByReqId(id:number): Observable<any> {
    
    return this.httpClient.get<any[]>(`${this.linkurl}getItemsByReqId/${id}`, httpOptions);
  }

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
