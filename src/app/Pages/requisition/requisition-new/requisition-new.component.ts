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
import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { ShipmasterService } from 'src/app/services/shipmaster.service';
import { RequisitionService } from 'src/app/services/requisition.service';
declare var $: any;
declare let Swal, PerfectScrollbar: any;

enum CheckBoxType {
  Generic,
  Internal,
  NONE,
}

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css']
})
export class RequisitionNewComponent implements OnInit {

  RequisitionForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'orderTypes', 'defaultOrderType','serviceType','abbreviation'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedIndex: any;
  projectnameAndcode:any;
  orderTypes:any;
  Priority:any;
  userId: string;
  userDetail: any;
  Vessels: any;
  Departments: any;
  selectedVesselId: any;
  Shipcomponent: any;
  portList: any;

  check_box_type = CheckBoxType;

  currentlyChecked: CheckBoxType;

  dropdownList: { shipComponentId: number, Shipcomponent: string }[] = [];
  selectedItems: string[] = [];
  dropdownShipcomSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  checkGeneric: boolean = false;
  checkInternal: boolean = false;

  constructor( private fb: FormBuilder,   private route: ActivatedRoute,
    private router:Router, private purchaseService: PurchaseMasterService,
    private authStatusService: AuthStatusService ,private userService :UserManagementService,
    private vesselService :VesselManagementService,private shipmasterService:ShipmasterService,
    private swal: SwalToastService, private requisitionService :RequisitionService) { }

  ngOnInit(): void 
  {
    this.userId = this.authStatusService.userId();
   
    this.RequisitionForm = this.fb.group({
      requisitionId: [0],
      originSite: ['', [Validators.required]],
      vesselId: ['', [Validators.required]],
      orderTypeId: ['', [Validators.required]],
      orderTitle: ['', [Validators.required]],
      orderReference: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      priorityId: ['', [Validators.required]],
      projectNameCodeId: ['', [Validators.required]],
      remarks: ['', [Validators.required]],
      genericComment: ['', [Validators.required]],
      internalComment: ['', [Validators.required]],
     
    });


    this.LoadOrdertype();
    this.LoadProjectnameAndcode();
    this.LoadPriority();
    this.LoadUserDetails();
    this.LoadVessel();
    this.LoadDepartment();
    this.loadPortList();
   
    this.dropdownShipcomSetting = {
      singleSelection: false,
      idField: 'shipComponentId',
      textField: 'shipComponentName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
  }

  get fm() { return this.RequisitionForm.controls };


  selectCheckBox(targetType: CheckBoxType) {
    // If the checkbox was already checked, clear the currentlyChecked variable
    if (this.currentlyChecked === targetType) {
      this.currentlyChecked = CheckBoxType.NONE;

      return;
    }

    this.currentlyChecked = targetType;

if(this.currentlyChecked == 0){

  this.checkGeneric = true ;
  alert('checkGeneric'+this.checkGeneric);
}
if(this.currentlyChecked == 1){

  this.checkInternal = true;
  alert('checkInternal'+this.checkInternal);
}

    
  }

  LoadOrdertype() {
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

  LoadUserDetails() {
    this.userService.getUserById(this.userId)
      .subscribe(response => {
        this.userDetail = response.data;

      })
  }

  LoadVessel() {
    this.vesselService.getVessels(0)
      .subscribe(response => {
        this.Vessels = response.data;
      })
  }
  LoadDepartment() {
    this.userService.getDepartment(0)
      .subscribe(response => {
        this.Departments = response.data;

      })
  }

  loadPortList() {
   
    this.purchaseService.GetPortList(0)
      .subscribe(response => {
        this.portList = response.data;
      })
  }

  LoadShipCompnent() {
    this.shipmasterService.getShipComponentwithvessel(this.selectedVesselId)
      .subscribe(response => {
        this.Shipcomponent = response.data.map(item => ({
          shipComponentId: item.shipComponentId,
          shipComponentName: item.shipComponentName
        }));
       
      })
  }

  onSelectAll(event: any) {
    
    if (event)
      this.selectedItems = event.map((x: { shipComponentId: any; }) => x.shipComponentId);
  }

  onItemSelect(event: any) {
    
    let isSelect = event.shipComponentId;
    if (isSelect) {
      this.selectedItems.push(event.shipComponentId);
    }
  }
  onShipCompoDeSelect(event: any) {
    
    let rindex = this.selectedItems.findIndex(shipComponentId => shipComponentId == event.shipComponentId);
    if (rindex !== -1) {
      this.selectedItems.splice(rindex, 1)
    }
  }

  onShipCompoDeSelectAll(event: any) {
    
    this.selectedItems.length = 0;
  }

  clear() {
    // this.RequisitionForm.reset();
    // this.RequisitionForm.controls.orderTypeId.setValue(0);
    // this.RequisitionForm.controls.defaultOrderType.setValue('');
    // this.RequisitionForm.controls.serviceTypeId.setValue('');

    // (document.getElementById('abc') as HTMLElement).focus();
  }

  onSubmit(form: any) {
   
    form.value.orderReference = this.selectedItems.join(',');
    form.value.originSite = this.userDetail.site; 
    form.value.genericComment = this.checkGeneric;
    form.value.internalComment = this.checkInternal;

    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    console.log(form.value)
    this.requisitionService.addRequisitionMaster(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.clear();
         
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.clear();
        
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
         
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          
        }
        else {

        }

      });
  }

}
