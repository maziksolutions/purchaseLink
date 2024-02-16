import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';

declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-page-category',
  templateUrl: './page-category.component.html',
  styleUrls: ['./page-category.component.css']
})
export class PageCategoryComponent implements OnInit {

  @ViewChild('searchInput') searchInput: ElementRef; searchForm: FormGroup;
  pageCategoryForm: FormGroup; flag; pkey: number = 0; pageEvent: PageEvent;
  displayedColumns: string[] = ['checkbox', 'pageCategory', 'module'];
  dataSource = new MatTableDataSource<any>(); pageSize = 20;
  selection = new SelectionModel<any>(true, []);
  deletetooltip: any; page: number = 1; currentPage = 0;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('mainSort') mainSort = new MatSort();
  selectedIndex: any;
  PageTotal: any; pageOptions: number[] = [20, 40, 60, 100];

  constructor(private fb: FormBuilder, public dialog: MatDialog, private swal: SwalToastService,
    private unitmasterService: UnitmasterService, private exportExcelService: ExportExcelService) { }

  ngOnInit(): void {
    this.pageCategoryForm = this.fb.group({
      pageCategoryId: [0],
      pageCategory: ['', [Validators.required]],
      module: ['PMS', [Validators.required]]
    });
    this.searchForm = this.fb.group({
      pageNumber: [''],
      pageSize: [this.pageSize],
      status: ['0'],
      keyword: [''],
      excel: ['']
    });
    this.loadData(0);
  }
  get fm() { return this.pageCategoryForm.controls };
  get sfm() { return this.searchForm.controls };

  loadData(status: number) {
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
    this.unitmasterService.getRequisitionPageCategoryByPaginator(this.searchForm.value)
      .subscribe(response => {
        debugger
        this.flag = status;
        console.log(response.data)
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
    this.fm.module.setValue('Purchase')
    this.unitmasterService.addRequisitionPageCategory(form.value)
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
    this.unitmasterService.getRequisitionPageCategoryById(id)
      .subscribe((response) => {
        if (response.status) {
          this.pageCategoryForm.patchValue(response.data);
          this.pkey = response.data.pageCategoryId;

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
          this.unitmasterService.archiveRequisitionPageCategory(numSelected).subscribe(result => {
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
    debugger
    this.page = 1; this.currentPage = 0;
    this.loadData(0);
    this.pageChanged(this.pageEvent);
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

  clearSearchInput() {
    this.sfm.keyword.setValue('');
    this.applyFilter()
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
    this.pageCategoryForm.reset();
    this.pageCategoryForm.controls.pageCategoryId.setValue(0);
    (document.getElementById('abc') as HTMLElement).focus();
  }

   // export excel
   generateExcel() {
    this.sfm.pageNumber.setValue(this.currentPage);
    this.sfm.pageSize.setValue(this.pageSize);
    this.sfm.excel.setValue('True')
    this.unitmasterService.getRequisitionPageCategoryByPaginator(this.searchForm.value)
    .subscribe((response) => {
      if (response.data.length == 0)
      this.swal.info('No data to Export');
    else
    this.exportAsXLSX(JSON.parse(JSON.stringify(response.data)));

    });
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.pageCategoryId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Page Category', 'Page Category');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.pageCategoryId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else {
      data = [{ pageCategory: '' }];
    }
    this.exportExcelService.LoadSheet(data, 'PageCategoryLoadSheet', 'Page Category Load Sheet',1);
  }

  close() {
    this.pageCategoryForm.reset();
    this.pageCategoryForm.controls.pageCategoryId.setValue(0);
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

   //Open Modal Pop-up to Importdata
   openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Page Category",tablename:"tblPageCategory",columname:"PageCategory"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }

}
