import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { NgxSummernoteModule } from 'ngx-summernote';
import { Keys } from '../../Shared/localKeys';
declare let Swal, PerfectScrollbar: any; declare let $: any;
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  pageCategory:any;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchInputNoti') searchInputNoti: ElementRef;
  @ViewChild('searchInputAlert') searchInputAlert: ElementRef;
  pageForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'page','url','pageCategory','specialFields','icon'];
  displayedNotificationColumns: string[] = ['checkbox', 'alertName','Frequency','description','EmailTemplate'];
  displayedAlertColumns: string[] = ['checkbox', 'alertName'];
    dataSource = new MatTableDataSource<any>();
    notificationDataSource = new MatTableDataSource<any>();
    alertDataSource = new MatTableDataSource<any>();
    selection = new SelectionModel<any>(true, []);
    notificationSelection = new SelectionModel<any>(true, []);
    alertSelection = new SelectionModel<any>(true, []);
   // rights:RightsModel;
   alertFrm: FormGroup; pageAlertFrm: FormGroup;
   flagNoti;
   PageId:any;
   deletetooltip:any;
   deletetooltips:any;
   html: '';
   pageName:any;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatPaginator, { static: false }) notificationPaginator: MatPaginator;
    @ViewChild(MatPaginator, { static: false }) alertPaginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild(MatSort, { static: false }) notificationSort: MatSort;
    @ViewChild(MatSort, { static: false }) alertSort: MatSort;

    config = {
      placeholder: '',
      tabsize: 2,      
      toolbar: [
          ['misc', ['codeview', 'undo', 'redo']],
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
          ['fontsize', ['fontname', 'fontsize', 'color']],
          ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
          ['insert', ['table', 'picture', 'link', 'video', 'hr']]
      ],
      fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times']
    }
  flagAlert: number;
  Page: any;
  pageAlerts: any;
  allAlerts: any;
  userName: string | null;



  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
    private unitmasterService: UnitmasterService, private swal: SwalToastService,private userManagementService: UserManagementService
    ,private router:Router,private authStatusService: AuthStatusService) { }

  ngOnInit(): void {
    this.userName= localStorage.getItem(Keys.userName);   
    // this.editor = new Editor();
    this.pageForm = this.fb.group({
      pageId:[0],
      pageCategoryId: ['', [Validators.required]],
      url:['', [Validators.required]],
      page: ['', [Validators.required]],
      specialFields:['']
    });
    this.alertFrm = this.fb.group({
      alertConfigId: [0],
      pageAlertId:[''],
      description:[''],
      frequency:[''],
      emailTemplate:[''],
      pageId:[''],
    });

    this.pageAlertFrm = this.fb.group({
      pageAlertId: [0],
      alertName: ['', [Validators.required]],    
      pageId:[''],
    });
    this.loadAllAlerts();
    this.loadPageCategory();
    this.loadData(0);
      $('#summernote').summernote({
        placeholder: 'Email Template',
        tabsize: 2,
        height: 120,
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'underline', 'clear']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture', 'video']],
          ['view', ['fullscreen', 'codeview', 'help']]
        ]
      });
   
  }
  get fm() { return this.pageForm.controls };
  get afm() { return this.alertFrm.controls };
  loadPageCategory() {
    this.unitmasterService.getAdministrationPageCategories(0)
      .subscribe((response) => {
        if (response.status) {
          this.pageCategory = response.data;
        } else {
          this.pageCategory = [];
        }
      },
        (error) => {
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

    this.unitmasterService.getAdministrationPages(status)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }
  onSubmit(form: any) {


    this.unitmasterService.addAdministrationPage(form.value)
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
    this.unitmasterService.getAdministrationPageById(id)
      .subscribe((response) => {
        if (response.status) {
          this.pageForm.patchValue(response.data);
          this.pkey = response.data.pageId;
          this.pageName = response.data.page;
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
          this.unitmasterService.archiveAdministrationPage(numSelected).subscribe(result => {
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
    this.pageForm.reset();
    this.pageForm.controls.pageId.setValue(0);
    this.pageForm.controls.pageCategoryId.setValue('');
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
      delete item.pageId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Administration Pages', 'Administration Pages');
  }
  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.pageId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else {
      data = [{ page: '' }];
    }
    this.exportExcelService.LoadSheet(data, 'AdministrationPageLoadSheet', 'Administration Page Load Sheet',1);
  }
  close() {
    this.pageForm.reset();
    this.pageForm.controls.pageId.setValue(0);
    this.pageForm.controls.pageCategoryId.setValue('');
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }


  //Open Modal Pop-up to Importdata
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Administration Page Master",tablename:"tblPage",columname:"Page"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }


//#region  Notification/Alerts


OpenModalPopup(id){
  this.PageId = id;
  $("#OpenModalPopup").modal('show');
  this.loadNotificationData(0);
  this.loadPageAlerts();
}


loadNotificationData(status: number) {
  if (status == 1) {
    this.deletetooltips ='UnArchive';
    if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
    (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
    (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
  }
}
  else {
    this.deletetooltips='Archive';
    if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
      (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
      (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
    }
  }
  this.userManagementService.getAlerts(status,this.PageId)
    .subscribe(response => {
      this.flagNoti = status;
      this.notificationDataSource.data = response.data;
      this.notificationDataSource.sort = this.notificationSort;
      this.notificationDataSource.paginator = this.notificationPaginator;
    });
}

applyFilterNotification(filterValue: string) {
  filterValue = filterValue.trim();
  filterValue = filterValue.toLowerCase();
  this.notificationDataSource.filter = filterValue;
}
clearSearchInputNotification(){
  this.searchInputNoti.nativeElement.value ='';
  this.applyFilter(this.searchInputNoti.nativeElement.value)
}

clearNotification() {
  this.alertFrm.reset();
  this.alertFrm.controls.alertConfigId.setValue(0);
  $('#summernote').summernote('reset');
  // $('#summernote').reset();
  (document.getElementById('collapse2') as HTMLElement).classList.remove("collapse");
  // (document.getElementById('summernote') as HTMLElement).focus();
  
}

DeleteNotificationData() {
  var message = ""
  var title = "";

  if (this.flagNoti == 1) {
    message = "Un-archived successfully.";
    title = "you want to un-archive data."
  }
  else {
    message = "Archived successfully.";
    title = "you want to archive data."

  }
  const numSelected = this.notificationSelection.selected;
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
          this.notificationSelection.clear();
          this.swal.success(message);
          this.loadNotificationData(this.flagNoti);
        })


      }
    })
  } else {
    this.swal.info('Select at least one row');
  }
}
onSubmitNotification(form: any) {
  var data=$("#summernote").val();

  this.afm.emailTemplate.setValue(data);
this.afm.pageId.setValue(this.PageId);
  this.userManagementService.addAlert(form.value)
    .subscribe(data => {
      if (data.message == "data added") {
        this.swal.success('Added successfully.');
        this.clearNotification();
        this.loadNotificationData(0);
      }

      else if (data.message == "updated") {
        this.swal.success('Data has been updated successfully.');
        this.clearNotification();
        this.loadNotificationData(0);
      }
      else if (data.message == "duplicate") {
        this.swal.info('Data already exist. Please enter new data');
        this.loadNotificationData(0);
      }
      else if (data.message == "not found") {
        this.swal.info('Data exist not exist');
        this.loadNotificationData(0);
      }
      else {

      }
      
    });
}


isAllNotificationSelected() {
  const numSelected = this.notificationSelection.selected.length;
  const numRows = !!this.notificationDataSource && this.notificationDataSource.data.length;
  return numSelected === numRows;
}
masterNotificationToggle() {
  this.isAllSelected() ? this.notificationSelection.clear() : this.notificationDataSource.data.forEach(r => this.notificationSelection.select(r));
}
/** The label for the checkbox on the passed row */
checkboxNotificationLabel(row: any): string {
  //console.log(row);
  if (!row) {
    return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  }
  return `${this.notificationSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
}

UpdateNotificationdata(id) {
  (document.getElementById('collapse2') as HTMLElement).classList.remove("collapse");
  (document.getElementById('collapse2') as HTMLElement).classList.add("show");
  this.userManagementService.getAlert(id)
    .subscribe((response) => {
      console.log(response.data)
      if (response.status) {
        this.alertFrm.patchValue(response.data);
        this.alertFrm.controls.emailTemplate.setValue(response.data.emailTemplate)       
      }
    },
      (error) => {

      });
}

//#endregion

//#region  Page Alerts


openModalPage(id,page){
  this.clearAlerts();
  this.PageId = id;
  this.Page=page;
  $("#openModalPage").modal('show');
  this.loadAlertData(0);
}

checkAlerts(pageId)
{
  var checkAlert=this.allAlerts.filter(x=>x.pageId==pageId);
  if(checkAlert.length>0)
  return true;
else
return false;
}
loadPageAlerts() { 
  this.userManagementService.getPageAlerts(0,this.PageId)
    .subscribe(response => {
      this.pageAlerts=response.data;
      this.alertFrm.controls.pageAlertId.setValue('');
    });
}
loadAllAlerts() { 
  this.userManagementService.getAllAlerts()
    .subscribe(response => {
      this.allAlerts=response.data;
    });
}


loadAlertData(status: number) {
  if (status == 1) {
    this.deletetooltips ='UnArchive';
    if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
    (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
    (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
  }
}
  else {
    this.deletetooltips='Archive';
    if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
      (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
      (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
    }
  }
  this.userManagementService.getPageAlerts(status,this.PageId)
    .subscribe(response => {
      this.flagAlert = status;
      this.alertDataSource.data = response.data;
      this.alertDataSource.sort = this.alertSort;
      this.alertDataSource.paginator = this.alertPaginator;
    });
}

applyFilterAlert(filterValue: string) {
  filterValue = filterValue.trim();
  filterValue = filterValue.toLowerCase();
  this.notificationDataSource.filter = filterValue;
}
clearSearchInputAlert(){
  this.searchInputAlert.nativeElement.value ='';
  this.applyFilter(this.searchInputAlert.nativeElement.value)
}

clearAlerts() {
  this.pageAlertFrm.reset();
  this.pageAlertFrm.controls.pageAlertId.setValue(0); 
  // (document.getElementById('collapse3') as HTMLElement).classList.remove("collapse");

}

DeleteAlerts() {
  var message = ""
  var title = "";

  if (this.flagAlert == 1) {
    message = "Un-archived successfully.";
    title = "you want to un-archive data."
  }
  else {
    message = "Archived successfully.";
    title = "you want to archive data."

  }
  const numSelected = this.alertSelection.selected;
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
        this.userManagementService.archivePageAlert(numSelected).subscribe(result => {
          this.alertSelection.clear();
          this.swal.success(message);
          this.loadAlertData(this.flagAlert);
        })


      }
    })
  } else {
    this.swal.info('Select at least one row');
  }
}
onSubmitAlert() {
this.pageAlertFrm.controls.pageId.setValue(this.PageId);
  this.userManagementService.addPageAlert(this.pageAlertFrm.value)
    .subscribe(data => {
      if (data.message == "data added") {
        this.swal.success('Added successfully.');
        this.clearAlerts();
        this.loadAlertData(0);
      }

      else if (data.message == "updated") {
        this.swal.success('Data has been updated successfully.');
        this.clearAlerts();
        this.loadAlertData(0);
      }
      else if (data.message == "duplicate") {
        this.swal.info('Data already exist. Please enter new data');
        this.loadAlertData(0);
      }
      else if (data.message == "not found") {
        this.swal.info('Data exist not exist');
        this.loadAlertData(0);
      }
      else {

      }
      
    });
}


isAllAlertSelected() {
  const numSelected = this.alertSelection.selected.length;
  const numRows = !!this.alertDataSource && this.alertDataSource.data.length;
  return numSelected === numRows;
}
masterAlertToggle() {
  this.isAllAlertSelected() ? this.alertSelection.clear() : this.alertDataSource.data.forEach(r => this.alertSelection.select(r));
}
/** The label for the checkbox on the passed row */
checkboxAlertLabel(row: any): string {
  //console.log(row);
  if (!row) {
    return `${this.isAllAlertSelected() ? 'select' : 'deselect'} all`;
  }
  return `${this.alertSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
}

UpdateAlertdata(id) {
  (document.getElementById('collapse3') as HTMLElement).classList.remove("collapse");
  (document.getElementById('collapse3') as HTMLElement).classList.add("show");
  this.userManagementService.getPageAlert(id)
    .subscribe((response) => {
      if (response.status) {
        this.pageAlertFrm.patchValue(response.data);
      }
    },
      (error) => {

      });
}

//#endregion


}
