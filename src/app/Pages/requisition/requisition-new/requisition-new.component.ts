import { Component, ElementRef, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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
import { map, filter } from 'rxjs/operators';
import { isNull } from '@angular/compiler/src/output/output_ast';
declare var $: any;
declare let Swal, PerfectScrollbar: any;
declare var SideNavi: any;

export interface RightTableItem {
  userInput?: string;
  inventoryCode: string;
  inventoryName: string;
  partNo: string;
  quantity: number;
  availableQty: number;
}

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css']
})
export class RequisitionNewComponent implements OnInit {

  RequisitionForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'index', 'itemName', 'itemCode', 'part', 'dwg', 'make', 'model', 'enterQuantity', 'rob', 'remarks'];
  leftTableColumn: string[] = ['checkbox', 'inventoryCode', 'inventoryName', 'partNo', 'quantity', 'availableQty'];
  rightTableColumn: string[] = ['checkbox', 'userInput', 'inventoryCode', 'inventoryName', 'partNo', 'quantity', 'availableQty'];
  dataSource = new MatTableDataSource<any>();
  leftTableDataSource = new MatTableDataSource<any>();
  rightTableDataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  leftTableSelection = new SelectionModel<any>(true, []);
  rightTableSelection = new SelectionModel<RightTableItem>(true, []);
  selectedIndex: any;
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('shipItemsModal') shipItemsModal!: ElementRef;
  projectnameAndcode: any;
  orderTypes: any;
  Priority: any;
  userId: string;
  userDetail: any;
  Vessels: any;
  Departments: any;
  selectedVesselId: any = '0';
  selectedOrderTypeId: any = '0';
  Shipcomponent: any;
  portList: any;
  deliveryForm: FormGroup;
  genericCheckbox: boolean = false;
  internalCheckbox: boolean = false;
  commetType: string = '';
  selectedItems: string[] = [];
  storeAccountCode: string[] = [];

  dropdownList: {
    accountCode: any; shipComponentId: number, shipComponentName: string, isDisabled: boolean
  }[] = [];
  selectedDropdown: { shipComponentId: number, shipComponentName: string, accountCode: any; }[] = [];
  dropdownShipcomSetting: { enableCheckAll: boolean; singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };

  requisitionId: number;
  reqGetId: string | null;
  reqId: number;
  checkGeneric: boolean = false;
  checkInternal: boolean = false;
  headsite: string;
  headCode: string;
  currentyear: any;
  headabb: string;
  requisitiondata: any;
  headserialNumber: string;
  listViewItems: any;

  selectedSpareItemsInput: any[] = [];

  isHeaderCheckboxChecked = false;

  comName = true;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private sideNavService: SideNavService, private cdr: ChangeDetectorRef,
    private router: Router, private purchaseService: PurchaseMasterService, private swal: SwalToastService, private zone: NgZone,
    private authStatusService: AuthStatusService, private userService: UserManagementService,
    private vesselService: VesselManagementService, private shipmasterService: ShipmasterService, private requisitionService: RequisitionService,
  ) { }

  ngOnInit(): void {
    this.userId = this.authStatusService.userId();
    this.reqGetId = this.route.snapshot.paramMap.get('requisitionId');

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
      allowSearchFilter: true,
      enableCheckAll: false
    }

    this.loadData(0);   

    this.sideNavService.setActiveComponent(this.comName);
  }

  get fm() { return this.RequisitionForm.controls };
  get fmd() { return this.deliveryForm.controls }


  onCheckboxChanged(event: any) {

    const checkboxType = event.target.id;
    const isChecked = event.target.checked;
    this.commetType = '';
    if (checkboxType === 'genric') {
      this.RequisitionForm.get('genericCheckbox')?.setValue(isChecked);
      this.RequisitionForm.get('internalCheckbox')?.setValue(false);
      this.genericCheckbox = isChecked;
      this.internalCheckbox = false;
      this.commetType = 'generic';
    } else if (checkboxType === 'internal') {
      this.RequisitionForm.get('internalCheckbox')?.setValue(isChecked);
      this.RequisitionForm.get('genericCheckbox')?.setValue(false);
      this.internalCheckbox = isChecked;
      this.genericCheckbox = false;
      this.commetType = 'internal';
    }

    this.sideNavService.setCommetType(this.commetType);
  }

  onSubmit(form: any) {
    console.log('Form validity:', this.deliveryForm.valid);
    console.log('Form value:', this.deliveryForm.value);

    form.value.reqIds = this.reqId;

    if (this.deliveryForm.valid) {
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
            console.error('Service error:', error);
          });
    }
  }

  getReqData() {
    this.requisitionService.getRequisitionById(this.reqGetId)
      .subscribe(response => {
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
        if (this.genericCheckbox == true) {
          this.commetType = 'generic';
          this.sideNavService.setCommetType(this.commetType);
        }
        if (this.internalCheckbox == true) {
          this.commetType = 'internal';
          this.sideNavService.setCommetType(this.commetType);
        }

        this.reqId = requisitionData.requisitionId;
        this.loadDeliveryInfo();

        this.getSpareItems(requisitionData.orderReference);

        this.selectedVesselId = requisitionData.vesselId;
        // Load ship components and then process orderReference
        this.LoadShipCompnentList().subscribe(shipComponentResponse => {
          const shipComponentData = shipComponentResponse.data;

          const objProcR = requisitionData.orderReference ? requisitionData.orderReference.split(',') : [];

          objProcR.forEach((item) => {
            const selectedShipComponent = shipComponentData.find(x => x.shipComponentId === parseInt(item));
            if (selectedShipComponent) {

              this.selectedDropdown.push(selectedShipComponent);
              this.selectedItems.push(selectedShipComponent.shipComponentId.toString());
            }
          });


          this.dropdownShipcomSetting = {
            singleSelection: false,
            idField: 'shipComponentId',
            textField: 'shipComponentName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 1,
            allowSearchFilter: true,
            enableCheckAll: true
          }

          let accountstore = this.selectedDropdown.map(x => x.accountCode)[0]
          let list = this.dropdownList.filter(x => x.accountCode == accountstore).map(item => ({

            accountCode: item.accountCode,
            shipComponentId: item.shipComponentId,
            shipComponentName: item.shipComponentName,
            isDisabled: false,

          }));
          let list2 = this.dropdownList.filter(x => x.accountCode != accountstore).map(item => ({

            accountCode: item.accountCode,
            shipComponentId: item.shipComponentId,
            shipComponentName: item.shipComponentName,
            isDisabled: true,

          }));

          this.dropdownList = list.concat(list2);

          this.RequisitionForm.controls['orderReference'].setValue(this.selectedDropdown);

          this.RequisitionForm.controls['orderTypeId'].setValue(requisitionData.orderTypeId);

          this.updateDocumentHeader(requisitionData);

          this.LoadheadorderType();

        });

      });
  }

  updateDocumentHeader(requisitionData: any) {
    this.headsite = requisitionData.originSite === 'Office' ? 'O' : 'V';
    this.headCode = requisitionData.originSite === 'Office' ? 'OFF' : '___';
    this.headabb = '___';

    const headerStringParts = requisitionData.documentHeader.split(' – ');
    if (headerStringParts.length === 6) {
      const headerSerialNumber = headerStringParts[5];
      // const headerAbbText = headerStringParts[3];
      this.headserialNumber = headerSerialNumber;
      // this.headabb = headerAbbText;
    }

    // Update document header element
    //   const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
    //   documentHeaderElement.innerHTML = `<i class="fas fa-radiation text-danger"></i><i class="fas fa-exclamation-triangle text-danger"></i> REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
  }

  loadDeliveryInfo() {

    this.requisitionService.getDeliveryInfoByReqId(this.reqId).subscribe(res => {

      const deliveryInfoData = res.data;
      this.deliveryForm.controls['expectedDeliveryPort'].setValue(deliveryInfoData.expectedDeliveryPort);
      if (deliveryInfoData)
        this.deliveryForm.setValue({
          delInfoId: deliveryInfoData.delInfoId,
          expectedDeliveryPort: deliveryInfoData.expectedDeliveryPort,
          expectedDeliveryDate: this.formatDate(deliveryInfoData.expectedDeliveryDate),
          vesselETA: this.formatDate(deliveryInfoData.vesselETA),
          vesselETB: this.formatDate(deliveryInfoData.vesselETB),
          deliveryAddress: deliveryInfoData.deliveryAddress,
          reqIds: this.reqId
        });
      this.deliveryForm.controls['expectedDeliveryPort'].setValue(deliveryInfoData.expectedDeliveryPort);
    })
  }

  private formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
  }

  LoadShipCompnentList() {

    return this.shipmasterService.getShipComponentwithvessel(this.selectedVesselId)
      .pipe(map(res => {
        this.dropdownList = res.data;
        return { data: this.dropdownList };
      }));
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

        if (this.userDetail.site == 'Office') {
          this.headsite = 'O';
          this.headCode = 'OFF';
          this.headabb = '___';
          let requisitionValues = this.requisitiondata.filter(x => x.originSite === 'Office').length;
          this.headserialNumber = `${requisitionValues + 1}`.padStart(4, '0');

        }
        else if (this.userDetail.site == 'Vessel') {
          this.headsite = 'V';
          this.headCode = '___ ';
          this.headabb = '___';

          let requisitionValues = this.requisitiondata.filter(x => x.originSite === 'Vessel');
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
        this.requisitiondata = response.data;

        if (this.reqGetId) {
          // this.loadItemByReqId(this.reqGetId);
          this.LoadVessel();
          this.loadPortList();
          this.getReqData();
          this.LoadShipCompnent();
          this.LoadOrdertype();
          this.LoadProjectnameAndcode();
          this.LoadPriority();
          this.LoadDepartment();
          this.userService.getUserById(this.userId).subscribe(response => { this.userDetail = response.data; this.currentyear = new Date().getFullYear(); })
          this.loadItemsData(0)
        } else {
          this.LoadUserDetails();
          this.LoadOrdertype();
          this.LoadProjectnameAndcode();
          this.LoadPriority();
          this.LoadVessel();
          this.LoadDepartment();
          this.loadPortList();
        }

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
    this.requisitionService.GetPortList(0)
      .subscribe(response => {
        this.portList = response.data;
      })
  }

  LoadShipCompnent() {
    this.shipmasterService.getShipComponentwithvessel(this.selectedVesselId)
      .subscribe(response => {
        this.dropdownList = response.data;
        this.Shipcomponent = response.data.map(item => ({
          accountCode: item.accountCode,
          shipComponentId: item.shipComponentId,
          shipComponentName: item.shipComponentName
        }));
        if (this.headsite == 'V') {
          this.headCode = this.Vessels.filter(x => x.vesselId === parseInt(this.selectedVesselId)).map(x => x.vesselCode);

        }
      })
  }

  LoadheadorderType() {
    this.zone.run(() => {
      this.headabb = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.abbreviation);
      console.log(this.headabb);
      this.cdr.markForCheck();
      // Update document header element
      const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
      // documentHeaderElement.innerHTML = `<i class="fas fa-radiation text-danger"></i><i class="fas fa-exclamation-triangle text-danger"></i> REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
      documentHeaderElement.innerHTML = ` REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;

    })

  }


  onSelectAll(event: any) {

    this.selectedItems = event.map((x: { shipComponentId: any; }) => x.shipComponentId);

  }

  onItemSelect(event: any) {

    let isSelect = event.shipComponentId;

    if (isSelect) {


      let ss = this.dropdownList.filter(x => x.shipComponentId === event.shipComponentId).map(x => x.accountCode)[0];

      if (this.storeAccountCode[0] == undefined) {

        this.storeAccountCode.push(ss);
      }

      if (ss == this.storeAccountCode) {

        this.selectedItems.push(event.shipComponentId);
        this.getSpareItems(this.selectedItems);
        this.dropdownShipcomSetting = {
          singleSelection: false,
          idField: 'shipComponentId',
          textField: 'shipComponentName',
          selectAllText: 'Select All',
          unSelectAllText: 'UnSelect All',
          itemsShowLimit: 1,
          allowSearchFilter: true,
          enableCheckAll: true
        }

        let list = this.dropdownList.filter(x => x.accountCode == this.storeAccountCode).map(item => ({

          accountCode: item.accountCode,
          shipComponentId: item.shipComponentId,
          shipComponentName: item.shipComponentName,
          isDisabled: false,

        }));
        let list2 = this.dropdownList.filter(x => x.accountCode != this.storeAccountCode).map(item => ({

          accountCode: item.accountCode,
          shipComponentId: item.shipComponentId,
          shipComponentName: item.shipComponentName,
          isDisabled: true,

        }));

        this.dropdownList = list.concat(list2);




        return
      }

    }

  }

  onShipCompoDeSelect(event: any) {

    let rindex = this.selectedItems.findIndex(shipComponentId => shipComponentId == event.shipComponentId);
    if (rindex !== -1) {
      this.selectedItems.splice(rindex, 1)
    }
    if (this.selectedItems.length != 0) {
      let list = this.dropdownList.filter(x => x.accountCode == this.storeAccountCode).map(item => ({

        accountCode: item.accountCode,
        shipComponentId: item.shipComponentId,
        shipComponentName: item.shipComponentName,
        isDisabled: false,

      }));
      let list2 = this.dropdownList.filter(x => x.accountCode != this.storeAccountCode).map(item => ({

        accountCode: item.accountCode,
        shipComponentId: item.shipComponentId,
        shipComponentName: item.shipComponentName,
        isDisabled: true,

      }));

      this.dropdownList = list.concat(list2);
      return
    }
    let listfull = this.dropdownList.map(item => ({

      accountCode: item.accountCode,
      shipComponentId: item.shipComponentId,
      shipComponentName: item.shipComponentName,
      isDisabled: false,

    }));

    console.log(this.storeAccountCode)
    let ds = listfull.map(x => x.accountCode)[0]
    const index: number = this.storeAccountCode.indexOf(ds);
    if (index !== -1) {
      this.storeAccountCode.splice(index, 1);
    }

    this.dropdownShipcomSetting = {
      singleSelection: false,
      idField: 'shipComponentId',
      textField: 'shipComponentName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      enableCheckAll: false
    }

    this.dropdownList = listfull;
  }

  onShipCompoDeSelectAll(event: any) {
    let listfull = this.dropdownList.map(item => ({

      accountCode: item.accountCode,
      shipComponentId: item.shipComponentId,
      shipComponentName: item.shipComponentName,
      isDisabled: false,

    }));
    let ds = listfull.map(x => x.accountCode)[0]
    const index: number = this.storeAccountCode.indexOf(ds);
    if (index !== -1) {
      this.storeAccountCode.splice(index, 1);
    }
    this.dropdownShipcomSetting = {
      singleSelection: false,
      idField: 'shipComponentId',
      textField: 'shipComponentName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      enableCheckAll: false
    }
    this.dropdownList = listfull;
    this.selectedItems.length = 0;
  }

  onSave(form: any) {
    form.value.orderReference = this.selectedItems.join(',');
    const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
    const h6Value = documentHeaderElement.textContent;

    const requisitionData = {
      requisitionId: form.value.requisitionId,
      documentHeader: h6Value,
      originSite: this.userDetail.site,
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
    form.value.genericComment = this.checkGeneric;
    form.value.internalComment = this.checkInternal;
    form.value.documentHeader = h6Value;


    const fmdata = new FormData();

    fmdata.append('data', JSON.stringify(requisitionData));

    this.requisitionService.addRequisitionMaster(fmdata)
      .subscribe(data => {
        if (data.message == "data added") {
          this.reqId = data.data;
          this.swal.success('Added successfully.');

        }
        else if (data.message == "Update") {
          this.swal.success('Data has been updated successfully.');

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

  //#region  PM Items
  getSpareItems(ids: any) {

    this.requisitionService.getItemsInfo(ids)
      .subscribe(res => {

        this.leftTableDataSource.data = res;
        console.log(this.leftTableDataSource.data);
        // this.spareItems = res;
      })
  }

  moveItemsToRight() {

    const selectedItems = this.leftTableDataSource.data.filter(item => this.leftTableSelection.isSelected(item));

    this.rightTableDataSource.data = [...this.rightTableDataSource.data, ...selectedItems];

    this.leftTableDataSource.data = this.leftTableDataSource.data.filter(item => !this.leftTableSelection.isSelected(item));

    this.leftTableSelection.clear();
  }

  moveItemsToLeft() {
    const selectedItems = this.rightTableDataSource.data.filter(item => this.rightTableSelection.isSelected(item));

    this.leftTableDataSource.data = [...this.leftTableDataSource.data, ...selectedItems];

    this.rightTableDataSource.data = this.rightTableDataSource.data.filter(item => !this.rightTableSelection.isSelected(item));

    this.rightTableSelection.clear();
  }

  storeTableData() {

    const itemsToAdd: {
      ItemCode: string;
      ItemName: string;
      Part: string;
      DWG: string;
      Make: string;
      Model: string;
      EnterQuantity: number;
      ROB: number;
      Remarks: string;
      PMReqId: number;
    }[] = [];
    this.rightTableDataSource.data.forEach((item, index) => {
      if (this.rightTableSelection.isSelected(item)) {

        const enterQuantity = item.userInput ? +item.userInput : 0;

        const newItem = {
          ItemCode: item.shipSpares.inventoryCode,
          ItemName: item.shipSpares.inventoryName,
          Part: item.partNo,
          DWG: item.drawingNo,
          Make: item.shipSpares.makerReference,
          Model: item.modelNo,
          EnterQuantity: enterQuantity,
          ROB: item.shipSpares.rob,
          Remarks: item.remarks,
          PMReqId: this.reqId
        };

        itemsToAdd.push(newItem);
      }
    });

    this.rightTableDataSource.data = this.rightTableDataSource.data.filter(item => !this.rightTableSelection.isSelected(item));
    this.rightTableDataSource._updateChangeSubscription();

    this.rightTableSelection.clear();

    if (itemsToAdd.length > 0) {
      this.requisitionService.addItemsInfo(itemsToAdd).subscribe(res => {

        this.loadItemsData(0);
        console.log('Server response:', res);

        // Close the modal
        $("#ship-items").modal('hide');
      });
    }
  }

  deleteItems() {

    var message = ""
    var title = "";

    if (this.flag == 1) {
      message = "Un-archived successfully.";
      title = "you want to un-archive data."
    }
    else {
      message = "Archived successfully.";
      title = "you want to archive data."

    }
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {

      Swal.fire({
        title: 'Are you sure?',
        text: title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.requisitionService.deleteItemsInfo(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.loadItemsData(0);
          })

        }
      })

    } else {
      this.swal.info('Select at least one row')
    }
    // const selectedIds = this.displayFinalSpareItems
    //   .filter(item => item.selected);
    // this.requisitionService.deleteItemsInfo(selectedIds).subscribe(res => {
    //   if (res) {
    //     this.loadDisplayItems();
    //   }
    //   console.log(res);
    // })
  }

  loadItemsData(status: number) {

    if (this.reqGetId)
      this.requisitionService.getItemsByReqId(parseInt(this.reqGetId))
        .subscribe(response => {

          this.flag = status;

          this.dataSource.data = response;
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          // this.clear();
          (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
        });
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }
  isAllLeftTableSelected() {

    const numSelected = this.leftTableSelection.selected.length;
    const numRows = !!this.leftTableDataSource && this.leftTableDataSource.data.length;
    return numSelected === numRows;
  }
  isAllRightTableSelected() {

    const numSelected = this.rightTableSelection.selected.length;
    const numRows = !!this.rightTableDataSource && this.rightTableDataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(r => this.selection.select(r));
  }
  masterLeftTableToggle() {

    this.isAllLeftTableSelected() ? this.leftTableSelection.clear() : this.leftTableDataSource.data.forEach(r => this.leftTableSelection.select(r));
  }
  masterRightTableToggle() {

    this.isAllRightTableSelected() ? this.rightTableSelection.clear() : this.rightTableDataSource.data.forEach(r => this.rightTableSelection.select(r));
  }
  checkboxLabel(row: any): string {

    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.shipComponentSpareId + 1}`;
  }
  checkboxLeftTableLabel(row: any): string {

    //console.log(row);
    if (!row) {
      return `${this.isAllLeftTableSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.leftTableSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.shipComponentSpareId + 1}`;
  }
  checkboxRightTableLabel(row: any): string {

    //console.log(row);
    if (!row) {
      return `${this.isAllRightTableSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.rightTableSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.shipComponentSpareId + 1}`;
  }
  //#endregion

  listDetails(id) {
    debugger;
    this.listViewItems = this.dataSource.data.filter(item => item.itemsId == id);
  }

  applyFilter(filterValue: string) {
    debugger;
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.leftTableDataSource.filter = filterValue;
  }
}

