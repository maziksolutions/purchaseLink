import { Component, ElementRef, OnInit, ChangeDetectorRef, NgZone, QueryList, ViewChildren, AfterViewInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PurchaseMasterService } from '../../../services/purchase-master.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { ShipmasterService } from 'src/app/services/shipmaster.service';
import { RequisitionService } from 'src/app/services/requisition.service';
import { map, filter, debounce, debounceTime, distinctUntilChanged, isEmpty, startWith } from 'rxjs/operators';
import { AutoSaveService } from 'src/app/services/auto-save.service';
import { PmsgroupService } from 'src/app/services/pmsgroup.service';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { TypemasterService } from 'src/app/services/typemaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Subscription, concat } from 'rxjs';
import { OrderRefPopUpViewComponent } from './common/order-ref-pop-up-view/order-ref-pop-up-view.component';
import { OrderRefDirectPopUpComponent } from './common/order-ref-direct-pop-up/order-ref-direct-pop-up.component';
import { EditReqQtyComponent } from './common/edit-req-qty/edit-req-qty.component';
import { HostListener } from '@angular/core';
import { ReqItemsModel, ServiceTypeData } from '../../Models/reqItems-model';
import { SideNavService } from 'src/app/services/sidenavi-service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { ModifyColumnsPopUpComponent } from './common/modify-columns-pop-up/modify-columns-pop-up.component';
import { RouteService } from 'src/app/services/route.service';

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

export interface componentTableItems {
  userInput?: string;
  accountCode: string;
  componentId: number;
  componentName: string;
  checkboxState: boolean;
  checkboxDisabled: boolean;
}

interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;
}

export interface Port {
  locationId: number;
  countryId: number;
  location: string;
  locationName: string;
  countryMaster?: Country;
}

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css'],
})
export class RequisitionNewComponent implements OnInit, OnDestroy {

  @ViewChild('attachments') fileInput: ElementRef;

  RequisitionForm: FormGroup; serviceTypeForm: FormGroup; jobListForm: FormGroup; flag; pkey: number = 0; isRequisitionApproved: boolean = false; temporaryNumber: any;
  serviceObject: any = {}; isEditMode = false;
  displayedColumns: string[]
  ItemsColumns: string[] = ['checkbox', 'Number', 'Item Name', 'Ship Component Name', 'Item Code', 'Part No', 'DWG', 'Make', 'Model', 'last Delivery Date',
    'Last Delivered Qty', 'ROB', 'Enter Quantity', 'Unit', 'Item Specs', 'Remarks', 'Attachments'];
  visibleColumns: boolean[] = [true, true, true, true, true, false, false, false, false, false, false, true, true, true, false, true, true];
  serviceTypeColumns: string[] = ['checkbox', 'index', 'sn', 'sd', 'remarks'];
  leftTableColumn: string[] = ['checkbox', 'inventoryName', 'partNo', 'dwg', 'quantity', 'availableQty', 'minRequired', 'reorderLevel'];
  rightTableColumn: string[] = ['checkbox', 'userInput', 'partNo', 'inventoryName'];
  componentTableColumn: string[] = ['checkbox', 'componentName'];
  groupTableColumn: string[] = ['checkbox', 'groupName'];
  attachmentColumns: string[] = ['checkbox', 'attachmenttype', 'filename', 'description', 'filesize', 'uploadeddatetime', 'Uploadedby', 'file'];
  dataSource = new MatTableDataSource<any>();
  leftTableDataSource = new MatTableDataSource<any>();
  rightTableDataSource = new MatTableDataSource<any>();
  componentsDataSourse = new MatTableDataSource<componentTableItems>();
  groupTableDataSource = new MatTableDataSource<any>();
  spareItemDataSource = new MatTableDataSource<any>();
  storeItemDataSource = new MatTableDataSource<any>();
  // serviceTypeDataSource = new MatTableDataSource<any>();
  serviceTypeDataSource: any
  jobListDataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  leftTableSelection = new SelectionModel<any>(true, []);
  rightTableSelection = new SelectionModel<RightTableItem>(true, []);
  componentSelection = new SelectionModel<any>(true, []);
  groupSelection = new SelectionModel<any>(true, []);
  spareItemSelection = new SelectionModel<any>(true, []);
  storeItemSelection = new SelectionModel<any>(true, []);
  selectedIndex: any;
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('shipItemsModal') shipItemsModal!: ElementRef;
  @ViewChild('orderReferenceModal') orderReferenceModal!: ElementRef;
  @ViewChild('orderReferenceModal2') orderReferenceModal2!: ElementRef;
  @ViewChild('itemTable', { static: true }) itemTable: ElementRef;
  @ViewChild('reqQty', { static: false }) reqQty!: ElementRef;
  @ViewChildren('reqQty') reqQtyElements!: QueryList<ElementRef>;
  @ViewChild('rightTable', { read: ElementRef }) rightTable: ElementRef;
  projectnameAndcode: any;
  orderTypes: any;
  Priority: any;
  userId: string;
  userDetail: any;
  Vessels: any;
  Departments: any;
  selectedVesselId: any = '0';
  selectedOrderTypeId: any = '0';
  // Shipcomponent: any;  
  deliveryForm: FormGroup;
  genericCheckbox: boolean = false;
  internalCheckbox: boolean = false;
  commetType: string = '';
  selectedItems: string[] = [];
  storeAccountCode: string[] = [];
  cartItemId: string = '';

  dropdownList: {
    accountCode: any; shipComponentId: number, shipComponentName: string, isDisabled: boolean
  }[] = [];
  dropdownGroupsList: { accountCode: any; pmsGroupId: number, groupName: string, isDisabled: boolean }[] = [];
  selectedDropdown: { shipComponentId: number, shipComponentName: string, accountCode: any; }[] = [];
  selectedGroupsDropdown: { pmsGroupId: number, groupName: string, accountCode: any; }[] = [];
  requisitionId: number;
  reqGetId: string | null;
  reqId: number;
  checkGeneric: boolean = false;
  checkInternal: boolean = false;
  headsite: string;
  headCode: string;
  currentyear = new Date().getFullYear();
  headabb: string;
  requisitiondata: any;
  headserialNumber: string;
  listViewItems: any;

  selectedSpareItemsInput: any[] = [];

  isHeaderCheckboxChecked = false;

  defaultOrderType = '';

  ComponentType: string = '';
  modalTarget: string = '';
  modal: string = '';
  displayValue: string = '';
  saveValue: string = '';
  showOrderReferenceModal: boolean = false;
  showOrderReference2Modal: boolean = false;

  selectedListItem: { itemName: any; id: any; }[] = [];
  itemsId: string = '';

  selectedComponents: componentTableItems[] = [];
  isReqApproved: boolean = false;
  public dataSourceTree: any;
  public groupTableSourceTree: any;
  cursorPosition: number | null = null;
  temporaryNODataBase: string;
  items: ReqItemsModel[] = [];
  approvestatus: any;
  finalHeader: string;
  finallyHeader: any;
  requisitionFullData: any;
  documentHeader: string;
  ReqData: any;
  itemdata: any;
  selectionattachment = new SelectionModel<any>(true, []);
  attachmentdataSource = new MatTableDataSource<any>();
  fileToUpload: File; fileUrl;
  myFiles: string[] = [];
  listOfFiles: any[] = [];
  FileName: string = "Choose file";
  fileList: File[] = [];
  attachmentfrm: FormGroup;
  requisitionWithIDAutoSave: any;
  attachmenttypelist: any;
  targetLoc: any;
  fileUrlss: any;
  filenamecut: string;

  attachmentItemdataSource = new MatTableDataSource<any>();
  selectionItemAttachment = new SelectionModel<any>(true, []);
  fileItemToUpload: File; fileItemUrl;
  myItemFiles: string[] = [];
  listItemOfFiles: any[] = [];
  fileItemList: File[] = [];
  GetItemId: any;
  expandedElement: any;
  isJobListRow = (_: number, row: any) => row === this.expandedElement;
  location = environment.location
  codeAccount: any;
  GetGroupAccCode: any;
  GetCompoAccCode: any;
  GetStoreAccCode: any;
  GetSpareAccCode: any;
  filteredOrderTypes: any
  searchTerm: string = '';
  myControl = new FormControl();
  portList: Port[] = [];
  filteredPorts: Observable<Port[]>;
  showSearchInput: boolean = true;
  myPlaceholder: string = 'Port/Country';
  selectedItemIndex: number = -1;
  AttachlistwithID: any;
  dataJobList: any;
  jobListAttachmentForm: FormGroup
  unitmasterlist: any;
  currentRoute: string;
  userSite: any;
  userData: any;

  pageNumber = 1;
  pageSize = 100;
  totalItems = 0;
  data: any[] = [];
  fileDes: any;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private sideNavService: SideNavService, private cdr: ChangeDetectorRef,
    private router: Router, private purchaseService: PurchaseMasterService, private swal: SwalToastService, private zone: NgZone, private pmsService: PmsgroupService,
    private authStatusService: AuthStatusService, private userService: UserManagementService, private autoSaveService: AutoSaveService, public dialog: MatDialog,
    private vesselService: VesselManagementService, private shipmasterService: ShipmasterService, private requisitionService: RequisitionService,
    private datePipe: DatePipe, private typemasterService: TypemasterService, private sanitizer: DomSanitizer, private http: HttpClient,
    private unitmasterservice: UnitmasterService, private routeService: RouteService
  ) { }

  ngOnInit(): void {

    this.targetLoc = environment.location;
    this.sideNavService.initSidenav();
    this.userId = this.authStatusService.userId();
    this.reqGetId = this.route.snapshot.paramMap.get('requisitionId')
    if (this.reqGetId !== null) {
      
      this.reqId = parseInt(this.reqGetId, 10);

      const vesselDisable = document.getElementById("vesselDisable") as HTMLSelectElement;
      const projectNameCodeDisable = document.getElementById("projectNameCodeDisable") as HTMLSelectElement;
      const categoryDisable = document.getElementById("categoryDisable") as HTMLSelectElement;
      vesselDisable.disabled = true;
      projectNameCodeDisable.disabled = true;
      categoryDisable.disabled = true;

    }
    this.routeService.getCurrentRoute().subscribe(route => {
      this.currentRoute = route;
    });

    this.RequisitionForm = this.fb.group({
      header: this.fb.group({
        requisitionId: [0],
        originSite: ['', [Validators.required]],
        documentHeader: ['', [Validators.required]],
        vesselId: ['0', [Validators.required]],
        orderTypeId: ['0', [Validators.required]],
        orderReference: ['', [Validators.required]],
        orderReferenceType: ['', [Validators.required]],
        departmentId: ['', [Validators.required]],
        priorityId: ['', [Validators.required]],
        projectNameCodeId: ['', [Validators.required]],
        remarks: ['']
      }),

      account: this.fb.group({

      }),

      delivery: this.fb.group({
        delInfoId: [0],
        expectedDeliveryPort: ['', Validators.required],
        expectedDeliveryDate: ['', Validators.required],
        vesselETA: ['', Validators.required],
        vesselETB: ['', Validators.required],
        deliveryAddress: ['vessel'],
        reqIds: [],
        vesselId: []
      }),

      items: this.fb.group({
        itemsId: [0],
        itemCode: ['', [Validators.required]],
        itemName: ['', [Validators.required]],
        partNo: ['', [Validators.required]],
        dwg: ['', [Validators.required]],
        make: ['', [Validators.required]],
        makerReference: ['', [Validators.required]],
        model: ['', [Validators.required]],
        minRequired: [0, [Validators.required]],
        orderQty: [0, [Validators.required]],
        rob: [0, [Validators.required]],
        lpp: [0],
        lpd: [0],
        aq: [0],
        unit: [0],
        uc: [0],
        qu: [0],
        dt: [Date],
        id: [0],
        cost: [0],
        cbc: [0],
        lowest: [0],
        remarks: ['', [Validators.required]],
        line: [''],
        componentName: [''],
        componentCode: [''],
        EquipmentName: [''],
        prevReqdQty: [''],
        approvedQty: [''],
        qtyInUse: [''],
        qtyRoB: [''],
        reorderQty: [''],
        reorderLevel: [''],
        maxQuantity: [''],
        split: [''],
        asset: [''],
        additionalRemarks: [''],
        storageLocation: [''],
        spareId: [],
        storeId: [],
        pmReqId: [0, [Validators.required]],
        vesselId: []
      }),
    });

    this.RequisitionForm.get('header')?.valueChanges.subscribe((headerValue) => {
      // if (headerValue && headerValue.requisitionId === 0) 
      this.autoSave('header');

    })

    this.RequisitionForm.get('delivery')?.valueChanges.subscribe((headerValue) => {
      if (headerValue && headerValue.delInfoId === 0)
        this.autoSave('delivery');
    });

    this.serviceTypeForm = this.fb.group({
      serviceReqId: [0],
      serviceName: ['', Validators.required],
      serviceDesc: ['', Validators.required],
      remarks: ['', Validators.required],
      jobList: this.fb.array([]),
      pmReqId: [],
    })

    this.RequisitionForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        // Trigger auto-save here
        this.autoSave('items'); // Assuming 'items' is the group you want to save
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

    this.attachmentfrm = this.fb.group({
      attachmentId: [0],
      attachmentTypeId: ['', [Validators.required]],
      tableName: [''],
      tablePkeyId: [],
      pageName: [''],
      attachment: [''],
      description: [''],
      vesselId: []
    });

    this.loadData(0);

    this.sortItems();
    this.sideNavService.setActiveComponent(true);
    // const orderTypeIdControl = this.RequisitionForm.get('header.orderTypeId');
    // if (orderTypeIdControl) {
    //   orderTypeIdControl.valueChanges.subscribe(() => {
    //     // Reset orderReference value when orderTypeId changes
    //     const orderReferenceControl = this.RequisitionForm.get('header.orderReference');
    //     if (orderReferenceControl) {
    //       // orderReferenceControl.setValue('');
    //     }
    //   });
    // }

    // this.requisitionService.selectedItems$.subscribe(data => {

    //   if (data != null && data.displayValue !== '' && data.saveValue !== '') {
    //     this.zone.run(() => {
    //       this.displayValue = ''
    //       this.saveValue = ''
    //       this.displayValue = data.displayValue;
    //       this.saveValue = data.saveValue;
    //     })
    //     const orderType = data.defaultOrderType
    //     this.RequisitionForm.get('header')?.patchValue({ orderReferenceType: data.orderReferenceType })
    //     if (orderType !== 'Service') {
    //       if (data.orderReferenceType === 'Component') {
    //         this.dataSource.data = [];
    //         this.getSpareItems(data.orderReferenceType, data.saveValue);
    //         this.autoSave('header')
    //       }
    //       else if (data.orderReferenceType === 'Group') {
    //         this.dataSource.data = [];
    //         this.getSpareItems(data.orderReferenceType, data.saveValue);
    //         this.autoSave('header')
    //       }
    //       else if (data.orderReferenceType === 'Spare') {
    //         this.leftTableDataSource.data = []
    //         this.dataSource.data = [];
    //         this.dataSource.data = data.cartItems?.map((item: any) => this.transformSpare(item)) || [];
    //         this.autoSave('header')
    //       }
    //       else if (data.orderReferenceType === 'Store') {
    //         this.leftTableDataSource.data = []
    //         this.dataSource.data = [];
    //         this.dataSource.data = data.cartItems?.map((item: any) => this.transformStore(item)) || [];
    //         this.autoSave('header')
    //       }
    //     }
    //   }
    // });

    // this.Loadgroup();
    // this.LoadComponent();
    // this.LoadStore();
    // this.LoadSpare();

    this.displayedColumns = this.ItemsColumns.filter((column, index) => this.visibleColumns[index]);
  }

  ngOnDestroy(): void {
    this.displayValue = ''
    this.saveValue = ''
  }

  get fm() { return this.RequisitionForm.controls };
  get fmd() { return this.deliveryForm.controls };
  get atfm() { return this.attachmentfrm.controls };
  get serviceType() { return this.serviceTypeForm.controls }
  get jobListAttachment() { return this.jobListAttachmentForm.controls }
  get jobListControls() {
    return (this.serviceTypeForm.get('jobList') as FormArray).controls;
  }

  generateTempNumber() {

    this.requisitionService.getTempNumber(0).subscribe(res => {
      if (res.data != null) {

        this.temporaryNumber = res.data;
        this.RequisitionForm.get('header')?.patchValue({ documentHeader: this.temporaryNumber })

        // var formattedNumber = parseInt(res.data.documentHeader)
        // formattedNumber++;

        // let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        // let text = '';
        // length = 3;
        // for (var i = 0; i < length; i++) {
        //   text += possible.charAt(Math.floor(Math.random() * possible.length));
        // }

        // this.temporaryNumber = formattedNumber.toString().padStart(3, '0') + ' - ' + text;
        // this.temporaryNODataBase = formattedNumber.toString().padStart(3, '0') + ' - ' + text;

      }
      // if (res.data == null) {
      //   var formattedNumber = parseInt('000');
      //   formattedNumber++;

      //   let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      //   let text = '';
      //   length = 3;
      //   for (var i = 0; i < length; i++) {
      //     text += possible.charAt(Math.floor(Math.random() * possible.length));
      //   }

      //   this.temporaryNumber = formattedNumber.toString().padStart(3, '0') + ' - ' + text;
      //   this.temporaryNODataBase = formattedNumber.toString().padStart(3, '0') + ' - ' + text;

      // }
    })
  }

  CloseServiceModal(){
    this.serviceTypeForm.reset();
    this.serviceTypeForm.controls.serviceReqId.setValue('0');
    (this.serviceTypeForm.controls.jobList as FormArray).clear();
    $('#add-service').modal('hide')

  }

  addJob() {
    this.GetunitList();
    const job = this.fb.group({
      jobId: [0],
      jobDescription: ['', Validators.required],
      qty: ['0', Validators.required],
      unit: ['', Validators.required],
      remarks: ['', Validators.required],
      attachment: ['']
    });

    const jobListFormArray = this.serviceTypeForm.get('jobList') as FormArray;
    jobListFormArray.push(job);
  }
  getAttachmentFormGroup(jobIndex: number): FormGroup {
    const jobListFormArray = this.serviceTypeForm.get('jobList') as FormArray;
    const jobFormGroup = jobListFormArray.at(jobIndex) as FormGroup;
    return jobFormGroup.get('attachment') as FormGroup;
  }


  autoSave(partName: string): void {

    if (partName == 'header') {

      const formPart = this.RequisitionForm.get(partName);
      if (this.isRequisitionApproved) {
        const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
        this.temporaryNumber = documentHeaderElement.textContent;
      }
      // formPart?.get('orderReference')?.setValue(displayValue);

      formPart?.patchValue({
        requisitionId: formPart?.value.requisitionId,
        documentHeader: formPart?.value.documentHeader || '0',
        originSite: this.location,
        vesselId: formPart?.value.vesselId,
        orderTypeId: formPart?.value.orderTypeId,
        orderReference: this.saveValue,
        departmentId: formPart?.value.departmentId,
        priorityId: formPart?.value.priorityId,
        projectNameCodeId: formPart?.value.projectNameCodeId,
        remarks: formPart?.value.remarks,
       
      });

     
      if (partName == 'header' && formPart != null && formPart.valid) {

        const formData = new FormData();
        formData.append('data', JSON.stringify(formPart.value))
        // formPart?.get('orderReference')?.setValue(displayValue);
        this.requisitionService.addRequisitionMaster(formData)
          .subscribe(data => {
            this.reqId = data.data;
            
            const vesselDisable = document.getElementById("vesselDisable") as HTMLSelectElement;
            const projectNameCodeDisable = document.getElementById("projectNameCodeDisable") as HTMLSelectElement;
            const categoryDisable = document.getElementById("categoryDisable") as HTMLSelectElement;
            vesselDisable.disabled = true;
            projectNameCodeDisable.disabled = true;
            categoryDisable.disabled = true;
            this.approvestatus = data.approvedReq
            this.temporaryNumber = data.documentHeader
            formPart.patchValue({ requisitionId: data.data, documentHeader: data.documentHeader })
            if (this.defaultOrderType[0] !== 'Service') {
              if (formPart.value.orderReferenceType === 'Spare' || formPart.value.orderReferenceType === 'Store') {

                this.items = []

                this.dataSource.data.map(item => {
                  const newItem = {
                    itemsId: item.itemsId || 0,
                    spareId: item.spareId || null,
                    storeId: item.storeId || null,
                    itemCode: item.itemCode || '',
                    itemName: item.itemName || '',
                    partNo: item.partNo || '',
                    availableQty: item.minimumLevel || '',
                    dwg: item.dwg || '',
                    maker: item.maker || '',
                    makerReference: item.makerReference || '',
                    model: item.model || '',
                    material: item.material || '',
                    description: item.description || '',
                    remarks: item.remarks || '',
                    minRequired: item.minRequired || 0,
                    reqQty: item.reqQty || 0,
                    rob: item.rob || 0,
                    lpp: item.lpp || 0,
                    lpd: item.lpd || 0,
                    aq: item.aq || 0,
                    unit: item.unit || '',
                    uc: item.uc || 0,
                    qu: item.qu || 0,
                    dt: item.dt || '',
                    id: item.id || 0,
                    cost: item.cost || 0,
                    cbc: item.cbc || 0,
                    lowest: item.lowest || 0,
                    itemRemarks: item.itemRemarks || '',
                    line: item.line || '',
                    componentName: item.componentName || '',
                    componentCode: item.componentCode || '',
                    equipmentName: item.equipmentName || '',
                    prevReqdQty: item.prevReqdQty || '',
                    approvedQty: item.approvedQty || '',
                    qtyInUse: item.qtyInUse || '',
                    qtyRoB: item.qtyRoB || '',
                    reorderQty: item.reorderQty || '',
                    reorderLevel: item.reorderLevel || '',
                    maxQuantity: item.maxQuantity || '',
                    split: item.split || false,
                    asset: item.asset || false,
                    additionalRemarks: item.additionalRemarks || '',
                    storageLocation: item.storageLocation || '',
                    attachments: item.attachments || '',
                    pmReqId: this.reqId,
                    vesselId: this.selectedVesselId
                  };
                  this.items.push(newItem);
                });
              }
            }
            if (data.message == "data added") {

              this.swal.success('Added successfully.');
              if (this.defaultOrderType[0] !== 'Service') {
                if (formPart.value.orderReferenceType === 'Spare' || formPart.value.orderReferenceType === 'Store') {
                  this.requisitionService.addItemsDataList(this.items).subscribe(res => {
                    if (res.message == "All items added") {
                      this.swal.success('Added successfully.');
                      this.loadItemsData(0);
                    }
                  });
                }
              }
            }
            else if (data.message == "Update") {

              this.swal.success('Data has been updated successfully.');
              if (this.defaultOrderType[0] !== 'Service') {
                if (formPart.value.orderReferenceType === 'Spare' || formPart.value.orderReferenceType === 'Store') {
                  this.requisitionService.addItemsDataList(this.items).subscribe(res => {
                    if (res.message == "All items added") {
                      this.swal.success('Added successfully.');
                      this.loadItemsData(0);
                    }
                  });
                }
                else {
                  this.swal.success('Updated successfully.');
                  this.loadData(0)
                }
              }
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

          },
            error => {
              this.swal.error('An error occurred. Please try again.');
            })
      }
      formPart?.get('orderReference')?.setValue(this.displayValue);
    }
    else if (partName == 'delivery') {

      if (this.reqId) {

        const formPart = this.RequisitionForm.get(partName);
        const selectedPort = this.myControl.value;
        if (selectedPort) {
          // const concatenatedValue = selectedPort.location + ',' + selectedPort.locationName;
          formPart?.patchValue({
            reqIds: this.reqId,
            expectedDeliveryPort: selectedPort.locationName,
            vesselId: this.selectedVesselId
          })
        }

        if (partName == 'delivery' && formPart != null && formPart.valid) {
          // this.requisitionFullData.vesselId
          this.requisitionService.addDeliveryAddress(formPart.value)
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
    }
    else if (partName == 'items') {
      if (this.reqId) {

        const itemList = this.dataSource.data.map(item => {

          if (item.itemsId != 0) {

            const { editMode, ...rest } = item;
            rest.vesselId = this.selectedVesselId
            return rest;
          } else {
            const { editMode, ...rest } = item;
            rest.vesselId = this.selectedVesselId
            return rest;
          }
        })

        this.requisitionService.addItemsDataList(itemList).subscribe(res => {

          if (res.message == "All items added") {
            this.swal.success('Added successfully.');
            this.loadItemsData(0);
          }
        });
      }
    }
  }

  // onCheckboxChanged(event) {

  //   const checkboxType = event.target.id;
  //   const isChecked = event.target.checked;
  //   this.commetType = '';
  //   if (checkboxType === 'generic') {
  //     this.RequisitionForm.get('header.genericCheckbox')?.setValue(isChecked);
  //     this.RequisitionForm.get('header.internalCheckbox')?.setValue(false);
  //     this.genericCheckbox = isChecked;
  //     this.internalCheckbox = false;
  //     this.commetType = 'generic';
  //   } else if (checkboxType === 'internal') {
  //     this.RequisitionForm.get('header.internalCheckbox')?.setValue(isChecked);
  //     this.RequisitionForm.get('header.genericCheckbox')?.setValue(false);
  //     this.internalCheckbox = isChecked;
  //     this.genericCheckbox = false;
  //     this.commetType = 'internal';
  //   }

  //   this.sideNavService.setCommetType(this.commetType);
  //   if (!this.reqGetId) {
  //     this.autoSave('header');
  //   }
  // }
  clearServiceForm() {

    this.serviceTypeForm.controls.serviceName.setValue('')
    this.serviceTypeForm.controls.serviceDesc.setValue('')
    this.serviceTypeForm.controls.remarks.setValue('')
    const jobListArray = this.serviceTypeForm.get('jobList') as FormArray;
    while (jobListArray.length) {
      jobListArray.removeAt(0);
    }
    this.serviceTypeForm.reset();
  }

  onFileChange(event: any, index: number) {

    const file = event.target.files[0];
    const jobListFormArray = this.serviceTypeForm.get('jobList') as FormArray;
    const jobFormGroup = jobListFormArray.at(index) as FormGroup;
    jobFormGroup.get('attachment')?.setValue(file);
  }

  getAttachmentFile(jobIndex: number): FormGroup {
    const jobListFormArray = this.serviceTypeForm.get('jobList') as FormArray;
    const jobFormGroup = jobListFormArray.at(jobIndex) as FormGroup;
    return jobFormGroup.get('attachment') as FormGroup;
  }

  onSubmit() {

    if (this.reqId) {
      const formData = new FormData();
      this.serviceTypeForm.patchValue({ pmReqId: this.reqId })
      const data = this.serviceTypeForm.value

      formData.append('data', JSON.stringify(data))

      if (this.serviceTypeForm.valid) {
        this.requisitionService.addServiceType(formData).subscribe(data => {

          if (data.message == "data added") {
            this.swal.success('Added successfully.');
            if (this.reqId) {
              this.clearServiceForm();
              this.loadServiceType(this.reqId);
            }
          } else if (data.message == "updated") {
            this.swal.success('Data has been updated successfully.');
            this.clearServiceForm();
            this.loadServiceType(this.reqId);
          }
          else if (data.message == "duplicate") {
            this.swal.info('Data already exist. Please enter new data');
            if (this.reqId)
              this.loadServiceType(this.reqId);
          }
          else if (data.message == "not found") {
            this.swal.info('Data exist not exist');

          }

          $("#add-service").modal('hide');

          // setTimeout(() => {
          //   if (this.reqId) {
          //     this.loadServiceType(this.reqId);
          //   }
          // }, 500); // Adjust the delay as needed
        });
      }
    }

    // formValues.jobList.forEach((job: any, index: number) => {
    //   const attachmentFormGroup = this.getAttachmentFormGroup(index);
    //   const attachmentFile = attachmentFormGroup.get('attachmentFile')?.value;
    //   if (attachmentFile) {
    //     formData.append(`attachment${index}`, attachmentFile);
    //   }
    // });

    // Append other form data


  }
  loadServiceType(id: any) {

    this.requisitionService.getServiceType(id).subscribe(res => {

      if (res.status === true) {

        const dataWithExpansion = res.data.map((item) => {
          // Ensure each item in jobList has the isExpanded property
          item.jobList = item.jobList.map(job => ({ ...job, isExpanded: false }));
          return { ...item, isExpanded: false };
        });
        this.serviceTypeDataSource = dataWithExpansion
        this.displayJobListsColumn();
      }
    })
  }
  // method to open the modal in add mode
  openAddServiceModal() {
    this.isEditMode = false;
    this.modal = 'modal'
    this.modalTarget = 'add-service'
    this.resetForm();
    this.openServiceTypeModal();

  }
  setDataBsToggle(value: string): void {
    // Dynamically set data-bs-toggle
    const addButton = document.getElementById('add-service-button');
    if (addButton) {
      addButton.setAttribute('data-bs-toggle', value);
    }
  }
  setDataBsTarget(value: string): void {
    // Dynamically set data-bs-target
    const addButton = document.getElementById('add-service-button');
    if (addButton) {
      addButton.setAttribute('data-bs-target', value);
    }
  }
  // method to open the modal in edit mode
  openEditServiceModal(service: any) {
    this.isEditMode = true;
    this.serviceObject = { ...service }; // copy data from the selected service
    this.populateForm();
    this.populateJobListForm();
    this.openServiceTypeModal();
  }
  populateJobListForm() {
    const jobListFormArray = this.serviceTypeForm.get('jobList') as FormArray;
    jobListFormArray.clear(); // Clear existing form array

    // Iterate through jobList and add form group for each job
    for (const job of this.serviceObject.jobList) {
      jobListFormArray.push(this.createJobFormGroup(job));
    }
  }
  createJobFormGroup(job: any): FormGroup {
    return this.fb.group({
      jobId: [job.jobId],
      jobDescription: [job.jobDescription],
      qty: [job.qty],
      unit: [job.unit],
      remarks: [job.remarks],
      attachment: [job.attachment],
    });
  }
  // method to reset the form
  resetForm() {
    this.serviceTypeForm.reset({
      serviceReqId: 0,
      serviceName: '',
      serviceDesc: '',
      remarks: '',
      jobList: this.fb.array([]),
      pmReqId: 0,
    })
  }
  // method to populate the form with data from the service object
  populateForm() {
    this.serviceTypeForm.patchValue(this.serviceObject);
  }
  // method to open the modal
  openServiceTypeModal() {
    $("#add-service").modal('show');
  }
  displayJobListsColumn(): boolean {
    // Check if any row is expanded
    return this.serviceTypeDataSource.data?.some(row => row.isExpanded);
  }

  getReqData() {

    this.requisitionService.getRequisitionById(this.reqGetId)
      .subscribe(response => {

        const requisitionData = response.data;
        const formPart = this.RequisitionForm.get('header');
        this.approvestatus = requisitionData.approvedReq;
        this.finallyHeader = requisitionData.documentHeader;
        this.requisitionFullData = response.data;
        this.saveValue = requisitionData.orderReference
        this.displayValue = requisitionData.orderReferenceNames

        // Populate the form controls with the data for editing
        formPart?.patchValue({
          requisitionId: requisitionData.requisitionId,
          originSite: requisitionData.originSite,
          vesselId: requisitionData.vesselId,
          orderTypeId: requisitionData.orderTypeId,
          departmentId: requisitionData.departmentId,
          priorityId: requisitionData.priorityId,
          projectNameCodeId: requisitionData.projectNameCodeId,
          remarks: requisitionData.remarks,
          orderReference: requisitionData.orderReferenceNames,
          documentHeader: requisitionData.documentHeader,
          orderReferenceType: requisitionData.orderReferenceType
        });

        if (this.approvestatus === 'Approved') {
          const headerStringParts = requisitionData.documentHeader.split(' – ');
          if (headerStringParts.length === 6) {
            const headerSerialNumber = headerStringParts[5];
            // this.headabb = headerStringParts[3];
            const descriptionDisable = document.getElementById("descriptionDisable") as HTMLSelectElement;
            descriptionDisable.disabled = true;

            this.temporaryNumber = headerSerialNumber;
          }
        } else {
          this.temporaryNumber = requisitionData.documentHeader
        }

        if (requisitionData.originSite == 'Office') {
          this.headsite = 'O'
        }
        else {
          this.headsite = 'V'

        }

        this.reqId = requisitionData.requisitionId;
        this.selectedVesselId = requisitionData.vesselId;
        const objProcR = requisitionData.orderReference.split(',');
        this.getPortList().subscribe(res => {
          
          this.portList = res;
          this.loadDeliveryInfo();
        });

        this.loadOrderTypeByEditReq().subscribe(res => {

          this.orderTypes = res;

          const selectedProjectCode = this.projectnameAndcode.filter(item => item.projectNameId == requisitionData.projectNameCodeId).map(item => item.serviceTypeId)
          if (selectedProjectCode[0] != null) {
            const serviceTypeIds: string[] = selectedProjectCode[0].split(',');

            // Filter order types based on service type IDs
            this.filteredOrderTypes = this.orderTypes.filter(orderType => {
              const orderTypeServiceTypeIds: string[] = orderType.serviceTypeId.split(',');
              return serviceTypeIds.some(id => orderTypeServiceTypeIds.includes(id));
            });
          }

          this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(requisitionData.orderTypeId)).map(x => x.defaultOrderType);
          formPart?.patchValue({ orderTypeId: requisitionData.orderTypeId })
          if (requisitionData.orderReferenceType === 'Component' || requisitionData.orderReferenceType === 'Spare') {
            this.getSpareItems('Component', objProcR);
            this.LoadShipCompnent()
            this.getCartItemsInEditReq(0).subscribe(res => {
              const transformedData: any[] = [];
              this.spareItemDataSource.data.forEach((item: any) => {

                if (requisitionData.orderReferenceNames.includes(item.inventoryName))
                  transformedData.push(this.transformSpare(item));
              })
              if (this.reqId) {
                this.loadItemsData(0);
              } else {
                this.dataSource.data = transformedData
              }
            })
          } else if (requisitionData.orderReferenceType === 'Group' || requisitionData.orderReferenceType === 'Store') {
            this.getSpareItems('Group', objProcR);
            this.loadGroupsComponent()
            this.getCartItemsInEditReq(0).subscribe(res => {

              const transformedData: any[] = [];
              this.storeItemDataSource.data.forEach((item: any) => {

                if (requisitionData.orderReferenceNames.includes(item.inventoryName))
                  transformedData.push(this.transformStore(item));
              })
              if (this.reqId) {
                this.loadItemsData(0);
              } else {
                this.dataSource.data = transformedData
              }
            })
          }
        })

        this.loadServiceType(this.reqId);
      });
  }

  loadOrderTypeByEditReq() {
    return this.purchaseService.getOrderTypes(0).pipe(map(res => {
      return res.data;
    }))
  }

  transformSpare(item: any): any {

    return {
      itemsId: item.itemsId || 0,
      itemCode: item.inventoryCode || '',
      itemName: item.inventoryName || '',
      partNo: item.spareAssembly.partNo || '',
      dwg: item.spareAssembly.drawingNo || '',
      maker: item.spareAssembly.components?.maker?.makerName || '',
      makerReference: item.makerReference || '',
      model: item.spareAssembly?.modelNo || '',
      minRequired: item.minRequired || 0,
      reqQty: item.requiredQuantity || 0,
      rob: item.rob || 0,
      lpp: item.lpp || 0,
      lpd: item.lpd || 0,
      aq: item.aq || 0,
      unit: item.unit || 0,
      uc: item.uc || 0,
      qu: item.qu || 0,
      dt: item.dt || '',
      id: item.id || 0,
      cost: item.assetCost || 0,
      cbc: item.cbc || 0,
      lowest: item.lowest || 0,
      itemRemarks: '',
      line: item.remarks || '',
      componentName: item.spareAssembly?.components?.shipComponentName || '',
      componentCode: item.spareAssembly?.components?.shipComponentCode || '',
      EquipmentName: item.EquipmentName || '',
      prevReqdQty: item.prevReqdQty || '',
      approvedQty: item.approvedQty || '',
      qtyInUse: item.qtyInUse || '',
      qtyRob: item.qtyRob || '',
      reorderQty: item.reorderQty || '',
      reorderLevel: item.reorderLevel || '',
      maxQuantity: item.maxQuantity || '',
      split: item.split || false,
      asset: item.asset || false,
      additionalRemarks: item.additionalRemarks || '',
      storageLocation: item.storageLocation || '',
      attachments: item.attachments || '',
      spareId: item.shipSpareId || null,
      storeId: item.shipStoreId || null,
      pmReqId: this.reqId,
    }
  }
  transformStore(item: any): any {
    return {
      itemsId: item.itemsId || 0,
      itemCode: item.inventoryCode || '',
      itemName: item.inventoryName || '',
      partNo: item.partNo || '',
      dwg: item.dwg || '',
      maker: item.makerReference || '',
      model: item.model || '',
      minRequired: item.minRequired || 0,
      reqQty: item.requiredQuantity || 0,
      rob: item.rob || 0,
      lpp: item.lpp || 0,
      lpd: item.lpd || 0,
      aq: item.aq || 0,
      unit: item.unit || 0,
      uc: item.uc || 0,
      qu: item.qu || 0,
      dt: item.dt || '',
      id: item.id || 0,
      cost: item.assetCost || 0,
      cbc: item.cbc || 0,
      lowest: item.lowest || 0,
      itemRemarks: '',
      remarks: item.remarks || '',
      material: item.material || '',
      description: item.description || '',
      line: item.remarks || '',
      componentName: item.componentName || '',
      componentCode: item.componentCode || '',
      EquipmentName: item.EquipmentName || '',
      prevReqdQty: item.prevReqdQty || '',
      approvedQty: item.approvedQty || '',
      qtyInUse: item.qtyInUse || '',
      qtyRob: item.qtyRob || '',
      reorderQty: item.reorderQty || '',
      reorderLevel: item.reorderLevel || '',
      maxQuantity: item.maxQuantity || '',
      split: item.split || false,
      asset: item.asset || false,
      additionalRemarks: item.additionalRemarks || '',
      storageLocation: item.storageLocation || '',
      attachments: item.attachments || '',
      spareId: item.shipSpareId || null,
      storeId: item.shipStoreId || null,
      pmReqId: this.reqId,
    }
  }

  getCartItemsInEditReq(status) {
    return this.shipmasterService.GetCartItemsInfo(status).pipe(map(res => {

      if (this.defaultOrderType[0] === 'Service' || this.defaultOrderType[0] === 'Spare') {
        return this.spareItemDataSource.data = res.data.map(item => {
          this.cartItemId = 'shipSpareId';
          const spareMaster = item.shipSpareMaster;
          if (spareMaster) {
            spareMaster.requiredQuantity = item.requiredQuantity,
              spareMaster.spareAssembly = item.shipComponentSparesLink
          }
          return spareMaster
        }).filter(spareMaster => spareMaster)
      }
      else if (this.defaultOrderType[0] === 'Store') {
        return this.storeItemDataSource.data = res.data.map(item => {
          this.cartItemId = 'shipStoreId';
          const storeMaster = item.shipStore;
          if (storeMaster)
            storeMaster.requiredQuantity = item.requiredQuantity
          return storeMaster
        }).filter(store => store)
      }
    }))
  }

  updateDocumentHeader(requisitionData: any) {

    this.headsite = requisitionData.originSite === 'Office' ? 'O' : 'V';
    this.headCode = requisitionData.originSite === 'Office' ? 'OFF' : this.headCode[0];

    if (this.isRequisitionApproved) {
      const headerStringParts = requisitionData.documentHeader.split(' – ');
      if (headerStringParts.length === 6) {
        const headerSerialNumber = headerStringParts[5];
        this.headabb = headerStringParts[3];
        this.headserialNumber = headerSerialNumber;
      }
    }

    this.zone.run(() => {

      this.cdr.markForCheck();
      // Update document header element
      const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
      // documentHeaderElement.innerHTML = `<i class="fas fa-radiation text-danger"></i><i class="fas fa-exclamation-triangle text-danger"></i> REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
      documentHeaderElement.innerHTML = ` REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;

    })
    // this.loadGroupsComponent();
  }

  loadDeliveryInfo() {
    this.requisitionService.getDeliveryInfoByReqId(this.reqId).subscribe(res => {

      const deliveryInfoData = res.data;
      if (deliveryInfoData) {

        const selectedPort = this.portList.find(port => port.locationName === deliveryInfoData.expectedDeliveryPort);
        if (selectedPort) {
          this.myControl.setValue(selectedPort);
        }
        const delivery = this.RequisitionForm.get('delivery');
        delivery?.patchValue({
          delInfoId: deliveryInfoData.delInfoId,
          // expectedDeliveryPort: this.portList.find(deliveryInfoData.expectedDeliveryPort),
          expectedDeliveryDate: this.formatDate(deliveryInfoData.expectedDeliveryDate),
          vesselETA: this.formatDate(deliveryInfoData.vesselETA),
          vesselETB: this.formatDate(deliveryInfoData.vesselETB),
          deliveryAddress: deliveryInfoData.deliveryAddress,
        })
      }
    })
  }
  // findPortByLocationName(locationName: string): any {
  //   // Splitting the locationName by comma
  //   const [_, name] = locationName.split(','); // Using '_' to ignore the first part
  //   // Finding the corresponding port object based on the locationName
  //   return this.portList.find(port => port.locationName === name.trim());
  // }

  private formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
  }

  LoadShipCompnentList() {

    return this.pmsService.GetComponentByList(0)
      .pipe(map(res => {
        this.componentsDataSourse.data = res.data;
        return { data: this.componentsDataSourse.data };
      }));
  }

  LoadOrdertype() {
    this.purchaseService.getOrderTypes(0)
      .subscribe(response => {
        this.orderTypes = response.data;
        this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.defaultOrderType);
        if (this.defaultOrderType[0] === 'Spare' || this.defaultOrderType[0] === 'Service')
          this.LoadShipCompnent();
        else if (this.defaultOrderType[0] === 'Store')
          this.loadGroupsComponent()
      },
        error => {
          console.error('Error loading order types:', error);
        }
      )
  }
  selectProjectCode(event: any) {

    const selectedId = event.target.value;
    const selectedProjectCode = this.projectnameAndcode.filter(item => item.projectNameId == selectedId).map(item => item.serviceTypeId)
    if (selectedProjectCode[0] != null) {
      const serviceTypeIds: string[] = selectedProjectCode[0].split(',');

      // Filter order types based on service type IDs
      this.filteredOrderTypes = this.orderTypes.filter(orderType => {
        const orderTypeServiceTypeIds: string[] = orderType.serviceTypeId.split(',');
        return serviceTypeIds.some(id => orderTypeServiceTypeIds.includes(id));
      });
      this.autoSave('header')
    }
  }

  LoadProjectnameAndcode() {

    // this.selectedVesselId =this.RequisitionForm.get('header')?.value.vesselId

    this.purchaseService.getProjectNCForReq(0)
      .subscribe(response => {

        if (this.selectedVesselId != "0") {
          const Vesselset = this.RequisitionForm.get('header')
          if (Vesselset) {
            Vesselset.value.vesselId = this.selectedVesselId
          }

          this.projectnameAndcode = response.data;

        }
        else {

          this.projectnameAndcode = response.data;
        }

      })
  }

  LoadPriority() {
    this.purchaseService.GetPreferenceType(0)
      .subscribe(response => {
        this.Priority = response.data;
      })
  }

  // LoadUserDetails() {
  //   this.userService.getUserById(this.userId)
  //     .subscribe(response => {
  //       this.userDetail = response.data;
  //       this.currentyear = new Date().getFullYear();

  //       if (this.userDetail.site == 'Office') {
  //         this.headsite = 'O';
  //         this.headCode = 'OFF';
  //         this.headabb = '___';
  //         // let requisitionValues = this.requisitiondata.filter(x => x.originSite === 'Office').length;
  //         // this.headserialNumber = `${requisitionValues + 1}`.padStart(4, '0');
  //       }
  //       else if (this.userDetail.site == 'Vessel') {
  //         this.headsite = 'V';
  //         this.headCode = '___ ';
  //         this.headabb = '___';

  //         // let requisitionValues = this.requisitiondata.filter(x => x.originSite === 'Vessel');
  //         // this.headserialNumber = `${requisitionValues.length + 1}`.padStart(4, '0');
  //       }

  //     })
  // }

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
        // (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });

    if (this.reqGetId) {
      // this.loadItemByReqId(this.reqGetId);
      this.LoadVessel();
      this.LoadProjectnameAndcode();
      this.LoadPriority();
      this.LoadDepartment();
      this.userService.getUserById(this.userId).subscribe(response => {
        this.userDetail = response.data;
        this.userSite = response.data.site;
        this.currentyear = new Date().getFullYear();
      })
      // this.LoadUserDetails();
      this.getReqData();
    } else {
      this.saveValue = ''
      this.displayValue = ''
      // this.LoadUserDetails();
      this.LoadOrdertype();
      this.LoadPriority();
      this.LoadVessel();
      this.LoadDepartment();
      
      // this.generateTempNumber();
    }
  }

  LoadVessel() {

    this.vesselService.getVessels(0)
      .subscribe(response => {

        if (this.targetLoc == 'Vessel') {
          this.headsite = 'V'
          const filteredVessels = response.data.filter(x => x.vesselId == environment.vesselId);
          if (filteredVessels.length > 0) {
            this.Vessels = filteredVessels;
            this.selectedVesselId = filteredVessels[0].vesselId;
            this.LoadProjectnameAndcode()
          }
        }
        else {
          this.headsite = 'O'
          this.Vessels = response.data;
          this.LoadProjectnameAndcode();

        }
      })
  }

  LoadDepartment() {
    this.userService.getDepartment(0)
      .subscribe(response => {
        this.Departments = response.data;
      })
  }

  getPortList() {
    return this.requisitionService.GetPortList(0).pipe(map(res => {
      
      return res.data;
    }))
  }

  loadPortList() {
    this.requisitionService.GetPortList(0)
      .subscribe(response => {

        this.portList = response.data;

        this.filteredPorts = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filterPorts(value))
        );
      });
  }
  displayFn(port: any): string {

    if (port && port.locationName &&  port.countryName) {
      return `${port.locationName}, ${port.countryName}`;
    } else if (port && port.locationName) {
      return port.locationName;
    } else {
      return '';
    }
  }
  private _filterPorts(value: string | Port): Port[] {

    const filterValue = (typeof value === 'string' ? value : value?.locationName || '').toLowerCase();

    return this.portList.filter(port => {
      const locationName = port.locationName.toLowerCase();
      const countryName = port.countryMaster?.countryName?.toLowerCase();
      return locationName.includes(filterValue) || countryName?.includes(filterValue);
    });
  }
  filterPorts(searchTerm: string) {

    if (searchTerm.trim().length > 0) {
      this.showSearchInput = false;
      this.filteredPorts = this.myControl.valueChanges.pipe(
        startWith(searchTerm),
        map(value => this._filterPorts(value))
      );
    } else {
      this.showSearchInput = true;
      this.filteredPorts = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.locationName),
        map(name => name ? this._filterPorts(name) : this.portList.slice())
      );
    }
  }


  LoadShipCompnent() {
    this.requisitionService.getTemplateTree().subscribe(res => {
      this.dataSourceTree = res;

    })
  }

  loadGroupsComponent() {

    // this.requisitionService.getGroupTemplateTree().subscribe(res => {
    //   this.groupTableSourceTree = res
    // })
    if (this.selectedVesselId) {
      const shipIdUint: number = parseInt(this.selectedVesselId, 10)
      const keyword = '';
      const pageNumber = 1;
      const pageSize = 20;
      // this.requisitionService.GetStoreByShipId(shipIdUint,keyword,pageNumber,pageSize).subscribe(res => {
      //   // this.groupTableDataSource.data = res.data.map(item => {
      //   //   return {
      //   //     pmsGroupId: item.pmsGroupId,
      //   //     groupName: item.groupName,
      //   //     accountCode: item.accountCode,
      //   //     // Add other properties as needed
      //   //   };
      //   // });
      //   // this.groupTableDataSource.data = res.data
      //   // this.groupTableDataSource.sort = this.sort;
      //   // this.groupTableDataSource.paginator = this.paginator;
      // })
    }

  }

  getCartItems(status) {

    this.shipmasterService.GetCartItemsInfo(status).subscribe(res => {

      if (this.defaultOrderType[0] === 'Service' || this.defaultOrderType[0] === 'Spare') {
        this.spareItemDataSource.data = res.data.map(item => {

          this.cartItemId = 'shipSpareId';
          const spareMaster = item.shipSpareMaster;
          if (spareMaster) {
            spareMaster.requiredQuantity = item.requiredQuantity,
              spareMaster.spareAssembly = item.shipComponentSparesLink
          }
          return spareMaster
        }).filter(spareMaster => spareMaster)
      }
      else if (this.defaultOrderType[0] === 'Store') {
        this.storeItemDataSource.data = res.data.map(item => {

          this.cartItemId = 'shipStoreId';
          const storeMaster = item.shipStore;
          if (storeMaster)
            storeMaster.requiredQuantity = item.requiredQuantity
          return storeMaster
        }).filter(store => store)
      }
    })
  }

  LoadheadorderType() {

    this.zone.run(() => {

      this.headabb = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.abbreviation);
      this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.defaultOrderType);
      if (this.defaultOrderType[0] === 'Service' || this.defaultOrderType[0] === 'Spare') {
        this.LoadShipCompnent()
        this.getCartItems(0)
      } else if (this.defaultOrderType[0] === 'Store') {
        this.loadGroupsComponent()
        this.getCartItems(0)
      }
      this.RequisitionForm.get('header')?.patchValue({ orderReference: '' });
      this.cdr.markForCheck();
      if (this.headsite === 'V') {
        this.headCode = this.Vessels.filter(x => x.vesselId === parseInt(this.selectedVesselId)).map(x => x.vesselCode);
      }

      // Update document header element
      const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
      // documentHeaderElement.innerHTML = `<i class="fas fa-radiation text-danger"></i><i class="fas fa-exclamation-triangle text-danger"></i> REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
      documentHeaderElement.innerHTML = ` REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.temporaryNumber}`;
    })
  }

  getSpareItemsList() {
    // Assuming allItems is already populated with data
    this.totalItems = this.data.length;
    this.updateTableData();
  }
  updateTableData() {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    this.leftTableDataSource.data = this.data.slice(startIndex, endIndex);
  }
  loadNextPage() {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.pageNumber < totalPages) {
      this.pageNumber++;
      this.updateTableData();
    }
  }
  loadPreviousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.updateTableData();
    }
  }
  //#region  PM Items
  getSpareItems(itemType: string, ids: any) {
    if (itemType === 'Component') {
      this.requisitionService.getItemsInfo(ids)
        .subscribe(res => {
          
          const data = res.map(item => ({
            itemsId: item.shipComponentSpareId,
            spareId: item.shipSpareId || null,
            storeId: item.shipStoreId || null,
            itemCode: item.shipSpares.inventoryCode || '',
            itemName: item.shipSpares.inventoryName || '',
            partNo: item.partNo || '',
            dwg: item.drawingNo || '',
            maker: item.components.maker.makerName || '',
            makerReference: item.shipSpares.makerReference || '',
            material: item.shipSpares.material || '',
            model: item.components.modelNo || '',
            minRequired: item.minRequired || 0,
            reqQty: item.reqQty || 0,
            rob: item.shipSpares.rob || 0,
            lpp: item.lpp || 0,
            lpd: item.lpd || 0,
            aq: item.aq || 0,
            unit: item.unit || '',
            uc: item.uc || 0,
            qu: item.qu || 0,
            dt: item.dt || '',
            id: item.id || 0,
            cost: item.shipSpares.assetCost || 0,
            cbc: item.cbc || 0,
            lowest: item.lowest || 0,
            itemRemarks: '',
            line: item.line || '',
            componentName: item.components.shipComponentName || '',
            componentCode: item.components.shipComponentCode || '',
            equipmentName: item.equipmentName || '',
            prevReqdQty: item.prevReqdQty || '',
            approvedQty: item.approvedQty || '',
            qtyInUse: item.qtyInUse || '',
            qtyRoB: item.qtyRoB || '',
            reorderQty: item.shipSpares.reOrderQty || '',
            reorderLevel: item.shipSpares.autoReOrder || '',
            maxQuantity: item.maxQuantity || '',
            split: item.split || false,
            asset: item.shipSpares.asset || false,
            additionalRemarks: item.additionalRemarks || '',
            storageLocation: item.storageLocation || '',
            attachments: item.attachments || '',
            availableQty: item.shipSpares.minimumLevel,
            itemSpec: item.makerReference || '' + ' ' + item.remarks || '',
            editMode: false,
          }));
          if (this.reqId) {
            this.requisitionService.getItemsByReqId(this.reqId).subscribe(items => {
              items.forEach(responseItem => {
                const indexToRemove = data.findIndex(leftItem =>
                  leftItem.itemName === responseItem.itemName && leftItem.itemCode === responseItem.itemCode
                );

                if (indexToRemove !== -1) {
                  data.splice(indexToRemove, 1);
                }
              });
              this.data = data;
              this.getSpareItemsList()
            })
          } else
            this.data = data;
          this.getSpareItemsList()
        });
    } else if (itemType === 'Group') {
      this.requisitionService.getGroupsInfo(ids).subscribe(res => {

        const data = res.map(item => ({
          itemsId: item.shipStoreId,
          spareId: item.shipSpareId || null,
          storeId: item.shipStoreId || null,
          itemCode: item.inventoryCode || '',
          itemName: item.inventoryName || '',
          partNo: item.partNo || '',
          dwg: item.dwg || '',
          maker: item.makerReference || '',
          model: item.model || '',
          minRequired: item.minRequired || 0,
          reqQty: item.reqQty || 0,
          rob: item.inventory?.shipSpares?.rob || 0,
          lpp: item.lpp || 0,
          lpd: item.lpd || 0,
          aq: item.aq || 0,
          unit: item.minimumLevel || 0,
          uc: item.uc || 0,
          qu: item.qu || 0,
          dt: item.dt || '',
          id: item.id || 0,
          cost: item.assetCost || 0,
          cbc: item.cbc || 0,
          lowest: item.lowest || 0,
          itemRemarks: '',
          line: item.line || '',
          componentName: item.group.groupName || '',
          componentCode: item.group.groupCode || '',
          equipmentName: item.equipmentName || '',
          prevReqdQty: item.prevReqdQty || '',
          approvedQty: item.approvedQty || '',
          qtyInUse: item.qtyInUse || '',
          qtyRoB: item.qtyRoB || '',
          reorderQty: item.reorderQty || '',
          reorderLevel: item.reorderLevel || '',
          maxQuantity: item.maxQuantity || '',
          split: item.split || false,
          asset: item.asset || false,
          additionalRemarks: item.additionalRemarks || '',
          storageLocation: item.storageLocation || '',
          attachments: item.attachments || '',
          description: item.description || '',
          material: item.material || '',
          remarks: item.remarks || '',
          editMode: false,
        }))
        if (this.reqId) {
          this.requisitionService.getItemsByReqId(this.reqId).subscribe(items => {
            items.forEach(responseItem => {
              const indexToRemove = data.findIndex(leftItem =>
                leftItem.itemName === responseItem.itemName && leftItem.itemCode === responseItem.itemCode
              );

              if (indexToRemove !== -1) {
                data.splice(indexToRemove, 1);
              }
            });
            this.leftTableDataSource.data = data;
          })
        } else
          this.leftTableDataSource.data = data;
      })
    }
  }
  getSpareItemByGroup(id: any) {
    this.requisitionService.getItemInfoByGroups(id).subscribe(res => {

    })
  }
  moveItemToRight(): void {
    
    const selectedItems = this.leftTableSelection.selected.length > 0
      ? this.leftTableSelection.selected
      : [this.leftTableDataSource.data[0]];

    if (selectedItems[0] != undefined) {
      this.rightTableDataSource.data = this.rightTableDataSource.data.concat(selectedItems);
      this.leftTableDataSource.data = this.leftTableDataSource.data.filter(item => !selectedItems.includes(item));
      // Remove selected items from the main data list
      this.data = this.data.filter(item => !selectedItems.includes(item));
      this.leftTableSelection.clear();
      this.getSpareItemsList()
    }
  }
  moveAllItemToRight(): void {
    
    const newData = this.rightTableDataSource.data.concat(this.leftTableDataSource.data);
    this.rightTableDataSource.data = newData;
    this.leftTableDataSource.data = [];
    this.data = this.data.filter(item => !newData.includes(item))
    this.leftTableDataSource._updateChangeSubscription();
    this.getSpareItemsList()
  }

  moveItemToLeft(): void {

    const selectedItems = this.rightTableSelection.selected.length > 0
      ? this.rightTableSelection.selected
      : [this.rightTableDataSource.data[0]];

    if (selectedItems[0] != undefined) {
      this.leftTableDataSource.data = this.leftTableDataSource.data.concat(selectedItems);
      this.data = this.leftTableDataSource.data.concat(selectedItems);
      this.rightTableDataSource.data = this.rightTableDataSource.data.filter(item => !selectedItems.includes(item));
      this.rightTableSelection.clear();
      this.getSpareItemsList()
    }
  }
  moveAllItemToLeft(): void {

    const newData = this.leftTableDataSource.data.concat(this.rightTableDataSource.data);
    this.leftTableDataSource.data = newData;
    this.data=newData
    this.rightTableDataSource.data = [];
    this.rightTableDataSource._updateChangeSubscription();
    this.getSpareItemsList()
  }

  storeTableData() {
    this.items = [];
    this.rightTableDataSource.data.forEach((item, index) => {
      const newItem = {
        itemsId: 0,
        spareId: item.spareId || null,
        storeId: item.storeId || null,
        pmReqId: this.reqId,
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        partNo: item.partNo || '',
        dwg: item.dwg || '',
        maker: item.maker || '',
        model: item.model || '',
        minRequired: item.minRequired || 0,
        reqQty: item.reqQty || 0,
        rob: item.rob || 0,
        lpp: item.lpp || 0,
        lpd: item.lpd || 0,
        aq: item.aq || 0,
        unit: item.unit || 0,
        uc: item.uc || 0,
        qu: item.qu || 0,
        dt: item.dt || '',
        id: item.id || 0,
        cost: item.cost || 0,
        cbc: item.cbc || 0,
        lowest: item.lowest || 0,
        itemRemarks: item.itemRemarks || '',
        line: item.line || '',
        componentName: item.componentName || '',
        componentCode: item.componentCode || '',
        equipmentName: item.equipmentName || '',
        prevReqdQty: item.prevReqdQty || '',
        approvedQty: item.approvedQty || '',
        qtyInUse: item.qtyInUse || '',
        qtyRoB: item.qtyRoB || '',
        reorderQty: item.reorderQty || '',
        reorderLevel: item.reorderLevel || '',
        maxQuantity: item.maxQuantity || '',
        split: item.split || false,
        asset: item.asset || false,
        additionalRemarks: item.additionalRemarks || '',
        storageLocation: item.storageLocation || '',
        remarks: item.remarks || '',
        description: item.description || '',
        material: item.material || '',
        attachments: item.attachments || '',
      };
      this.items.push(newItem);
    });
    this.requisitionService.addItemsDataList(this.items).subscribe(res => {
      if (res.status === true) {
        this.requisitionService.getItemsByReqId(this.reqId).subscribe(res => {

          this.dataSource.data = [];
          this.rightTableDataSource.data = [];
          this.rightTableDataSource._updateChangeSubscription();
          this.dataSource.data = res;
          $("#ship-items").modal('hide');
          this.cdr.detectChanges();
        })
      }
    })
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
    //  
    // })
  }

  loadItemsData(status: number) {
    if (this.reqId)
      this.requisitionService.getItemsByReqId(this.reqId)
        .subscribe(response => {
          
          this.flag = status;
          this.dataSource.data = [];
          this.zone.run(() => {
            response.forEach(responseItem => {
              const indexToRemove = this.leftTableDataSource.data.findIndex(leftItem =>
                leftItem.itemName === responseItem.itemName && leftItem.itemCode === responseItem.itemCode
              );

              if (indexToRemove !== -1) {
                this.leftTableDataSource.data.splice(indexToRemove, 1);
              }
            });
            this.cdr.detectChanges();
          })
          this.dataSource.data = response.map(item => ({
            editMode: false,
            ...item
          }));

          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.itemdata = response;

          // const unitset = this.RequisitionForm.get('items')
          // if (unitset) {
          //   unitset.value.unit = response[0].unit
          // }
          // this.clear();
          // (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
        });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(r => this.selection.select(r));
  }
  checkboxLabel(row: any): string {

    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.shipComponentSpareId + 1}`;
  }


  isAllLeftTableSelected() {

    const numSelected = this.leftTableSelection.selected.length;
    const numRows = !!this.leftTableDataSource && this.leftTableDataSource.data.length;
    return numSelected === numRows;
  }
  masterLeftTableToggle() {

    this.isAllLeftTableSelected() ? this.leftTableSelection.clear() : this.leftTableDataSource.data.forEach(r => this.leftTableSelection.select(r));
  }
  checkboxLeftTableLabel(row: any): string {

    if (!row) {
      return `${this.isAllLeftTableSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.leftTableSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.shipComponentSpareId + 1}`;
  }

  isAllRightTableSelected() {

    const numSelected = this.rightTableSelection.selected.length;
    const numRows = !!this.rightTableDataSource && this.rightTableDataSource.data.length;
    return numSelected === numRows;
  }
  masterRightTableToggle() {

    this.isAllRightTableSelected() ? this.rightTableSelection.clear() : this.rightTableDataSource.data.forEach(r => this.rightTableSelection.select(r));
  }
  checkboxRightTableLabel(row: any): string {

    if (!row) {
      return `${this.isAllRightTableSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.rightTableSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.shipComponentSpareId + 1}`;
  }
  //#endregion

  listDetails(id, indexNo) {
    this.selectedItemIndex = indexNo + 1
    const uniqueIds = new Set<number>();
    this.listViewItems = this.dataSource.data.filter(item => {
      if (item.itemsId == id && !uniqueIds.has(item.itemsId)) {

        uniqueIds.add(item.itemsId);
        return true;
      }
      return false;
    });
  }

  showAttachinDetails(id) {

    var status = 0;
    this.pmsService.getmattachment(status, 'Purchase Requisition Item', id)
      .subscribe(response => {

        this.AttachlistwithID = response.data;

      });
  }

  applyFilter(filterValue: string) {

    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.leftTableDataSource.filter = filterValue;
  }




  // onCheckAllSpareItemChange(checked: boolean): void {

  //   if (checked) {
  //     const itemsToCheck = this.getSpareItemsWithSameAccountCode();
  //     itemsToCheck.forEach(item => {
  //       item.checkboxState = true;
  //       this.spareItemSelection.select(item);
  //     });
  //   } else {
  //     this.spareCartItemDatasource.data.forEach(item => (item.checkboxState = false));
  //     this.spareItemSelection.clear();
  //     this.spareCartItemDatasource.data.forEach(item => item.checkboxDisabled = false);
  //   }

  //   // this.sortItems();
  // }
  // applySpareItemFilter(filterValue: string) {
  //   filterValue = filterValue.trim();
  //   filterValue = filterValue.toLowerCase();
  //   this.spareCartItemDatasource.filter = filterValue;
  // }

  isAllCompSelected() {

    const numSelected = this.componentSelection.selected.length;
    const numRows = this.getItemsWithSameAccountCode();
    return numSelected === numRows.length;
  }
  getItemsWithSameAccountCode(): componentTableItems[] {
    const selectedAccountCode = this.componentSelection.selected.length > 0 ? this.componentSelection.selected[0].accountCode : null;
    return selectedAccountCode ? this.componentsDataSourse.data.filter(item => item.accountCode === selectedAccountCode) : [];
  }
  onCheckboxChange(checked: boolean, item: componentTableItems): void {

    item.checkboxState = checked;

    const selectedItemsWithDifferentAccountCode = this.componentSelection.selected.filter(
      selectedItem => selectedItem.accountCode !== item.accountCode
    );
    // this.componentsDataSourse.data.forEach(otherItems => {
    //   if (otherItems !== item) {
    //     
    //     otherItems.checkboxDisabled = otherItems.accountCode !== item.accountCode;
    //   }
    // })

    if (selectedItemsWithDifferentAccountCode.length > 0) {
      // Display an alert for different account codes
      alert('Selected item(s) have different account codes.');
    }

    if (checked) {
      this.componentSelection.select(item);
    } else {
      this.componentSelection.deselect(item);
    }
    if (this.componentSelection.selected.length === 0) {

      this.componentsDataSourse.data.forEach(item => item.checkboxDisabled = false);
    }

    this.sortItems();
  }
  onCheckAllChange(checked: boolean): void {

    if (checked) {

      const itemsToCheck = this.getItemsWithSameAccountCode();
      itemsToCheck.forEach(item => {

        item.checkboxState = true;
        this.componentSelection.select(item);
      });
    } else {
      this.componentsDataSourse.data.forEach(item => (item.checkboxState = false));
      this.componentSelection.clear();
      this.componentsDataSourse.data.forEach(item => item.checkboxDisabled = false);
    }

    this.sortItems();
  }
  applyComponentItemFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.componentsDataSourse.filter = filterValue;
  }
  sortItems(): void {

    // Sort the items so that items with matching account codes come first
    if (this.componentSelection.selected.length === 0) {
      this.componentsDataSourse.data.sort((a, b) => a.componentId - b.componentId);
    } else {
      // Sort the items so that items with matching account codes come first
      this.componentsDataSourse.data.sort((a, b) => {
        if (a.checkboxDisabled === b.checkboxDisabled) {
          return 0;
        }
        return a.checkboxDisabled ? 1 : -1;
      });
    }
    this.componentsDataSourse.sort = this.sort;
  }
  formatSelectedComponents(type: string) {

    if (type === 'Component') {
      if (this.selectedComponents.length > 0) {
        this.displayValue = '';
        this.saveValue = '';
        const selectedCom = this.selectedComponents.map(item => item.componentName).join(', ');
        const selectedComId = this.selectedComponents.map(item => item.componentId).join(',');

        this.displayValue = selectedCom
        this.saveValue = selectedComId
      }
    } else if (type === 'Group') {
      if (this.selectedGroupsDropdown.length > 0) {
        this.displayValue = '';
        this.saveValue = '';
        const selectedGroupName = this.selectedGroupsDropdown.map(item => item.groupName).join(', ');
        const selectedGroupId = this.selectedGroupsDropdown.map(item => item.pmsGroupId).join(',');

        this.displayValue = selectedGroupName
        this.saveValue = selectedGroupId
      }
    } else if (type === 'Spare') {
      this.displayValue = '';
      this.saveValue = '';
      const spareItemDisplayValue = this.spareItemDataSource.data
        .filter(row => this.spareItemSelection.isSelected(row))
        .map(item => item.inventoryName)
        .join(', ');
      const spareItemSaveValue = this.spareItemDataSource.data
        .filter(row => this.spareItemSelection.isSelected(row))
        .map(item => (item.shipSpareId).toString())
        .join(',');
      this.displayValue = spareItemDisplayValue;
      this.saveValue = spareItemSaveValue;
    } else if (type === 'Store') {
      this.displayValue = '';
      this.saveValue = '';
      const storeItemDisplayValue = this.storeItemDataSource.data
        .filter(row => this.storeItemSelection.isSelected(row))
        .map(item => item.inventoryName)
        .join(', ');
      const storeItemSaveValue = this.storeItemDataSource.data
        .filter(row => this.storeItemSelection.isSelected(row))
        .map(item => (item.shipStoreId).toString())
        .join(',');
      this.displayValue = storeItemDisplayValue;
      this.saveValue = storeItemSaveValue;
    }
  }


  // Approvel Requisition Start
  sendApprove() {

    this.requisitionService.sendApprove(this.temporaryNumber)
      .subscribe(response => {
        if (response.message != undefined) {

          this.swal.error('After saving the data, proceed with the approval.')
        }

        if (response.message == undefined) {
          this.approvestatus = response.data.approvedReq;
          this.swal.success('Successfully send for approval.')
        }

      });

  }

  FinalApprove(final) {

    if (final == 'Approved') {

      if (this.headsite == 'O') {

        this.headabb = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.abbreviation);

        let DocumentHeadValue = this.requisitiondata.filter(x => x.approvedReq == 'Approved' && x.originSite == 'Office').map(x => x.documentHeader);

        if (DocumentHeadValue.length == 0) {
          this.documentHeader = '601'
        }

        let largeNumbers: number[] = DocumentHeadValue.map((item) => {
          let matches = item.match(/\d+$/);
          return matches ? parseInt(matches[0], 10) : NaN;
        });

        if (DocumentHeadValue.length != 0) {
          const GetMaxNumber = largeNumbers.reduce((a, b) => Math.max(a, b));
          if(GetMaxNumber<601)
            {
              this.documentHeader = '601'
            }
            else{
              let incrementedValue = GetMaxNumber + 1;
              this.documentHeader = incrementedValue.toString().padStart(3, '0');
            }        

        }
        this.finalHeader = 'REQ – ' + this.headsite + ' – ' + 'OFF' + ' – ' + this.headabb + ' – ' + this.currentyear + ' – ' + this.documentHeader;
      }

      if (this.headsite == 'V') {

        this.headabb = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.abbreviation);

        let DocumentHeadValue = this.requisitiondata.filter(x => x.approvedReq == 'Approved' && x.originSite == 'Vessel').map(x => x.documentHeader);
        if (DocumentHeadValue.length == 0) {
          this.documentHeader = '601'
        }

        let largeNumbers: number[] = DocumentHeadValue.map((item) => {
          let matches = item.match(/\d+$/);
          return matches ? parseInt(matches[0], 10) : NaN;
        });

        if (DocumentHeadValue.length != 0) {
          const GetMaxNumber = largeNumbers.reduce((a, b) => Math.max(a, b));
          if(GetMaxNumber<601)
            {
              this.documentHeader = '601'
            }
            else{
              let incrementedValue = GetMaxNumber + 1;
              this.documentHeader = incrementedValue.toString().padStart(3, '0');
            }        

        }

        this.headCode = this.Vessels.filter(x => x.vesselId === parseInt(this.selectedVesselId)).map(x => x.vesselCode);

        this.finalHeader = 'REQ – ' + this.headsite + ' – ' + this.headCode + ' – ' + this.headabb + ' – ' + this.currentyear + ' – ' + this.documentHeader;
      }


      var title = "";
      Swal.fire({
        title: 'Are you certain you want to proceed with the approval? ',
        text: title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.requisitionService.Finalapprove(final, this.temporaryNumber, this.finalHeader)
            .subscribe(result => {
              this.swal.success('successfully Approved');
              this.router.navigate(['/Requisition/Requisitionslist']);

            })
        }
      })
    }

    if (final == 'Rejected') {

      var title = "";
      Swal.fire({
        title: 'Are you certain you want to proceed with the reject?',
        text: title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {

        if (result.value) {
          let DocumentHeadValue = this.requisitionFullData.documentHeader;
          this.requisitionService.Finalapprove(final, DocumentHeadValue, this.finalHeader)
            .subscribe(result => {

              if (result.status === true) {
                this.approvestatus = result.data.approvedReq
                this.swal.error('Requisition Approval Reject');
                this.router.navigate(['/Requisition/Requisitionslist']);
              }
            })
        }
      })
    }

  }
  // Loadgroup() {
  //   this.pmsService.GetPMSGroupdata(0)
  //     .subscribe(response => {

  //       this.GetGroupAccCode = response.data;

  //     })
  // }
  // LoadComponent() {
  //   this.pmsService.GetComponent(0)
  //     .subscribe(response => {

  //       this.GetCompoAccCode = response.data;

  //     })
  // }
  // LoadStore() {
  //   this.pmsService.getStore(0)
  //     .subscribe(response => {

  //       this.GetStoreAccCode = response.data;

  //     })
  // }
  // LoadSpare() {
  //   this.shipmasterService.GetShipSpareList(0)
  //     .subscribe(response => {

  //       this.GetSpareAccCode = response.data;

  //     })
  // }
  downloadNotepad() {
    // this.ReqData =  this.requisitionFullData.filter(x=>x.documentHeader == this.temporaryNumber);
    debugger
    this.ReqData = this.requisitionFullData;

    if (this.ReqData == undefined) {
      this.swal.error('Please save your data before downloading the RTO file.')
    }
    let shipcompId = this.ReqData.orderReference.split(',')[0];
    if (this.ReqData.orderReferenceType == "Group") {
      this.codeAccount = this.ReqData.accountCode
      this.fileDes = "StarIPS"
      // this.codeAccount = this.GetGroupAccCode?.filter(x => x.pmsGroupId == shipcompId)[0];
    }
    if (this.ReqData.orderReferenceType == "Component") {
      this.codeAccount = this.ReqData.accountCode
      this.fileDes = "TmMASTER"
      // this.codeAccount = this.GetCompoAccCode?.filter(x => x.componentId == shipcompId)[0];
    }
    if (this.ReqData.orderReferenceType == "Store") {
      this.codeAccount = this.ReqData.accountCode
      this.fileDes = "StarIPS"
      // this.codeAccount = this.GetStoreAccCode?.filter(x => x.shipStoreId == shipcompId)[0];
    }
    if (this.ReqData.orderReferenceType == "Spare") {
      this.codeAccount = this.ReqData.accountCode
      this.fileDes = "TmMASTER"
      // this.codeAccount = this.GetSpareAccCode?.filter(x => x.spareId == shipcompId)[0];
    }
    let Dates = this.datePipe.transform(this.ReqData.recDate, 'yyyyMMdd');
    let year = this.datePipe.transform(this.ReqData.recDate, 'yy');

    //  let documentHeader =this.ReqData.documentHeader.replace(/\D/g, '')
    let documentHeader = this.ReqData.documentHeader.slice(-4).trim()

    const uniqueItems = this.itemdata.filter(x => x.pmReqId == this.ReqData.requisitionId);

    // let fileDes = this.ReqData.pmOrderType.defaultOrderType == "Spare" ? "TmMASTER" : "StarIPS";


    let stepData = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Requisition data transfer in ${this.fileDes}');
FILENAME('C:\\inetpub\\PmsAship\\ExportedFile\\Rto\\'${this.ReqData.vessel.vesselCode}${year + '' + documentHeader}.RTO','${Dates}');
ENDSEC;
DATA;`;

    stepData += `
   
#1=Requisition_ship_to_PO_step_1('${this.ReqData.vessel.vesselCode}','${year + '/' + documentHeader}','${this.ReqData.orderReferenceNames.toString()}','0','${Dates}','','','${this.ReqData.departments.departmentName}','','${this.codeAccount == null ? '' : this.codeAccount }','','','','','')`;

    uniqueItems.forEach((item, index) => {
      stepData += `
#${index + 2}=Items_for_ordering_mr('${this.ReqData.vessel.vesselCode}','${year + '/' + documentHeader}','${index + 1}','${item.partNo}','${item.itemName}','${item.dwg}','','','${item.maker}','','','${item.rob}','${item.unit}','${item.reqQty}','','','${item.model}','exactOrderRef','','','','','${item.makerReference == null ? '' : item.makerReference}','','','','','');`;
    });

    if (this.serviceTypeDataSource.length !== 0 || this.serviceTypeDataSource.length !== null) {


      const jobToAdd = this.serviceTypeDataSource.map(item => ({
        serviceName: item.serviceName,
        jobList: item.jobList
      })
      );
      let jobNumber = 1;
      jobToAdd.forEach((item, index) => {

        // Add jobList details to the stepData
        item.jobList.forEach((job, jobIndex) => {
          stepData += `,
#${jobNumber + 1}=Service_for_ordering_mr('${job.jobDescription}','${job.qty}','','','${job.unit}','','','${job.remarks}','','','','','','','')`;
          jobNumber++;
        });
      });
    }
    stepData += `
ENDSEC;`;

    // Convert the content to a Blob
    const blob = new Blob([stepData], { type: 'text/plain;charset=utf-8' });

    let filesaveName = this.ReqData.vessel.vesselCode + year + documentHeader;
    // Use FileSaver.js to save the file
    saveAs(blob, filesaveName + '.RTO');

  }

  // Approvel Requisition End

  // Attachment Start
  openAttachmentPopup() {
    $("#openAttachmentModal").modal('show');
    this.loadattachment(0);
  }

  CloseAttachment() {
    $("#openAttachmentModal").modal('hide');
  }

  loadattachment(status: number) {
    if (status == 1) {
      this.deletetooltip = 'UnArchive';
      if (((document.getElementById("collapse9") as HTMLElement).querySelector('.fa-trash') as HTMLElement) != null) {
        ((document.getElementById("collapse9") as HTMLElement).querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        ((document.getElementById("collapse9") as HTMLElement).querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {
      this.deletetooltip = 'Archive';
      if (((document.getElementById("collapse9") as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement) != null) {
        ((document.getElementById("collapse9") as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        ((document.getElementById("collapse9") as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }
    this.pmsService.getmattachment(status, 'Purchase Requisition', this.reqId)
      .subscribe(response => {
        this.flag = status;
        this.attachmentdataSource.data = response.data;
        this.attachmentdataSource.sort = this.sort;
        this.attachmentdataSource.paginator = this.paginator;
      });
  }

  submitattachmentfrm(form: any) {

    this.reqId

    if (this.reqId == 0) {
      this.swal.error('Firstly please add (select) the maintenance ');
      return;
    }
    if (this.myFiles.length === 0) {
      this.swal.error('Firstly please add attachment ');
      return;
    }


    this.getDataReqwithId(this.reqId);

    this.atfm.shipAttachmentId.setValue(0);
    this.atfm.tablePkeyId.setValue(this.reqId);
    this.atfm.tableName.setValue('tblPMRequisitions');
    this.atfm.pageName.setValue('Purchase Requisition');
    this.atfm.vesselId.setValue(this.requisitionWithIDAutoSave.vesselId);
    let formValues = form.value;

    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(formValues));

    if (this.fileToUpload != null) {

      this.myFiles.forEach((f) => fmdata.append('attachment', f));
      //fmdata.append('attachment', this.myFiles);
    }

    this.pmsService.addattachment(fmdata)
      .subscribe(res => {
        if (res.message == "data added") {
          this.swal.success('Added successfully.'); this.CloseAttachmentFrm();
          (document.getElementById('collapse9') as HTMLElement).classList.remove("show");
          this.loadattachment(0);
          this.myFiles.length === 0;

        }
        else if (res.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          // this.clearattachmentfrm(); 
          (document.getElementById('collapse9') as HTMLElement).classList.remove("show");
          this.CloseAttachmentFrm(); this.loadattachment(0);
          this.myFiles.length === 0;
        }
        else if (res.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
        }
        else if (res.message == "not found") {
          this.swal.info('Data exist not exist');
        }
        else {

        }
      });
  }


  getDataReqwithId(reqId) {
    this.requisitionService.getRequisitionById(reqId)
      .subscribe(response => {
        this.requisitionWithIDAutoSave = response.data;

      });
  }

  fillattachmenttype() {
    this.typemasterService.getAttachmentTypes(0)
      .subscribe(response => {
        if (response.status) {
          this.attachmenttypelist = response.data.filter(x => x.module == 'Purchase');
        } else {
          this.attachmenttypelist = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }

  FileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.fileToUpload = file;
      this.FileName = file.name;
      for (var i = 0; i <= event.target.files.length - 1; i++) {
        this.myFiles.push(event.target.files[i]);
        var selectedFile = event.target.files[i];
        if (this.listOfFiles.indexOf(selectedFile.name) === -1) {
          this.fileList.push(selectedFile);
          this.listOfFiles.push(selectedFile);
        }
      }
    } else {
      this.FileName = "Choose file";
    }
  }

  clearattachmentfrm() {
    this.myFiles = []; this.listOfFiles = [];
    this.attachmentfrm.controls.attachmentTypeId.setValue('');
    this.attachmentfrm.controls.description.setValue('');
    (document.getElementById('collapse9') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse9') as HTMLElement).classList.remove("show");
  }

  CloseAttachmentFrm() {
    this.myFiles = []; this.listOfFiles = [];
    this.attachmentfrm.reset();
    // this.atfm.attachmentLinkingId.setValue(0);
    this.atfm.attachmentTypeId.setValue('');
    this.atfm.description.setValue('');
    this.atfm.attachment.setValue('');
    // (document.getElementById('collapse9') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse9') as HTMLElement).classList.remove("show");
  }

  removeSelectedFile(index) {
    // Delete the item from fileNames list
    this.listOfFiles.splice(index, 1);
    // delete file from FileList
    this.fileList.splice(index, 1);
  }

  Updatesttachment(id) {
    (document.getElementById('collapse9') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse9') as HTMLElement).classList.add("show");
    this.pmsService.GetattachmentById(id)
      .subscribe((response) => {
        if (response.status) {
          this.attachmentfrm.patchValue(response.data);
          this.fileUrl = response.data.filePath;
          this.pkey = response.data.attachmentId;
        }
      },
        (error) => {

        });
  }

  showAttachment(filePath) {
    let parts: string[] = filePath.split('\\');
    let filename: string | undefined = parts.pop();

    if (filePath.indexOf(".") !== -1) {

      this.requisitionService.DownloadReqAttach(filename)
        .subscribe((response) => {
          var bolb = new Blob([response], { type: response.type });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(bolb);
          a.download = filename || 'defaultFilename.txt';;
          a.click();

        })
    }
    else {
      this.swal.info('No attachment found');
    }
    $('.tooltip').remove();
  }

  Deleteattachment() {
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
    const numSelected = this.selectionattachment.selected;
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
          this.pmsService.archiveattachments(numSelected).subscribe(result => {
            this.selectionattachment.clear();
            this.swal.success(message);
            this.loadattachment(this.flag);
          })
        }
      })
    } else {
      this.swal.info('Select at least one row');
    }
  }


  attachmentcheckboxLabel(row: any): string {
    if (!row) {
      return `${this.isattachmentAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionattachment.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  isattachmentAllSelected() {
    const numSelected = this.selectionattachment.selected.length;
    const numRows = !!this.attachmentdataSource && this.attachmentdataSource.data.length;
    return numSelected === numRows;
  }

  attachmentToggle() {
    this.isattachmentAllSelected() ? this.selectionattachment.clear() : this.attachmentdataSource.data.forEach(r => this.selectionattachment.select(r));
  }
  // Attachment End

  openModal() {
    let dialogRef: any
    const orderType = this.defaultOrderType[0]
    if (orderType != undefined) {
      if (orderType === 'Spare' || orderType === 'Service') {
        const isSpareDataEmpty = this.spareItemDataSource.data.length === 0;
        if (orderType === 'Spare') {
          if (isSpareDataEmpty) {
            dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
              width: '800px',
              height: '70vh',
              data: {
                modalTitle: "Order Reference", componentType: 'Component', orderType: orderType,
                dataSourceTree: this.dataSourceTree, orderTypeId: this.selectedOrderTypeId
              }
            });
          } else {

            const selectedCartItems = this.dataSource.data
            dialogRef = this.dialog.open(OrderRefPopUpViewComponent, {
              width: '400px',
              data: {
                modalTitle: "Order Reference", orderType: orderType, spareTableData: this.spareItemDataSource.data,
                componentType: 'Component', dataSourceTree: this.dataSourceTree, orderTypeId: this.selectedOrderTypeId,
                selectedCartItems: selectedCartItems
              }
            });
          }
        } else if (orderType === 'Service') {
          if (isSpareDataEmpty) {
            dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
              width: '800px',
              data: {
                modalTitle: "Order Reference", componentType: 'Component', orderType: orderType,
                dataSourceTree: this.dataSourceTree, orderTypeId: this.selectedOrderTypeId
              }
            });
          } else {
            dialogRef = this.dialog.open(OrderRefPopUpViewComponent, {
              width: '400px',
              data: {
                modalTitle: "Order Reference", orderType: orderType, spareTableData: this.spareItemDataSource.data,
                componentType: 'Component', dataSourceTree: this.dataSourceTree, orderTypeId: this.selectedOrderTypeId
              }
            });
          }
        }
      } else {
        const isStoreDataEmpty = this.storeItemDataSource.data.length === 0;
        if (isStoreDataEmpty) {

          dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
            width: '800px',
            data: {
              modalTitle: "Order Reference", componentType: 'Group', orderType: orderType, vesselId: this.selectedVesselId,
              groupTableData: this.groupTableDataSource.data, orderTypeId: this.selectedOrderTypeId
            }
          });
        } else {
          const selectedCartItems = this.dataSource.data
          dialogRef = this.dialog.open(OrderRefPopUpViewComponent, {
            width: '400px',
            data: {
              modalTitle: "Order Reference", orderType: orderType, groupTableData: this.groupTableDataSource.data,
              storeTableData: this.storeItemDataSource.data, orderTypeId: this.selectedOrderTypeId,
              selectedCartItems: selectedCartItems
            }
          });
        }
      }
    }
    dialogRef.afterClosed().subscribe(result => {

      if (result.result === 'success') {
        
        const data = result.dataToSend
        if (data != null && data.displayValue !== '' && data.saveValue !== '') {
          this.zone.run(() => {
            this.displayValue = ''
            this.saveValue = ''
            if (data.orderReferenceType === 'Component') {
              
              this.requisitionService.getDisplayComponent(data.saveValue).subscribe(res => {
                this.displayValue = res.data.map(item => `${item.componentName},${item.componentCode},${item.makerName},${item.modelNo},${item.serialNo}`)
                  .join('/ ')
              })
            } else {
              this.displayValue = data.displayValue;
            }
            this.saveValue = data.saveValue;

          })
          const orderType = data.defaultOrderType
          this.RequisitionForm.get('header')?.patchValue({ orderReferenceType: data.orderReferenceType })
          if (orderType !== 'Service') {
            if (data.orderReferenceType === 'Component') {
              this.dataSource.data = [];
              this.getSpareItems(data.orderReferenceType, data.saveValue);
              this.autoSave('header')
            }
            else if (data.orderReferenceType === 'Group') {
              this.dataSource.data = [];
              this.getSpareItems(data.orderReferenceType, data.saveValue);
              this.autoSave('header')
            }
            else if (data.orderReferenceType === 'Spare') {
              // this.leftTableDataSource.data = []
              // this.dataSource.data = [];
              const cartItemIds = this.dataSource.data?.map((item: any) => item.spareId) || []; // Get shipspareIds from cartItems
              data.cartItems = data.cartItems?.filter((item: any) => !cartItemIds.includes(item.shipSpareId))
              const newItemsData = data.cartItems?.map((item: any) => this.transformSpare(item)) || [];
              this.dataSource.data = [...this.dataSource.data, ...newItemsData];
              this.autoSave('header')
            }
            else if (data.orderReferenceType === 'Store') {
              // this.leftTableDataSource.data = []
              // this.dataSource.data = [];
              this.dataSource.data = data.cartItems?.map((item: any) => this.transformStore(item)) || [];
              this.autoSave('header')
            }
          }
        }
      }
    })
  }

  openEditModal(row) {

    const dialogConfig = new MatDialogConfig();
    // dialogConfig.position = { top: '70px' };
    const dialogRef = this.dialog.open(EditReqQtyComponent, {
      // width: '700px',
      // height: '200px',
      data: {
        modalTitle: "Stock Reconciliation",
        data: row,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.result === 'success') {
        row.rob = result.data.newRob
        this.autoSave('items')
      }
    })
  }

  toggleEditMode(row: any): void {
    row.editMode = !row.editMode;
    if (row.editMode) {
      // Change input type to text during edit mode
      this.changeInputTypeToText(row);
    }
  }
  changeInputTypeToText(row: any): void {
    const currentIndex = this.dataSource.data.indexOf(row);
    setTimeout(() => {
      const inputField = this.reqQtyElements.toArray()[currentIndex].nativeElement as HTMLInputElement;
      if (inputField) {
        inputField.type = 'text';
      }
    })
  }
  changeInputTypeToNumber(row: any): void {
    const currentIndex = this.dataSource.data.indexOf(row);
    const inputField = this.reqQtyElements.toArray()[currentIndex].nativeElement as HTMLInputElement;
    if (inputField) {
      inputField.type = 'number';
    }
  }
  saveChanges(row: any): void {
    row.editMode = false; // Turn off edit mode after saving
    this.changeInputTypeToNumber(row);
    this.autoSave('items');
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent, row: any): void {

    if (event.defaultPrevented) {
      return;
    }
    const target = event.target as HTMLElement;
    if (this.reqId !== undefined && (this.defaultOrderType[0] === 'Spare' || this.defaultOrderType[0] === 'Store')) {
      const isWithinItemTable = target.closest('.itemTable');
      const isWithinRightTable = this.rightTable.nativeElement.contains(target);

      if (row) {
        if (isWithinItemTable || isWithinRightTable) {
          // Check for numeric keys (0 to 9) and handle accordingly
          if (/^\d$/.test(event.key)) {
            // Handle numeric input, you can replace this with your logic
            // For example, concatenate the digit to the existing value
            this.handleNumericInput(row, event.key);
          } else if (isWithinItemTable) {
            switch (event.key) {
              case 'Backspace':
                this.handleBackspace(row);
                break;
              case 'ArrowUp':
                event.preventDefault();
                this.moveFocus(row, -1);
                break;
              case 'ArrowDown':
                event.preventDefault();
                this.moveFocus(row, 1);
                break;
              case 'ArrowLeft':
                this.moveCursorLeft(row);
                break;
              case 'ArrowRight':
                this.moveCursorRight(row);
                break;
              default:
                this.toggleEditMode(row);
                this.saveChanges(row);
                break;
            }
          }
          else if (isWithinRightTable) {
            switch (event.key) {
              case 'Backspace':
                this.handleBackspace(row);
                break;
              case 'ArrowUp':
                event.preventDefault();
                this.moveFocusItem(row, -1);
                break;
              case 'ArrowDown':
                event.preventDefault();
                this.moveFocusItem(row, 1);
                break;
              case 'ArrowLeft':
                this.moveCursorLeft(row);
                break;
              case 'ArrowRight':
                this.moveCursorRight(row);
                break;
              default:
                this.toggleEditMode(row);
                break;
            }
          }
        }
      }
    }
  }
  handleNumericInput(row: any, input: string): void {
    setTimeout(() => {
      if (row.reqQty === null) {
        row.reqQty = '';
      }
      if (!row.reqQty.includes(input)) {
        row.reqQty += input;
      }
    }, 10);
  }
  moveFocus(row: any, direction: number): void {

    const currentIndex = this.dataSource.data.indexOf(row);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && this.reqQtyElements.length) {
      const nextRow = this.dataSource.data[newIndex];
      if (nextRow) {
        this.toggleEditMode(nextRow);
        // Delay before moving focus to the next row
        setTimeout(() => {
          this.zone.run(() => {
            const inputField = this.reqQtyElements.toArray()[newIndex]?.nativeElement.querySelector('input') as HTMLInputElement;
            if (inputField) {
              inputField.focus();
              //  Set the selection range to indicate the end of the text
              setTimeout(() => {
                inputField.setSelectionRange(
                  inputField.value.length,
                  inputField.value.length
                );
              }, 10);
            }
          });
        }, 10);
      }
    }
  }

  handleBackspace(row: any): void {

    // Handle left arrow key to move the cursor within the input field
    const inputField = this.reqQty.nativeElement as HTMLInputElement;
    if (inputField) {
      inputField.focus();
      const currentPosition = inputField.selectionStart !== null ? inputField.selectionStart : inputField.value.length;
      if (currentPosition !== null && currentPosition > 0) {
        setTimeout(() => {
          // Make the changes to the value
          const newValue = row.reqQty.slice(0, currentPosition - 1) + row.reqQty.slice(currentPosition);
          row.reqQty = newValue;

        }, 10);
        inputField.focus();
      }
    }
  }
  moveCursorLeft(row: any): void {

    // Handle left arrow key to move the cursor within the input field
    const inputField = this.reqQty.nativeElement as HTMLInputElement;

    if (inputField) {
      this.cursorPosition = inputField.selectionStart !== null ? inputField.selectionStart - 1 : 0;
    }
  }
  moveCursorRight(row: any): void {

    // Handle right arrow key to move the cursor within the input field
    const inputField = this.reqQty.nativeElement as HTMLInputElement;

    if (inputField) {
      this.cursorPosition = inputField.selectionStart !== null ? inputField.selectionStart + 1 : 0;
    }
  }
  getInputField(row: any): HTMLInputElement | null {
    return document.getElementById(`reqQty_${row.ids}`) as HTMLInputElement;
  }
  getCurrentRow(): any {

    const focusedElement = document.activeElement; // Get the currently focused element

    // Check if the focused element is within the table
    if (focusedElement && this.itemTable.nativeElement.contains(focusedElement)) {
      // Traverse up the DOM hierarchy to find the nearest <tr> ancestor
      const closestRow = focusedElement.closest('tr');

      if (closestRow) {
        // Extract the row's data from your data array based on some identifier (e.g., an ID)
        const rowId = closestRow.dataset.rowId; // Assuming you have a "data-row-id" attribute on your <tr> elements
        const rowData = this.dataSource.data.find(row => row.ids === +rowId!);

        return rowData;
      }
    }

    // If no row is found, return null or handle it according to your application's logic
    return null;
  }

  isHighlighted(row: any): boolean {
    return this.selectedIndex == 0 ? row.index == 0 : row.shipComponentSpareId == this.selectedIndex;
  }
  toggleEditModeItem(row: any): void {

    row.editMode = !row.editMode;
    if (row.editMode) {

      // Change input type to text during edit mode
      this.changeInputTypeToTextItem(row);
    }
  }
  changeInputTypeToTextItem(row: any): void {

    const currentIndex = this.rightTableDataSource.data.indexOf(row);
    setTimeout(() => {
      const inputField = this.reqQtyElements.toArray()[currentIndex].nativeElement as HTMLInputElement;
      if (inputField) {
        inputField.type = 'text';
      }
    })
  }
  changeInputTypeToNumberItem(row: any): void {
    const currentIndex = this.rightTableDataSource.data.indexOf(row);
    const inputField = this.reqQtyElements.toArray()[currentIndex].nativeElement as HTMLInputElement;
    if (inputField) {
      inputField.type = 'number';
    }
  }
  moveFocusItem(row: any, direction: number): void {

    const currentIndex = this.rightTableDataSource.data.indexOf(row);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && this.reqQtyElements.length) {
      const nextRow = this.rightTableDataSource.data[newIndex];
      if (nextRow) {
        this.toggleEditMode(nextRow);
        // Delay before moving focus to the next row
        setTimeout(() => {
          this.zone.run(() => {
            const inputField = this.reqQtyElements.toArray()[newIndex]?.nativeElement.querySelector('input') as HTMLInputElement;
            if (inputField) {
              inputField.focus();
              //  Set the selection range to indicate the end of the text
              setTimeout(() => {
                inputField.setSelectionRange(
                  inputField.value.length,
                  inputField.value.length
                );
              }, 10);
            }
          });
        }, 10);
      }
    }
  }

  //#region ServiceType Attachment Items
  openServiceItem(id, pageName, tableName) {

    this.GetItemId = id;
    $("#openAttachmentItem").modal('show');
    this.loadItemAttachment(0, id, pageName, tableName);
    // this.loadServiceAttachement(0, page, id);
  }
  // loadServiceAttachement(status: number, page: string, id: number) {

  //   if (status == 1) {
  //     this.deletetooltip = 'UnArchive';
  //     if (((document.getElementById("collapse10") as HTMLElement).querySelector('.fa-trash') as HTMLElement) != null) {
  //       ((document.getElementById("collapse10") as HTMLElement).querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
  //       ((document.getElementById("collapse10") as HTMLElement).querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
  //     }
  //   }
  //   else {
  //     this.deletetooltip = 'Archive';
  //     if (((document.getElementById("collapse10") as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement) != null) {
  //       ((document.getElementById("collapse10") as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
  //       ((document.getElementById("collapse10") as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
  //     }
  //   }
  //   this.pmsService.getmattachment(status, page, id)
  //     .subscribe(response => {

  //       this.flag = status;
  //       this.attachmentItemdataSource.data = response.data;
  //       this.attachmentItemdataSource.sort = this.sort;
  //       this.attachmentItemdataSource.paginator = this.paginator;
  //     });
  // }
  //#endregion


  //#region AttachmentItem  
  openAttachmentItem(id, pageName, tableName) {
    this.GetItemId = id;
    if (this.GetItemId !== 0 || this.GetItemId !== undefined) {
      this.loadItemAttachment(0, id, pageName, tableName);
      $("#openAttachmentItem").modal('show');
    }

  }

  CloseAttachmentItem() {
    this.clearItemAttachmentfrm()
    $("#openAttachmentItem").modal('hide');
  }

  loadAttachment(status: number) {
    const pageName = this.atfm.pageName.value
    const id = this.atfm.tablePkeyId.value
    const tableName = this.atfm.tableName.value
    this.loadItemAttachment(status, id, pageName, tableName)
  }

  loadItemAttachment(status: number, id: number, pageName: string, tableName: string) {

    if (status == 1) {

      this.deletetooltip = 'UnArchive';
      if ((document.querySelector('.attach') as HTMLElement) != null) {
        (document.querySelector('.attach') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        (document.querySelector('.attach') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {

      this.deletetooltip = 'Archive';
      if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }

    this.atfm.tablePkeyId.setValue(id);
    this.atfm.tableName.setValue(tableName);
    this.atfm.pageName.setValue(pageName);
    this.atfm.vesselId.setValue(this.selectedVesselId);
    this.pmsService.getmattachment(status, pageName, id)
      .subscribe(response => {

        this.flag = status;
        this.attachmentItemdataSource.data = response.data;
        this.attachmentItemdataSource.sort = this.sort;
        this.attachmentItemdataSource.paginator = this.paginator;

        this.loadUser();
      });
  }

  loadUser() {
    this.userService.getLineManagers(0)
      .subscribe(response => {
        // console.log(response.data)
        this.userData = response.data;
      });
  }
  getUserName(userId) {
    if (userId != null && userId != undefined) {

      var UserName = this.userData.filter(x => x.userId == userId);
      return UserName[0]?.firstName + ' ' + UserName[0]?.lastName;
    }
    else
      return '';
  }

  DeleteItemAttachment() {
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
    const numSelected = this.selectionItemAttachment.selected;
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
          this.requisitionService.archiveAttachments(numSelected).subscribe((res: any) => {

            if (res.status === true) {

              this.selectionItemAttachment.clear();
              this.swal.success(message);
              this.loadItemAttachment(this.flag, res.tablePkId, res.pageName, res.tableName);
            }
          })
        }
      })
    } else {
      this.swal.info('Select at least one row');
    }
  }


  submitItemAttachmentfrm(form: any) {

    this.GetItemId

    if (this.GetItemId == 0) {
      this.swal.error('Firstly please add (select) the maintenance ');
      return;
    }
    if (this.myItemFiles.length === 0) {
      this.swal.error('Firstly please add attachment ');
      return;
    }

    this.getDataReqwithId(this.reqId);

    // this.atIfm.shipAttachmentId.setValue(0);
    this.atfm.tablePkeyId.setValue(this.GetItemId);
    // this.atIfm.tableName.setValue('tblPmReqItems');
    // this.atIfm.pageName.setValue('Purchase Requisition Item');
    // this.atIfm.vesselId.setValue(this.requisitionWithIDAutoSave.vesselId);
    let formValues = form.value;

    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(formValues));

    if (this.fileItemToUpload != null) {

      this.myItemFiles.forEach((f) => fmdata.append('attachment', f));
    }

    this.pmsService.addattachment(fmdata)
      .subscribe(res => {

        if (res.message == "data added") {
          this.swal.success('Added successfully.');
          this.CloseAttachmentForm();
          (document.getElementById('collapse10') as HTMLElement).classList.remove("show");
          this.loadItemAttachment(0, res.id, res.pageName, res.tableName);
          this.myItemFiles.length === 0;
          this.fileInput.nativeElement.value = null;
        }
        else if (res.message == "updated") {

          this.swal.success('Data has been updated successfully.');
          this.CloseAttachmentForm();
          (document.getElementById('collapse10') as HTMLElement).classList.remove("show");
          this.loadItemAttachment(0, res.id, res.pageName, res.tableName);
          this.myItemFiles.length === 0;
          this.fileInput.nativeElement.value = null;

        }
        else if (res.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
        }
        else if (res.message == "not found") {
          this.swal.info('Data exist not exist');
        }
        else {

        }
      });
  }

  FileItemSelect(event) {

    if (event.target.files.length > 0) {

      const file = event.target.files[0];
      this.fileItemToUpload = file;
      this.FileName = file.name;

      for (var i = 0; i <= event.target.files.length - 1; i++) {

        this.myItemFiles.push(event.target.files[i]);
        var selectedFile = event.target.files[i];
        if (this.listItemOfFiles.indexOf(selectedFile.name) === -1) {
          this.fileItemList.push(selectedFile);
          this.listItemOfFiles.push(selectedFile);
        }
      }
    } else {
      this.FileName = "Choose file";
    }
  }

  clearItemAttachmentfrm() {
    this.myItemFiles = [];
    this.listItemOfFiles = [];
    this.attachmentfrm.controls.attachmentTypeId.setValue('');
    this.attachmentfrm.controls.description.setValue('');
    (document.getElementById('collapse10') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse10') as HTMLElement).classList.remove("show");
  }

  CloseAttachmentForm() {

    this.myItemFiles = [];
    this.listItemOfFiles = [];
    // this.attachmentfrm.reset();

    this.atfm.attachmentTypeId.setValue('');
    this.atfm.description.setValue('');
    this.atfm.attachment.setValue('');
    (document.getElementById('collapse10') as HTMLElement).classList.remove("show");
  }

  removeItemSelectedFile(index) {
    // Delete the item from fileNames list
    this.listItemOfFiles.splice(index, 1);
    // delete file from FileList
    this.fileItemList.splice(index, 1);
  }

  ItemattachmentcheckboxLabel(row: any): string {
    if (!row) {
      return `${this.isItemattachmentAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionItemAttachment.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  isItemattachmentAllSelected() {
    const numSelected = this.selectionItemAttachment.selected.length;
    const numRows = !!this.attachmentItemdataSource && this.attachmentItemdataSource.data.length;
    return numSelected === numRows;
  }

  attachmentItemToggle() {
    this.isItemattachmentAllSelected() ? this.selectionItemAttachment.clear() : this.attachmentItemdataSource.data.forEach(r =>
      this.selectionItemAttachment.select(r));
  }

  UpdateItemAttach(id) {
    (document.getElementById('collapse10') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse10') as HTMLElement).classList.add("show");
    this.pmsService.GetattachmentById(id)
      .subscribe((response) => {

        if (response.status) {
          this.attachmentfrm.patchValue(response.data);
          this.fileItemUrl = response.data.filePath;
          this.pkey = response.data.attachmentId;
        }
      },
        (error) => {

        });
  }

  showItemAttachment(filePath) {
    let parts: string[] = filePath.split('\\');
    let filename: string | undefined = parts.pop();

    if (filePath.indexOf(".") !== -1) {

      this.requisitionService.DownloadReqAttach(filename)
        .subscribe((response) => {
          var bolb = new Blob([response], { type: response.type });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(bolb);
          a.download = filename || 'defaultFilename.txt';;
          a.click();

        })
    }
    else {
      this.swal.info('No attachment found');
    }
    $('.tooltip').remove();
  }
  //#endregion

  //#region Modify Columns of Items Pop Up View
  openModifyPopUp() {
    let dialogRef: any

    dialogRef = this.dialog.open(ModifyColumnsPopUpComponent, {
      width: '600px',
      data: {
        modalTitle: "Modify Columns",
        visibleColumns: this.visibleColumns,
        displayedColumns: this.ItemsColumns,
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result.result === 'success') {
        const data = result.data
        this.zone.run(() => {
          this.displayedColumns = this.ItemsColumns.filter((column, index) => data[index]);
        })
      }
    });
  }
  //#endregion

  // CancelRequisition() {

  //   let DataRequisitionMaster =  this.requisitiondata.filter(x=>x.documentHeader == this.finallyHeader);

  //  if(DataRequisitionMaster.length != 0){
  //   this.requisitionService.archiveRequisitionMaster(DataRequisitionMaster).subscribe(result => {
  //     this.router.navigate(['/Requisition/Requisitionslist']);
  //   })
  //  }
  //  else{
  // this.router.navigate(['/Requisition/Requisitionslist']);
  //  }


  // }
  ItemsClick(){
    this.loadItemsData(0);
    this.GetunitList();
    this.fillattachmenttype();
  }

  GetunitList() {
    this.unitmasterservice.GetunitList(0)
      .subscribe(response => {
        this.unitmasterlist = response.data;
      });
  }

  updateunit(value: any, id: any) {
    const selectedValue = value.target.value;
    this.requisitionService.updateUnitinItem(selectedValue, id)
      .subscribe(response => {


      });
  }

  backButton() {
    this.router.navigate(['/Requisition/Requisitionslist']);
  }

}

