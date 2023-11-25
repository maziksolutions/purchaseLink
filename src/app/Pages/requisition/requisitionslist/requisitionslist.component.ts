import { SideNavService } from '../sidenavi-right/sidenavi-service';
import { Subscription } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { Component, OnInit, ElementRef } from '@angular/core';
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


declare var SideNavi: any;
@Component({
  selector: 'app-requisitionslist',
  templateUrl: './requisitionslist.component.html',
  styleUrls: ['./requisitionslist.component.css']
})
export class RequisitionslistComponent implements OnInit {
  RequisitionForm: FormGroup; flag; pkey: number = 0;
  selectedIndex: any;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['denger', 'checkbox', 'Requisition_No', 'Delivery_Site', 'OriginSite', 'RequestOrderType', 'OrderTitle',
    'OrderReference', 'Department', 'Priority', 'ProjectName_Code'];
  selection = new SelectionModel<any>(true, []);
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  Vessels: any;
  selectedVesselId: number = 0;


  constructor(private sideNavService: SideNavService, private route: Router,
    private userManagementService: UserManagementService, private vesselService: VesselManagementService,
    private fb: FormBuilder, private requisitionService: RequisitionService) { }

  get fm() { return this.RequisitionForm.controls };

  navigateToNewReq() {
    debugger;
    this.sideNavService.destroySidenav();

    const navigationExtras: NavigationExtras = {
      queryParams: { 'reload': true }
    };
    this.route.navigate(['/Requisition/RequisitionsNew'], navigationExtras);
  }

  ngOnInit(): void {
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

}
