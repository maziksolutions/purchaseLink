import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
declare let Swal, PerfectScrollbar: any;
import { ActivatedRoute, Router } from '@angular/router';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {
  flag; pkey: number = 0;
  companies: any;
  status: number = 0;
  departments: any;
  deletetooltip: any;
  rights: RightsModel;
  designationRoles: any;
  pageSizeOptions: number[] = [20, 40, 60, 100];
  pageTotal: any;
  pageEvent: PageEvent;
  searchForm: FormGroup;
  pageSize = 20; currentPage = 0; page: number = 1;
  displayedColumns: string[] = ['checkbox', 'companyName', 'companyTypeId', 'companyHODID'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  CompanyId: any;
  Id: any;

  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService, private router: Router,
    private userManagementService: UserManagementService, private route: ActivatedRoute,
    private swal: SwalToastService) { }

  ngOnInit(): void { 
    this.CompanyId =this.route.snapshot.paramMap.get('id');
    this.route.params.subscribe(params => {this.Id = params['id']; });
    
    this.searchForm = this.fb.group({
      pageNumber: [''],
      pageSize: [this.pageSize],
      status: ['0'],
      keyword: ['']
    });   
    
    this.loadRights()
    this.loadData(0);
    this.loadcompanies();
    // this.loadDepartments();
    // this.loadCompanyHODs();
  }
  get sfm() { return this.searchForm.controls };
  loadRights() {
    this.userManagementService.checkAccessRight(administrationNavEnum.company).subscribe((response) => {
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
    if(this.Id>0)
    {
      
      this.searchForm.patchValue(JSON.parse(localStorage.getItem('searchCompany') as string));
      this.currentPage=this.sfm.pageNumber.value;
      this.pageSize=this.sfm.pageSize.value;  
      this.userManagementService.getCompany(this.searchForm.value)
      .subscribe(response => {
        //localStorage.removeItem('searchCompany');
        this.router.navigateByUrl(this.router.url.replace(this.Id, '0'))
        // this.CompanyId=0;
        this.flag = status;
        this.dataSource.data = response.data;
        // this.dataSource.paginator = this.paginator;
        this.pageTotal = response.total;
        // setTimeout(() => this.dataSource.paginator=this.paginator);
        setTimeout(() => this.dataSource.sort = this.sort);
        this.dataSource.sort = this.sort;
      });
    }
    else
    {
      this.sfm.pageNumber.setValue(this.currentPage);
      this.sfm.pageSize.setValue(this.pageSize)
      localStorage.setItem('searchCompany',JSON.stringify(this.searchForm.value))
      this.userManagementService.getCompany(this.searchForm.value)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        // this.dataSource.paginator = this.paginator;
        this.pageTotal = response.total;
        // setTimeout(() => this.dataSource.paginator=this.paginator);
        setTimeout(() => this.dataSource.sort = this.sort);
        this.dataSource.sort = this.sort;
      });

    }    
  }

  loadcompanies() {
    this.userManagementService.getCompanyType(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.companies = response.data;
        } else {
          this.companies = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }

  // loadDepartments() {
  //   this.userManagementService.getDepartment(0)
  //     .subscribe((response) => {
  //       if (response.status) {
  //         this.departments = response.data;
  //       } else {
  //         this.departments = [];
  //       }
  //     }, (error) => {
  //       console.log(error);
  //     })
  // }

  // loadCompanyHODs() {
  //   this.userManagementService.getDesignationRoles(0)
  //     .subscribe((response) => {
  //       if (response.status) {
  //         this.designationRoles = response.data;
  //       } else {
  //         this.designationRoles = [];
  //       }
  //     }, (error) => {
  //       console.log(error);
  //     })
  // }


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
          this.userManagementService.archiveCompany(numSelected).subscribe(result => {
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
    this.page = 1;
    this.currentPage = 0;
    //this.loadData(0);
    this.pageChanged(this.pageEvent);
  }
  clearSearchInput(){
    this.sfm.keyword.setValue('');
    this.applyFilter()
 }
  pageChanged(event: PageEvent) {
    if (event == undefined) {

    }
    else {
      this.pageSize = event.pageSize;
      this.currentPage = event.pageIndex;     
      // this.dataSource.paginator = this.paginator;
    }
    this.loadData(0);
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


  // clear() {
  //   this.companyForm.reset();
  //   this.companyForm.controls.companyId.setValue(0);
  //   this.companyForm.controls.companyTypeId.setValue(0);
  //   this.companyForm.controls.companyLogo.setValue('');

  //   this.companyForm.controls.companyHODID.setValue(0);
  //   this.selectedDepartments = [];

  // }

  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data = data.map(item => ({
      companyName: item.companyName, companyType: item.companyType?.companyTypeName, companyHOD: item.designationRoles.roleName
    }));
    this.exportExcelService.exportAsExcelFile(data, 'Company', 'Company');
  }

  //Open Modal Pop-up to Importdata
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data: { modalTitle: "Import Company Master", columncheck: "Type1", tablename: "tblCompany", columname: "companyName" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
  Updatedata(id) {
    this.router.navigateByUrl('/administration/addcompany?id=' + id)
  }
  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data = data.map(item => ({
        companyName: item.companyName, companyType: item.companyType?.companyTypeName, email: item.email, postcode: item.postcode, address: item.postcode
      }));
    }
    else {
      data = [{ companyName: '', companyType: '', email: '', postcode: '', address: '' }];
    }
    this.exportExcelService.LoadSheet(data, 'CompanyLoadSheet', 'Company Load Sheet',3);
  }

}
