import { Component, ElementRef, OnInit, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
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
import { map, filter, debounce } from 'rxjs/operators';
import { isNull } from '@angular/compiler/src/output/output_ast';
import { AutoSaveService } from 'src/app/services/auto-save.service';
import { debug, error } from 'console';
import { PmsgroupService } from 'src/app/services/pmsgroup.service';
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
  shipComponentId: number;
  shipComponentName: string;
  checkboxState: boolean;
  checkboxDisabled: boolean;
}

@Component({
  selector: 'app-requisition-new',
  templateUrl: './requisition-new.component.html',
  styleUrls: ['./requisition-new.component.css']
})
export class RequisitionNewComponent implements OnInit {

  RequisitionForm: FormGroup; flag; pkey: number = 0; isRequisitionApproved: boolean = false; temporaryNumber: any;
  displayedColumns: string[] = ['checkbox', 'index', 'itemName', 'itemCode', 'part', 'dwg', 'make', 'model', 'enterQuantity', 'rob', 'remarks'];
  leftTableColumn: string[] = ['checkbox', 'inventoryCode', 'inventoryName', 'partNo', 'quantity', 'availableQty'];
  rightTableColumn: string[] = ['checkbox', 'userInput', 'inventoryCode', 'inventoryName', 'partNo', 'quantity', 'availableQty'];
  componentTableColumn: string[] = ['checkbox', 'shipComponentName'];
  groupTableColumn: string[] = ['checkbox', 'groupName'];
  dataSource = new MatTableDataSource<any>();
  leftTableDataSource = new MatTableDataSource<any>();
  rightTableDataSource = new MatTableDataSource<any>();
  componentsDataSourse = new MatTableDataSource<componentTableItems>();
  groupTableDataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  leftTableSelection = new SelectionModel<any>(true, []);
  rightTableSelection = new SelectionModel<RightTableItem>(true, []);
  componentSelection = new SelectionModel<any>(true, []);
  groupSelection = new SelectionModel<any>(true, []);
  selectedIndex: any;
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('shipItemsModal') shipItemsModal!: ElementRef;
  @ViewChild('orderReferenceModal') orderReferenceModal!: ElementRef;
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

  selectedComponents: componentTableItems[] = [];

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private sideNavService: SideNavService, private cdr: ChangeDetectorRef,
    private router: Router, private purchaseService: PurchaseMasterService, private swal: SwalToastService, private zone: NgZone, private pmsService: PmsgroupService,
    private authStatusService: AuthStatusService, private userService: UserManagementService, private autoSaveService: AutoSaveService,
    private vesselService: VesselManagementService, private shipmasterService: ShipmasterService, private requisitionService: RequisitionService,
  ) { }

  ngOnInit(): void {
    this.sideNavService.initSidenav();
    this.userId = this.authStatusService.userId();
    this.reqGetId = this.route.snapshot.paramMap.get('requisitionId');

    this.initForm();

    this.RequisitionForm.get('header')?.valueChanges.subscribe(() => {
      this.autoSave('header');
    })

    this.RequisitionForm.get('delivery')?.valueChanges.subscribe(() => {
      if (this.reqId)
        this.autoSave('delivery');
    })

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
  }

  get fm() { return this.RequisitionForm.controls };
  get fmd() { return this.deliveryForm.controls }

  generateTempNumber() {
    this.requisitionService.getTempNumber(0).subscribe(res => {
      if (!this.reqGetId) {

        var formattedNumber = parseInt(res.data.documentHeader)
        formattedNumber++;
        this.temporaryNumber = formattedNumber.toString().padStart(3, '0');
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
        departmentId: ['', [Validators.required]],
        priorityId: ['', [Validators.required]],
        projectNameCodeId: ['', [Validators.required]],
        remarks: ['', [Validators.required]],
        genericComment: [false],
        internalComment: [false],
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
        part: ['', [Validators.required]],
        dwg: ['', [Validators.required]],
        make: ['', [Validators.required]],
        model: ['', [Validators.required]],
        enterQuantity: [0, [Validators.required]],
        rob: [0, [Validators.required]],
        remarks: ['', [Validators.required]],
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

      const { displayValue, saveValue } = this.formatSelectedComponents();
      // formPart?.get('orderReference')?.setValue(displayValue);

      formPart?.patchValue({
        requisitionId: formPart?.value.requisitionId,
        documentHeader: this.temporaryNumber,
        originSite: this.userDetail.site,
        vesselId: formPart?.value.vesselId,
        orderTypeId: formPart?.value.orderTypeId,
        orderTitle: formPart?.value.orderTitle,
        orderReference: saveValue,
        departmentId: formPart?.value.departmentId,
        priorityId: formPart?.value.priorityId,
        projectNameCodeId: formPart?.value.projectNameCodeId,
        remarks: formPart?.value.remarks,
        genericComment: this.commetType == 'generic' ? true : false,
        internalComment: this.commetType == 'internal' ? true : false
      });
      if (partName == 'header' && formPart != null && formPart.valid && (formPart.value.genericComment || formPart.value.internalComment)) {

        const formData = new FormData();
        formData.append('data', JSON.stringify(formPart.value))
        formPart?.get('orderReference')?.setValue(displayValue);
        this.requisitionService.addRequisitionMaster(formData)
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

          },
            error => {
              console.error('Error:', error);
              this.swal.error('An error occurred. Please try again.');
            })
      }
      formPart?.get('orderReference')?.setValue(displayValue);
    }
    else if (partName == 'delivery') {

      if (this.reqId) {

      }
    }
    else if (partName == 'items') {
      if (this.reqId) {

      }
    }
  }

  onCheckboxChanged(event) {
    debugger;
    const checkboxType = event.target.id;
    const isChecked = event.target.checked;
    this.commetType = '';
    if (checkboxType === 'generic') {
      this.RequisitionForm.get('header.genericCheckbox')?.setValue(isChecked);
      this.RequisitionForm.get('header.internalCheckbox')?.setValue(false);
      this.genericCheckbox = isChecked;
      this.internalCheckbox = false;
      this.commetType = 'generic';
    } else if (checkboxType === 'internal') {
      this.RequisitionForm.get('header.internalCheckbox')?.setValue(isChecked);
      this.RequisitionForm.get('header.genericCheckbox')?.setValue(false);
      this.internalCheckbox = isChecked;
      this.genericCheckbox = false;
      this.commetType = 'internal';
    }

    this.sideNavService.setCommetType(this.commetType);
    if (!this.reqGetId) {
      this.autoSave('header');
    }
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
        debugger;
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
          genericComment: requisitionData.genericComment,
          internalComment: requisitionData.internalComment
        });

        if (!this.isRequisitionApproved) (
          this.temporaryNumber = requisitionData.documentHeader
        )

        this.genericCheckbox = requisitionData.genericComment === true;
        this.internalCheckbox = requisitionData.internalComment === true;

        if (this.genericCheckbox)
          this.sideNavService.setCommetType('generic');
        else if (this.internalCheckbox)
          this.sideNavService.setCommetType('internal');

        this.reqId = requisitionData.requisitionId;
        this.loadDeliveryInfo();

        this.selectedVesselId = requisitionData.vesselId;

        this.loadOrderTypeInEdit().subscribe(res => {
          debugger
          this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(requisitionData.orderTypeId)).map(x => x.defaultOrderType);
          const objProcR = requisitionData.orderReference ? requisitionData.orderReference.split(',') : [];
          if (this.defaultOrderType[0] === 'Spare')
            this.LoadShipCompnentList().subscribe(res => {
              debugger
              const selectedItems = this.componentsDataSourse.data.filter(item => objProcR.includes(item.shipComponentId.toString()));
              this.RequisitionForm.get('header')?.patchValue({
                orderReference: selectedItems.map(item => item.shipComponentName).join(', ')
              });
              const componentIds = selectedItems.map(item => item.shipComponentId);
              const id = componentIds.join(', ');
              this.getSpareItems('Component', id)
            })
          else if (this.defaultOrderType[0] === 'Store')
            this.loadGroupList().subscribe(res => {
              debugger
              const selectedItems = this.groupTableDataSource.data.filter(item => objProcR.includes(item.pmsGroupId.toString()));
              this.RequisitionForm.get('header')?.patchValue({
                orderReference: selectedItems.map(item => item.groupName).join(', ')
              });
              const groupIds = selectedItems.map(item => item.pmsGroupId);
              const id = groupIds.join(', ');
              this.getSpareItems('Group', id)
            })

          this.RequisitionForm.get('header')?.patchValue({ orderTypeId: requisitionData.orderTypeId });
          this.cdr.detectChanges();
        })

        //   this.RequisitionForm.get('header')?.patchValue({ orderTypeId: requisitionData.orderTypeId });

        //   debugger
        //   this.headCode = this.Vessels.filter(x => x.vesselId === parseInt(this.selectedVesselId)).map(x => x.vesselCode);


        //   this.updateDocumentHeader(requisitionData);

        //   //  this.LoadheadorderType();


      });
  }

  updateDocumentHeader(requisitionData: any) {
    debugger
    this.headsite = requisitionData.originSite === 'Office' ? 'O' : 'V';
    this.headCode = requisitionData.originSite === 'Office' ? 'OFF' : this.headCode[0];

    const headerStringParts = requisitionData.documentHeader.split(' – ');
    if (headerStringParts.length === 6) {
      const headerSerialNumber = headerStringParts[5];
      this.headabb = headerStringParts[3];
      this.headserialNumber = headerSerialNumber;
    }
    this.zone.run(() => {
      debugger
      this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.defaultOrderType);
      if (this.defaultOrderType[0] === 'Spare') {
        this.getSpareItems('Component', requisitionData.orderReference);
      }
      else if (this.defaultOrderType[0] === 'Store') {
        this.getSpareItems('Group', requisitionData.orderReference);
      }
      this.cdr.markForCheck();
      // Update document header element
      const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
      // documentHeaderElement.innerHTML = `<i class="fas fa-radiation text-danger"></i><i class="fas fa-exclamation-triangle text-danger"></i> REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
      documentHeaderElement.innerHTML = ` REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;

    })
    this.loadGroupsComponent();
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
        this.componentsDataSourse.data = res.data;
        return { data: this.componentsDataSourse.data };
      }));
  }

  loadGroupList() {
    debugger
    if (this.selectedVesselId)
      debugger
    return this.pmsService.GetStoreByShipId(this.selectedVesselId).pipe(map(res => {
      this.groupTableDataSource.data = res.data;
      return { data: this.groupTableDataSource.data };
    }));
  }
  loadOrderTypeInEdit() {
    return this.purchaseService.getOrderTypes(0).pipe(map(res => {
      this.orderTypes = res.data;
      return { data: this.orderTypes }
    }))
  }

  LoadOrdertype() {
    debugger
    this.purchaseService.getOrderTypes(0)
      .subscribe(response => {
        this.orderTypes = response.data;
        this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.defaultOrderType);
        if (this.defaultOrderType[0] === 'Spare')
          this.LoadShipCompnent();
        else if (this.defaultOrderType[0] === 'Store')
          this.loadGroupsComponent()

        this.cdr.detectChanges();
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
          // this.LoadShipCompnent();
          // this.LoadOrdertype();
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
        console.log(this.Vessels);
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
        this.componentsDataSourse.data = response.data;

        // this.Shipcomponent = response.data.map(item => ({
        //   accountCode: item.accountCode,
        //   shipComponentId: item.shipComponentId,
        //   shipComponentName: item.shipComponentName
        // }));
        if (this.headsite == 'V') {
          this.headCode = this.Vessels.filter(x => x.vesselId === parseInt(this.selectedVesselId)).map(x => x.vesselCode);
        }
      })
  }

  loadGroupsComponent() {

    if (this.selectedVesselId)
      this.pmsService.GetStoreByShipId(this.selectedVesselId).subscribe(res => {

        this.groupTableDataSource.data = res.data.map(item => {
          return {
            pmsGroupId: item.pmsGroupId,
            groupName: item.groupName,
            accountCode: item.accountCode,
            // Add other properties as needed
          };
        });
      })
  }

  LoadheadorderType() {
    this.zone.run(() => {
      debugger
      this.headabb = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.abbreviation);
      this.defaultOrderType = this.orderTypes.filter(x => x.orderTypeId === parseInt(this.selectedOrderTypeId)).map(x => x.defaultOrderType);

      // Clear the selections when the order type changes
      this.componentSelection.clear();
      this.groupSelection.clear();

      this.componentsDataSourse.data.length = 0
      this.groupTableDataSource.data.length = 0;

      if (this.defaultOrderType[0] === 'Spare') {
        this.LoadShipCompnent();
      }
      else if (this.defaultOrderType[0] === 'Store') {
        this.loadGroupsComponent()
        //  this.isAllGroupSelected()
      }

      this.RequisitionForm.get('header')?.patchValue({ orderReference: '' });
      this.cdr.markForCheck();
      // Update document header element
      const documentHeaderElement = document.getElementById('documentHeader') as HTMLHeadingElement;
      // documentHeaderElement.innerHTML = `<i class="fas fa-radiation text-danger"></i><i class="fas fa-exclamation-triangle text-danger"></i> REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
      documentHeaderElement.innerHTML = ` REQ – ${this.headsite} – ${this.headCode} – ${this.headabb} – ${this.currentyear} – ${this.headserialNumber}`;
    })
  }

  //#region  PM Items
  getSpareItems(itemType: string, ids: any) {
    if (itemType === 'Component') {
      this.requisitionService.getItemsInfo(ids)
        .subscribe(res => {
          console.log(res)

          this.leftTableDataSource.data = res.map(item => ({
            itemsId: item.shipSpares.shipSpareId,
            itemCode: item.shipSpares.inventoryCode,
            itemName: item.shipSpares.inventoryName,
            part: item.partNo,
            dwg: item.dwg,
            make: item.make,
            model: item.model,
            enterQuantity: '',
            rob: item.rob,
            unit: item.quantity
          }));
        })
    } else if (itemType === 'Group') {
      this.requisitionService.getGroupsInfo(ids).subscribe(res => {
        this.leftTableDataSource.data = res;
        console.log(res)
        this.leftTableDataSource.data = res.map(item => ({
          itemsId: item.shipStoreId,
          itemCode: item.inventoryCode,
          itemName: item.inventoryName,
          part: item.partNo,
          dwg: item.dwg,
          make: item.makerReference,
          model: item.model,
          enterQuantity: '',
          rob: item.rob,
          unit: item.unit
        }))
      })
    }
  }
  getSpareItemByGroup(id: any) {
    this.requisitionService.getItemInfoByGroups(id).subscribe(res => {

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
    debugger;
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
          ItemCode: item.itemCode,
          ItemName: item.itemName,
          Part: item.part,
          DWG: item.dwg,
          Make: item.make,
          Model: item.model,
          EnterQuantity: enterQuantity,
          ROB: item.rob,
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
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(r => this.selection.select(r));
  }
  checkboxLabel(row: any): string {

    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.shipComponentSpareId + 1}`;
  }

  //#region this is for GroupItems Table Checkbox handling code 
  isAllGroupSelected() {

    const numSelected = this.groupSelection.selected.length;
    const numRows = !!this.groupTableDataSource && this.groupTableDataSource.data.length;
    return numSelected === numRows;
  }
  groupToggle() {

    this.isAllGroupSelected() ? this.groupSelection.clear() : this.groupTableDataSource.data.forEach(r => this.groupSelection.select(r));
  }
  groupLabel(row: any): string {

    if (!row) {
      return `${this.isAllGroupSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.groupSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.pmsGroupId + 1}`;
  }
  //#endregion

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

    this.listViewItems = this.dataSource.data.filter(item => item.itemsId == id);
  }

  applyFilter(filterValue: string) {

    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.leftTableDataSource.filter = filterValue;
  }

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

    this.componentsDataSourse.data.forEach(otherItems => {
      if (otherItems !== item) {
        otherItems.checkboxDisabled = otherItems.accountCode !== item.accountCode;
      }
    })

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
  sortItems(): void {

    // Sort the items so that items with matching account codes come first
    if (this.componentSelection.selected.length === 0) {
      this.componentsDataSourse.data.sort((a, b) => a.shipComponentId - b.shipComponentId);
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
  formatSelectedComponents(): { displayValue: string, saveValue: string } {
    let displayValue = '';
    let saveValue = '';
    if (this.selectedComponents.length > 0) {
      displayValue = this.selectedComponents.map(item => item.shipComponentName).join(', ');
      saveValue = this.selectedComponents.map(item => item.shipComponentId).join(',');
    }
    else {
      displayValue = this.selectedGroupsDropdown.map(item => item.groupName).join(', ');
      saveValue = this.selectedGroupsDropdown.map(item => item.pmsGroupId).join(',');
    }

    return { displayValue, saveValue };
  }
  saveComponent() {
    debugger
    this.selectedComponents = this.componentsDataSourse.data.filter(row => row.checkboxState);
    this.selectedGroupsDropdown = this.groupTableDataSource.data.filter(row => this.groupSelection.isSelected(row));

    if (this.selectedComponents.length > 0) {
      debugger;
      this.selectedItems = this.selectedComponents.map((x: { shipComponentId: any; }) => x.shipComponentId);
      const itemsId = this.selectedItems.join(',');
      this.getSpareItems('Component', itemsId);
    }
    else if (this.selectedGroupsDropdown) {
      debugger
      this.selectedItems = this.selectedGroupsDropdown.map((x: { pmsGroupId: any; }) => x.pmsGroupId);
      const itemsId = this.selectedItems.join(',');
      this.getSpareItems('Group', itemsId);
    }

    this.autoSave('header');
    $("#orderReference").modal('hide');
  }
}

