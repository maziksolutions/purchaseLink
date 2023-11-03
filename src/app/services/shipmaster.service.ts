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
export class ShipmasterService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'ShipMaster/';
  constructor(private httpClient: HttpClient) { }

//#region Maintenance Type Master

//Get Maintenance Type data
getPositions(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}positions/${status}`, httpOptions);
}
getPositionById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'position/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New position
addPosition(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addPosition', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
archivePosition(position: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivePosition/`, position, httpOptions);  
}  
//#endregion


//#region  Ship PMS Master


GetShipPmslist(formData): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}filterShipPmsMaster?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}

archiveShipPms(shipComponentMasters: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveShipPmsmaster/`, shipComponentMasters, httpOptions);  
}  

GetShipPmsComponentyId(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getShipPmsComponentId/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}


AddShipPmsComponentMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipPmsComponentMaster', formData)
  .pipe(catchError(this.handleError));
}

getworkingPositions(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}workingPositions/${status}`, httpOptions);
}

getStoragePositions(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}storagePositions/${status}`, httpOptions);
}


GetComponentSpares(status,componentId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}componentSpares/${status}/${componentId}`, httpOptions);
}

ArchiveComponentSpare(pmsgroup: any[]): Observable < string > { 
  return this.httpClient.post<string> (`${this.linkurl}archiveComponentSpare/`, pmsgroup, httpOptions);  
} 
AddComponentSpare(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentSpare', formData)
  .pipe(catchError(this.handleError));
}

GetComponentSpareById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getComponentSpareById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

GetSpareList(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getSpareList/${status}`, httpOptions);
}
GetComponentList(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getComponentList/${status}`, httpOptions);
}
//#endregion

//#region  Counter Master

GetCounterMasterlist(formData): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}filterCounterMaster?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}
GetCounterMasterlists(status): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}CounterMasterlists/${status}`, httpOptions);
}
archiveCounterMaster(shipComponentMasters: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveCounterMaster/`, shipComponentMasters, httpOptions);  
} 

GetCounterById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getCounterById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
getCounterDetails(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getCounterDetails/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

GetCounterUpdateById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getCounterUpdateById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
GetCounterUpdateByUpdateId(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getCounterUpdateByUpdateId/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
LoadCounters(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'LoadCountersById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
AddCounterMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addCounterMaster', formData)
  .pipe(catchError(this.handleError));
}
AddCounterUpdate(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addCounterUpdate', formData)
  .pipe(catchError(this.handleError));
}
//#endregion

//#region  Ship Maintenance Master


GetShipMaintenancelist(formData): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}filterShipMaintenanceMaster?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}

archiveShipMaintenance(shipMaintenanceMasters: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveShipMaintenance/`, shipMaintenanceMasters, httpOptions);  
}

GetShipMaintenanceId(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getShipMaintenanceId/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

AddShipMaintenanceMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipMaintenanceMaster', formData)
  .pipe(catchError(this.handleError));
}

addShipMainenanceChecks(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addchecks', formData).pipe(catchError(this.handleError));
}

archiveShipMaintenanceClassification(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveShipmaintenanceClassification/`, pmsgroup, httpOptions);  
}
getShipmclassification(status,mid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getShipmclassification/${status}/${mid}`, httpOptions);
}

addclassification(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addclassification', formData).pipe(catchError(this.handleError));
}

GetMaintenanceClassById(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'GetMaintenanceClassById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

getShipMaintenancesparesLink(status, mid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getShipMaintenancesparesLink/${status}/${mid}`, httpOptions);
}
getmaintenancebyid(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'getmaintenancebyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveShipMaintenancespares(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveShipMaintenancespares/`, pmsgroup, httpOptions);  
}

addmaintenancespares(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addShipMaintenancespares', formData).pipe(catchError(this.handleError));
}

getMsparesbyid(id):Observable<any>{
  return  this.httpClient.get<any>(this.linkurl + 'getMsparesbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

GetJobSpareList(shipMaintenanceId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getJobSpareList/${shipMaintenanceId}`, httpOptions);
}


getShipcomponentlinks(status,maintenanceid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getmcomponentlinks/${status}/${maintenanceid}`, httpOptions);
}


//#endregion


//#region  Ship Spare Parts Master

GetShipSpareslist(formData): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}filterShipSparesPartsMaster?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}
archiveShipSpareParts(shipSparePartsMasters: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveSpareParts/`, shipSparePartsMasters, httpOptions);  
}
AddShipSpareParts(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipSpareParts', formData)
  .pipe(catchError(this.handleError));
}

AddShipSparePartsOther(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipSparePartsOther', formData)
  .pipe(catchError(this.handleError));
}

getSparePartsbyid(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'getSparePartsbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

GetComponentSpareList(ShipSpareId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getComponentSpare/${ShipSpareId}`, httpOptions);
}


//#endregion

//#region  Ship Attachmets

getmattachment(status,pagename,mid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getattachment/${status}/${pagename}/${mid}`, httpOptions);
}

archiveattachments(attachments: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveattachment/`, attachments, httpOptions);  
}
addattachment(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addattachment', formData).pipe(catchError(this.handleError));
}

GetattachmentById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getattachmentbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
getSpareAssemblyById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'spareAssembly/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
//#endregion

//#region Spare Parts Master
//Get PMS Group data
GetComponentCounterLinks(status,componentId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}componentCounterLinks/${status}/${componentId}`, httpOptions);
}

GetCounterName(status,componentId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}GetCounterName/${status}/${componentId}`, httpOptions);
}

GetCounterJobLink(counterId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}jobCounterLinks/${counterId}`, httpOptions);
}


//Get PMS by id
GetComponentCounterById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getComponentCounterById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
ArchiveComponentCounter(formData): Observable < string > { 
  return this.httpClient.post<string> (`${this.linkurl}archiveComponentCounter/`, formData)  
  .pipe(catchError(this.handleError));;  
}  
//Add New PMS
AddComponentCounter(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentCounter', formData)
  .pipe(catchError(this.handleError));
}

//Get PMS by id
GetShipComponentList(vesselId,counterId):Observable<any>{  
  return  this.httpClient.get<any>(`${this.linkurl}shipComponentList/${vesselId}/${counterId}`,httpOptions)
  .pipe(catchError(this.handleError));
}

//#endregion

//#region Ship-Component-Maintenance Liniking

//Get PMS by id
GetJobList():Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'shipJobList',httpOptions)
  .pipe(catchError(this.handleError));
}
GetComponentJobLink(status,componentId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}shipComponentJobLinks/${status}/${componentId}`, httpOptions);
}
GetmaintenanceForecast(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}shipMaintenanceForecast??PageNumber=${formData.pageNumber}&FromDate=${formData.fromDate}&ToDate=${formData.toDate}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}
GetmaintenanceForecastSideNav(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}shipMaintenanceForecastSideNav??PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&jobTypeId=${formData.jobTypeId}&jobGroupId=${formData.jobGroupId}&critical=${formData.critical}`, httpOptions);
}
GetmaintenanceDirectComplete(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}shipMaintenanceDirectComplete??PageNumber=${formData.pageNumber}&FromDate=${formData.fromDate}&ToDate=${formData.toDate}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}
submitCancelJob(formData): Observable<any> {  
  return this.httpClient.post<any> (`${this.linkurl}submitCancelJob`, formData);
}
CompleteJob(formData): Observable<any> {  
  return this.httpClient.post<any> (`${this.linkurl}completeJob`, formData);
}
DraftJob(formData): Observable<any> {  
  return this.httpClient.post<any> (`${this.linkurl}draftJob`, formData);
}
JobPlanSubmit(formData): Observable < any > { 
   return this.httpClient.post<any> (`${this.linkurl}jobPlansSubmit`, formData);  
 } 
 JobPlanDirectSubmit(formData): Observable < any > { 
  return this.httpClient.post<any> (`${this.linkurl}jobPlanDirectSubmit`, formData);  
} 
GetmaintenanceForecastById(id): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}shipMaintenanceForecastById/${id}`, httpOptions);
}
GetShipChildComponent(id): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getShipChildComponent/${id}`, httpOptions);
}


//#region  Work Order


GetWorkOrderList(status): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}WorkOrderLists/${status}`, httpOptions);
}
GetCompletedWorkOrderList(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}CompletedWorkOrderLists??PageNumber=${formData.pageNumber}&FromDate=${formData.fromDate}&ToDate=${formData.toDate}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}
getjobCompletionbyid(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getjobCompletionbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
getComponentJob(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getComponentJob/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
getWorkOrder(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getWorkOrder/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

WorkOrderSpareSubmit(formData): Observable < any > { 
  return this.httpClient.post<any> (`${this.linkurl}workOrderSpareSubmit`, formData);  
} 


//#endregion


//Get PMS by id
GetComponentJobLinkById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getShipComponentJobLinkById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
ArchiveComponentJobLink(pmsgroup: any): Observable < string > { 
  return this.httpClient.post<string> (`${this.linkurl}archiveShipComponentJobLink/`, pmsgroup, httpOptions);  
}  
//Add New PMS
AddComponentJobLink(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipComponentJobLink', formData)
  .pipe(catchError(this.handleError));
}
//#endregion


//#region  Ship Spare Assemblys
getspareAssemblys(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}spareAssemblys?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&VesselId=${formData.vesselId}`, httpOptions);
}
getspareAssembly(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}spareAssemblies/${status}`, httpOptions);
}
archiveSpareAssembly(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveSpareAssembly/`, jobType, httpOptions);  
}

addSpareAssembly(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addSpareAssembly', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
GetAssemblySpares(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}assemblySpare?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&spareAssemblyId=${formData.shipSpareAssemblyId}`, httpOptions);
}
//#endregion

GetWorkOrderSpares(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}WorkOrderSpares/${status}`, httpOptions);
}

deleteSparePartsConsumption(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteSparePartsConsumption/`, user, httpOptions);  
}  

GetWorkOrderSparesList(componentId,workOrderId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}workOrderSparesList/${componentId}/${workOrderId}`, httpOptions);
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
