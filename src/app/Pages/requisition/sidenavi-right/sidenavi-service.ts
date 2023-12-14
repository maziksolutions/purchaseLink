import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { resolve } from 'dns';
import { rejects } from 'assert';

declare var SideNavi: any;
@Injectable({
  providedIn: 'root'
})

export class SideNavService {
  private commentType: string = '';
  private sideNavInitialized: boolean = false;
  private activeComponent: boolean = false;
  private renderer: Renderer2;

  // Add a subject to emit events when the comment type changes
  private commentTypeChangeSource = new Subject<string>();
  commentTypeChange$ = this.commentTypeChangeSource.asObservable();

  constructor(private route: Router,private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);    
  }

  initSidenav() {
    
    if (!this.sideNavInitialized) {
      this.loadExternalScript('assets/js/SideNavi.js').then(()=>{
        SideNavi.init('right', {
          container: '#sideNavi',
          defaultitem: '.side-navi-item-default',
          item: '.side-navi-item',
          data: '.side-navi-data',
          tab: '.side-navi-tab',
          active: '.active'
        });
        this.sideNavInitialized = true;
      }).catch(error=>{
        console.error('Error loading SideNavi.js:', error);
      })
      
    }
  }

  destroySidenav() {
    
    if (this.sideNavInitialized) {      
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
 
  private loadExternalScript(scriptUrl: string): Promise<void>{
    return new Promise<void>((resolve,reject)=>{
      const scriptElement = this.renderer.createElement('script');
      scriptElement.type='text/javascript';
      scriptElement.src = scriptUrl;
      scriptElement.onload = resolve;
      scriptElement.onerror = reject;

      this.renderer.appendChild(document.body, scriptElement);
    });
  }
}