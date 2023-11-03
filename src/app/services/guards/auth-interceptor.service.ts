import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Keys } from 'src/app/Pages/Shared/localKeys';
let authToken = localStorage.getItem(Keys.token);
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem(Keys.token);
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,                                  
            }
        });
    }
    return next.handle(req).pipe(
        catchError((err, caught: Observable<HttpEvent<any>>) => {
            if (err instanceof HttpErrorResponse && err.status == 401) {
                localStorage.removeItem(Keys.token);
                localStorage.removeItem(Keys.refreshtoken);
                localStorage.removeItem("isLocked");
                localStorage.clear();
                this.router.navigateByUrl('/login')
                return of(err as any);
            }
            throw err;
        })
    );
}
}
