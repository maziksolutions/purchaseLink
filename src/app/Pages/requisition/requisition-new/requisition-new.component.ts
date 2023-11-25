import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseMasterService } from '../../../services/purchase-master.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import {SelectionModel} from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { registerNavEnum, unitMasterNavEnum } from '../../Shared/rights-enum';
import { response } from '../../Models/response-model';
import { SideNavService } from '../sidenavi-right/sidenavi-service';

import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { ShipmasterService } from 'src/app/services/shipmaster.service';
import { RequisitionService } from 'src/app/services/requisition.service';
import { filter } from 'rxjs/operators';
declare var $: any;
declare let Swal, PerfectScrollbar: any;
declare var SideNavi: any;

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
  userId: string;
  userDetail: any;
  Vessels: any;
  Departments: any;
  selectedVesselId: any  = '0';
  selectedOrderTypeId:any = '0';
  Shipcomponent: any;
  portList: any;
  deliveryForm: FormGroup;
  genericCheckbox: boolean = false;
  internalCheckbox: boolean = false;
  commetType: string = '';
  check_box_type = CheckBoxType;
  currentlyChecked: CheckBoxType;
  dropdownList: { shipComponentId: number, Shipcomponent: string }[] = [];
  selectedItems: string[] = [];
  dropdownShipcomSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  checkGeneric: boolean = false;
  checkInternal: boolean = false;
  headsite: string;
  headCode: string;
  currentyear : any;
  headabb: string;
  requisitiondata: any;
  headserialNumber: string;
 

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private sideNavService: SideNavService, 
    private router: Router, private purchaseService: PurchaseMasterService, private swal: SwalToastService,
    private authStatusService: AuthStatusService, private userService: UserManagementService,
    private vesselService: VesselManagementService, private shipmasterService: ShipmasterService,
    private requisitionService: RequisitionService) { }

  ngOnInit(): void {
    this.userId = this.authStatusService.userId();

    this.RequisitionForm = this.fb.group({
      requisitionId: [0],
      originSite: ['', [Validators.required]],
      documentHeader: ['', [Validators.required]],
      vesselId: ['0', [Validators.required]],
      orderTypeId: ['0', [Validators.required]],
      orderTitle: ['', [Validators.required]],
      orderReference: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      priorityId: ['', [Validators.required]],
      projectNameCodeId: ['', [Validators.required]],
      remarks: ['', [Validators.required]],
      genericComment: ['', [Validators.required]],
      internalComment: ['', [Validators.required]],
    });

    this.loadData(0);
    
   
   
    this.deliveryForm = this.fb.group({
      delInfoId: [0],
      expectedDeliveryPort: ['', Validators.required],
      expectedDeliveryDate: [''],
      vesselETA: [''],
      vesselETB: [''],
      deliveryAddressType: ['vessel'],
    });

    this.dropdownShipcomSetting = {
      singleSelection: false,
      idField: 'shipComponentId',
      textField: 'shipComponentName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    }

    this.LoadOrdertype();
    this.LoadProjectnameAndcode();
    this.LoadPriority();
    this.LoadUserDetails();
    this.LoadVessel();
    this.LoadDepartment();
    this.getPortList();
    this.loadPortList();
  }

  get fm() { return this.RequisitionForm.controls };
  get fmd() { return this.deliveryForm.controls }


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
  }


  selectCheckBox(targetType: CheckBoxType) {
    // If the checkbox was already checked, clear the currentlyChecked variable
    if (this.currentlyChecked === targetType) {
      this.currentlyChecked = CheckBoxType.NONE;
      return;
    }

    this.currentlyChecked = targetType;
  }

  onSubmit(form: any) {
    debugger;
    console.log('Form validity:', this.deliveryForm.valid);
    console.log('Form value:', this.deliveryForm.value);
    if (this.deliveryForm.valid) {
      debugger;
      this.requisitionService.addDeliveryAddress(form.value)
        .subscribe(data => {


          if (data.message == "data added") {
            this.swal.success('Added successfully.');
          }
          else if (data.message == "updated") {
            this.swal.success('Data has been updated successfully.');
           
          }
          else if (data.message == "duplicate") {
            this.swal.info('Data already exist. Please enter new data');
           
          }
          else if (data.message == "not found") {
            this.swal.info('Data exist not exist');
        
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


  getPortList() {
    debugger;
    this.purchaseService.GetPortList(0)
      .subscribe(response => {
        debugger;
        console.log(response.data);
        this.portList = response.data;
      })
    if (this.currentlyChecked == 0) {

      this.checkGeneric = true;
      alert('checkGeneric' + this.checkGeneric);
    }
    if (this.currentlyChecked == 1) {

      this.checkInternal = true;
      alert('checkInternal' + this.checkInternal);
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
        this.currentyear = new Date().getFullYear();

        if(this.userDetail.site == 'Office' ){
        this.headsite = 'O';
        this.headCode = 'OFF';
        this.headabb = '___';
        let requisitionValues = this.requisitiondata.filter(x=>x.originSite === 'Office').length;
        this.headserialNumber = `${requisitionValues + 1}`.padStart(4, '0');
         
        }
        else if(this.userDetail.site == 'Vessel'){
          this.headsite = 'V';
          this.headCode = '___ ';
          this.headabb = '___';

          let requisitionValues = this.requisitiondata.filter(x=>x.originSite === 'Vessel'); 
          this.headserialNumber = `${requisitionValues.length + 1}`.padStart(4, '0');
        }
      
      })
  }

  loadData(status: number) {
   
    if (status == 1) {
      this.deletetooltip = 'UnArchive';
      if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
        (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {
      this.deletetooltip = 'Archive';
      if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }
    this.requisitionService.getRequisitionMaster(status)
      .subscribe(response => {
        // this.flag = status;
        this.requisitiondata =response.data;

        this.LoadUserDetails();
        this.LoadOrdertype();
        this.LoadProjectnameAndcode();
        this.LoadPriority();
        this.LoadVessel();
        this.LoadDepartment();
        this.loadPortList();
        // (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
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
        if(  this.headsite == 'V'){
        this.headCode  = this.Vessels.filter(x=>x.vesselId === parseInt(this.selectedVesselId)).map(x=>x.vesselCode);
     
        }
      })
  }

  LoadheadorderType(){
    this.headabb  = this.orderTypes.filter(x=>x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x=>x.abbreviation);
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

  
 


  onSave(form: any) {

    form.value.orderReference = this.selectedItems.join(',');
    const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
    const h6Value = documentHeaderElement.textContent;
    form.value.originSite = this.userDetail.site;
    form.value.genericComment = this.checkGeneric;
    form.value.internalComment = this.checkInternal;
    form.value.documentHeader = h6Value;


    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.requisitionService.addRequisitionMaster(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');        
         
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
             
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

