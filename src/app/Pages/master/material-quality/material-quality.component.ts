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
import { PurchaseMasterService } from 'src/app/services/purchase-master.service';
declare let Swal,$, PerfectScrollbar: any;
@Component({
  selector: 'app-material-quality',
  templateUrl: './material-quality.component.html',
  styleUrls: ['./material-quality.component.css']
})
export class MaterialQualityComponent implements OnInit {

  materialqualitiesForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox','materialqualities'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  rights:RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip:any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedIndex: any;
  constructor(private fb: FormBuilder, public dialog: MatDialog, private exportExcelService: ExportExcelService,
    private purchasemasterService: PurchaseMasterService, private swal: SwalToastService,
    private router:Router,private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.materialqualitiesForm = this.fb.group({
      materialQualityId: [0],
      materialQualities: ['', [Validators.required]],
    });
    //this.servicetypeForm.controls.directCompletion.setValue('');
  //  this.loadRights();
    this.loadData(0);
  }
  get fm() { return this.materialqualitiesForm.controls };

  loadRights(){
    this.userManagementService.checkAccessRight(unitMasterNavEnum.jobGroup).subscribe((response)=>{
if(response.status){
this.rights=response.data;
}else{
  this.rights=new RightsModel(); 
  this.rights.addRight=this.rights.ammendRight=this.rights.deleteRight=this.rights.importRight=this.rights.viewRight=false;
}
if(!this.rights.viewRight){
  alert('you have no view right')
  this.router.navigate(['welcome']);
}
    },(error)=>{
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
    this.purchasemasterService.getmaterialquality(status)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.clear();
          (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }
  onSubmit(form: any) {
    this.purchasemasterService.addmaterialquality(form.value)
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
  Updatedata(id) {

    this.selectedIndex=id;
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.purchasemasterService.getmaterialqualityId(id)
      .subscribe((response) => {
        if (response.status) {
          this.materialqualitiesForm.patchValue(response.data);
          this.pkey = response.data.materialQualityId;

        }
      },
        (error) => {

        });
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
          this.purchasemasterService.archivematerialquality(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.loadData(this.flag);
          })

        }
      })

    } else {
      this.swal.info('Select at least one row')
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
    console.log(this.dataSource)
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

  clear() {
    this.materialqualitiesForm.reset();
    this.materialqualitiesForm.controls.materialQualityId.setValue(0);
    this.materialqualitiesForm.controls.materialQualities.setValue('');    

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
      delete item.materialQualityId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Material Quality', 'Material Quality');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.materialQualityId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else
      data = { materialQuality: '' };
    this.exportExcelService.LoadSheet(data, 'MaterialQualitySheet', 'Material Quality Load Sheet',2);
  }

  close() {
    this.materialqualitiesForm.reset();
    this.materialqualitiesForm.controls.materialQualityId.setValue(0);
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

    //Open Modal Pop-up to Importdata
    openModal() {   
      const dialogRef = this.dialog.open(ImportDataComponent, {
        width: '500px',
        data:{modalTitle: "Import Maintenance Group Master",tablename:"tblJobGroup",columname:"JobGroup"},
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'success') {
          this.loadData(this.flag);
        }
      });
    }    

}
