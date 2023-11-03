import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnitmasterService } from '../../../services/unitmaster.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {SelectionModel} from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { MatDialog } from '@angular/material/dialog';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router } from '@angular/router';
import { registerNavEnum, unitMasterNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
import { SwalToastService } from 'src/app/services/swal-toast.service';
declare let Swal,$, PerfectScrollbar: any;
@Component({
  selector: 'app-material-quality',
  templateUrl: './material-quality.component.html',
  styleUrls: ['./material-quality.component.css']
})
export class MaterialQualityComponent implements OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;
  materialqualityForm: FormGroup; flag; pkey: number = 0;
   displayedColumns: string[] = ['materialquality'];
  dataSource = new MatTableDataSource<any>();
  rights: RightsModel;
  deletetooltip:any;
  JSAToggle: boolean = false;
  postPoneToggle: boolean = true;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedIndex: number;
  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
    private unitmasterService: UnitmasterService, private swal: SwalToastService,
    private router: Router, private userManagementService: UserManagementService) { }

    ngOnDestroy()
    {
      $('#jobType').removeClass('active');  
    }
  ngOnInit(): void {
    this.selectedIndex=0;
    this.postPoneToggle=true;
    $('#jobType').addClass('active');  
    this.materialqualityForm = this.fb.group({
      materialQualityId: [0],
      materialQualities: ['', [Validators.required]],

    });
    // this.loadRights();
    this.loadData(0);
  }
  get fm() { return this.materialqualityForm.controls };

  loadRights() {
    this.userManagementService.checkAccessRight(unitMasterNavEnum.jobType).subscribe((response) => {
      if (response.status) {
        this.rights = response.data;
      } else {
        this.rights = new RightsModel();
        this.rights.addRight = this.rights.ammendRight = this.rights.deleteRight = this.rights.importRight = this.rights.viewRight = false;
      }
      if (!this.rights.viewRight) {
        alert('you have no view right')
        this.router.navigate(['welcome']);
      }
    }, (error) => {
      console.log(error);
    })
  }
  
  loadData(status: number) {
    if (status == 1) {
      this.deletetooltip ='UnArchive';
      if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
        (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {
      this.deletetooltip='Archive';
      if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }

    this.unitmasterService.getJobTypes(status)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        setTimeout(() => this.dataSource.sort = this.sort);       
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.clear();
          (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }
  onSubmit() {
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.materialqualityForm.value));
    this.unitmasterService.addJobType(formData)
      .subscribe(data => {
        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.clear();
          this.loadData(0);

        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.clear();
          this.loadData(0);
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.loadData(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.loadData(0);
        }
        else {

        }

      });
  }
  // Updatedata(id) {
  //   this.selectedIndex=id;
  //   (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
  //   (document.getElementById('collapse1') as HTMLElement).classList.add("show");
  //   this.unitmasterService.getJobTypeById(id)
  //     .subscribe((response) => {
  //       if (response.status) {
  //         this.jobtypeForm.patchValue(response.data);
  //         this.pkey = response.data.jobTypeId;

  //       }
  //     },
  //       (error) => {

  //       });
  // }
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
          this.unitmasterService.archiveJobType(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.loadData(this.flag);
          })


        }
      })
    } else {
      this.swal.info('Select at least one row');
    }
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  clearSearchInput(){
    this.searchInput.nativeElement.value ='';
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

  clear() {
    this.materialqualityForm.reset();
    this.postPoneToggle=true;
    // this.jobtypeForm.controls.isPostpone.setValue(true);
    this.materialqualityForm.controls.jobTypeId.setValue(0);
    (document.getElementById('abc') as HTMLElement).focus();
  }
  // export excel
  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.jobTypeId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Maintenance Type', 'Maintenance Type');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.jobTypeId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else {
      data = [{ jobType: '',jsa: ''}];
    }
    this.exportExcelService.LoadSheet(data, 'JobTypeLoadSheet', 'Maintenance Type Load Sheet',1);
  }

  close() {
    this.materialqualityForm.reset();
    this.materialqualityForm.controls.jobTypeId.setValue(0);
    this.postPoneToggle=true;
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }


  //Open Modal Pop-up to Importdata
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data: { modalTitle: "Import Maintenance Type Master", tablename: "tblJobType", columname: "JobType" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  } 

}
