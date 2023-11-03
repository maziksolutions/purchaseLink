import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { Router } from '@angular/router';
import { UserManagementService } from 'src/app/services/user-management.service';
import { RightsModel } from '../../Models/page-rights';
import { administrationNavEnum } from '../../Shared/rights-enum';
declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-engine-sub-type',
  templateUrl: './engine-sub-type.component.html',
  styleUrls: ['./engine-sub-type.component.css']
})
export class EngineSubTypeComponent implements OnInit {
  status: number = 0;
  engineTypes:any;
  engineSubTypeForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'subType','engineType'];
  dataSource = new MatTableDataSource<any>();
  rights:RightsModel;
  deletetooltip:any;
  pageTotal: any;
    pageEvent: PageEvent;
    pageSizeOptions: number[] = [20, 40, 60, 100];
    searchForm: FormGroup;
  pageSize = 20;  currentPage = 0;page: number = 1; 
  selection = new SelectionModel<any>(true, []);
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private fb: FormBuilder, private userManagementService: UserManagementService,private router:Router, public dialog: MatDialog,
    private exportExcelService: ExportExcelService, private swal: SwalToastService,private vesselManagementService:VesselManagementService) { }

  ngOnInit(): void {
    this.engineSubTypeForm = this.fb.group({
      engineSubTypeId:[0],
      subType: ['', [Validators.required]],
      engineTypeId: ['', [Validators.required]]
     
    });
    this.searchForm = this.fb.group({
      pageNumber:[''],
      pageSize:[this.pageSize],
      status: ['0'],
      keyword: ['']
    });
    this.loadRights();
    this.loadData(0);
    this.loadEngineTypes();
  }
  get fm() { return this.engineSubTypeForm.controls };
  get sfm() { return this.searchForm.controls };

  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.engineSubType).subscribe((response)=>{
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
    this.sfm.pageNumber.setValue(this.currentPage );
    this.sfm.pageSize.setValue(this.pageSize )
    this.vesselManagementService.getEngineSubTypes(this.searchForm.value)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        // this.dataSource.paginator = this.paginator;
        this.pageTotal = response.total;     
        // setTimeout(() => this.dataSource.paginator=this.paginator);
        setTimeout(() => this.dataSource.sort = this.sort);       
         this.dataSource.sort = this.sort;
      });
  }
  loadEngineTypes() {
    this.vesselManagementService.getEngineTypes(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.engineTypes = response.data;
        } else {
          this.engineTypes = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  onSubmit(form: any) {
    this.vesselManagementService.addEngineSubType(form.value)
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
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.vesselManagementService.getEngineSubTypeById(id)
      .subscribe((response) => {
        if (response.status) {
          this.engineSubTypeForm.patchValue(response.data);
          this.pkey = response.data.engineSubTypeId;

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
          this.vesselManagementService.archiveEngineSubType(numSelected).subscribe(result => {
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
  applyFilter() {
    this.page = 1; this.currentPage = 0;
      this.loadData(0);
      this.pageChanged(this.pageEvent);
  }
  clearSearchInput(){
    this.sfm.keyword.setValue('');
    this.applyFilter()
 }
  pageChanged(event: PageEvent) {
    if(event == undefined)
    {

    }
    else{
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData(0);
    // this.dataSource.paginator = this.paginator;
    }
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
    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }
  clear() {
    this.engineSubTypeForm.reset();
    this.engineSubTypeForm.controls.engineSubTypeId.setValue(0);
    this.engineSubTypeForm.controls.engineTypeId.setValue('');
    (document.getElementById('abc') as HTMLElement).focus();
  }


  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.engineTypeId,delete item.engineSubTypeId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Engine Sub Type', 'Engine Sub Type');
  }
  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data=data.map(item=>({
        subType:item.subType,engineType:item.engineType?.EngineTypeName   
       })); 
    }
    else
      data = [{ subType: '', engineType:'' }];
    this.exportExcelService.LoadSheet(data, 'EngineSubTypeLoadSheet', 'Engine Sub Type Load Sheet',2);
  }
  close() {
    this.engineSubTypeForm.reset();
    this.engineSubTypeForm.controls.engineSubTypeId.setValue(0);
    this.engineSubTypeForm.controls.engineTypeId.setValue('');
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

  openModal() {   
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Engine Sub Type",columncheck:"Type1",tablename:"tblEngineSubType",columname:"subType"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
}
