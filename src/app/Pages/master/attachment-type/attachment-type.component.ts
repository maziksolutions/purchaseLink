import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { PurchaseMasterService } from 'src/app/services/purchase-master.service';
import { TypemasterService } from 'src/app/services/typemaster.service';
import { filter } from 'rxjs/operators';

declare let Swal, PerfectScrollbar: any; declare let $: any;
@Component({
  selector: 'app-attachment-type',
  templateUrl: './attachment-type.component.html',
  styleUrls: ['./attachment-type.component.css']
})
export class AttachmentTypeComponent implements OnInit {
  attachmentTypeForm: FormGroup; flag; pkey: number = 0;
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  displayedColumns: string[] = ['checkbox', 'attachmentTypeName'];
  selectedIndex: any;

  @ViewChild('mainSort') mainSort = new MatSort();
  PageTotal: any;
  pageEvent: PageEvent;
  pageSizeOptions: number[] = [20, 40, 60, 100];
  deletetooltip: any;
  searchForm: FormGroup;
  pageSize = 20; currentPage = 0; page: number = 1;

  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private swal: SwalToastService,private exportExcelService: ExportExcelService, 
    private router: Router, private userManagementService: UserManagementService, 
    private typemasterService:TypemasterService ) { }

  ngOnInit(): void {
    this.attachmentTypeForm = this.fb.group({
      attachmentTypeId: [0],
      attachmentTypeName: ['', [Validators.required]],
      module: ['Purchase']

    })

    this.searchForm = this.fb.group({
      pageNumber: [''],
      pageSize: [this.pageSize],
      status: ['0'],
      keyword: [''],
      excel: ['']
    });

    this.loadData(0);
  }
  get fm() { return this.attachmentTypeForm.controls };
  get sfm() { return this.searchForm.controls };

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
    this.sfm.pageSize.setValue(this.pageSize);
    this.sfm.excel.setValue('False')
    this.typemasterService.getAttachmentsByPaginator(this.searchForm.value)
      .subscribe(response => {
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
        this.clear();
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }

  onSubmit(form: any) {
    debugger
    form.value.module ='Purchase';
    this.typemasterService.addAttachmentTypes(form.value)
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

  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data: { modalTitle: "Import Attachment Type Master", tablename: "tblAttachmentType", columname: "AttachmentTypeName" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
  close() {
    this.attachmentTypeForm.reset();
    this.attachmentTypeForm.controls.attachmentTypeId.setValue(0);
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

  clear() {
    this.attachmentTypeForm.reset();
    this.attachmentTypeForm.controls.attachmentTypeId.setValue(0);
    (document.getElementById('abc') as HTMLElement).focus();
  }

  applyFilter() {
    this.page = 1; this.currentPage = 0;
    this.loadData(0);
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
      this.loadData(0);
      // this.dataSource.paginator = this.paginator;
    }
  }

  Updatedata(id) {
    this.selectedIndex = id;
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.typemasterService.getAttachmentTypeById(id)
      .subscribe((response) => {
        if (response.status) {
          this.attachmentTypeForm.patchValue(response.data);
          this.pkey = response.data.attachmentTypeId;

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
          this.typemasterService.archiveAttachmentType(numSelected).subscribe(result => {
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

  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.attachmentTypeId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Attachment Type', 'Attachment Type');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.attachmentTypeId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else
      data = [{ AttachmentTypeName: '' }];
    this.exportExcelService.LoadSheet(data, 'AttachmentTypeLoadSheet', 'Attachment Type Load Sheet', 1);
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

}
