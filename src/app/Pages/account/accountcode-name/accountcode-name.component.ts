import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AccountMasterService } from 'src/app/services/account-master.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
declare let Swal, PerfectScrollbar: any;
declare let  $: any;

@Component({
  selector: 'app-accountcode-name',
  templateUrl: './accountcode-name.component.html',
  styleUrls: ['./accountcode-name.component.css']
})
export class AccountcodeNameComponent implements OnInit {
  accountCategoryForm: FormGroup; flag; pkey: number = 0;
  subCategoryForm: FormGroup; flagSub; pkeySub: number = 0;
  accountHeadForm: FormGroup; flagAh; pkeyAh: number = 0;
  accountCodeForm: FormGroup; flagAc; pkeyAc: number = 0;

  displayedColumns: string[] = ['checkbox', 'department', 'category', 'subCategory', 'accountHead','accountCodes','accountName'];

  selection = new SelectionModel<any>(true, []);
  selectedIndex: any;
  @ViewChild('searchInput') searchInput: ElementRef;
  
  dataSource = new MatTableDataSource<any>();
  subCatDataSource = new MatTableDataSource<any>();
  accHeadDataSource = new MatTableDataSource<any>();
  accCodeDataSource = new MatTableDataSource<any>();

  deletetooltip: string;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  Idheaderfoot: any = 0;

  constructor(private fb: FormBuilder, public dialog: MatDialog, private exportExcelService: ExportExcelService,
    private accountMasterService :AccountMasterService, private swal: SwalToastService,
    private router: Router,) { }

  ngOnInit(): void {
    this.accountCategoryForm = this.fb.group({
      categoryId: [0],
      accountType: ['', [Validators.required]],
      categoryname: ['', [Validators.required]],
      categorycode: ['', [Validators.required]],
    });

    this.subCategoryForm = this.fb.group({
      subCategoryId: [0],
      categoryId: ['', [Validators.required]],
      subCategoryName: ['', [Validators.required]],
      subCategoryCode: ['', [Validators.required]],
    });

    this.accountHeadForm = this.fb.group({
      accountHeadId: [0],
      categoryId: ['', [Validators.required]],
      subCategoryId: ['', [Validators.required]],
      accountHead: ['', [Validators.required]],
      headCode: ['', [Validators.required]],

    });

    this.accountCodeForm = this.fb.group({
      accountCodeId: [0],
      departmentName: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      subCategoryId: ['', [Validators.required]],
      accountHeadId: ['', [Validators.required]],
      accountName: ['', [Validators.required]],
      accountcode: ['', [Validators.required]],

    });

    this.loadData(0);
    this.subCatLoadData(0);
    this.accHeadLoadData(0)
    this.AccCodeLoadData(0);
  }
  get fm() { return this.accountCategoryForm.controls };
  get subfm() { return this.subCategoryForm.controls };
  get ahfm() { return this.accountHeadForm.controls };


  //#region AccountCategory
  onSubmit(form: any) {
   
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.accountMasterService.addAccountCategoryMaster(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.loadData(0);
          this.close();
          this.addCat();
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.loadData(0);
          this.close();
          this.addCat();
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

  addCat() {
    this.accountCategoryForm.reset();
    this.accountCategoryForm.controls.categoryId.setValue(0);
    this.accountCategoryForm.controls.accountType.setValue('');
    this.accountCategoryForm.controls.categoryname.setValue('');
    this.accountCategoryForm.controls.categorycode.setValue('');

    (document.getElementById('abc') as HTMLElement).focus();
  }

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

    this.accountMasterService.getAccountCategoryMaster(status)
      .subscribe(response => {
       
        this.flag = status;

        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.addCat();
        (document.getElementById('add-cat') as HTMLElement).classList.remove("show");
      });
  }

  close(){
    this.accountCategoryForm.reset();
    this.accountCategoryForm.controls.categoryId.setValue(0);
    $("#add-cat").modal('hide');
    
  }

  //#endregion

  //#region SubCategory

  onSubmitSubCat(form: any) {
   
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.accountMasterService.addAccountSubCategory(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.subCatLoadData(0);
          this.subCatClose();
          this.addsubcat();
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.subCatLoadData(0);
          this.subCatClose();
          this.addsubcat();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.subCatLoadData(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.subCatLoadData(0);
        }
        else {

        }

      });
  }

  subCatLoadData(status: number) {
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

    this.accountMasterService.getAccountSubCategory(status)
      .subscribe(response => {
       
        this.flagSub = status;

        this.subCatDataSource.data = response.data;
        this.subCatDataSource.sort = this.sort;
        this.subCatDataSource.paginator = this.paginator;
        this.addsubcat();
        (document.getElementById('add-cat') as HTMLElement).classList.remove("show");
      });
  }

  
  addsubcat() {
    this.subCategoryForm.reset();
    this.subCategoryForm.controls.subCategoryId.setValue(0);
    this.subCategoryForm.controls.categoryId.setValue('');
    this.subCategoryForm.controls.subCategoryName.setValue('');
    this.subCategoryForm.controls.subCategoryCode.setValue('');

    (document.getElementById('abc') as HTMLElement).focus();
  }


  subCatClose(){
    this.subCategoryForm.reset();
    this.subCategoryForm.controls.subCategoryId.setValue(0);
    $("#add-sub-cat").modal('hide');
    
  }
  //#endregion


  //#region AccountHead

  
  onSubmitAccHead(form: any) {
   
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.accountMasterService.addAccountHead(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.accHeadLoadData(0);
          this.accheadClose();
          this.addacchead();
          
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.accHeadLoadData(0);
          this.accheadClose();
          this.addacchead();
         
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.accHeadLoadData(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.accHeadLoadData(0);
        }
        else {

        }

      });
  }


  accHeadLoadData(status: number) {
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

    this.accountMasterService.getAccountHead(status)
      .subscribe(response => {
       
        this.flagAh = status;

        this.accHeadDataSource.data = response.data;
        this.accHeadDataSource.sort = this.sort;
        this.accHeadDataSource.paginator = this.paginator;
        this.addacchead();
        (document.getElementById('add-cat') as HTMLElement).classList.remove("show");
      });
  }

  addacchead() {
    this.accountHeadForm.reset();
    this.accountHeadForm.controls.accountHeadId.setValue(0);
    this.accountHeadForm.controls.categoryId.setValue('');
    this.accountHeadForm.controls.subCategoryId.setValue('');
    this.accountHeadForm.controls.accountHead.setValue('');
    this.accountHeadForm.controls.headCode.setValue('');


    (document.getElementById('abc') as HTMLElement).focus();
  }

  accheadClose(){
    this.accountHeadForm.reset();
    this.accountHeadForm.controls.accountHeadId.setValue(0);
    $("#add-acc-head").modal('hide');
    
  }

  //#endregion

  //#region Accountcode

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.accCodeDataSource && this.accCodeDataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.accCodeDataSource.data.forEach(r => this.selection.select(r));
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  onSubmitAccCode(form: any) {
   
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.accountMasterService.addAccountCode(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.AccCodeLoadData(0);
          this.accCodeClose();
          this.addAccCode();
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.AccCodeLoadData(0);
          this.accCodeClose();
          this.addAccCode();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.AccCodeLoadData(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.AccCodeLoadData(0);
        }
        else {

        }

      });
  }

  AccCodeLoadData(status: number) {
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

    this.accountMasterService.getAccountCode(status)
      .subscribe(response => {
       
        this.flagAc = status;

        this.accCodeDataSource.data = response.data;
        this.accCodeDataSource.sort = this.sort;
        this.accCodeDataSource.paginator = this.paginator;
        this.addacchead();
        (document.getElementById('add-acc-code') as HTMLElement).classList.remove("show");
      });
  }

  addAccCode() {
    this.Idheaderfoot = 0;
    this.accountCodeForm.reset();
    this.accountCodeForm.controls.accountCodeId.setValue(0);
    this.accountCodeForm.controls.departmentName.setValue('');
    this.accountCodeForm.controls.categoryId.setValue('');
    this.accountCodeForm.controls.subCategoryId.setValue('');
    this.accountCodeForm.controls.accountHeadId.setValue('');
    this.accountCodeForm.controls.accountName.setValue('');
    this.accountCodeForm.controls.accountcode.setValue('');

    (document.getElementById('abc') as HTMLElement).focus();
  }
  
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.accCodeDataSource.filter = filterValue;
  }
  clearSearchInput() {
    this.searchInput.nativeElement.value = '';
    this.applyFilter(this.searchInput.nativeElement.value)
  }
  UpdateAccountCodedata(id){
    this.selectedIndex = id;
    this.Idheaderfoot = id;

    $("#add-acc-code").modal('show');
    this.accountMasterService.getAccountCodeId(id)
      .subscribe((response) => {

        if (response.status) {

          this.accountCodeForm.patchValue(response.data);

        }
      },
        (error) => {

        });
  }
  accCodeClose(){
    this.accountCodeForm.reset();
    this.accountCodeForm.controls.accountCodeId.setValue(0);
    $("#add-acc-code").modal('hide');
    
  }

  DeleteData() {
    debugger
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
          this.accountMasterService.archiveAccountCode(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.AccCodeLoadData(this.flag);
          })

        }
      })

    } else {
      this.swal.info('Select at least one row')
    }
  }

  //#endregion
}
