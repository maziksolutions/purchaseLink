import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PrincipalListTree, ExampleFlatNode, response } from 'src/app/Pages/Models/response-model';
import { UserModel } from '../Pages/Models/user-model';
import { AuthResponse } from '../Pages/Models/auth-response';
import { Keys } from '../Pages/Shared/localKeys';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'UserManagement/';
  constructor(private httpClient: HttpClient,private router:Router, private jwtHelper:JwtHelperService) { }


//#region  AccessRight


  checkAccessRight(url){  
    const token=localStorage.getItem(Keys.token);
    let userId=0;
    if(!!token){
      userId= parseInt(this.jwtHelper.decodeToken(token).userId);
    }  
    return this.httpClient.get<response>(this.linkurl + 'accessrightbyurl/' + userId+'/'+url, httpOptions)
    .pipe(catchError(this.handleError));
  }

  checkAccessRightByUrlList(urls){
    const token=localStorage.getItem(Keys.token);
    let userId=0;
    if(!!token){
      userId= parseInt(this.jwtHelper.decodeToken(token).userId);     
    }
    return this.httpClient.get<response>(this.linkurl + 'accessrightbyurllist/' + userId+'/'+urls, httpOptions)
    .pipe(catchError(this.handleError));
  }

//#endregion


//#region  Auth



  Auth(user:UserModel):Observable<any>{
    // console.log(this.linkurl+'Auth')
   return  this.httpClient.post<AuthResponse>(this.linkurl+'Auth',user,httpOptions)
     .pipe(catchError(this.handleError));
   }
   resetPassword(id):Observable<any>{
    return  this.httpClient.put<response>(this.linkurl+'resetpassword/'+id,httpOptions)
     .pipe(catchError(this.handleError));
    }

    changeUserPassword(formdata):Observable<any>{ 
      return this.httpClient.put<response>(this.linkurl+ 'updateConfirmPassword',formdata)
      .pipe(catchError(this.handleError));
      }
      
    logout(){
      localStorage.removeItem(Keys.token);
      localStorage.removeItem(Keys.refreshtoken);
      localStorage.removeItem("isLocked"); // for locker folder
      localStorage.clear();
      this.router.navigateByUrl('/login')
    }

//#endregion

  //#region CompanyType

  getCompanyType(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}CompanyTypes/${status}`, httpOptions);
  }

  addCompanyType(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addCompanyType', formData, httpOptions)
    .pipe(catchError(this.handleError));
  }

  getCompanyTypeById(id):Observable<any>{  
    return  this.httpClient.get<any>(this.linkurl + 'companyType/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }

  archiveCompanyType(jobType: any[]): Observable < string > {   
    return this.httpClient.post<string> (`${this.linkurl}archiveComapnyType/`, jobType, httpOptions);  
  }  

  //#endregion

   //#region User Position

   getUserPostions(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}userPostions/${status}`, httpOptions);
  }

  addUserPosition(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addUserPosition', formData, httpOptions)
    .pipe(catchError(this.handleError));
  }

  getUserPostionId(id):Observable<any>{  
    return  this.httpClient.get<any>(this.linkurl + 'userPosition/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }

  archiveUserPostion(jobType: any[]): Observable < string > {   
    return this.httpClient.post<string> (`${this.linkurl}archiveUserPosition/`, jobType, httpOptions);  
  }  

  //#endregion

//#region DesignationRoles

getDesignationRoles(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}DesignationRoles?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}

getDesignationRole(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getDesignationRole/${status}`, httpOptions);
}

addDesignationRoles(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addDesignationRoles', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
getDesignationRoleById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'DesignationRole/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveDesignationRole(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveDesignationRole/`, jobType, httpOptions);  
}  

//#endregion



//#region  Department

getDepartment(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}Departments/${status}`, httpOptions);
}
getParentDepartment(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}ParentDepartments/${status}`, httpOptions);
}
addDepartment(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addDepartment', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getDepartmentById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'Department/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveDepartment(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveDepartment/`, jobType, httpOptions);  
} 
getParentDepartmentBysiteDepartment(siteDepartment): Observable<any> {  
 
  return this.httpClient.get<any[]>(`${this.linkurl}ParentDepartmentsBysiteDepartment/${siteDepartment}`, httpOptions);
}
//#endregion


//#region  Company

getCompany(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}Companies?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}
getAllCompanies(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}allCompanies/${status}`, httpOptions);
}

addCompany(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addCompany', formData)
  .pipe(catchError(this.handleError));
}

getCompanyById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'Company/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveCompany(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveCompany/`, jobType, httpOptions);  
}

//#endregion


//#region  CompanyDepartmentMapping

getCompanyDepartment(status,companyId:any): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}CompanyDepartment/${status}/${companyId}`, httpOptions);
}

addCompanyDepartment(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addCompanyDepartment', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getCompanyDepartmentById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'CompanyDepartmentById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveCompanyDepartment(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveCompanyDepartment/`, jobType, httpOptions);  
} 

//#endregion

//#region  User

getUser(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}Users/${status}`, httpOptions);
}
getByAccessUser(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}UsersByAccess/${status}`, httpOptions);
}
addUser(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addUser', formData)
  .pipe(catchError(this.handleError));
}

getUserById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'User/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveUser(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveUser/`, jobType, httpOptions);  
}

getLineManagers(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}UserLineManager/${status}`, httpOptions);
}

//#endregion


//#region  UserRoleMapping

getUserRole(status,UserId:any): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}UserRole/${status}/${UserId}`, httpOptions);
}

addUserRole(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addUserRole', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getUserRoleById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'UserRoleById/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveUserRole(jobType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveUserRole/`, jobType, httpOptions);  
} 

//#endregion


//Get PrincpalTree
getPrincipalTree(): Observable<PrincipalListTree[]> {
  return this.httpClient.get<PrincipalListTree[]>(this.linkurl + 'PrincipalListTree');
}
vesselMap(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'vesselMap', formData, httpOptions) .pipe(catchError(this.handleError));
}

getUserVessels(userId): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}uservessels/${userId}`, httpOptions);
}

//#region  User Fleet

addUserFleet(formData): Observable<any> {
  return this.httpClient.post(this.linkurl + 'addUserFleet', formData).pipe(catchError(this.handleError));
}


loadUserFleet(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}UserFleets/${status}`, httpOptions);
}
getUserFleetById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'UserFleet/' + id,httpOptions)
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




  //#region AlertNotification

  getAlerts(status,id): Observable<any> {  
    // return this.httpClient.get<any[]>(`${this.linkurl}getAlerts/${status}/${id}`, httpOptions);
    return  this.httpClient.get<any>(this.linkurl + 'getAlerts/'+ status  + '/' +  id,httpOptions)
  }

  addAlert(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addAlert', formData, httpOptions)
    .pipe(catchError(this.handleError));
  }

  getAlert(id):Observable<any>{  
    return  this.httpClient.get<any>(this.linkurl + 'getAlert/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }

  archiveAlert(jobType: any[]): Observable < string > {   
    return this.httpClient.post<string> (`${this.linkurl}archiveAlert/`, jobType, httpOptions);  
  }  

  //#endregion

  //#region Page Alerts

  getPageAlerts(status,id): Observable<any> {  
    // return this.httpClient.get<any[]>(`${this.linkurl}getAlerts/${status}/${id}`, httpOptions);
    return  this.httpClient.get<any>(this.linkurl + 'getPageAlerts/'+ status  + '/' +  id,httpOptions)
  }
  getAllAlerts(): Observable<any> {  
    // return this.httpClient.get<any[]>(`${this.linkurl}getAlerts/${status}/${id}`, httpOptions);
    return  this.httpClient.get<any>(this.linkurl + 'getAllAlerts',httpOptions)
  }
  

  addPageAlert(formData): Observable<any> {
    console.log(formData)
    return this.httpClient.post<any>(this.linkurl + 'addPageAlert', formData, httpOptions)
    .pipe(catchError(this.handleError));
  }

  getPageAlert(id):Observable<any>{  
    return  this.httpClient.get<any>(this.linkurl + 'getPageAlert/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }

  archivePageAlert(jobType: any[]): Observable < string > {   
    return this.httpClient.post<string> (`${this.linkurl}archivePageAlert/`, jobType, httpOptions);  
  }  

  //#endregion

  //#region Alert Settings

  getAlertSettings(id):Observable<any>{  
    return  this.httpClient.get<any>(this.linkurl + 'userAlertSettings/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }

  addAlertSetting(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addAlertSetting', formData)
      .pipe(catchError(this.handleError));
  }

  copyRights(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'copyRights', formData)
      .pipe(catchError(this.handleError));
  }
  
  //#endregion

}
