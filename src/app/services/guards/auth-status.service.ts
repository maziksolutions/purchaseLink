import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Keys } from 'src/app/Pages/Shared/localKeys';

@Injectable({
  providedIn: 'root'
})
export class AuthStatusService {

  constructor(private jwtHelper: JwtHelperService) { }


  isAutenticated():boolean{
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      return true;
    }
      return false;
  }
  userName():string{
    let userName:string="userName";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      userName=this.jwtHelper.decodeToken(token).userName;
    }
    return userName;
  }
  Designation():string{
    let designation:string="designation";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      designation=this.jwtHelper.decodeToken(token).designation;
    }
    return designation;
  }
  userCode():string{
    let userCode:string="userCode";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      userCode=this.jwtHelper.decodeToken(token).userCode;
    }
    return userCode;
  }
  JoiningDate():string{
    let JoiningDate:string="JoiningDate";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      JoiningDate=this.jwtHelper.decodeToken(token).JoiningDate;
    }
    return JoiningDate;
  }
  DOB():string{
    let DOB:string="DOB";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      DOB=this.jwtHelper.decodeToken(token).DOB;
    }
    return DOB;
  }
  MobileNumber():string{
    let MobileNumber:string="MobileNumber";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      MobileNumber=this.jwtHelper.decodeToken(token).MobileNumber;
    }
    return MobileNumber;
  }
  location():string{
    let location:string="location";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      location=this.jwtHelper.decodeToken(token).location;
    }
    return location;
  }
  FullName():string{
    let fullName:string="fullName";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      fullName=this.jwtHelper.decodeToken(token).fullName;
    }
    return fullName;
  }
  Email():string{
    let Email:string="Email";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      Email=this.jwtHelper.decodeToken(token).Email;
    }
    return Email;
  }
  companyName():string{
    let companyName:string="companyName";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      companyName=this.jwtHelper.decodeToken(token).companyName;
    }
    return companyName;
  }
  userId():string{
    let userId:string="userId";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
     return this.jwtHelper.decodeToken(token).userId;
    }
    return userId;
  }
  ModuleAccess():string{
    let ModuleAccess:string="ModuleAccess";
    const token = localStorage.getItem(Keys.token);
    if (token && !this.jwtHelper.isTokenExpired(token)){
      ModuleAccess=this.jwtHelper.decodeToken(token).ModuleAccess;
    }
    return ModuleAccess;
  }
}
