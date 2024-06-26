import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TemplateTree, response } from '../Pages/Models/response-model';
import { MatTableDataSource } from '@angular/material/table';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class RequisitionService {

  private selectedItemsSubject = new BehaviorSubject<{
    displayValue: string; saveValue: string, orderReferenceType: string,
    cartItems?: any[], defaultOrderType?: string
  }>
    ({ displayValue: '', saveValue: '', orderReferenceType: '', cartItems: [], defaultOrderType: '' });
  selectedItems$ = this.selectedItemsSubject.asObservable();

  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'PMRequisitionMaster/';
  private hierarchyurl = this.baseUrl + 'PMSHierarchy/';
  constructor(private httpClient: HttpClient) { }

  //Get Maintenance Type data
  getRequisitionMaster(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}OldfilterRequisitionMaster/${status}`, httpOptions);
  }
  getRequisitionMasters(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}filterRequisitionMasterOlds/${status}`, httpOptions);
  }
  filterRequisitionMasterwithvessel(vesselId): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}OldGetRequisitionMasterWithVessel/${vesselId}`, httpOptions);
  }
  
  filterRequisitionMasterwithvessels(vesselId): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}OldGetRequisitionMasterWithVesselss/${vesselId}`, httpOptions);
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
  archiveRequisitionMaster(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archiveRequisitionMaster/`, jobType, httpOptions);
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
  getTempNumber(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}getTempHeaderNum/${status}`, httpOptions);
  }

  getDeliveryInfoByReqId(id): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'getDeliveryInfoByReqId/' + id, httpOptions)
      .pipe(catchError(this.handleError));
  }

  getItemsInfo(data: string): Observable<any> {

    return this.httpClient.get<any[]>(`${this.linkurl}getItems/${data}`, httpOptions);
  }
  getGroupsInfo(data: string): Observable<any> {

    return this.httpClient.get<any[]>(`${this.linkurl}getGroups/${data}`, httpOptions);
  }
  getItemInfoByGroups(data: string): Observable<any> {

    return this.httpClient.get<any[]>(`${this.linkurl}getItemsByGroups/${data}`, httpOptions);
  }

  getDisplayItems(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterItemsInfo/${status}`, httpOptions);
  }

  getSpareItemsById(ids): Observable<any> {

    const params = new HttpParams().set('ids', ids.join(','));
    return this.httpClient.get<any>(this.linkurl + 'getItems/', { params })
      .pipe(catchError(this.handleError));
  }

  getAllSpareitems(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterItemsInfo/${status}`, httpOptions);
  }

  addItemsDataList(data: any): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addItemsDataList', data)
      .pipe(catchError(this.handleError));
  }

  deleteItemsInfo(jobType: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archivePMItemsMaster/`, jobType, httpOptions);
  }

  getItemsByReqId(id: number): Observable<any> {

    return this.httpClient.get<any[]>(`${this.linkurl}getItemsByReqId/${id}`, httpOptions);
  }

  sendApprove(header: any): Observable<any> {

    return this.httpClient.post<any>(`${this.linkurl}sendapprove/${header}`, httpOptions);
  }

  Finalapprove(ApprovelStatus: any, header: any, finalHeader: any): Observable<any> {

    return this.httpClient.post<any>(`${this.linkurl}Finalapprove/${ApprovelStatus}/${header}/${finalHeader}`, httpOptions);
  }

  // DownloadReqAttach(filepath): Observable<any> {
  //   return this.httpClient.get<any>(this.linkurl + 'DownloadReqAttach/' + filepath, httpOptions)
  //     .pipe(catchError(this.handleError));
  // }
  DownloadReqAttach(fileName: any): Observable<any> {
    return this.httpClient.get<any>(`${this.linkurl}downloadReqAttach/${fileName}`, { responseType: 'blob' as 'json' })
      .pipe(catchError(this.handleError));
  }
  updateSelectedItems(data: { displayValue: string; saveValue: string; orderReferenceType: string; cartItems?: any[]; defaultOrderType?: string }): void {
    this.selectedItemsSubject.next(data);
  }

  //#region Tree structure for Component and Groups
  getTemplateTree(): Observable<TemplateTree[]> {
    return this.httpClient.get<TemplateTree[]>(this.linkurl + 'componentTemplateTree');
  }

  getGroupTemplateTree(): Observable<TemplateTree[]> {
    return this.httpClient.get<TemplateTree[]>(this.linkurl + 'groupTemplateTree');
  }

  GetStoreByShipId(request: any): Observable<any> {
    const params = new HttpParams()
      .set('ShipId', request.ShipId.toString())
      .set('KeyWord', request.KeyWord)
      .set('PageNumber', request.PageNumber.toString())
      .set('PageSize', request.PageSize.toString());
    return this.httpClient.get<any>(this.linkurl + 'StoreLinkedGroups/', { params })
      .pipe(catchError(this.handleError));
  }

  updateUnitinItem(unitvalue: string, id: number): Observable<any> {

    return this.httpClient.post<any>(`${this.linkurl}updateUnitinItem/${unitvalue}/${id}`, httpOptions);
  }
  //#endregion

  editRobData(data: any): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'editRobData', data)
      .pipe(catchError(this.handleError));
  }

  checkAccountCode(accountCode: number, orderTypeId: number): Observable<any> {

    return this.httpClient.post<any>(`${this.linkurl}checkAccountCode/${accountCode}/${orderTypeId}`, httpOptions);
  }

  //#region  Service Type
  addServiceType(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'AddServiceType', formData)
      .pipe(catchError(this.handleError));
  }

  getServiceType(reqId): Observable<any> {
    return this.httpClient.get<any>(this.linkurl + 'GetServiceTypeById/' + reqId, httpOptions)
      .pipe(catchError(this.handleError));
  }
  getServiceTypefull(status): Observable<any> {
    return this.httpClient.get<any>(`${this.linkurl}filterServiceType/${status}`, httpOptions)
      .pipe(catchError(this.handleError));
  }
  //#endregion

  getInventoryType(status): Observable<any> {
    return this.httpClient.get<any[]>(`${this.linkurl}filterInventoryType/${status}`, httpOptions);
  }

  getDisplayComponent(data: string): Observable<any> {

    return this.httpClient.get<any[]>(`${this.linkurl}getDisplayCartItems/${data}`, httpOptions);
  }

  // archive Maintenance Classification Society
  archiveAttachments(attachments: any[]): Observable<string> {
    return this.httpClient.post<string>(`${this.linkurl}archiveAttachment/`, attachments, httpOptions);
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
