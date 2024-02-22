import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AccountMasterService } from 'src/app/services/account-master.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { DatePipe } from '@angular/common';

declare let Swal, PerfectScrollbar: any; declare let $: any;
@Component({
  selector: 'app-currency-master',
  templateUrl: './currency-master.component.html',
  styleUrls: ['./currency-master.component.css']
})
export class CurrencyMasterComponent implements OnInit {

  currencyForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'CurrencySign', 'CurrencyName', 'LastUpdate', 'UsdExcRate', 'UsdValue', 'GbpValue', 'FromDate', 'ToDate'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedIndex: any;

  @ViewChild('mainSort') mainSort = new MatSort();
  PageTotal: any;
  pageEvent: PageEvent;
  pageSizeOptions: number[] = [20, 40, 60, 100];
  deletetooltip: any;
  searchForm: FormGroup;
  pageSize = 20; currentPage = 0; page: number = 1;

  constructor(private fb: FormBuilder, public dialog: MatDialog, private exportExcelService: ExportExcelService,
    private swal: SwalToastService, private actService: AccountMasterService,
    private router: Router, private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      pageNumber: [''],
      pageSize: [this.pageSize],
      status: ['0'],
      keyword: [''],
      excel: ['']
    });

    this.loadData(0);
  }
  get sfm() { return this.searchForm.controls };

  loadData(status: number) {
    debugger
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
    this.sfm.pageSize.setValue(this.pageSize);
    this.sfm.excel.setValue('False')
    this.actService.getCurrencyByPaginator(this.searchForm.value)
      .subscribe(response => {
        debugger
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.mainSort;
        this.PageTotal = response.total;
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'checkbox': return this.checkboxLabel(item);
            case 'pageCategory': return item.pageCategory;
            case 'module': return item.module;

            default: return item[property];
          }
        };
        // this.clear();
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }

  applyFilter() {
    debugger
    this.page = 1; this.currentPage = 0;
    this.loadData(this.flag);
    this.pageChanged(this.pageEvent);
  }
  clearSearchInput() {
    debugger
    this.sfm.keyword.setValue('');
    this.applyFilter()
  }
  pageChanged(event: PageEvent) {
    if (event == undefined) {

    }
    else {
      this.pageSize = event.pageSize;
      this.currentPage = event.pageIndex;
      this.loadData(this.flag);
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

UpdateData(id: any): void {
  debugger
  this.router.navigate(['/Account/addCurrency', id]);
}
DeleteData(){}
}
