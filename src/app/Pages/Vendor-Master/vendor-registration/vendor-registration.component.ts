import { Component, OnInit } from '@angular/core';
import { SideNavService } from 'src/app/services/sidenavi-service';

@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {

  constructor(private sideNavService:SideNavService) { }

  ngOnInit(): void {
    this.sideNavService.initSidenav();
  }

}
