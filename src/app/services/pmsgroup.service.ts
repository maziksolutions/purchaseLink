import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
export class PmsgroupService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'PMSGroup/';
  constructor(private httpClient: HttpClient) { }

//#region Maintenance Master
//Get Maintenance Master data
Getmaintenancelist(formData): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}filtermaintenancemaster?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}
//Get Maintenance by id
getmaintenancebyid(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'getmaintenancebyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive Maintenance data
archivemaintenance(maintenancemaster: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivemaintenancemaster/`, maintenancemaster, httpOptions);  
}  
//Add New Maintenance record
addmaintenance(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addmaintenancemaster', formData).pipe(catchError(this.handleError));
}

//Add check
addchecks(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addchecks', formData).pipe(catchError(this.handleError));
}
//#endregion

//#region Maintenance addattachment list
//Add New Maintenance addattachment
addattachment(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addattachment', formData).pipe(catchError(this.handleError));
}
//Get Maintenance addattachment
getmattachment(status,pagename,mid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getattachment/${status}/${pagename}/${mid}`, httpOptions);
}
//Get Maintenance Classification Society by id
GetattachmentById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getattachmentbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive Maintenance Classification Society
archiveattachments(attachments: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveattachment/`, attachments, httpOptions);  
} 
//#endregion

//#region Maintenance Classification Society
//Get Maintenance Classification Society
getmclassification(status,mid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getmclassification/${status}/${mid}`, httpOptions);
}

//Add Maintenance Classification Society
addclassification(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addclassification', formData).pipe(catchError(this.handleError));
}

//Get Maintenance Classification Society by id
GetMaintenanceClassById(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'GetMaintenanceClassById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive Maintenance Classification Society
archivemaintenanceClassification(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivemaintenanceClassification/`, pmsgroup, httpOptions);  
} 
//#endregion

//#region Maintenance master Spares link
//Get Spares
getmaintenancesparesLink(status, mid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getmaintenancesparesLink/${status}/${mid}`, httpOptions);
}
//Add Spares
addmaintenancespares(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addmaintenancespares', formData).pipe(catchError(this.handleError));
}
//Get Spares by id
getMsparesbyid(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getMsparesbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive Spares
archivemaintenancespares(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivemaintenancespares/`, pmsgroup, httpOptions);  
}
//#endregion


  //#region PMS Group
//Get PMS Group data
GetPMSGrouplist(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterpmsList?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}
GetPMSGroupdata(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filter/${status}`, httpOptions);
}
//Get PMS by id
getPMSbyid(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'getbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
archivePMGGroup(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivePMGGroup/`, pmsgroup, httpOptions);  
}  
//Add New PMS
addPMS(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'add', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
//Import the PMS Data
importPMSData(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'importunit', formData)
  .pipe(catchError(this.handleError));
}
//#endregion



 //#region Componenet Master
//Get PMS Group data
GetComponents(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterComponent?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}


GetComponent(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getComponents/${status}`, httpOptions);
}

GetComponentByList(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getComponentList/${status}`, httpOptions);
}

//Get PMS by id
GetComponentyId(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getComponentId/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

//Get PMS by id
GetGroupComponent(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getGroupComponent/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

//Get PMS by id
GetComponentList():Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'componentList',httpOptions)
  .pipe(catchError(this.handleError));
}

// archive PMS data
ArchiveComponent(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveComponent/`, pmsgroup, httpOptions);  
}  
//Add New PMS
AddComponentMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentMaster', formData)
  .pipe(catchError(this.handleError));
}
//#endregion

//#region Spare Parts Master
//Get PMS Group data
GetSpares(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterSpare?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}

GetAssemblySpares(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}assemblySpare?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}&spareAssemblyId=${formData.spareAssemblyId}`, httpOptions);
}

//Get PMS Group data
GetSpareList(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getSpareList/${status}`, httpOptions);
}

//Get PMS Group data
GetJobSpareList(maintenanceId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getJobSpareList/${maintenanceId}`, httpOptions);
}


//Get PMS Group data
GetComponentSpareList(spareId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getComponentSpare/${spareId}`, httpOptions);
}

//Get PMS by id
GetSpareById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getSpareById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
ArchiveSpare(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveSpare/`, pmsgroup, httpOptions);  
}  
//Add New PMS
AddSpareMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addSpareMaster', formData)
  .pipe(catchError(this.handleError));
}

//Get PMS Group data
GetLinkedJobs(spareId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getLinkedJobs/${spareId}`, httpOptions);
}


//#endregion




//#region Spare Parts Master
//Get PMS Group data
GetComponentSpares(status,componentId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}componentSpares/${status}/${componentId}`, httpOptions);
}
//Get PMS by id
GetComponentSpareById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getComponentSpareById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
ArchiveComponentSpare(pmsgroup: any[]): Observable < string > { 
  return this.httpClient.post<string> (`${this.linkurl}archiveComponentSpare/`, pmsgroup, httpOptions);  
}  
//Add New PMS
AddComponentSpare(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentSpare', formData)
  .pipe(catchError(this.handleError));
}
//#endregion



//#region Spare Parts Master
//Get PMS Group data
GetComponentLink(status,componentId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}componentLinks/${status}/${componentId}`, httpOptions);
}
//Get PMS by id
GetComponentLinkById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getComponentLinkById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
ArchiveComponentLink(pmsgroup: any[]): Observable < string > { 
  return this.httpClient.post<string> (`${this.linkurl}archiveComponentLink/`, pmsgroup, httpOptions);  
}  
//Add New PMS
AddComponentLink(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentLink', formData)
  .pipe(catchError(this.handleError));
}
//#endregion


//#region Component-Maintenance Liniking

//Get PMS by id
GetJobList():Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'jobList',httpOptions)
  .pipe(catchError(this.handleError));
}
GetComponentJobLink(status,componentId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}componentJobLinks/${status}/${componentId}`, httpOptions);
}

getmcomponentlinks(status,maintenanceid): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getmcomponentlinks/${status}/${maintenanceid}`, httpOptions);
}

//Get PMS by id
GetComponentJobLinkById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getComponentJobLinkById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
ArchiveComponentJobLink(pmsgroup: any): Observable < string > { 
  return this.httpClient.post<string> (`${this.linkurl}archiveComponentJobLink/`, pmsgroup, httpOptions);  
}  
//Add New PMS
AddComponentJobLink(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentJobLink', formData)
  .pipe(catchError(this.handleError));
}
//#endregion


//#region Store Master
//Get data
GetStores(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterStore?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}

//Get PMS by id
GetStoreById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getStoreById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// archive PMS data
ArchiveStore(pmsgroup: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveStore/`, pmsgroup, httpOptions);  
}  
//Add New PMS
AddStoreMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addStoreMaster', formData)
  .pipe(catchError(this.handleError));
}
// Get Store by shipId
GetStoreByShipId(id):Observable<any>{
  debugger
  return this.httpClient.get<any>(this.linkurl + 'StoreLinkedGroups/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

getStore(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getstore/${status}`, httpOptions);
}
//#endregion




//#region  ClassificationSurvey


getClassificationSurvey(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}classificationSurvey?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}

getClassificationSurveys(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}ClassificationSurveys/${status}`, httpOptions);
}
deleteClassificationSurvey(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteClassificationSurvey/`, user, httpOptions);  
} 

addClassificationSurvey(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addClassificationSurvey', formData, httpOptions)
  .pipe(catchError(this.handleError));
}



//#region MaintennanceCause
// Category Type Master
addMaintenanceCause(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addMaintenanceCauses', formData, httpOptions)
    .pipe(catchError(this.handleError));
}
getMaintenanceCausesPaginate(page,size,status):Observable<response>{
  return  this.httpClient.get<response>(`${this.linkurl}maintenanceCausesPaginate?PageNumber=${page}&PageSize=${size}&Status=${status}`,httpOptions)
  .pipe(catchError(this.handleError));
}
filterGetMaintenanceCause(page,size,status,keyword):Observable<response>{
  return  this.httpClient.get<response>(`${this.linkurl}filterGetMaintenanceCause?PageNumber=${page}&PageSize=${size}
  &Status=${status}&keyword=${keyword}`,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveMaintenanceCause(categoryName: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveMaintenanceCause/`, categoryName, httpOptions);  
}  

 getCauses(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}causes/${status}`, httpOptions)
  .pipe(catchError(this.handleError));;
}

getMaintenanceCausesById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getMaintenanceCausesById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}


CategoryExportReport(formData): Observable<any> {
  return this.httpClient.get<response>(`${this.linkurl}categoryExportReport?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&PageSize=${formData.categoryId}&Status=${formData.status}&Keyword=${formData.keyword}`, httpOptions)
    .pipe(catchError(this.handleError));
}
//#endregion



getClassificationSurveybyid(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getClassificationSurveybyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
//handel error
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
