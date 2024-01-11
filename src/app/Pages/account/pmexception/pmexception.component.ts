import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountMasterService } from 'src/app/services/account-master.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { PurchaseMasterService } from 'src/app/services/purchase-master.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { map, filter } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ExceptionService } from 'src/app/services/exception.service';
import { SelectionModel } from '@angular/cdk/collections';
declare let Swal, PerfectScrollbar: any;

@Component({
  selector: 'app-pmexception',
  templateUrl: './pmexception.component.html',
  styleUrls: ['./pmexception.component.css']
})
export class PMExceptionComponent implements OnInit {
  ExceptionForm: FormGroup; flag; pkey: number = 0;
  selectorderType: string[] = [];
  selectprojectNC: string[] = [];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  displayedColumns: string[] = ['checkbox', 'orderTypeId', 'projectCode', 'accountCode'];
  dropdownAccountcodeSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; tooltipField: string; };
  dropdownprojectNCSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; tooltipField: string; };
  selectedaccountCode: string[] = [];
  selectedprojectNC: string[] = [];
  accountcode: any;
  orderTypes: any;
  fullname: any;
  projectnameAndcode: any;
  deletetooltip: string;
  selectedIndex: any;
  accountcodeFullData: any;
  dropdownList: { accountCodeId: number, accountcode: string }[] = [];
  projectList: { projectNameId: number, fullNameCode: string }[] = [];
  projectCodeFullData: any;

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
    private purchaseService: PurchaseMasterService,
    private swal: SwalToastService,
    private accountMasterService: AccountMasterService,
    private exceptionService: ExceptionService,) { }

  ngOnInit(): void {

    this.ExceptionForm = this.fb.group({
      exceptionId: [0],
      orderTypeId: ['', [Validators.required]],
      projectCode: ['', [Validators.required]],
      accountCode: ['', [Validators.required]]
    });

    this.dropdownAccountcodeSetting = {
      singleSelection: false,
      idField: 'accountCodeId',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      tooltipField: 'description',
    };
    this.dropdownprojectNCSetting = {
      singleSelection: false,
      idField: 'projectNameId',
      textField: 'fullNameCode',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      tooltipField: 'description',
    };

    this.loadData(0);
    this.LoadAccountcode();
    this.LoadOrderType();
    this.LoadProjectnameAndcode();


  }

  LoadAccountcode() {
    this.accountMasterService.getAccountCode(0)
      .subscribe(response => {

        this.accountcodeFullData = response.data;
        this.accountcode = response.data.map(item => ({
          accountCodeId: item.accountCodeId,
          fullName: `${item.accountcode} ${item.accountName}`,

        }));

      })
  }

  LoadProjectnameAndcode() {
    this.purchaseService.getprojectname(0)
      .subscribe(response => {
        this.projectCodeFullData = response.data;
        this.projectnameAndcode = response.data.map(item => ({
          projectNameId: item.projectNameId,
          fullNameCode: `${item.projectName} ${item.projectCode}`,

        }));;

      })
  }

  LoadOrderType() {
    this.purchaseService.getOrderTypes(0)
      .subscribe(response => {

        this.orderTypes = response.data;

      })
  }

  onAccountcodeSelect(event: any) {
  
    event.fullName = event.fullName.replace(/\D/g, '');

    let isSelect = event.fullName;
    if (isSelect) {
      this.selectedaccountCode.push(event.fullName);

    }
  }

  onAccountcodeSelectAll(event: any) {
    if (event)
      this.selectedaccountCode = event.map((x: { fullName: any; }) => x.fullName.replace(/\D/g, ''));
  }

  onAccountcodeDeSelect(event: any) {

    event.fullName = event.fullName.replace(/\D/g, '');
    let rindex = this.selectedaccountCode.findIndex(fullName => fullName == event.fullName);
    if (rindex !== -1) {
      this.selectedaccountCode.splice(rindex, 1)
    }
  }

  onAccountcodeDeSelectAll(event: any) {
    this.selectedaccountCode.length = 0;
  }



  onprojectNCSelect(event: any) {
   
    event.fullNameCode = event.fullNameCode.replace(/\D/g, '');
    let isSelect = event.fullNameCode;
    if (isSelect) {
      this.selectedprojectNC.push(event.fullNameCode);

    }
  }

  onprojectNCSelectAll(event: any) {
    if (event)
      this.selectedprojectNC = event.map((x: { fullNameCode: any; }) => x.fullNameCode.replace(/\D/g, ''));
  }

  onprojectNCDeSelect(event: any) {

    event.fullNameCode = event.fullNameCode.replace(/\D/g, '');
    let rindex = this.selectedprojectNC.findIndex(fullNameCode => fullNameCode == event.fullNameCode);
    if (rindex !== -1) {
      this.selectedprojectNC.splice(rindex, 1)
    }
  }

  onprojectNCDeSelectAll(event: any) {
    this.selectedprojectNC.length = 0;
  }

  onSubmit(form: any) {
    
    form.value.accountCode = this.selectedaccountCode.join(',');
    form.value.projectCode = this.selectedprojectNC.join(',');
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.exceptionService.addException(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.selectedaccountCode = []
          this.selectedprojectNC = []
          this.swal.success('Added successfully.');
          this.loadData(0);
          this.clear();
        }
        else if (data.message == "updated") {
          this.selectedaccountCode = []
          this.selectedprojectNC = []
          this.swal.success('Data has been updated successfully.');
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

  clear() {
    this.ExceptionForm.reset();
    this.ExceptionForm.controls.exceptionId.setValue(0);
    this.ExceptionForm.controls.orderTypeId.setValue('');
    this.ExceptionForm.controls.projectCode.setValue('');
    this.ExceptionForm.controls.accountCode.setValue('');

    (document.getElementById('abc') as HTMLElement).focus();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  clearSearchInput() {
    this.searchInput.nativeElement.value = '';
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
    
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
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
          this.exceptionService.archiveException(numSelected).subscribe(result => {
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

    this.exceptionService.getException(status)
      .subscribe(response => {

        this.flag = status;

        this.dataSource.data = response.data;       
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.clear();
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }


  Updatedata(id) {

    this.selectedIndex = id;
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.exceptionService.getExceptionById(id)
      .subscribe((response) => {
        
        if (response.status) {

          var objProcR = [];
          var objProcRS = [];
          var objJoin = [];
          this.dropdownList = [];
          if (response.data.accountCode != '' && response.data.accountCode != null) {

            const objProcR = response.data.accountCode.split(',');

            const objJoin = objProcR.map(item => ({

              acountnames: this.accountcodeFullData.filter(x => x.accountcode == item).map(x => x.accountName)[0].toString(),
              accountcode: `${item}`,

            }));

            const objProcRS = objJoin.map(item => ({

              fullname: `${item.accountcode} ${item.acountnames}`

            }));

            this.dropdownList = objProcRS.map(item => {
              return this.accountcode.find(x => x.fullName == item.fullname);
            });
            const merge4 = this.dropdownList.flat(1);
            this.dropdownList = merge4;
            this.selectedaccountCode.length = 0;
            objJoin.map(item => {
              this.selectedaccountCode.push(item.accountcode.toString());
            })
          }

          response.data.accountCode = this.dropdownList;

          var getObj = [];
          var joinObj = [];
          var finalObj = [];
          this.projectList = [];
          if (response.data.projectCode != '' && response.data.projectCode != null) {

            const getObj = response.data.projectCode.split(',');

            const joinObj = getObj.map(item => ({

              projectname: this.projectCodeFullData.filter(x => x.projectCode == item).map(x => x.projectName)[0].toString(),
              projectcode: `${item}`,

            }));

            const finalObj = joinObj.map(item => ({

              fullname: `${item.projectname} ${item.projectcode}`

            }));

            this.projectList = finalObj.map(item => {
              return this.projectnameAndcode.find(x => x.fullNameCode == item.fullname);
            });

            const merge4 = this.projectList.flat(1);
            this.projectList = merge4;
            this.selectedprojectNC.length = 0;

            joinObj.map(item => {
              this.selectedprojectNC.push(item.projectcode.toString());
            })
          }
          response.data.projectCode = this.projectList;

          this.ExceptionForm.patchValue(response.data);

        }
      },
        (error) => {

        });
  }



  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.exceptionId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Exception', 'Exception');
  }

}
