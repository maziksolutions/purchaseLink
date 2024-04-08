import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseMasterService } from '../../../services/purchase-master.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
declare let Swal, PerfectScrollbar: any;
import { SelectionModel } from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { registerNavEnum, unitMasterNavEnum } from '../../Shared/rights-enum';
import { userInfo } from 'os';
import { filter } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-priority',
  templateUrl: './priority.component.html',
  styleUrls: ['./priority.component.css']
})
export class PriorityComponent implements OnInit {
  PriorityForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'servicetype', 'description', 'orderTypeId', 'defaultPriority'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  rights: RightsModel;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedIndex: any;
  orderTypes: any;

  @ViewChild('mainSort') mainSort = new MatSort();
  PageTotal: any;
  pageEvent: PageEvent;
  pageSizeOptions: number[] = [20, 40, 60, 100];
  deletetooltip: any;
  searchForm: FormGroup;
  pageSize = 20; currentPage = 0; page: number = 1;

  selectorderType: string[] = [];
  selectedorderType: string[] = [];
  dropdownOrderTypeSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; tooltipField: string; };

  selectedDocumentReference: string[] = [];
  defchecked: boolean = false;
  ordertypename: any;
  lastpreferenceValues: any;
  FullDatapriority: any;


  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
    private purchaseService: PurchaseMasterService,
    private swal: SwalToastService,
    private router: Router,
    private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.PriorityForm = this.fb.group({
      prefenceId: [0],
      preferenceNumber: [this.lastpreferenceValues + 1, [Validators.required]],
      description: ['', [Validators.required]],
      orderTypeId: ['', [Validators.required]],
      defaultPriority: [false],
    });

    this.dropdownOrderTypeSetting = {
      singleSelection: false,
      idField: 'orderTypeId',
      textField: 'orderTypes',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      tooltipField: 'description'
    };

    this.searchForm = this.fb.group({
      pageNumber: [''],
      pageSize: [this.pageSize],
      status: ['0'],
      keyword: [''],
      excel: ['']
    });

    //this.PriorityForm.controls.directCompletion.setValue('');
    // this.loadRights();
    this.fullData();
    this.loadData(0);
    this.LoadOrderType();
  }
  get fm() { return this.PriorityForm.controls };
  get sfm() { return this.searchForm.controls };

  loadRights() {
    this.userManagementService.checkAccessRight(unitMasterNavEnum.jobGroup).subscribe((response) => {
      if (response.status) {
        this.rights = response.data;
      } else {
        this.rights = new RightsModel();
        this.rights.addRight = this.rights.ammendRight = this.rights.deleteRight = this.rights.importRight = this.rights.viewRight = false;
      }
      if (!this.rights.viewRight) {
        alert('you have no view right')
        this.router.navigate(['welcome']);
      }
    }, (error) => {
      console.log(error);
    })
  }

  LoadOrderType() {
    this.purchaseService.getOrderTypes(0)
      .subscribe(response => {

        this.orderTypes = response.data;

      })
  }

  onOrderTypeSelect(event: any) {
    debugger
    let isSelect = event.orderTypeId;
    if (isSelect) {
      this.selectedorderType.push(event.orderTypeId);

    }
  }

  onOrderTypeSelectAll(event: any) {
    if (event)
      this.selectedorderType = event.map((x: { orderTypeId: any; }) => x.orderTypeId);
  }

  onOrderTypeDeSelect(event: any) {
    debugger
    let rindex = this.selectedorderType.findIndex(orderTypeId => orderTypeId == event.orderTypeId);
    if (rindex !== -1) {
      this.selectedorderType.splice(rindex, 1)
    }
  }

  onOrderTypeDeSelectAll(event: any) {
    this.selectedorderType.length = 0;
    // this.selectedCountries.splice(0, this.selectedCountries.length);
  }

  fullData(){
    this.purchaseService.GetPreferenceType(0)
      .subscribe(response => {

        this.FullDatapriority = response.data;

        let preferenceValues = response.data.map(x => x.preferenceNumber);

        if (preferenceValues.length > 0) {
          this.lastpreferenceValues = preferenceValues.pop();

        }
        else if (preferenceValues.length == 0) {
          this.lastpreferenceValues = 0;
        }
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
    this.sfm.pageSize.setValue(this.pageSize);
    this.sfm.excel.setValue('False')
    this.purchaseService.getPreferenceTypeByPaginator(this.searchForm.value)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;

      
        this.dataSource.sort = this.mainSort;
        this.PageTotal = response.total;
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

    form.value.orderTypeId = this.selectedorderType.join(',');

    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.purchaseService.AddPreference(fmdata)
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
    this.purchaseService.GetPreferenceById(id)
      .subscribe((response) => {
        if (response.status) {


          var objProcR = [];
          this.selectorderType = [];
          if (response.data.orderTypeId != '' && response.data.orderTypeId != null) {
            objProcR = response.data.orderTypeId.split(',')
            this.selectedorderType = response.data.orderTypeId.split(',');

            objProcR.forEach((item) => {
              this.selectorderType.push(this.orderTypes.filter(x => x.orderTypeId == item));
            })
            const merge4 = this.selectorderType.flat(1);
            this.selectorderType = merge4;
          }

          this.defchecked = response.data.defaultPriority;
          response.data.orderTypeId = this.selectorderType;
          this.PriorityForm.patchValue(response.data);
          this.pkey = response.data.prefenceId;

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
          this.purchaseService.archivePreference(numSelected).subscribe(result => {
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
  applyFilter() {
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
  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {
    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  clear() {
    this.PriorityForm.reset();
    this.PriorityForm.controls.prefenceId.setValue(0);
    this.PriorityForm.controls.preferenceNumber.setValue(this.lastpreferenceValues + 1);
    this.PriorityForm.controls.description.setValue('');
    this.PriorityForm.controls.orderTypeId.setValue('');
    this.PriorityForm.controls.defaultPriority.setValue(false);
    (document.getElementById('abc') as HTMLElement).focus();
  }
  // export excel
  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.prefenceId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy,
        delete item.orderTypeId

      item.orderTypeNames = item.orderTypeNames.join(', ');
    })
    this.exportExcelService.exportAsExcelFile(data, 'Priority', 'Priority');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.prefenceId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy,
          delete item.orderTypeId

        item.orderTypeNames = item.orderTypeNames.join(', ');
      })
    }
    else
      data = [{ jobGroup: '', directCompletion: '' }];
    this.exportExcelService.LoadSheet(data, 'PriorityGroupLoadSheet', 'Priority Load Sheet', 2);
  }

  close() {
    this.PriorityForm.reset();
    this.PriorityForm.controls.orderTypeId.setValue(0);
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

  //Open Modal Pop-up to Importdata
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data: { modalTitle: "Import Priority Master", tablename: "tblJobGroup", columname: "JobGroup" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
}