import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseMasterService } from '../../../services/purchase-master.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { SelectionModel } from '@angular/cdk/collections';
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
import { parse } from 'path';
import { map } from 'rxjs/operators';
declare var $: any;
declare let Swal, PerfectScrollbar: any;
declare var SideNavi: any;


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
  projectnameAndcode: any;
  orderTypes: any;
  Priority: any;
  userId: string;
  userDetail: any;
  Vessels: any;
  Departments: any;
  selectedVesselId: any;
  portList: any;
  deliveryForm: FormGroup;
  genericCheckbox: boolean = false;
  internalCheckbox: boolean = false;
  commetType: string = '';

  selectedItems: string[] = [];
  Shipcomponent: any;
  dropdownList: { shipComponentId: number, shipComponentName: string }[] = [];
  selectedDropdown: { shipComponentId: number, shipComponentName: string }[] = [];
  dropdownShipcomSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };

  requisitionId: number;
  reqGetId: string | null;
  reqId: number;


  constructor(private route: ActivatedRoute, private fb: FormBuilder, private sideNavService: SideNavService,
    private router: Router, private swal: SwalToastService, private authStatusService: AuthStatusService,
    private userService: UserManagementService, private requisitionService: RequisitionService,
    private vesselService: VesselManagementService, private shipmasterService: ShipmasterService,
    private purchaseService: PurchaseMasterService) { }

  ngOnInit(): void {
    debugger;
    this.userId = this.authStatusService.userId();
    this.reqGetId = this.route.snapshot.paramMap.get('requisitionId');

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
      genericCheckbox: [false],
      internalCheckbox: [false],
    });

    this.deliveryForm = this.fb.group({
      delInfoId: [0],
      expectedDeliveryPort: ['', Validators.required],
      expectedDeliveryDate: ['', Validators.required],
      vesselETA: ['', Validators.required],
      vesselETB: ['', Validators.required],
      deliveryAddress: ['vessel'],
      reqIds: []
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

    if (this.reqGetId) {
      this.LoadVessel();
      this.getReqData();
      this.LoadShipCompnent();
      this.LoadOrdertype();
      this.LoadProjectnameAndcode();
      this.LoadPriority();
      this.LoadUserDetails();
      this.LoadDepartment();
      this.getPortList();
      this.loadPortList();
    }
    else {
      this.LoadOrdertype();
      this.LoadProjectnameAndcode();
      this.LoadPriority();
      this.LoadUserDetails();
      this.LoadVessel();
      this.LoadDepartment();
      this.getPortList();
      this.loadPortList();
      this.LoadShipCompnent();
    }
  }

  get fm() { return this.RequisitionForm.controls };
  // get fmd() { return this.deliveryForm.controls }


  onCheckboxChanged(event: any) {
    debugger;
    const checkboxType = event.target.id;
    const isChecked = event.target.checked;
    this.commetType = '';
    if (checkboxType === 'genric') {
      this.RequisitionForm.get('genericCheckbox')?.setValue(isChecked);
      this.RequisitionForm.get('internalCheckbox')?.setValue(false);
      this.commetType = 'generic';
    } else if (checkboxType === 'internal') {
      this.RequisitionForm.get('internalCheckbox')?.setValue(isChecked);
      this.RequisitionForm.get('genericCheckbox')?.setValue(false);
      this.commetType = 'internal';
    }

    this.sideNavService.setCommetType(this.commetType);
  }

  onSubmit(form: any) {
    debugger;
    console.log('Form validity:', this.deliveryForm.valid);
    console.log('Form value:', this.deliveryForm.value);

    form.value.reqIds = this.reqId;

    if (this.deliveryForm.valid) {
      debugger;
      this.requisitionService.addDeliveryAddress(form.value)
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

  getReqData() {
    this.requisitionService.getRequisitionById(this.reqGetId)
      .subscribe(response => {
        debugger;
        const requisitionData = response.data;
        // Populate the form controls with the data for editing
        this.RequisitionForm.patchValue({
          requisitionId: requisitionData.requisitionId,
          originSite: requisitionData.originSite,
          vesselId: requisitionData.vesselId,
          orderTypeId: requisitionData.orderTypeId,
          orderTitle: requisitionData.orderTitle,
          departmentId: requisitionData.departmentId,
          priorityId: requisitionData.priorityId,
          projectNameCodeId: requisitionData.projectNameCodeId,
          remarks: requisitionData.remarks,
        });

        this.genericCheckbox = requisitionData.genericComment === true;
        this.internalCheckbox = requisitionData.internalComment === true;

        this.reqId = requisitionData.requisitionId;
        this.loadDeliveryInfo();

        this.selectedVesselId = requisitionData.vesselId;
        debugger;
        // Load ship components and then process orderReference
        this.LoadShipCompnentList().subscribe(shipComponentResponse => {
          debugger;
          const shipComponentData = shipComponentResponse.data;

          const objProcR = requisitionData.orderReference ? requisitionData.orderReference.split(',') : [];

          objProcR.forEach((item) => {
            const selectedShipComponent = shipComponentData.find(x => x.shipComponentId === parseInt(item));
            if (selectedShipComponent) {
              debugger;

              this.selectedDropdown.push(selectedShipComponent);
              this.selectedItems.push(selectedShipComponent.shipComponentId.toString());
            }
          });
          this.RequisitionForm.controls['orderReference'].setValue(this.selectedDropdown);
        });


      });
  }

  loadDeliveryInfo() {
    this.requisitionService.getDeliveryInfoByReqId(this.reqId).subscribe(res => {
      debugger;
      const deliveryInfoData = res.data;
      console.log(deliveryInfoData);
      if (deliveryInfoData)
        this.deliveryForm.patchValue({
          delInfoId: deliveryInfoData.delInfoId,
          expectedDeliveryPort: deliveryInfoData.expectedDeliveryPort,
          expectedDeliveryDate: this.formatDate(deliveryInfoData.expectedDeliveryDate),
          vesselETA: this.formatDate(deliveryInfoData.vesselETA),
          vesselETB: this.formatDate(deliveryInfoData.vesselETB),
          deliveryAddress: deliveryInfoData.deliveryAddress,
          reqIds: this.reqId
        });
    })
  }

  private formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
  }

  LoadShipCompnentList() {

    return this.shipmasterService.getShipComponentwithvessel(this.selectedVesselId)
      .pipe(map(res => {
        debugger;
        this.dropdownList = res.data;
        return { data: this.dropdownList };
      }));
  }

  getPortList() {
    debugger;
    this.requisitionService.GetPortList(0)
      .subscribe(response => {
        debugger;
        console.log(response.data);
        this.portList = response.data;
      })
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
    debugger;
    this.userService.getUserById(this.userId)
      .subscribe(response => {
        debugger;
        this.userDetail = response.data;
      })
  }

  LoadVessel() {
    debugger;
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
    this.requisitionService.GetPortList(0)
      .subscribe(response => {
        this.portList = response.data;
      })
  }

  LoadShipCompnent() {
    debugger;
    this.shipmasterService.getShipComponentwithvessel(this.selectedVesselId)
      .subscribe(response => {
        debugger;
        this.dropdownList = response.data;
      })
  }

  onSelectAll(event: any) {
    debugger;
    if (event)
      this.selectedItems = event.map((x: { shipComponentId: any; }) => x.shipComponentId);
  }

  onItemSelect(event: any) {
    debugger;
    let isSelect = event.shipComponentId;
    if (isSelect) {
      this.selectedItems.push(event.shipComponentId);
    }
  }
  onShipCompoDeSelect(event: any) {
    debugger;
    let rindex = this.selectedItems.findIndex(shipComponentId => shipComponentId == event.shipComponentId);
    if (rindex !== -1) {
      this.selectedItems.splice(rindex, 1)
    }
  }

  onShipCompoDeSelectAll(event: any) {
    debugger;
    this.selectedItems.length = 0;
  }

  clear() {
    // this.RequisitionForm.reset();
    // this.RequisitionForm.controls.orderTypeId.setValue(0);
    // this.RequisitionForm.controls.defaultOrderType.setValue('');
    // this.RequisitionForm.controls.serviceTypeId.setValue('');

    // (document.getElementById('abc') as HTMLElement).focus();
  }

  onSave(form: any) {
    debugger;
    form.value.orderReference = this.selectedItems.join(',');
    form.value.originSite = this.userDetail.site;

    const requisitionData = {
      requisitionId: form.value.requisitionId,
      originSite: form.value.originSite,
      vesselId: form.value.vesselId,
      orderTypeId: form.value.orderTypeId,
      orderTitle: form.value.orderTitle,
      orderReference: form.value.orderReference,
      departmentId: form.value.departmentId,
      priorityId: form.value.priorityId,
      projectNameCodeId: form.value.projectNameCodeId,
      remarks: form.value.remarks,
      genericComment: form.value.genericCheckbox,
      internalComment: form.value.internalCheckbox,
    };

    const fmdata = new FormData();

    fmdata.append('data', JSON.stringify(requisitionData));

    console.log(form.value)
    this.requisitionService.addRequisitionMaster(fmdata)
      .subscribe(data => {
        debugger;
        if (data.message == "data added") {
          this.reqId = data.data;
          this.swal.success('Added successfully.');
          this.clear();

        }
        else if (data.message == "Update") {
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
          this.swal.info(data.message);
        }

      });
  }

}

