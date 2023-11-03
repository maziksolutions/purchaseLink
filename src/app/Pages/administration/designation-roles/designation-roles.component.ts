import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
import { Router } from '@angular/router';
declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-designation-roles',
  templateUrl: './designation-roles.component.html',
  styleUrls: ['./designation-roles.component.css']
})
export class DesignationRolesComponent implements OnInit {
  designationRoleForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'roleName',  'userPosition', 'level'];
  dataSource = new MatTableDataSource<any>();
  isActivevar:boolean = false;
  rights:RightsModel;
  deletetooltip:any;
  pageEvent: PageEvent;
  searchForm: FormGroup;
  pageSizeOptions: number[] = [20, 40, 60, 100];
    pageSize = 20;  currentPage = 0;page: number = 1; 
  selection = new SelectionModel<any>(true, []);
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  positions: any;
  pageTotal: any;
  constructor( private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
     private userManagementService: UserManagementService, 
    private swal: SwalToastService,private router: Router,) { }

  ngOnInit(): void {
    this.designationRoleForm = this.fb.group({
      roleId: [0],
      roleName: ['', [Validators.required]],
      userPositionId: ['', [Validators.required]],
      level: ['', [Validators.required]]     
    });
    this.searchForm = this.fb.group({
      pageNumber:[''],
      pageSize:[this.pageSize],
      status: ['0'],
      keyword: ['']
    });
    this.loadRights();
    this.loadData(0);
    this.loadUserPositions();
  }
  get fm() { return this.designationRoleForm.controls };
  get sfm() { return this.searchForm.controls };
  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.designationRoles).subscribe((response)=>{
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
    this.userManagementService.getDesignationRoles(this.searchForm.value)
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
  isActiveCheck(e:any){
    let checked = e.target.checked;
    let date = Date.now();
    if(checked){
      this.fm.isActive.setValue(true)
      
    }
    
    else{
      this.fm.isActive.setValue(false)
      this.fm.activeDate.setValue(date)
    }
  }

  onSubmit(form: any) {   
  
    this.userManagementService.addDesignationRoles(form.value)
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
    this.userManagementService.getDesignationRoleById(id)
      .subscribe((response) => {
        if (response.status) {
          this.designationRoleForm.patchValue(response.data);
          this.pkey = response.data.roleId;

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
          this.userManagementService.archiveDesignationRole(numSelected).subscribe(result => {
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

  loadUserPositions()
  {
    this.userManagementService.getUserPostions(0)
      .subscribe(response => {
        this.positions=response.data;     
       
      });
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
  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {
    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  clear() {
    this.designationRoleForm.reset();
    this.designationRoleForm.controls.roleId.setValue(0);
    this.designationRoleForm.controls.userPositionId.setValue('');
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
      delete item.roleId, delete item.isActive,delete item.activeDate,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Designation Roles', 'Designation Roles');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data=data.map(item=>({
        roleName:item.roleName,userPosition:item.userPosition.positionName,level:item.level    
       }));
      
    }
    else {
      data = [{ roleName:'' ,userPosition:'',level:''}];
    }
    this.exportExcelService.LoadSheet(data, 'RolesLoadSheet', 'Roles Load Sheet',2);
  }

  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Company Type Master",columncheck:"Type1",tablename:"tblCompanyType",columname:"companyTypeName"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
  close() {
    this.designationRoleForm.reset();
    this.designationRoleForm.controls.roleId.setValue(0);
    this.designationRoleForm.controls.userPositionId.setValue('');
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }


}
