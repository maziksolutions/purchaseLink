import { Component, OnInit, OnDestroy } from '@angular/core';
import { SideNavService } from '../sidenavi-right/sidenavi-service';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';

declare var SideNavi: any;
@Component({
  selector: 'app-requisitionslist',
  templateUrl: './requisitionslist.component.html',
  styleUrls: ['./requisitionslist.component.css']
})
export class RequisitionslistComponent implements OnInit {

  constructor(private sideNavService: SideNavService, private route: Router) { }

  ngOnInit(): void {

  }

  navigateToNewReq() {
    debugger;
    this.sideNavService.destroySidenav();

    const navigationExtras: NavigationExtras = {
      queryParams: { 'reload': true }
    };

    this.route.navigate(['/Requisition/RequisitionsNew'], navigationExtras);
  }

}
