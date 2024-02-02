import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { RequisitionService } from 'src/app/services/requisition.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { RightsModel } from '../../Models/page-rights';
import { UserManagementService } from 'src/app/services/user-management.service';
import { registerNavEnum, unitMasterNavEnum } from '../../Shared/rights-enum';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { saveAs } from 'file-saver';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { DatePipe } from '@angular/common';
import { ShipmasterService } from 'src/app/services/shipmaster.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { environment } from 'src/environments/environment';
import { PmsgroupService } from 'src/app/services/pmsgroup.service';
import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { SideNavService } from 'src/app/services/sidenavi-service';


@Component({
  selector: 'app-requisitionslist',
  templateUrl: './requisitionslist.component.html',
  styleUrls: ['./requisitionslist.component.css']
})
export class RequisitionslistComponent implements OnInit {
  RequisitionForm: FormGroup; flag; pkey: number = 0;
  selectedIndex: any;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['checkbox', 'Requisition_No', 'Delivery_Site', 'OriginSite', 'RequestOrderType', 'OrderTitle',
    'OrderReference', 'Department', 'Priority', 'ProjectName_Code', 'Status'];
  selection = new SelectionModel<any>(true, []);
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  Vessels: any;
  selectedVesselId: number = 0;
  selectedVesselGroupId: number = 0;
  targetLoc: string;
  VesselId: any;
  vesselcode: any;
  ReqData: any[];
  GetGroupAccCode: any;
  itemdata: any;
  accountcode: any;
  GetCompoAccCode: any;
  GetStoreAccCode: any;
  GetSpareAccCode: any;
  myFleet: any;
  fullVesselList: any;


  constructor(private sideNavService: SideNavService, private route: Router, private authStatusService: AuthStatusService,
    private userManagementService: UserManagementService, private vesselService: VesselManagementService, private elRef: ElementRef,
    private fb: FormBuilder, private requisitionService: RequisitionService, private swal: SwalToastService, private datePipe: DatePipe, private shipmasterService: ShipmasterService,
    private exportExcelService: ExportExcelService, private pmsgroupService: PmsgroupService) {
    this.route.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sideNavService.initSidenav();
      }
    })
  }

  get fm() { return this.RequisitionForm.controls };

  // navigateToNewReq() {

  //   this.sideNavService.destroySidenav();

  //   const navigationExtras: NavigationExtras = {
  //     queryParams: { 'reload': true }
  //   };
  //   this.route.navigate(['/Requisition/RequisitionsNew'], navigationExtras);
  // }

  ngOnInit(): void {
    
    this.targetLoc = environment.location;
    this.sideNavService.setActiveComponent(false);
    this.sideNavService.initSidenav();

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
    if (this.targetLoc == 'Vessel') {
      this.VesselId = environment.vesselId;
    }
    this.loadUserFleetData();
    this.loadData(0);
    this.LoadVessel();
    this.Loadgroup();
    this.LoadComponent();
    this.LoadStore();
    this.LoadSpare();
    this.loadItem();

    this.loadScript('assets/js/SideNavi.js');
  }

  ngAfterViewInit(): void {
    this.checkDropdownItems();
  }
  checkDropdownItems() {
    debugger
    const dropdownItems = this.elRef.nativeElement.querySelectorAll('.dropdown-item');
    // if (dropdownItems.length === 1) {
    //   const singleItem = dropdownItems[0] as HTMLElement;
    //   singleItem.click();
    // }
  }

  handleButtonClick() {
    debugger
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    if (dropdownItems.length === 1) {
      const singleItem = dropdownItems[0] as HTMLElement;
      singleItem.click();
    } else {
      // Handle regular dropdown behavior here (e.g., show the dropdown)
    }
  }

  loadUserFleetData() {
    this.userManagementService.loadUserFleet(0, this.authStatusService.userId())
      .subscribe(response => {

        this.myFleet = response.data;
      });
  }
  filteredVessels(id) {
    debugger
    this.VesselId = null;
    var vesselList = this.myFleet.filter(x => x.userFleetId == id)[0]["vessels"];

    if (vesselList != null || vesselList != undefined) {
      this.Vessels = this.fullVesselList.filter(x => vesselList.split(",").includes(x.vesselId.toString()));
      // this.searchForm.controls.vesselId.setValue('');
    }

    // this.sfm.fleetId.setValue(id);       
    // this.page = 1; this.currentPage = 0;   
    // this.loadShipComponentList(this.sfm.componentId.value, this.searchForm.controls.type.value);
  }


  private loadScript(scriptUrl: string): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);
  }

  editRequisition(row: any): void {

    this.route.navigate(['/Requisition/RequisitionsNew', row.requisitionId]);
  }

  loadRights() {
    this.userManagementService.checkAccessRight(unitMasterNavEnum.jobGroup).subscribe((response) => {
      if (response.status) {
        this.rights = response.data;
      } else {
        this.rights = new RightsModel();
        this.rights.addRight = this.rights.ammendRight = this.rights.deleteRight = this.rights.importRight = this.rights.viewRight = false;
      }
      if (!this.rights.viewRight) {
        alert('you have no view right')
        this.route.navigate(['welcome']);
      }
    }, (error) => {
      console.log(error);
    })
  }

  LoadVessel() {
    this.vesselService.getVessels(0)
      .subscribe(response => {
        debugger
        if (this.targetLoc == 'Vessel') {
          const filteredVessels = response.data.filter(x => x.vesselId == environment.vesselId);
          if (filteredVessels.length > 0) {
            this.Vessels = filteredVessels;
            this.selectedVesselId = filteredVessels[0].vesselId;
            this.filterVessel()
          }
        }
        else {
          this.Vessels = response.data;
          this.fullVesselList = response.data;
        }
      })
  }
  filterVessel() {
    this.requisitionService.filterRequisitionMasterwithvessel(this.selectedVesselId)
      .subscribe(response => {

        this.flag = status;

        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  clearSearchInput() {
    this.searchInput.nativeElement.value = '';
    this.applyFilter(this.searchInput.nativeElement.value)
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {

    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(r => this.selection.select(r));

  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {

    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;

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

        this.flag = status;
        // this.documentHeaderList =response.data.map(x=>x.documentHeader.replace(/\D/g, '')) 

        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }

  clear() {
    debugger
    this.RequisitionForm.reset();
    this.RequisitionForm.controls.requisitionId.setValue(0);
    this.RequisitionForm.controls.originSite.setValue('');
    this.RequisitionForm.controls.vesselId.setValue('');
    this.RequisitionForm.controls.orderTypeId.setValue('');
    this.RequisitionForm.controls.orderTitle.setValue('');
    this.RequisitionForm.controls.orderReference.setValue('');
    this.RequisitionForm.controls.departmentId.setValue('');
    this.RequisitionForm.controls.priorityId.setValue('');
    this.RequisitionForm.controls.projectNameCodeId.setValue('');
    this.route.navigate(['/Requisition/RequisitionsNew']);
  }

  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.requisitionId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy,
        delete item.vesselId, delete item.orderTypeId, delete item.orderReference, delete item.orderReferenceType, delete item.departmentId,
        delete item.priorityId, delete item.projectNameCodeId, delete item.remarks, delete item.genericComment, delete item.internalComment,
        delete item.approvedReq, delete item.shipRecordId, delete item.officeRecordId, delete item.vessel,

        item.pmOrderType = item.pmOrderType.orderTypes;
      item.pmPreference = item.pmPreference.description;
      item.pmProjectNameCode = item.pmProjectNameCode.projectName + item.pmProjectNameCode.projectCode;
      item.departments = item.departments.departmentName;


    })
    this.exportExcelService.exportAsExcelFile(data, 'Requisition', 'Requisition');
  }

  Loadgroup() {
    this.pmsgroupService.GetPMSGroupdata(0)
      .subscribe(response => {

        this.GetGroupAccCode = response.data;

      })
  }
  LoadComponent() {
    this.pmsgroupService.GetComponent(0)
      .subscribe(response => {

        this.GetCompoAccCode = response.data;

      })
  }
  LoadStore() {
    this.pmsgroupService.getStore(0)
      .subscribe(response => {
        this.GetStoreAccCode = response.data;

      })
  }
  LoadSpare() {
    this.pmsgroupService.GetSpareList(0)
      .subscribe(response => {

        this.GetSpareAccCode = response.data;

      })
  }
  loadItem() {
    this.requisitionService.getDisplayItems(0)
      .subscribe(response => {
        this.itemdata = response.data;

      })
  }
  downloadNotepad() {
    
    const id = this.selection.selected.filter(x => x.approvedReq == "Approved");

    for (let i = 0; i < id.length; i++) {
      this.ReqData = this.dataSource.data.filter(x => x.requisitionId == id[i].requisitionId && x.approvedReq == "Approved");
      let shipcompId = this.ReqData[0].orderReference.split(',')[0];
      if (this.ReqData[0].orderReferenceType == "Group") {
        this.accountcode = this.GetGroupAccCode.filter(x => x.pmsGroupId == shipcompId)[0];
      }
      if (this.ReqData[0].orderReferenceType == "Component") {
        this.accountcode = this.GetCompoAccCode.filter(x => x.componentId == shipcompId)[0];
      }
      if (this.ReqData[0].orderReferenceType == "Store") {
        this.accountcode = this.GetStoreAccCode.filter(x => x.storeId == shipcompId)[0];
      }
      if (this.ReqData[0].orderReferenceType == "Spare") {
        this.accountcode = this.GetSpareAccCode.filter(x => x.spareId == shipcompId)[0];
      }

      let Dates = this.datePipe.transform(this.ReqData[0].recDate, 'yyyyMMdd');
      let year = this.datePipe.transform(this.ReqData[0].recDate, 'yy');

      // let documentHeader =this.ReqData[0].documentHeader.replace(/\D/g, '')
      let documentHeader = this.ReqData[0].documentHeader.slice(-4).trim()

      const uniqueItems = this.itemdata.filter(x => x.pmReqId == id[i].requisitionId);

      let fileDes = this.ReqData[0].pmOrderType.defaultOrderType == "Spare" ? "TmMASTER" : "StarIPS";


      let stepData = `ISO-10303-21;
    HEADER;
    FILE_DESCRIPTION(('Requisition data transfer in ${fileDes}');
    FILENAME('C:\\inetpub\\PmsAship\\ExportedFile\\Rto\\'${this.ReqData[0].vessel.vesselCode}${year + '' + documentHeader}.RTO','${Dates}');
    ENDSEC;
    DATA;`;

      stepData += `
  
             #1=Requisition_ship_to_PO_step_1('${this.ReqData[0].vessel.vesselCode}','${year + '/' + documentHeader}','${this.ReqData[0].orderReferenceNames}','${this.ReqData[0].pmPreference.description}','${Dates}','','','${this.ReqData[0].departments.departmentName}','','${this.accountcode.accountCode}','','','','','${this.ReqData[0].orderTitle}')`;

      uniqueItems.forEach((item, index) => {
        stepData += `
             #${index + 2}=Items_for_ordering_mr('${this.ReqData[0].vessel.vesselCode}','${year + '/' + documentHeader}','${index + 1}','${item.partNo}','${item.itemName}','${item.dwg}','','','${item.maker}','','','${item.rob}','${item.unit}','${item.reqQty}','','','${item.model}','exactOrderRef','','','','','${item.maker}','','','','','');`;
      });
      stepData += `
       ENDSEC;`;

      // Convert the content to a Blob
      const blob = new Blob([stepData], { type: 'text/plain;charset=utf-8' });

      let filesaveName = this.ReqData[0].vessel.vesselCode + year + documentHeader + '.RTO';
      // Use FileSaver.js to save the file
      saveAs(blob, filesaveName);

    }

    if (id.length == 0) {
      this.swal.error('Please Select Approved Requisition. ')
    }
  }
}
