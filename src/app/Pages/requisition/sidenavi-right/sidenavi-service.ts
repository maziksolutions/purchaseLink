import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare var SideNavi: any;
@Injectable({
  providedIn: 'root'
})

export class SideNavService {
  private commentType: string = '';
  private sideNavInitialized: boolean = false;
  private activeComponent: boolean = false;

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
  }

  setActiveComponent(comName: boolean) {
    debugger;
    this.activeComponent = comName;
  }

  getActiveComponent(): boolean {
    return this.activeComponent;
  }
}