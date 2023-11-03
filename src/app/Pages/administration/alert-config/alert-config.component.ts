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
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
import { Router } from '@angular/router';
declare let Swal, PerfectScrollbar: any;

@Component({
  selector: 'app-alert-config',
  templateUrl: './alert-config.component.html',
  styleUrls: ['./alert-config.component.css']
})
export class AlertConfigComponent implements OnInit {
  alertFrm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'alertName','description'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('searchInput') searchInput: ElementRef;
  rights:RightsModel;
  deletetooltip:any;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
     private userManagementService: UserManagementService, 
    private swal: SwalToastService,private router: Router
  ) { }

  ngOnInit(): void {
    this.alertFrm = this.fb.group({
      alertConfigId: [0],
      alertName: ['', [Validators.required]],
      description:['']
    });
    this.loadRights();
   this.loadData(0);
  }
  get fm() { return this.alertFrm.controls };

  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.alert).subscribe((response)=>{
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

    // this.userManagementService.getAlerts(status)
    //   .subscribe(response => {
    //     this.flag = status;
    //     this.dataSource.data = response.data;
    //     this.dataSource.sort = this.sort;
    //     this.dataSource.paginator = this.paginator;
    //   });
  }

  onSubmit(form: any) {
    this.userManagementService.addAlert(form.value)
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
    this.userManagementService.getAlert(id)
      .subscribe((response) => {
        if (response.status) {
          this.alertFrm.patchValue(response.data);
          this.pkey = response.data.companyTypeId;

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
          this.userManagementService.archiveAlert(numSelected).subscribe(result => {
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
    this.alertFrm.reset();
    this.alertFrm.controls.alertConfigId.setValue(0);
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
      delete item.companyTypeId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Alert/notification Config', 'Alert/notification Config');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.alertConfigId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else {
      data = [{ alertName: '',description:'' }];
    }
    this.exportExcelService.LoadSheet(data, 'AlertLoadSheet', 'Alert/notification  Load Sheet',1);
  }

  //Open Modal Pop-up to Importdata
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Alert/Notification",columncheck:"Type1",tablename:"tblAlertConfig",columname:"companyTypeName"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
  close() {
    this.alertFrm.reset();
    this.alertFrm.controls.companyTypeId.setValue(0);
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

}

