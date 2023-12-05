import { Component, OnInit,ElementRef, HostListener, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
declare var SideNavi: any;
@Component({
  selector: 'app-requisition-tracking',
  templateUrl: './requisition-tracking.component.html',
  styleUrls: ['./requisition-tracking.component.css']
})
export class RequisitionTrackingComponent implements OnInit,AfterViewInit {
  @ViewChild('menuCtn') menuCtn!: ElementRef;
  @ViewChild('menuBars') menuBars!: ElementRef;
  @ViewChild('menuItems') menuItems!: ElementRef;
  @ViewChild('menuContent') menuContent!: ElementRef;
  firstClick = true;
  menuClosed = true;  

  selectedMenuItem: string = '';

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    debugger;
    this.handleMenu = this.handleMenu.bind(this);

    const bars = this.menuCtn.nativeElement;
    this.renderer.addClass(bars, 'crossed');
    this.renderer.addClass(bars, 'hamburger');
  }

  ngAfterViewInit(): void {
    debugger
    this.handleMenu = this.handleMenu.bind(this);

    const bars = this.menuCtn.nativeElement;
    this.renderer.addClass(bars, 'crossed');
    this.renderer.addClass(bars, 'hamburger');
  }

  selectMenuItem(item: string): void {
    debugger;
    this.selectedMenuItem = item;
  }

  handleMenu(event: Event): void {
    debugger
    if (!this.firstClick) {
      this.renderer.removeClass(this.menuCtn.nativeElement, 'crossed');
      this.renderer.removeClass(this.menuCtn.nativeElement, 'hamburger');
    } else {
      this.renderer.addClass(this.menuCtn.nativeElement, 'crossed');
      this.firstClick = false;
    }

    this.menuClosed = !this.menuClosed;

    if (this.menuClosed) {
      this.renderer.removeClass(this.menuContent.nativeElement, 'dropped');
    } else {
      this.renderer.addClass(this.menuContent.nativeElement, 'dropped');
    }

    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.menuCtn.nativeElement.contains(event.target) && !this.menuContent.nativeElement.contains(event.target)) {
      if (!this.menuClosed) {
        this.handleMenu(event);
      }
    }
  }
}
