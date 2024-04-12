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
import { filter } from 'rxjs/operators';
import { RouteService } from 'src/app/services/route.service';
import { concat } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { N } from '@angular/cdk/keycodes';

declare let Swal, PerfectScrollbar: any; declare let $: any;
@Component({
  selector: 'app-requisitionslist',
  templateUrl: './requisitionslist.component.html',
  styleUrls: ['./requisitionslist.component.css']
})
export class RequisitionslistComponent implements OnInit {
  @ViewChild('StatusVessel') statusVesselSelect: ElementRef;
  RequisitionForm: FormGroup; flag; pkey: number = 0;
  selectedIndex: any;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['checkbox', 'VesselName', 'Requisition_No', 'Status', 'reqRecDate', 'Priority', 'OrderReference',
    'OriginSite', 'Department', 'ProjectName_Code', 'Delivery_Site', 'RequestOrderType',];
  selection = new SelectionModel<any>(true, []);
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  Vessels: any;searchForm:FormGroup;
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
  serviceTypeDataSource: any;
  currentRoute: string;
  filterDatavessel: any[];
 VesselGroupId: any;
  fileDes: string;

  constructor(private sideNavService: SideNavService, private route: Router, private authStatusService: AuthStatusService, private routeService: RouteService,
    private userManagementService: UserManagementService, private vesselService: VesselManagementService, private elRef: ElementRef,
    private fb: FormBuilder, private requisitionService: RequisitionService, private swal: SwalToastService, private datePipe: DatePipe, private shipmasterService: ShipmasterService,
    private exportExcelService: ExportExcelService, private ngxUiLoaderService: NgxUiLoaderService, private pmsgroupService: PmsgroupService) {
    this.route.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sideNavService.initSidenav();
      }
    })
  }



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
    this.routeService.getCurrentRoute().subscribe(route => {
      this.currentRoute = route;
    });

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

    this.searchForm = this.fb.group({
      vesselId: ['0'],
      fleetId: [''],
     
    });

    if (this.targetLoc == 'Vessel') {
      this.VesselId = environment.vesselId;
    }
    this.LoadVessel();
    this.loadUserFleetData();
   
    

    this.loadScript('assets/js/SideNavi.js');


    this.loadItem();
    this.loadServiceType();
  }

  ngAfterViewInit(): void {
    this.checkDropdownItems();
    if (this.targetLoc == 'Vessel') {
      this.VesselId = environment.vesselId;
      this.searchForm.controls.vesselId.setValue(environment.vesselId);
      this.searchForm.controls.vesselId.disable();
      this.searchForm.controls.fleetId.setValue(this.VesselGroupId);
      this.filterVessel();
    }
    else {
      if (localStorage.getItem('searchVessels')) {
        this.searchForm.controls.vesselId.patchValue(JSON.parse(localStorage.getItem('searchVessels') as string));
        this.VesselId = localStorage.getItem('searchVessels');
        this.loadData(0);
      }
      else {
        this.loadData(0);
      }
    }

  }
  get sfm() { return this.searchForm.controls };
  get fm() { return this.RequisitionForm.controls };
  checkDropdownItems() {

    const dropdownItems = this.elRef.nativeElement.querySelectorAll('.dropdown-item');
    // if (dropdownItems.length === 1) {
    //   const singleItem = dropdownItems[0] as HTMLElement;
    //   singleItem.click();
    // }
  }

  handleButtonClick() {

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
        if(this.VesselGroupId>0){
          this.sfm.fleetId.setValue(this.VesselGroupId);
                this.filteredVessels(this.VesselGroupId);
        }
        else{
          var defaultFleetId = response.data.filter(x => x.fleetName == 'Default Vessels')[0]['userFleetId'];
          this.filteredVessels(defaultFleetId);
        }
      
      });
  }
  filteredVessels(id) {


   this.VesselGroupId = id;
    this.sfm.fleetId.setValue(id);
     this.VesselId = null;
    var vesselList = this.myFleet.filter(x => x.userFleetId == id)[0]["vessels"];
    if (vesselList != null || vesselList != undefined) {
      this.Vessels = this.fullVesselList.filter(x => vesselList.split(",").includes(x.vesselId.toString()));
      this.searchForm.controls.vesselId.setValue('');
    }
    this.filterVessel();
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
           this.loadData(0);
        }
      })
  }
  filterVessel() {
    this.requisitionService.filterRequisitionMasterwithvessels(this.selectedVesselId)
      .subscribe(response => {
        this.ngxUiLoaderService.stop();
        this.flag = status;
        
        const selectedValue = this.statusVesselSelect.nativeElement.value;

        if (this.targetLoc == 'Vessel') {
          if(selectedValue == 0){
            this.dataSource.data = response.data.filter(x => x.originSite == 'Vessel' && x.isDeleted == false);
          }
          if(selectedValue == 1){
            this.dataSource.data = response.data.filter(x => x.originSite == 'Vessel' && x.isDeleted == true);
          }
         
         
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.ngxUiLoaderService.stop();
          (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
        }
        if (this.targetLoc == 'Office') {
          let OfficeSite = response.data.filter(x => x.originSite == "Office");
          let VesselSite = response.data.filter(x => x.originSite == "Vessel" && (x.approvedReq == "Approved" || x.documentHeader.includes('REQ')));

          this.dataSource.data = OfficeSite.concat(VesselSite);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.ngxUiLoaderService.stop();
        }
       
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
    
this.selection.clear();
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
    this.requisitionService.getRequisitionMasters(status)
      .subscribe(response => {

        this.flag = status;

        if (this.targetLoc == "Office") {

          let OfficeSite = response.data.filter(x => x.originSite == "Office");
          let VesselSite =  response.data.filter(x => x.originSite == "Vessel" && (x.approvedReq == "Approved" || x.documentHeader.includes('REQ')));

          this.dataSource.data = OfficeSite.concat(VesselSite);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.ngxUiLoaderService.stop();
        }
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
        
      });
  }

  selectVesselFilter(id) {
    this.requisitionService.filterRequisitionMasterwithvessels(id)
      .subscribe(response => {
        this.dataSource.data = response.data
      });
  }

  clear() {
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

    data = data.map(item => ({
      VesselName:item.vesselName,
      RequisitionNo:item.documentHeader,
      Status:item.approvedReq,
      Priority:item.description,
      Description: item.orderReferenceNames,
      Origin:item.originSite,
      Departments : item.departmentName,
      Type : item.projectName + item.projectCode,
      DelvierySite:item.deliverySiteNames,
      Category : item.orderTypes,
 
    }))
 
    data.forEach((item) => {
      delete item.requisitionId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy,
        delete item.vesselId, delete item.orderTypeId, delete item.orderReference, delete item.orderReferenceType, delete item.departmentId,
        delete item.priorityId, delete item.projectNameCodeId, delete item.remarks, delete item.genericComment, delete item.internalComment,
        delete item.approvedReq, delete item.shipRecordId, delete item.officeRecordId, delete item.vessel

    })
    this.exportExcelService.exportAsExcelFile(data, 'Requisition', 'Requisition');
  }


  loadItem() {
    this.requisitionService.getDisplayItems(0)
      .subscribe(response => {
        this.itemdata = response.data;

      })
  }

  loadServiceType() {
    var status = 0;
    this.requisitionService.getServiceTypefull(status).subscribe(res => {

      if (res.status === true) {

        const dataWithExpansion = res.data.map((item) => {
          // Ensure each item in jobList has the isExpanded property
          item.jobList = item.jobList.map(job => ({ ...job, isExpanded: false }));
          return { ...item, isExpanded: false };
        });
        this.serviceTypeDataSource = dataWithExpansion

      }
    })
  }

  downloadNotepad() {

    const id = this.selection.selected.filter(x => x.approvedReq == "Approved");

    for (let i = 0; i < id.length; i++) {

      this.ReqData = this.dataSource.data.filter(x => x.requisitionId == id[i].requisitionId && x.approvedReq == "Approved");
      
      if (this.ReqData[0].orderReferenceType == "Group") {
       
        this.accountcode = this.ReqData[0].accountCode
        this.fileDes = "StarIPS"
      }
      if (this.ReqData[0].orderReferenceType == "Component") {
   
        this.accountcode = this.ReqData[0].accountCode
        this.fileDes = "TmMASTER"
      }
      if (this.ReqData[0].orderReferenceType == "Store") {
     
        this.accountcode = this.ReqData[0].accountCode
        this.fileDes = "StarIPS"
      }
      if (this.ReqData[0].orderReferenceType == "Spare") {
        
        this.accountcode = this.ReqData[0].accountCode
        this.fileDes = "TmMASTER"
      }

      let Dates = this.datePipe.transform(this.ReqData[0].recDate, 'yyyyMMdd');
      let year = this.datePipe.transform(this.ReqData[0].recDate, 'yy');

      // let documentHeader =this.ReqData[0].documentHeader.replace(/\D/g, '')
      let documentHeader = this.ReqData[0].documentHeader.slice(-4).trim()

      const uniqueItems = this.itemdata.filter(x => x.pmReqId == id[i].requisitionId);

      let stepData = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Requisition data transfer in ${this.fileDes}');
FILENAME('C:\\inetpub\\PmsAship\\ExportedFile\\Rto\\'${this.ReqData[0].vesselCode}${year + '' + documentHeader}.RTO','${Dates}');
ENDSEC;
DATA;`;

      stepData += `
  
#1=Requisition_ship_to_PO_step_1('${this.ReqData[0].vesselCode}','${year + '/' + documentHeader}','${this.ReqData[0].orderReferenceNames}','0','${Dates}','','','${this.ReqData[0].departmentName}','','${this.accountcode == null ? '' : this.accountcode}','','','','','')`;

      uniqueItems.forEach((item, index) => {
        stepData += `
#${index + 2}=Items_for_ordering_mr('${this.ReqData[0].vesselCode}','${year + '/' + documentHeader}','${index + 1}','${item.partNo}','${item.itemName}','${item.dwg}','','','${item.maker}','','','${item.rob}','${item.unit}','${item.reqQty}','','','${item.model}','exactOrderRef','','','','','${item.makerReference == null ? '' : item.makerReference}','','','','','');`;
      });



      if (this.serviceTypeDataSource.length !== 0 || this.serviceTypeDataSource.length !== null) {

        let dataservice = this.serviceTypeDataSource.filter(x => x.pmReqId == id[i].requisitionId);

        const jobToAdd = dataservice.map(item => ({
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

      let filesaveName = this.ReqData[0].vesselCode + year + documentHeader + '.RTO';
      // Use FileSaver.js to save the file
      saveAs(blob, filesaveName);

    }

    if (id.length == 0) {
      this.swal.error('Please Select Approved Requisition. ')
    }
  }



  DeleteData() {
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
          this.requisitionService.archiveRequisitionMaster(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            if (this.targetLoc == 'Office') {
            this.loadData(this.flag);
            }
            if (this.targetLoc == 'Vessel') {
              this.filterVessel()
            }

          })

        }
      })

    } else {
      this.swal.info('Select at least one row')
    }
  }

}
