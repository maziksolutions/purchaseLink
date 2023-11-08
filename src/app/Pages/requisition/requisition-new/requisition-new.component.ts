import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css']
})
export class RequisitionNewComponent implements OnInit {
  purchaseroute:any;
  purchaseroutee:boolean=false;
  constructor(    private route: ActivatedRoute,
    private router:Router,) { }

  ngOnInit(): void 
  {
   
  }

  

}
