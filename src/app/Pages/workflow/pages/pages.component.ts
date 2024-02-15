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

  constructor(private fb: FormBuilder, public dialog: MatDialog, private swal: SwalToastService, private router: Router) { }

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
  }
  get fm() { return this.pageForm.controls };
  get sfm() { return this.searchForm.controls };
  get afm() { return this.alertFrm.controls };

   //Open Modal Pop-up to Importdata
   openModal() {
    // const dialogRef = this.dialog.open(ImportDataComponent, {
    //   width: '500px',
    //   data: { modalTitle: "Import Page Master", tablename: "tblPage", columname: "Page" },
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result === 'success') {
    //     this.loadData(this.flag);
    //   }
    // });
  }

  exportLoadSheet(){}
  generateExcel(){}
  DeleteData(){}
  clear(){}
  clearSearchInput(){}
  applyFilter(){}
  loadData(status: number){}
  OpenModalPopup(id){}
  checkAlerts(id){}
  openModalPage(id,page){}
  Updatedata(id){}
  checkboxLabel(row){}
  close(){}
  onSubmit(form){}
}
