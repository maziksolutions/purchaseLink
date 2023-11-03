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
export class UnitmasterService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'unit/';  private linkurl1 = this.baseUrl + 'ImportExcel/';
  constructor(private httpClient: HttpClient) { }
//#region Unit Master

//Get unit data
GetunitList(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filter/${status}`, httpOptions);
}
GetunitLists(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterBasicUnits/${status}`, httpOptions);
}
getunitbyid(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'getbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
deleteData(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deletedata/`, user, httpOptions);  
}  
// delete unit data
Deleteunit(id: number) {
  return this.httpClient.delete(this.linkurl + 'remove/' + id, httpOptions);
}
// Add New unit
addunit(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'add', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
importunit(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'importunit', formData)
  .pipe(catchError(this.handleError));
}
ImportSinglecolumn(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'importonecolumn', formData)
  .pipe(catchError(this.handleError));
}
importtest(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl1 + 'importdepartment', formData)
  .pipe(catchError(this.handleError));
}
ImportCodelist(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'ImportCodelist', formData)
  .pipe(catchError(this.handleError));
}
ImportMaker(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'ImportMaker', formData)
  .pipe(catchError(this.handleError));
}
//#region "Ship Classification Society"
//Get unit data
getClassificationList(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterlassification/${status}`, httpOptions);
}
getclassificationbyid(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getclassificationbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// delete classification
deleteclassification(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteclassification/`, user, httpOptions);  
}  
// Add New addclassification
addclassification(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addclassification', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
//#endregion

//#region "Inventory Type Master"
//Get unit data
getinventorydata(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterinventory/${status}`, httpOptions);
}
getinventoryid(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getinventoryid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// delete classification
deleteinventortype(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteinventortype/`, user, httpOptions);  
}  
// Add New addclassification
addinventorytype(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addinventorytype', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
//#endregion

//#endregion

//#region Maintenance Type Master

//Get Maintenance Type data
getJobTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}jobTypes/${status}`, httpOptions);
}
getJobTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'jobType/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addJobType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addJobType', formData)
  .pipe(catchError(this.handleError));
}
archiveJobType(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveJobType/`, jobType, httpOptions);  
}  
//#endregion

//Get Maintenance Group data
getJobGroups(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}jobGroups/${status}`, httpOptions);
}
getJobGroupById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'jobGroup/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addJobGroup(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addJobGroup', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
archiveJobGroup(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveJobGroup/`, jobType, httpOptions);  
}  
//#endregion

addattachment(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addattachment', formData).pipe(catchError(this.handleError));
}
GetattachmentById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getattachmentbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
getmattachment(status,pagename,SpareAssemblyId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getattachment/${status}/${pagename}/${SpareAssemblyId}`, httpOptions);
}
getAttachmentTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}attachmentTypes/${status}`, httpOptions);
}

archiveattachments(attachments: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveattachment/`, attachments, httpOptions);  
} 
//#region Spare Assembly

getspareAssemblys(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}spareAssemblys/${status}`, httpOptions);
}
addSpareAssembly(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addSpareAssembly', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getSpareAssemblyById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'spareAssembly/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveSpareAssembly(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveSpareAssembly/`, jobType, httpOptions);  
}
//#endregion


//#region Component Type Master

//Get component Type data
getComponentTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}componentTypes/${status}`, httpOptions);
}
getComponentTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'componentType/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addComponentType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentType', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
archiveComponentType(componentType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveComponentType/`, componentType, httpOptions);  
}  
//#endregion


//#region Component Condition Master

//Get component Consition data
getComponentConditions(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}componentConditions/${status}`, httpOptions);
}
getComponentConditionById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'componentCondition/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addComponentCondition(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addComponentCondition', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
archiveComponentCondition(componentCondition: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveComponentCondition/`, componentCondition, httpOptions);  
}  
//#endregion




// Start Country Master


GetCountry(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterCountry/${status}`, httpOptions);
}
addCountry(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addCountry', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

DeleteCountry(id: number) {
  return this.httpClient.delete(this.linkurl + 'removeCountry/' + id, httpOptions);
}

getCountrybyid(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'getCountrybyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
deleteCountryData(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteCountrydata/`, user, httpOptions);  
}  

// End Country Master


// Start FunctionClassifier Master

GetFunctionClassifier(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterFunctionClassifier/${status}`, httpOptions);
}

addFunctionClassifier(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addFunctionClassifier', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
DeleteFunctionClassifier(id: number) {
  return this.httpClient.delete(this.linkurl + 'removeFunctionClassifier/' + id, httpOptions);
}
getFunctionClassifierbyid(id):Observable<any>{  
  const newurl = `${this.linkurl}getbyid/${id}`;
  return  this.httpClient.get<any>(this.linkurl + 'getFunctionClassifierbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
deleteFunctionClassifierData(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteFunctionClassifierdata/`, user, httpOptions);  
}  
// End FunctionClassifier Master


// Start CodeList Master

getCodeList(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterCodeList?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}
  &country=${formData.country}&location=${formData.location}&locationname=${formData.locationname}&state=${formData.state}&Coordinates=${formData.Coordinates}`, httpOptions);
}
GetCodeLis(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getCodeList/${status}`, httpOptions);
}

getPorts(): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getPorts`, httpOptions);
}

deleteCodeList(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deleteCodeList/`, user, httpOptions);  
}  
addCodeList(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addCodeList', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
getCodeListbyid(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getCodeListbyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

// End CodeList Master

//#region  RoleBasedAccessRights

addRights(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addAccessRights', formData)
    .pipe(catchError(this.handleError));
}

getRightsByRole(userPositionId,module): Observable<response> {
  return this.httpClient.get<response>(this.linkurl + 'accessRightByRole/' + userPositionId+'/'+ module, httpOptions)
    .pipe(catchError(this.handleError));
}
getAdministrationRightsByRole(userPositionId,module): Observable<response> {
  return this.httpClient.get<response>(this.linkurl + 'accessRightByRoleAdministration/' + userPositionId+'/'+ module, httpOptions)
    .pipe(catchError(this.handleError));
}
CheckAllbyPage( event,pageCategoryId,userPositionId):Observable<any>{
  return this.httpClient.get<any>(this.linkurl + 'checkAllbyPage/' + event+'/'+pageCategoryId+'/'+userPositionId, httpOptions)
  .pipe(catchError(this.handleError));
 }

//#endregion


//#region  User Based Access Rights

getRightsByUser(userId,module): Observable<response> {
  return this.httpClient.get<response>(this.linkurl + 'accessRightByUser/' + userId+'/'+ module, httpOptions)
    .pipe(catchError(this.handleError));
}
getRightsByUserAdministration(userId,module): Observable<response> {
  return this.httpClient.get<response>(this.linkurl + 'accessRightByUserAdministration/' + userId+'/'+ module, httpOptions)
    .pipe(catchError(this.handleError));
}

addUserRights(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addUserAccessRights', formData)
    .pipe(catchError(this.handleError));
}

UserCheckAllbyPage( event,pageCategoryId,userId):Observable<any>{
  return this.httpClient.get<any>(this.linkurl + 'userCheckAllbyPage/' + event+'/'+pageCategoryId+'/'+userId, httpOptions)
  .pipe(catchError(this.handleError));
 }


//#endregion

//#region  Administration Page Category

getAdministrationPageCategories(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}AdministrationPageCategories/${status}`, httpOptions);
}
addAdministrationPageCategory(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addAdministrationPageCategory', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getAdministrationPageCategoryById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'AdministrationPageCategory/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveAdministrationPageCategory(PageCategory: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveAdministrationPageCategory/`, PageCategory, httpOptions);  
}  

//#endregion



//#region Page Category
//Get Page Category data
getPageCategories(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}PageCategories/${status}`, httpOptions);
}
getPageCategoryById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'PageCategory/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addPageCategory(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addPageCategory', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
archivePageCategory(PageCategory: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivePageCategory/`, PageCategory, httpOptions);  
}  

//#region Administration Pages

getAdministrationPages(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}administrationPages/${status}`, httpOptions);
}

addAdministrationPage(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addAdministrationPage', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getAdministrationPageById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'AdministrationPage/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveAdministrationPage(Page: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveAdministrationPage/`, Page, httpOptions);  
} 
//#endregion


//Get Page data

getPages(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}Pages?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}
getPageById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'Page/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
// Add New unit
addPage(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addPage', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
archivePage(Page: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archivePage/`, Page, httpOptions);  
}  
//#endregion


//#region  MaintenanceReference Master

getMaintenanceReferences(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}maintenanceReferences/${status}`, httpOptions);
}
addMaintenanceReference(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addMaintenanceReference', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
getMaintenanceReferenceById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'maintenanceReference/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveMaintenanceReference(maintenanceReference: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveMaintenanceReference/`, maintenanceReference, httpOptions);  
}  

//#endregion

//#region  MaintenanceProcedure Master

getMaintenanceProcedures(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}maintenanceProcedures/${status}`, httpOptions);
}
addMaintenanceProcedure(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addMaintenanceProcedure', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
getMaintenanceProcedureById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'maintenanceProcedure/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveMaintenanceProcedure(maintenanceProcedure: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveMaintenanceProcedure/`, maintenanceProcedure, httpOptions);  
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
