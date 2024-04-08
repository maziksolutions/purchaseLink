import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { Keys } from '../../Shared/localKeys';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';

declare let Swal, PerfectScrollbar: any; declare let $: any;
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  pageCategory: any;
  pageForm: FormGroup; flag; pkey: number = 0;

  displayedColumns: string[] = ['checkbox', 'page', 'url', 'pageCategory', 'specialFields', 'icon'];
  displayedNotificationColumns: string[] = ['checkbox', 'alertName', 'Frequency', 'description', 'EmailTemplate'];
  displayedAlertColumns: string[] = ['checkbox', 'alertName'];
  dataSource = new MatTableDataSource<any>();
  notificationDataSource = new MatTableDataSource<any>();
  alertDataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  notificationSelection = new SelectionModel<any>(true, []);
  alertSelection = new SelectionModel<any>(true, []);

  pageTotal: any;
  pageEvent: PageEvent;
  pageSizeOptions: number[] = [20, 40, 60, 100];
  deletetooltip: any;
  deletetooltipss: any;
  searchForm: FormGroup;

  pageSize = 20; currentPage = 0; page: number = 1;

  alertFrm: FormGroup; pageAlertFrm: FormGroup;
  flagNoti;
  PageId: any;
  deletetooltips: any;
  html: '';
  pageName: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) notificationPaginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) alertPaginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatSort, { static: false }) notificationSort: MatSort;
  @ViewChild(MatSort, { static: false }) alertSort: MatSort;

  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchInputNoti') searchInputNoti: ElementRef;
  @ViewChild('searchInputAlert') searchInputAlert: ElementRef;

  @ViewChild('mainSort') mainSort = new MatSort();
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

  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;  
  selectedIndex: any;
  userName: string | null;

  constructor(private fb: FormBuilder, public dialog: MatDialog, private swal: SwalToastService, private router: Router,
    private unitmasterService: UnitmasterService, private exportExcelService: ExportExcelService, private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem(Keys.userName);

    this.pageForm = this.fb.group({
      pageId: [0],
      pageCategoryId: ['', [Validators.required]],
      url: ['', [Validators.required]],
      page: ['', [Validators.required]],
      specialFields: ['']
    });
    this.searchForm = this.fb.group({
      pageNumber: [''],
      pageSize: [this.pageSize],
      status: ['0'],
      keyword: [''],
      excel: ['']
    });

    this.alertFrm = this.fb.group({
      alertConfigId: [0],
      pageAlertId: [''],
      description: [''],
      frequency: [''],
      emailTemplate: [''],
      pageId: [''],
    });

    this.pageAlertFrm = this.fb.group({
      pageAlertId: [0],
      alertName: ['', [Validators.required]],
      pageId: [''],
    });

    this.loadData(0);
    this.loadPageCategory();
    this.loadAllAlerts();
    this.loadAlertData(0);
  }
  get fm() { return this.pageForm.controls };
  get sfm() { return this.searchForm.controls };
  get afm() { return this.alertFrm.controls };

  loadPageCategory() {
    this.unitmasterService.getRequisitionPageCategories(0)
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
    this.sfm.pageNumber.setValue(this.currentPage);
    this.sfm.pageSize.setValue(this.pageSize)
    this.sfm.excel.setValue('False');
    this.unitmasterService.getRequistionPagesByPaginator(this.searchForm.value)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;

        // this.dataSource.paginator = this.paginator;
        this.pageTotal = response.total;
        // setTimeout(() => this.dataSource.paginator=this.paginator);
        setTimeout(() => this.dataSource.sort = this.mainSort);
        this.dataSource.sort = this.mainSort;
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'checkbox': return this.checkboxLabel(item);
            case 'page': return item.page;
            case 'url': return item.url;
            case 'pageCategory': return item.pageCategories?.pageCategory;
            case 'specialFields': return item.specialFields == true ? 'Yes' : 'No';

            default: return item[property];
          }
        };
        this.clear();
        // (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
        // (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
      });
  }

  onSubmit(form: any) {
    this.unitmasterService.addRequisitionPage(form.value)
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
    this.selectedIndex = id;
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.unitmasterService.getRequisitionPageById(id)
      .subscribe((response) => {
        if (response.status) {
          this.pageForm.patchValue(response.data);
          this.pkey = response.data.pageId;

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
          this.unitmasterService.archiveRequisitionPage(numSelected).subscribe(result => {
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

  clearSearchInput() {
    this.sfm.keyword.setValue('');
    this.applyFilter()
  }
  pageChanged(event: PageEvent) {
    if (event == undefined) {

    }
    else {
      this.pageSize = event.pageSize;
      this.currentPage = event.pageIndex;
      this.loadData(0);
      // this.dataSource.paginator = this.paginator;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.filteredData.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.filteredData.forEach(r => this.selection.select(r));
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
  // export excel
  generateExcel() {
    this.sfm.pageNumber.setValue(this.currentPage);
    this.sfm.pageSize.setValue(this.pageSize)
    this.sfm.excel.setValue('True');
    this.unitmasterService.getPages(this.searchForm.value)
    .subscribe((response) => {
      if (response.data.length == 0)
      this.swal.info('No data to Export');
    else
    this.exportAsXLSX(JSON.parse(JSON.stringify(response.data)));

    });
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {

      item.pageCategories = item.pageCategories.pageCategory;

      delete item.pageId, delete item.pageCategoryId
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Pages', 'Pages');
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
    this.exportExcelService.LoadSheet(data, 'PageLoadSheet', 'Page Load Sheet', 1);
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
      data: { modalTitle: "Import Page Master", tablename: "tblPage", columname: "Page" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }


  //#region  Notification/Alerts


  OpenModalPopup(id) {
    this.PageId = id;
    $("#OpenModalPopup").modal('show');
    this.loadNotificationData(0);
    this.loadPageAlerts();
  }


  loadNotificationData(status: number) {

    this.notificationSelection.clear();
    if (status == 1) {    
      this.deletetooltip ='UnArchive';
      if (((document.getElementById("OpenModalPopup")as HTMLElement).querySelector('.fa-trash') as HTMLElement) != null) {
        ((document.getElementById("OpenModalPopup")as HTMLElement).querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        ((document.getElementById("OpenModalPopup")as HTMLElement).querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {     
      this.deletetooltip='Archive';
      if (((document.getElementById("OpenModalPopup")as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement) != null) {
        ((document.getElementById("OpenModalPopup")as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        ((document.getElementById("OpenModalPopup")as HTMLElement).querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }
    // if (status == 1) {
    //   this.deletetooltips = 'UnArchive';
    //   if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
    //   }
    // }
    // else {
    //   this.deletetooltips = 'Archive';
    //   if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
    //   }
    // }
    this.userManagementService.getAlerts(status, this.PageId)
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
  clearSearchInputNotification() {
    this.searchInputNoti.nativeElement.value = '';
    //this.applyFilter(this.searchInputNoti.nativeElement.value)
    this.applyFilter();
  }

  clearNotification() {
    this.alertFrm.reset();
    this.alertFrm.controls.pageAlertId.setValue(0);
   (document.getElementById('collapse2') as HTMLElement).classList.add("collapse");
   (document.getElementById('collapse2') as HTMLElement).classList.remove("show");
  }

  // clearNotification() {
  //   this.alertFrm.reset();
  //   this.alertFrm.controls.alertConfigId.setValue(0);
  //   $('#summernote').summernote('reset');
  //   // $('#summernote').reset();
  //   (document.getElementById('collapse2') as HTMLElement).classList.remove("collapse");
  //   // (document.getElementById('summernote') as HTMLElement).focus();

  // }

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
    var data = $("#summernote").val();

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
    const numRows = !!this.notificationDataSource && this.notificationDataSource.filteredData.length;
    return numSelected === numRows;
  }
  masterNotificationToggle() {
    this.isAllSelected() ? this.notificationSelection.clear() : this.notificationDataSource.filteredData.forEach(r => this.notificationSelection.select(r));
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


  openModalPage(id, page) {
    this.clearAlerts();
    this.PageId = id;
    this.Page = page;
    $("#openModalPage").modal('show');
    this.loadAlertData(0);
  }

  checkAlerts(pageId) {
    var checkAlert = this.allAlerts.filter(x => x.pageId == pageId);
    if (checkAlert.length > 0)
      return true;
    else
      return false;
  }

  loadPageAlerts() {
    this.userManagementService.getPageAlerts(0, this.PageId)
      .subscribe(response => {
        this.pageAlerts = response.data;
        this.alertFrm.controls.pageAlertId.setValue('');
      });
  }
  loadAllAlerts() {
    this.userManagementService.getAllAlerts()
      .subscribe(response => {
        this.allAlerts = response.data;
      });
  }


  loadAlertData(status: number) {
    this.alertSelection.clear();
    if (status == 1) {
      this.deletetooltipss ='UnArchive';
      if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
        (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {
      this.deletetooltipss='Archive';
      if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }

    // this.alertSelection.clear();
    // if (status == 1) {
    //   alert("UnArchive")
    //   this.deletetooltipss = 'UnArchive';
    //   if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
    //   }
    // }
    // else {
    //   alert("Archive")
    //   this.deletetooltipss = 'Archive';
    //   if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
    //   }
    // }
    this.userManagementService.getPageAlerts(status, this.PageId)
      .subscribe(response => {
        this.flagAlert = status;
        this.alertDataSource.data = response.data;
        this.alertDataSource.sort = this.alertSort;
        this.alertDataSource.paginator = this.alertPaginator;
        this.clear();
          (document.getElementById('collapse3') as HTMLElement).classList.remove("show");      
      });
  }

  applyFilterAlert(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.notificationDataSource.filter = filterValue;
  }
  clearSearchInputAlert() {
    this.searchInputAlert.nativeElement.value = '';
    // this.applyFilter(this.searchInputAlert.nativeElement.value)
    this.applyFilter();
  }

  clearAlerts() {
    this.pageAlertFrm.reset();
    this.pageAlertFrm.controls.pageAlertId.setValue(0);
   (document.getElementById('collapse3') as HTMLElement).classList.add("collapse");
   (document.getElementById('collapse3') as HTMLElement).classList.remove("show");
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
    const numRows = !!this.alertDataSource && this.alertDataSource.filteredData.length;
    return numSelected === numRows;
  }
  masterAlertToggle() {
    this.isAllAlertSelected() ? this.alertSelection.clear() : this.alertDataSource.filteredData.forEach(r => this.alertSelection.select(r));
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
}
