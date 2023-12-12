import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var SideNavi: any;
@Injectable({
  providedIn: 'root'
})

export class SideNavService {
  private commentType: string = '';
  private sideNavInitialized: boolean = false;
  private activeComponent: boolean = false;

  // Add a subject to emit events when the comment type changes
  private commentTypeChangeSource = new Subject<string>();
  commentTypeChange$ = this.commentTypeChangeSource.asObservable();

  constructor(private route: Router) {
    this.route.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.initSidenav();
    });
  }

  initSidenav() {

    if (!this.sideNavInitialized) {
      SideNavi.init('right', {
        container: '#sideNavi',
        defaultitem: '.side-navi-item-default',
        item: '.side-navi-item',
        data: '.side-navi-data',
        tab: '.side-navi-tab',
        active: '.active'
      });
      this.sideNavInitialized = true;
    }
  }

  destroySidenav() {
    if (this.sideNavInitialized) {
      SideNavi.destroy();
      this.sideNavInitialized = false;
    }
  }

  toggleSidenav() {

    SideNavi.slideEvent();
  }

  getCommetType(): string {
    return this.commentType;
  }

  setCommetType(value: string): void {
    this.commentType = value;
    this.commentTypeChangeSource.next(value);
  }

  setActiveComponent(comName: boolean) {
    
    this.activeComponent = comName;
  }

  getActiveComponent(): boolean {
    return this.activeComponent;
  }
}