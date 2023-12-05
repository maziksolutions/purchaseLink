import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private currentRouteSubject=new BehaviorSubject<string>('');

  constructor(private route:Router) { 
    this.route.events.subscribe((event)=>{
      if(event instanceof NavigationEnd){
        this.currentRouteSubject.next(event.url);
      }
    });
  }

  getCurrentRoute(){
    return this.currentRouteSubject.asObservable();
  }
}
