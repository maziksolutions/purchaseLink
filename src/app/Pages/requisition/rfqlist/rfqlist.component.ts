import { Component, OnInit } from '@angular/core';
import { VesselManagementService } from 'src/app/services/vessel-management.service';

@Component({
  selector: 'app-rfqlist',
  templateUrl: './rfqlist.component.html',
  styleUrls: ['./rfqlist.component.css']
})
export class RfqlistComponent implements OnInit {
  Vessels: any;
  selectedVesselId: number = 0;


  constructor(private vesselService: VesselManagementService,) { }

  ngOnInit(): void {

    this.LoadVessel();

  }

  LoadVessel() {
    this.vesselService.getVessels(0)
      .subscribe(response => {
        this.Vessels = response.data;
      })
  }

}

