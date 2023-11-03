import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { uptime } from 'process';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TemplateTree } from '../Pages/Models/response-model';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class PMSHierarchyService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'PMSHierarchy/';
  constructor(private httpClient: HttpClient) { }

//#region  PMSTemplate

  getTemplateList(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}filterTemplateList/${status}`, httpOptions);
  }

  deletePMSTemplate(user: any[]): Observable < string > {   
    return this.httpClient.post<string> (`${this.linkurl}deleteTemplate/`, user, httpOptions);  
  }
  addPMSTemplate(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addPMSTemplate', formData)
    .pipe(catchError(this.handleError));
  }

  getTemplateById(id):Observable<any>{  
    return  this.httpClient.get<any>(this.linkurl + 'Template/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }

  getPMSGroup(): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}pmsGroup`, httpOptions);
  }

  getPMSComponent(): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}pmsComponent`, httpOptions);
  }
//#endregion

//#region Pms set-uptime
//Add PMS Groups





AddTemplateGroup(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addTemplateGroup', formData)
  .pipe(catchError(this.handleError));
}

  //Get tree
  // getTemplateTree() {
  //   return this.httpClient.get(this.linkurl + 'templateTree', httpOptions);
  // }

  getTemplateTree(): Observable<TemplateTree[]> {
    return this.httpClient.get<TemplateTree[]>(this.linkurl + 'templateTree');
  }


  //Add PMS Groups
AddTemplateComponent(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addTemplateComponent', formData)
  .pipe(catchError(this.handleError));
}
//#endregion

//Add New PMS
AddShipComponents(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipComponents', formData)
  .pipe(catchError(this.handleError));
}

GetPMSFootPrint(componentId:any, ShipId:any): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}pmsFootPrint?ComponentId=${componentId}&ShipId=${ShipId}`, httpOptions);
}
ShipLinkedJobs(shipComponentId:any): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}shipLinkedJobs?shipComponentId=${shipComponentId}`, httpOptions);
}

ShipLinkedSpares(shipComponentId:any): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}shipLinkedSpares?shipComponentId=${shipComponentId}`, httpOptions);
}

shipSparesById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'shipSparesById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

AddShipSpare(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipSpare', formData)
  .pipe(catchError(this.handleError));
}


//#region  PMS Set Up COnfig

GetPMSSetUp(status,vesselId): Observable<any> {
  return this.httpClient.get<any[]>(`${this.linkurl}flterPMSSetUp?status=${status}&vesselId=${vesselId}`, httpOptions);
}

ArchiveSetUp(pmsSetUp: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveSetUp/`, pmsSetUp, httpOptions);  
} 

GetSetUpById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getSetUpById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

AddPMSSetUp(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addPMSSetUp', formData)
  .pipe(catchError(this.handleError));
}
//#endregion


//#region  Ship Pmsload in Overview

GetShipPmslist(formData): Observable<any> {

  return this.httpClient.get<any[]>(`${this.linkurl}filterShipPmsMaster??PageNumber=${formData.pageNumber}&&PageSize=${formData.pageSize}&Status=${formData.status}&VesselId=${formData.vesselId}&ComponentId=${formData.componentId}&type=${formData.type}`, httpOptions);
}
GetShipPmsComponentyId(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getShipPmsComponentId/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
//#endregion

//#region Postpone Config

addPostponeConfig(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addPostponeConfig', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getPostponeConfigs(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}PostponeConfigs/${status}`, httpOptions);
}

archivePostponeConfig(attachmentType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivePostponeConfig/`, attachmentType, httpOptions);  
}  

getPostponeConfigById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'PostponeConfig/' + id,httpOptions)
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
