import { SideNavService } from '../sidenavi-right/sidenavi-service';
import { Subscription } from 'rxjs';
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
import { filter, map } from 'rxjs/operators';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { DatePipe } from '@angular/common';
declare var $: any;
declare let Swal, PerfectScrollbar: any;
declare var SideNavi: any;

interface Item {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}


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
    'OrderReference', 'Department', 'Priority', 'ProjectName_Code'];
  selection = new SelectionModel<any>(true, []);
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  Vessels: any;
  selectedVesselId: number = 0;

  items: Item[] = [
    { id: 1, name: 'ENVIROCLEAN', quantity: 200, unit: 'LTR' },
    { id: 2, name: 'NATURAL HAND CLEANER', quantity: 50, unit: 'LTR' },
    // Add more items as needed
  ];
  vesselcode: any;

  constructor(private sideNavService: SideNavService, private route: Router,
    private userManagementService: UserManagementService, private vesselService: VesselManagementService,
    private fb: FormBuilder, private requisitionService: RequisitionService, private swal: SwalToastService, private datePipe: DatePipe) {
    // this.route.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     this.sideNavService.initSidenav();
    //   }
    // });
  }

  get fm() { return this.RequisitionForm.controls };
  
  navigateToNewReq() {
    
    this.sideNavService.destroySidenav();

    const navigationExtras: NavigationExtras = {
      queryParams: { 'reload': true }
    };
    this.route.navigate(['/Requisition/RequisitionsNew'], navigationExtras);
  }

  ngOnInit(): void {
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

    this.loadData(0);
    this.LoadVessel();

    this.loadScript('assets/js/SideNavi.js');
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
        this.Vessels = response.data;
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
    //console.log(row);
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
        debugger;
        this.flag = status;
        console.log(response.data)
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
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
    this.route.navigate(['/Requisition/RequisitionsNew'])
  }

  downloadNotepad() {
    let CurtDate = new Date;
    let currentDate = this.datePipe.transform(CurtDate, 'yyyyMMdd');
    let stepData = `ISO-10303-21;
    HEADER;
    FILE_DESCRIPTION(('Requisition data transfer in StarIPS');
    FILENAME('C:\\inetpub\\PmsAship\\ExportedFile\\Rto\\BMY23113.RTO','${currentDate}');
    ENDSEC;
    DATA;`;


    this.vesselcode = this.Vessels.filter(x => x.vesselId == this.selectedVesselId).map(x => x.vesselCode);

    // Ensure that the items array is unique based on some identifier
    const uniqueItems = Array.from(new Set(this.items.map(item => item.id)))
      .map(id => this.items.find(item => item.id === id));
    console.log(uniqueItems)

    // Generate dynamic data based on the items array

    if (this.vesselcode.length == 0) {
      this.vesselcode = this.dataSource.data;
      stepData += `
          #1=Requisition_ship_to_PO_step_1('','23/113','','0','${currentDate}','','','Engine','','5012100','','','','','')`;

      uniqueItems.forEach((item, index) => {

        const matchingVesselCode = this.vesselcode.find(vessel => vessel.requisitionId === item?.id);
        if (matchingVesselCode) {

          stepData += `
          #${index + 2}=Items_for_ordering_mr('${matchingVesselCode.vessel.vesselCode}','23/113','${index + 1}','','${item?.name}','','','','','','','0.00','${item?.unit}','${item?.quantity}','','','','','','','','');`;

        }

      });
      stepData += `
      ENDSEC;`;

      // Convert the content to a Blob
      const blob = new Blob([stepData], { type: 'text/plain;charset=utf-8' });


      // Use FileSaver.js to save the file
      saveAs(blob, 'Requisition_RTO.txt');
      return;
    }
    if (this.vesselcode.length != 0 && this.dataSource.data.length != 0) {
      stepData += `
           #1=Requisition_ship_to_PO_step_1('${this.vesselcode}','23/113','','0','${currentDate}','','','Engine','','5012100','','','','','')`;

      this.items.forEach((item, index) => {
        stepData += `
           #${index + 2}=Items_for_ordering_mr('${this.vesselcode}','23/113','${index + 1}','','${item.name}','','','','','','','0.00','${item.unit}','${item.quantity}','','','','','','','','');`;

      });
      stepData += `
      ENDSEC;`;

      // Convert the content to a Blob
      const blob = new Blob([stepData], { type: 'text/plain;charset=utf-8' });

      // Use FileSaver.js to save the file
      saveAs(blob, 'Requisition_RTO.txt');
      return
    }

    else {
      this.swal.error('This selected vessel has no Requisition Data.');

    }

  }

}
