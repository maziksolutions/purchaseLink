import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { C } from '@angular/cdk/keycodes';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
import { Router } from '@angular/router';
declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  departmentForm: FormGroup; flag;pkey:any=0;
  displayedColumns: string[] = ['checkbox', 'departmentName','siteDepartment','parentDepartment'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('searchInput') searchInput: ElementRef;
  selection = new SelectionModel<any>(true, []);  
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  departments:any;
  deletetooltip:any;
  status: number = 0;
  rights:RightsModel;
  constructor( private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
     private userManagementService: UserManagementService, 
     private router: Router,private swal: SwalToastService) { }

  ngOnInit(): void {
    this.departmentForm = this.fb.group({
      departmentId: [0],
      departmentName: ['', [Validators.required]],
      siteDepartment:['', [Validators.required]],
      parentDepartmentId:['', [Validators.required]]
    });
    this.loadRights();
    this.loadData(0);  
  }
  get fm() { return this.departmentForm.controls }; 
  
  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.department).subscribe((response)=>{
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

    this.userManagementService.getParentDepartment(status)
      .subscribe(response => {
        this.flag = status;
        this.departments=response.data;       
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  //Submit: Add/Update data
  onSubmit(form: any) {
   
    this.userManagementService.addDepartment(form.value)
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
  loadDataDepartment(siteDepartment:any)
  {
    alert('l')
    if(this.pkey==0)
    {
    this.departments=this.dataSource.data.filter(x=>x.siteDepartment==siteDepartment && x.parentDepartmentId==null);
    }
    else
    this.departments=this.dataSource.data.filter(x=>x.siteDepartment==siteDepartment && x.departmentId!=this.pkey && x.parentDepartmentId!=this.pkey);
  }

  Updatedata(id) {
    this.clear();
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.userManagementService.getDepartmentById(id)
      .subscribe((response) => {
        if (response.status) { 
          this.pkey=response.data.departmentId;

          this.departments=this.dataSource.data.filter(x=>x.siteDepartment==response.data.siteDepartment && x.departmentId!=response.data.departmentId && x.parentDepartmentId!=this.pkey && x.parentDepartmentId==null);    
             
          this.departmentForm.patchValue(response.data);
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
          this.userManagementService.archiveDepartment(numSelected).subscribe(result => {
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
    this.pkey=0;
    this.departmentForm.reset();
    this.departmentForm.controls.departmentId.setValue(0);
    this.departmentForm.controls.parentDepartmentId.setValue('');
    this.departmentForm.controls.siteDepartment.setValue('');
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
      delete item.departmentId,item.parentDepartmentId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Department', 'Department');
  }
  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.departmentId,delete item.parentDepartmentId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else {
      data = [{ departmentName: '', siteDepartment:'',parentDepartment
:''    }];
    }
    this.exportExcelService.LoadSheet(data, 'DepartmentLoadSheet', 'Department Load Sheet',2);
  }

  //Open Modal Pop-up to Importdata
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Department Master",tablename:"tblDepartment",columname:"departmentName",columname1:"SiteDepartment"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
  close() {
    this.departmentForm.reset();
    this.departmentForm.controls.departmentId.setValue(0);
    this.departmentForm.controls.parentDepartmentId.setValue('');
    this.departmentForm.controls.siteDepartment.setValue('');
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

}
