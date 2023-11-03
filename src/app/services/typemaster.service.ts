import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { response } from '../Pages/Models/response-model';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': "application/json",
    'Accept': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class TypemasterService {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'CategoryMaster/';
  constructor(private httpClient: HttpClient) { }

// Category Type Master
  addCategory(formData): Observable<any> {
    return this.httpClient.post<any>(this.linkurl + 'addcategorymaster', formData, httpOptions)
      .pipe(catchError(this.handleError));
  }
  getCategoryMasterPaginate(page,size,status):Observable<response>{
    return  this.httpClient.get<response>(`${this.linkurl}CategoryMasterPaginate?PageNumber=${page}&PageSize=${size}&Status=${status}`,httpOptions)
    .pipe(catchError(this.handleError));
  }
  filterCategoryTypeMaster(page,size,status,keyword):Observable<response>{
    return  this.httpClient.get<response>(`${this.linkurl}filterCategoryTypeMaster?PageNumber=${page}&PageSize=${size}
    &Status=${status}&keyword=${keyword}`,httpOptions)
    .pipe(catchError(this.handleError));
  }

  archiveCategory(categoryName: any[]): Observable < string > {   
    return this.httpClient.post<string> (`${this.linkurl}archiveCategory/`, categoryName, httpOptions);  
  }  

  GetcategoryList(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}filter/${status}`, httpOptions);
  }

   getCategories(status): Observable<any> {  
    return this.httpClient.get<any[]>(`${this.linkurl}categories/${status}`, httpOptions)
    .pipe(catchError(this.handleError));;
  }

  getCategorybyid(id):Observable<any>{  
    const newurl = `${this.linkurl}getbyid/${id}`;
    return  this.httpClient.get<any>(this.linkurl + 'getbyid/' + id,httpOptions)
    .pipe(catchError(this.handleError));
  }

  updateCategoryMaster(formData): Observable<any> {
    return this.httpClient.put<any>(this.linkurl + 'update', formData, httpOptions)
      .pipe(catchError(this.handleError));
  }
 

  CategoryExportReport(formData): Observable<any> {
    return this.httpClient.get<response>(`${this.linkurl}categoryExportReport?PageNumber=${formData.pageNumber}&PageSize=${formData.pageSize}&PageSize=${formData.categoryId}&Status=${formData.status}&Keyword=${formData.keyword}`, httpOptions)
      .pipe(catchError(this.handleError));
  }



// Priority Master


getPriorityList(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}filterPriority/${status}`, httpOptions);
}

deletePriority(user: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}deletePriority/`, user, httpOptions);  
}  
addPriority(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addPriority', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getPrioritybyid(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'getPrioritybyid/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}



// Attachment Type


getAttachmentTypes(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}attachmentTypes/${status}`, httpOptions);
}

addAttachmentTypes(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addAttachmentTypes', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getAttachmentTypeById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'AttachmentType/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveAttachmentType(attachmentType: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveAttachmentType/`, attachmentType, httpOptions);  
}  


//#region  Reason Master

getReasonMasters(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}reasonMasters/${status}`, httpOptions);
}
getReasonForcastMasters(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}getReasonForcastMasters/${status}`, httpOptions);
}
addReasonMaster(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addReasonMaster', formData, httpOptions)
  .pipe(catchError(this.handleError));
}
getReasonById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'reasonMaster/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveReason(reason: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveReason/`, reason, httpOptions);  
}  
//#endregion


// Maker Master

getMakers(status): Observable<any> {  
  return this.httpClient.get<any[]>(`${this.linkurl}makers/${status}`, httpOptions);
}

addMakers(formData): Observable<any> {
  return this.httpClient.post<any>(this.linkurl + 'addMakers', formData, httpOptions)
  .pipe(catchError(this.handleError));
}

getMakerById(id):Observable<any>{  
  return  this.httpClient.get<any>(this.linkurl + 'maker/' + id,httpOptions)
  .pipe(catchError(this.handleError));
}

archiveMaker(maker: any[]): Observable < string > {   
  return this.httpClient.post<string> (`${this.linkurl}archiveMaker/`, maker, httpOptions);  
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
