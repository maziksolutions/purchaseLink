import { Component, ElementRef, OnInit, ChangeDetectorRef, NgZone, QueryList, ViewChildren, AfterViewInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseMasterService } from '../../../services/purchase-master.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { registerNavEnum, unitMasterNavEnum } from '../../Shared/rights-enum';
import { response } from '../../Models/response-model';
import { SideNavService } from '../sidenavi-right/sidenavi-service';

import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { ShipmasterService } from 'src/app/services/shipmaster.service';
import { RequisitionService } from 'src/app/services/requisition.service';
import { parse } from 'path';
import { map, filter, debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { isNull } from '@angular/compiler/src/output/output_ast';
import { AutoSaveService } from 'src/app/services/auto-save.service';
import { PmsgroupService } from 'src/app/services/pmsgroup.service';
import { Subscription, concat } from 'rxjs';
import { OrderRefPopUpViewComponent } from './common/order-ref-pop-up-view/order-ref-pop-up-view.component';
import { OrderRefDirectPopUpComponent } from './common/order-ref-direct-pop-up/order-ref-direct-pop-up.component';
import { EditReqQtyComponent } from './common/edit-req-qty/edit-req-qty.component';
import { HostListener } from '@angular/core';
import { ReqItemsModel } from '../../Models/reqItems-model';

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

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css'],
})
export class RequisitionNewComponent implements OnInit {

  RequisitionForm: FormGroup; flag; pkey: number = 0; isRequisitionApproved: boolean = false; temporaryNumber: any;
  displayedColumns: string[] = ['checkbox', 'index', 'itemName', 'itemCode', 'part', 'dwg', 'make', 'model', 'lastDlDt', 'lastDlQty', 'rob', 'enterQuantity', 'unit', 'remarks', 'attachments'];
  leftTableColumn: string[] = ['checkbox', 'inventoryName', 'partNo', 'dwg', 'quantity', 'availableQty', 'minRequired', 'reorderLevel'];
  rightTableColumn: string[] = ['checkbox', 'userInput', 'partNo', 'inventoryName'];
  componentTableColumn: string[] = ['checkbox', 'componentName'];
  groupTableColumn: string[] = ['checkbox', 'groupName'];
  dataSource = new MatTableDataSource<any>();
  leftTableDataSource = new MatTableDataSource<any>();
  rightTableDataSource = new MatTableDataSource<any>();
  componentsDataSourse = new MatTableDataSource<componentTableItems>();
  groupTableDataSource = new MatTableDataSource<any>();
  spareItemDataSource = new MatTableDataSource<any>();
  storeItemDataSource = new MatTableDataSource<any>();
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
  portList: any;
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
  currentyear: any;
  headabb: string;
  requisitiondata: any;
  headserialNumber: string;
  listViewItems: any;

  selectedSpareItemsInput: any[] = [];

  isHeaderCheckboxChecked = false;

  defaultOrderType = '';

  ComponentType: string = '';
  refModalTarget: string = '';
  refModal: string = '';
  modalTarget: string = '';
  modal: string = '';
  displayValue: string = '';
  saveValue: string = '';
  showOrderReferenceModal: boolean = false;
  showOrderReference2Modal: boolean = false;

  selectedListItem: { itemName: any; id: any; }[] = [];
  itemsId: string = '';
  private selectedItemsSubscription: Subscription;

  selectedComponents: componentTableItems[] = [];
  isReqApproved: boolean = false;
  public dataSourceTree: any;
  public groupTableSourceTree: any;
  cursorPosition: number | null = null;
  temporaryNODataBase: string;
  items: ReqItemsModel[] = [];

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private sideNavService: SideNavService, private cdr: ChangeDetectorRef,
    private router: Router, private purchaseService: PurchaseMasterService, private swal: SwalToastService, private zone: NgZone, private pmsService: PmsgroupService,
    private authStatusService: AuthStatusService, private userService: UserManagementService, private autoSaveService: AutoSaveService, public dialog: MatDialog,
    private vesselService: VesselManagementService, private shipmasterService: ShipmasterService, private requisitionService: RequisitionService,
  ) { }

  ngOnInit(): void {
    this.sideNavService.initSidenav();
    this.userId = this.authStatusService.userId();
    this.reqGetId = this.route.snapshot.paramMap.get('requisitionId');

    this.initForm();

    this.RequisitionForm.get('header')?.valueChanges.subscribe((headerValue) => {
      // if (headerValue && headerValue.requisitionId === 0) 
      this.autoSave('header');

    })

    this.RequisitionForm.get('delivery')?.valueChanges.subscribe((headerValue) => {
      if (headerValue && headerValue.delInfoId === 0)
        this.autoSave('delivery');
    });

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

    this.loadData(0);

    this.sortItems();
    this.generateTempNumber();
    this.sideNavService.setActiveComponent(true);
    // const orderTypeIdControl = this.RequisitionForm.get('header.orderTypeId');
    // if (orderTypeIdControl) {
    //   debugger
    //   orderTypeIdControl.valueChanges.subscribe(() => {
    //     debugger
    //     // Reset orderReference value when orderTypeId changes
    //     const orderReferenceControl = this.RequisitionForm.get('header.orderReference');
    //     if (orderReferenceControl) {
    //       // orderReferenceControl.setValue('');
    //     }
    //   });
    // }
    debugger
    if (this.reqId == undefined) {
      this.requisitionService.selectedItems$.subscribe(data => {
        debugger
        if (data) {
          this.displayValue = data.displayValue;
          this.saveValue = data.saveValue;
          this.RequisitionForm.get('header')?.patchValue({ orderReferenceType: data.orderReferenceType })
          if (data.orderReferenceType === 'Component') {
            this.dataSource.data = [];
            this.getSpareItems(data.orderReferenceType, data.saveValue);
          }
          else if (data.orderReferenceType === 'Group') {
            this.dataSource.data = [];
            this.getSpareItems(data.orderReferenceType, data.saveValue);
          }
          else if (data.orderReferenceType === 'Spare') {
            debugger
            this.leftTableDataSource.data = []
            this.dataSource.data = [];
            this.dataSource.data = data.cartItems?.map((item: any) => this.transformSpare(item)) || [];
          }
          else if (data.orderReferenceType === 'Store') {
            this.leftTableDataSource.data = []
            this.dataSource.data = [];
            this.dataSource.data = data.cartItems?.map((item: any) => this.transformStore(item)) || [];
          }
        }
      });
    }
  }

  get fm() { return this.RequisitionForm.controls };
  get fmd() { return this.deliveryForm.controls }

  generateTempNumber() {

    this.requisitionService.getTempNumber(0).subscribe(res => {
      if (res.data != null) {

        var formattedNumber = parseInt(res.data.documentHeader)
        formattedNumber++;

        let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let text = '';
        length = 3;
        for (var i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        this.temporaryNumber = formattedNumber.toString().padStart(3, '0') + ' - ' + text;
        this.temporaryNODataBase = formattedNumber.toString().padStart(3, '0') + ' - ' + text;

      }
      if (res.data == null) {
        var formattedNumber = parseInt('000');
        formattedNumber++;

        let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let text = '';
        length = 3;
        for (var i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        this.temporaryNumber = formattedNumber.toString().padStart(3, '0') + ' - ' + text;
        this.temporaryNODataBase = formattedNumber.toString().padStart(3, '0') + ' - ' + text;

      }
    })
  }

  initForm(): void {
    this.RequisitionForm = this.fb.group({
      header: this.fb.group({
        requisitionId: [0],
        originSite: ['', [Validators.required]],
        documentHeader: ['', [Validators.required]],
        vesselId: ['0', [Validators.required]],
        orderTypeId: ['0', [Validators.required]],
        orderTitle: ['', [Validators.required]],
        orderReference: ['', [Validators.required]],
        orderReferenceType: ['', [Validators.required]],
        departmentId: ['', [Validators.required]],
        priorityId: ['', [Validators.required]],
        projectNameCodeId: ['', [Validators.required]],
        remarks: ['', [Validators.required]]
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
        reqIds: []
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
        pmReqId: [0, [Validators.required]]
      }),
    });
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
        documentHeader: this.temporaryNODataBase,
        originSite: this.userDetail.site,
        vesselId: formPart?.value.vesselId,
        orderTypeId: formPart?.value.orderTypeId,
        orderTitle: formPart?.value.orderTitle,
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

            if (data.message == "data added") {
              this.reqId = data.data;
              this.swal.success('Added successfully.');
              debugger
              if (formPart.value.orderReferenceType === 'Spare' || formPart.value.orderReferenceType === 'Store') {
                this.items = []
                this.dataSource.data.map(item => {
                  const newItem = {
                    itemsId: 0,
                    itemCode: item.itemCode || '',
                    itemName: item.itemName || '',
                    partNo: item.partNo || '',
                    availableQty: item.minimumLevel || '',
                    dwg: item.dwg || '',
                    maker: item.makerReference || '',
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
                    remarks: item.remarks || '',
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
                    pmReqId: this.reqId
                  };
                  this.items.push(newItem);
                });
                debugger
                this.requisitionService.addItemsDataList(this.items).subscribe(res => {
                  debugger
                  if (res.message == "All items added") {
                    this.swal.success('Added successfully.');
                    this.loadItemsData(0);
                  }
                });
              }
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
        formPart?.patchValue({
          reqIds: this.reqId,
        })
        if (partName == 'delivery' && formPart != null && formPart.valid) {

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
          debugger
          if (item.itemsId != 0) {
            const { editMode, ...rest } = item;
            return rest;
          } else {
            const { editMode, ...rest } = item;
            return rest;
          }
        })
        this.requisitionService.addItemsDataList(itemList).subscribe(res => {
          debugger
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

  onSubmit(form: any) {

    form.value.reqIds = this.reqId;

    if (this.deliveryForm.valid) {

    }
  }

  getReqData() {
    debugger
    this.requisitionService.getRequisitionById(this.reqGetId)
      .subscribe(response => {
        debugger
        const requisitionData = response.data;
        const formPart = this.RequisitionForm.get('header');

        // Populate the form controls with the data for editing
        formPart?.patchValue({
          requisitionId: requisitionData.requisitionId,
          originSite: requisitionData.originSite,
          vesselId: requisitionData.vesselId,
          orderTypeId: requisitionData.orderTypeId,
          orderTitle: requisitionData.orderTitle,
          departmentId: requisitionData.departmentId,
          priorityId: requisitionData.priorityId,
          projectNameCodeId: requisitionData.projectNameCodeId,
          remarks: requisitionData.remarks,
          orderReference: requisitionData.orderReferenceNames.join(', ')
        });

        if (!this.isRequisitionApproved) (
          this.temporaryNumber = requisitionData.documentHeader
        )
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
          debugger
          this.orderTypes = res;
          this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(requisitionData.orderTypeId)).map(x => x.defaultOrderType);
          formPart?.patchValue({ orderTypeId: requisitionData.orderTypeId })
          if (requisitionData.orderReferenceType === 'Component' || requisitionData.orderReferenceType === 'Spare') {
            this.getSpareItems('Component', objProcR);
            this.LoadShipCompnent(0)
            this.getCartItemsInEditReq(0).subscribe(res => {
              console.log('spareItemsList:-', this.spareItemDataSource.data);
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
      });
  }

  loadOrderTypeByEditReq() {
    return this.purchaseService.getOrderTypes(0).pipe(map(res => {
      return res.data;
    }))
  }

  transformSpare(item: any): any {
    return {
      itemsId: 0,
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
      remarks: item.remarks || '',
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
      pmReqId: this.reqId,
    }
  }
  transformStore(item: any): any {
    return {
      itemsId: 0,
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
      remarks: item.remarks || '',
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
            spareMaster.requiredQuantity = item.requiredQuantity
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
        const delivery = this.RequisitionForm.get('delivery');
        delivery?.patchValue({
          delInfoId: deliveryInfoData.delInfoId,
          expectedDeliveryPort: deliveryInfoData.expectedDeliveryPort,
          expectedDeliveryDate: this.formatDate(deliveryInfoData.expectedDeliveryDate),
          vesselETA: this.formatDate(deliveryInfoData.vesselETA),
          vesselETB: this.formatDate(deliveryInfoData.vesselETB),
          deliveryAddress: deliveryInfoData.deliveryAddress,
        })
      }
    })
  }

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

  loadOrderTypeInEdit() {
    return this.purchaseService.getOrderTypes(0).pipe(map(res => {
      this.orderTypes = res.data;
      return { data: this.orderTypes }
    }))
  }

  LoadOrdertype() {
    this.purchaseService.getOrderTypes(0)
      .subscribe(response => {
        this.orderTypes = response.data;
        this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.defaultOrderType);
        if (this.defaultOrderType[0] === 'Spare' || this.defaultOrderType[0] === 'Service')
          this.LoadShipCompnent(0);
        else if (this.defaultOrderType[0] === 'Store')
          this.loadGroupsComponent()
      },
        error => {
          console.error('Error loading order types:', error);
        }
      )
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
          // let requisitionValues = this.requisitiondata.filter(x => x.originSite === 'Office').length;
          // this.headserialNumber = `${requisitionValues + 1}`.padStart(4, '0');
        }
        else if (this.userDetail.site == 'Vessel') {
          this.headsite = 'V';
          this.headCode = '___ ';
          this.headabb = '___';

          // let requisitionValues = this.requisitiondata.filter(x => x.originSite === 'Vessel');
          // this.headserialNumber = `${requisitionValues.length + 1}`.padStart(4, '0');
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
          this.LoadProjectnameAndcode();
          this.LoadPriority();
          this.LoadDepartment();
          this.userService.getUserById(this.userId).subscribe(response => { this.userDetail = response.data; this.currentyear = new Date().getFullYear(); })
          this.getReqData();
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

  getPortList() {
    return this.requisitionService.GetPortList(0).pipe(map(res => {
      return res.data;
    }))
  }
  loadPortList() {
    this.requisitionService.GetPortList(0)
      .subscribe(response => {
        this.portList = response.data;
      })
  }

  LoadShipCompnent(status) {
    this.requisitionService.getTemplateTree().subscribe(res => {
      this.dataSourceTree = res;

    })
  }

  loadGroupsComponent() {
    this.requisitionService.getGroupTemplateTree().subscribe(res => {
      this.groupTableSourceTree = res
    })
    // if (this.selectedVesselId)
    //   this.pmsService.GetStoreByShipId(this.selectedVesselId).subscribe(res => {

    //     this.groupTableDataSource.data = res.data.map(item => {
    //       return {
    //         pmsGroupId: item.pmsGroupId,
    //         groupName: item.groupName,
    //         accountCode: item.accountCode,
    //         // Add other properties as needed
    //       };
    //     });
    //   })
  }

  getCartItems(status) {

    this.shipmasterService.GetCartItemsInfo(status).subscribe(res => {

      if (this.defaultOrderType[0] === 'Service' || this.defaultOrderType[0] === 'Spare') {
        this.spareItemDataSource.data = res.data.map(item => {

          this.cartItemId = 'shipSpareId';
          const spareMaster = item.shipSpareMaster;
          if (spareMaster) {
            spareMaster.requiredQuantity = item.requiredQuantity
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
        this.LoadShipCompnent(0)
        this.getCartItems(0)
      } else if (this.defaultOrderType[0] === 'Store') {
        this.loadGroupsComponent()
        this.getCartItems(0)
      }
      this.RequisitionForm.get('header')?.patchValue({ orderReference: '' });
      this.cdr.markForCheck();
      // Update document header element
      const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
      // documentHeaderElement.innerHTML = `<i class="fas fa-radiation text-danger"></i><i class="fas fa-exclamation-triangle text-danger"></i> REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
      documentHeaderElement.innerHTML = ` REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.temporaryNumber}`;
    })
  }

  //#region  PM Items
  getSpareItems(itemType: string, ids: any) {
    if (itemType === 'Component') {
      this.requisitionService.getItemsInfo(ids)
        .subscribe(res => {
          debugger
          const data = res.map(item => ({
            itemsId: item.shipComponentSpareId,
            itemCode: item.shipSpares.inventoryCode || '',
            itemName: item.shipSpares.inventoryName || '',
            partNo: item.shipSpares.partNo || '',
            dwg: item.drawingNo || '',
            maker: item.components.maker.makerName || '',
            model: item.components.modelNo || '',
            minRequired: item.minRequired || 0,
            reqQty: item.reqQty || 0,
            rob: item.shipSpares.rob || 0,
            lpp: item.lpp || 0,
            lpd: item.lpd || 0,
            aq: item.aq || 0,
            unit: item.unit || 0,
            uc: item.uc || 0,
            qu: item.qu || 0,
            dt: item.dt || '',
            id: item.id || 0,
            cost: item.shipSpares.assetCost || 0,
            cbc: item.cbc || 0,
            lowest: item.lowest || 0,
            remarks: item.remarks || '',
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
              this.leftTableDataSource.data = data;
            })
          } else
            this.leftTableDataSource.data = data;
        });
    } else if (itemType === 'Group') {
      this.requisitionService.getGroupsInfo(ids).subscribe(res => {
        debugger
        const data = res.map(item => ({
          itemsId: item.shipStoreId,
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
          remarks: item.remarks || '',
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
      this.leftTableSelection.clear();
    }
  }
  moveAllItemToRight(): void {

    const newData = this.rightTableDataSource.data.concat(this.leftTableDataSource.data);
    this.rightTableDataSource.data = newData;
    this.leftTableDataSource.data = [];
    this.leftTableDataSource._updateChangeSubscription();
  }

  moveItemToLeft(): void {

    const selectedItems = this.rightTableSelection.selected.length > 0
      ? this.rightTableSelection.selected
      : [this.rightTableDataSource.data[0]];

    if (selectedItems[0] != undefined) {
      this.leftTableDataSource.data = this.leftTableDataSource.data.concat(selectedItems);
      this.rightTableDataSource.data = this.rightTableDataSource.data.filter(item => !selectedItems.includes(item));
      this.rightTableSelection.clear();
    }
  }
  moveAllItemToLeft(): void {

    const newData = this.leftTableDataSource.data.concat(this.rightTableDataSource.data);
    this.leftTableDataSource.data = newData;
    this.rightTableDataSource.data = [];
    this.rightTableDataSource._updateChangeSubscription();
  }

  storeTableData() {
    this.items = [];
    this.rightTableDataSource.data.forEach((item, index) => {
      const newItem = {
        itemsId: 0,
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
        remarks: item.remarks || '',
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
      };
      this.items.push(newItem);
    });
    this.requisitionService.addItemsDataList(this.items).subscribe(res => {
      if (res.status === true) {
        debugger
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
    //   console.log(res);
    // })
  }

  loadItemsData(status: number) {
    debugger
    if (this.reqId)
      this.requisitionService.getItemsByReqId(this.reqId)
        .subscribe(response => {
          debugger
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
          console.log(this.leftTableDataSource.data);
          this.dataSource.data = response.map(item => ({
            editMode: false,
            ...item
          }));
          console.log('dataSourcedata :- ', this.dataSource.data)

          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
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

  listDetails(id) {

    const uniqueIds = new Set<number>();
    this.listViewItems = this.dataSource.data.filter(item => {
      if (item.ids == id && !uniqueIds.has(item.ids)) {
        uniqueIds.add(item.ids);
        return true;
      }
      return false;
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
    //     debugger
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

  openModal() {
    const orderType = this.defaultOrderType[0]
    const dialogConfig = new MatDialogConfig();
    dialogConfig.position = { top: '70px' };
    if (orderType === 'Spare' || orderType === 'Service') {
      const isSpareDataEmpty = this.spareItemDataSource.data.length === 0;
      if (isSpareDataEmpty) {
        const dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
          width: '1000px',
          height: '70vh',
          data: {
            modalTitle: "Order Reference", componentType: 'Component',
            dataSourceTree: this.dataSourceTree
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'success') {

          }
        })
      } else {
        const dialogRef = this.dialog.open(OrderRefPopUpViewComponent, {
          width: '500px',
          data: {
            modalTitle: "Order Reference", orderType: this.defaultOrderType[0], spareTableData: this.spareItemDataSource.data,
            componentType: 'Component', dataSourceTree: this.dataSourceTree
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'success') {
            this.defaultOrderType[0]
          }
        })
      }
    } else {

      const isStoreDataEmpty = this.storeItemDataSource.data.length === 0;
      if (isStoreDataEmpty) {
        const dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
          width: '1000px',
          data: { modalTitle: "Order Reference", componentType: 'Group', groupTableData: this.groupTableSourceTree }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'success') {

          }
        })
      } else {

        const dialogRef = this.dialog.open(OrderRefPopUpViewComponent, {
          width: '500px',
          data: {
            modalTitle: "Order Reference", orderType: this.defaultOrderType[0], groupTableData: this.groupTableSourceTree,
            storeTableData: this.storeItemDataSource.data
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'success') {
            this.defaultOrderType[0]
          }
        })
      }
    }
  }

  openEditModal(row) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.position = { top: '70px' };
    const dialogRef = this.dialog.open(EditReqQtyComponent, {
      width: '350px',
      height: '260px',
      data: {
        modalTitle: "Edit Quantity",
        itemName: row.itemName,
        itemCode: row.itemCode,
        partNo: row.partNo,
        reqQty: row.reqQty
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      if (result && result.result === 'success') {
        row.reqQty = result.editedQuantity
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
}

