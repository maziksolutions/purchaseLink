import { Component, OnInit } from '@angular/core';
import { SideNavService } from 'src/app/services/sidenavi-service';

@Component({
  selector: 'app-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.css']
})
export class VendorDetailsComponent implements OnInit {

  constructor(private sideNavService:SideNavService) { }

  ngOnInit(): void {
    this.sideNavService.initSidenav();
  }

}
