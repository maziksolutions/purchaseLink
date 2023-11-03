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
export class VesselManagementService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'VesselManagement/';
  constructor(private httpClient: HttpClient) { }



//#region  Engine Type

getEngineTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}engineTypes/${status}`, httpOptions);
}

addEngineType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addEngineType', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getEngineTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'engineType/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveEngineType(engineType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveEngineType/`, engineType, httpOptions);  
}  

//#endregion


//#region Engine Sub Type


getEngineSubTypes(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}engineSubTypes?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}
getEngineSubTypess(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getEngineSubTypess/${status}`, httpOptions);
}

addEngineSubType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addEngineSubType', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getEngineSubTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'engineSubType/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveEngineSubType(engineSubType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveEngineSubType/`, engineSubType, httpOptions);  
} 
//#endregion

//#region  Engine Model

getEngineModels(formData): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}engineModels?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&Status=${formData.status}&KeyWord=${formData.keyword}`, httpOptions);
}
addEngineModel(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addEngineModel', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getEngineModelById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'engineModel/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveEngineModel(engineModel: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveEngineModel/`, engineModel, httpOptions);  
} 
//#endregion


//#region  Ship Type

getShipTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}shipTypes/${status}`, httpOptions);
}
addShipType(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addShipType', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getShipTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'shipType/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveShipType(shipType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveShipType/`, shipType, httpOptions);  
} 
//#endregion



//#region  ECDIS

getECDIS(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}eCDISs/${status}`, httpOptions);
}
addECDIS(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addECDIS', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getECDISById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'eCDIS/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}
archiveECDIS(engineModel: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveECDIS/`, engineModel, httpOptions);  
} 
//#endregion



//#region  Vessel Register
getVessels(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}vessels/${status}`, httpOptions);
}

addVessel(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addVessel', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getVesselById(id):Observable<any>{
  return  this.httpClient.get<any>(this.linkurl + 'vessel/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveVessel(vessel: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveVessel/`, vessel, httpOptions);  
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
