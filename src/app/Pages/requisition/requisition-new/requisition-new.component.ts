import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
import { SideNavService } from '../sidenavi-right/sidenavi-service';
import { RequisitionMasterService } from 'src/app/services/requisition-master.service';

declare var $: any;
declare let Swal, PerfectScrollbar: any;
declare var SideNavi: any;

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css']
})
export class RequisitionNewComponent implements OnInit {

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
  genericCheckbox: boolean = false;
  internalCheckbox: boolean = false;
  commetType: string = '';

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private sideNavService: SideNavService, private reqService: RequisitionMasterService,
    private router: Router, private purchaseService: PurchaseMasterService, private swal: SwalToastService) {
    this.deliveryForm = this.fb.group({
      delInfoId: [0],
      expectedDeliveryPort: ['', Validators.required],
      expectedDeliveryDate: [''],
      vesselETA: [''],
      vesselETB: [''],
      deliveryAddressType: ['vessel'],
    });
  }

  get fm() { return this.deliveryForm.controls }

  ngOnInit(): void {
    this.LoadOrdertype();
    this.LoadProjectnameAndcode();
    this.LoadPriority();
    this.loadPortList();
  }   

  onCheckboxChanged(event: any) {
    debugger;
    const checkboxType = event.target.id;
    const isChecked = event.target.checked;
    this.commetType = '';
    if (checkboxType === 'genric') {
      this.genericCheckbox = isChecked;
      this.internalCheckbox = false;
      this.commetType = 'generic';
      this.sideNavService.setCommetType(this.commetType);
    } else if (checkboxType === 'internal') {
      this.internalCheckbox = isChecked;
      this.genericCheckbox = false;
      this.commetType = 'internal';
      this.sideNavService.setCommetType(this.commetType);
    }

    console.log(`Checkbox ${checkboxType} is changed to ${isChecked}`);
  }

  onSubmit(form: any) {
    debugger;
    console.log('Form validity:', this.deliveryForm.valid);
    console.log('Form value:', this.deliveryForm.value);
    if (this.deliveryForm.valid) {
      debugger;
      this.reqService.addDeliveryAddress(form.value)
        .subscribe(data => {

          if (data.message == "data added") {
            this.swal.success('Added successfully.');
            this.clear();
            // this.loadData(0);
          }
          else if (data.message == "updated") {
            this.swal.success('Data has been updated successfully.');
            this.clear();
            // this.loadData(0);
          }
          else if (data.message == "duplicate") {
            this.swal.info('Data already exist. Please enter new data');
            // this.loadData(0);
          }
          else if (data.message == "not found") {
            this.swal.info('Data exist not exist');
            // this.loadData(0);
          }
          else {

          }
        },
          error => {
            debugger;
            console.error('Service error:', error);
          });
    }
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

  clear() { }

}
