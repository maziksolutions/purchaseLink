import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseMasterService } from '../../../services/purchase-master.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import {
  SelectionModel
} from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { registerNavEnum, unitMasterNavEnum } from '../../Shared/rights-enum';
import { response } from '../../Models/response-model';

declare var $: any;
declare let Swal, PerfectScrollbar: any;

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css']
})
export class RequisitionNewComponent implements OnInit{

  orderForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'orderTypes', 'defaultOrderType', 'serviceType', 'abbreviation'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedIndex: any;
  projectnameAndcode: any;
  orderTypes: any;
  Priority: any;
  portList: any;
  deliveryForm: FormGroup;


  constructor(private route: ActivatedRoute, private fb: FormBuilder,
    private router: Router, private purchaseService: PurchaseMasterService) {
    this.deliveryForm = this.fb.group({
      expectedDeliveryPort: ['', Validators.required],
      expectedDeliveryDate: [''],
      vesselETA: [''],
      vesselETB: [''],
      deliveryAddressType: [''],
    });
  }
 
  ngOnInit(): void {
    this.LoadOrdertype();
    this.LoadProjectnameAndcode();
    this.LoadPriority();
    this.loadPortList();
  }

  onCheckboxChecked(checkboxType: string) {
    console.log(`Checkbox ${checkboxType} is selected`);

  }


  loadPortList() {
    debugger;
    this.purchaseService.GetPortList(0)
      .subscribe(response => {
        debugger;
        console.log(response.data);
        this.portList = response.data;
      })
  }

  LoadOrdertype() {
    debugger;
    this.purchaseService.getOrderTypes(0)
      .subscribe(response => {
        this.orderTypes = response.data;
      })
  }

  LoadProjectnameAndcode() {
    this.purchaseService.getprojectname(0)
      .subscribe(response => {
        this.projectnameAndcode = response.data;

      })
  }

  LoadPriority() {
    this.purchaseService.GetPreferenceType(0)
      .subscribe(response => {
        this.Priority = response.data;
      })
  }



}
