import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Keys } from 'src/app/Pages/Shared/localKeys';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  baseUrl = environment.apiurl;
  private linkurl = this.baseUrl + 'UserManagement/';
  constructor(private jwtHelper: JwtHelperService,
    private router: Router,private httpClient: HttpClient) { }

    async canActivate(route: ActivatedRouteSnapshot, 
      state: RouterStateSnapshot):Promise<boolean> {
      const token = (localStorage.getItem(Keys.token)!);
      if (token && !this.jwtHelper.isTokenExpired(token)){
        return true;
      }
      const isRefreshSuccess = await this.tryRefreshingTokens(token);
      if (!isRefreshSuccess) {
        this.router.navigate(["login"],{ queryParams: { returnUrl: state.url } });
      }
      return isRefreshSuccess;
    }
    
    private async tryRefreshingTokens(token: string): Promise<boolean> {
      // Try refreshing tokens using refresh token
      const refreshToken: string = (localStorage.getItem(Keys.refreshtoken)!);
      if (!token || !refreshToken) { 
        return false;
      }
      const credentials = JSON.stringify({ token: token, refreshToken: refreshToken });
      let isRefreshSuccess: boolean;
      try {
        const response = await this.httpClient.post(this.linkurl+"refreshtoken", credentials, {
          headers: new HttpHeaders({
            "Content-Type": "application/json"
          }),
          observe: 'response'
        }).toPromise();
        // If token refresh is successful, set new tokens in local storage.
        const newToken = (<any>response).body.token;
        const newRefreshToken = (<any>response).body.refreshToken;
        localStorage.setItem(Keys.token, newToken);
        localStorage.setItem(Keys.refreshtoken, newRefreshToken);
        isRefreshSuccess = true;
      }
      catch (ex) {      
        isRefreshSuccess = false;
      }
      return isRefreshSuccess;
    }
}
