import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
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
  selector: 'app-addcompany',
  templateUrl: './addcompany.component.html',
  styleUrls: ['./addcompany.component.css']
})
export class AddcompanyComponent implements OnInit {
  companyDepartmentMapForm: FormGroup; flag; pkey: number = 0;
  status: number = 0; companyForm: FormGroup;
  designationRoles: any;
  companyName: any;
  private selectedAccessModules: any[] = [];
  companyType: any;
  deletetooltip:any;
  departments: any;
  CompanyLogoFile: File;
  logoName: string = '';
  uploadlogo: string = "Choose Image";
  private selectedDepartments: any[] = [];
  CompanyId: any = 0;
  rights:RightsModel;
  selectedAccess: string[] = ['PMS', 'Crewlink', 'Purchase', 'Administration', ' QHSE',];
  displayedColumns: string[] = ['checkbox', 'departmentName', 'hod','site'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(private fb: FormBuilder, public dialog: MatDialog, private route: ActivatedRoute,
    private exportExcelService: ExportExcelService, private router: Router,
    private userManagementService: UserManagementService,
    private swal: SwalToastService) { }

  ngOnInit(): void {
    this.CompanyId =this.route.snapshot.paramMap.get('id');
    this.companyForm = this.fb.group({
      companyId: [0],
      companyName: ['', [Validators.required]],
      companyTypeId: ['', [Validators.required]],
      companyLogo: [''],
      companyHODID: ['', [Validators.required]],
      departmentIds: [''],
      address:[''],
      email:['', [Validators.email]],
      postcode:['', [Validators.required]],
      moduleAccess:[''],
    });
    this.companyDepartmentMapForm = this.fb.group({
      companyDepartmentId: [0],
      companyId: ['0'],
      departmentId: ['0'],
      hodRoleId: ['', [Validators.required]]
    });    
    // this.loadCompanies();
    this.loadRights();
    this.loadcompanyType();
    this.loadDepartments();
    this.loadDesignationRoles();   
    if (parseInt(this.CompanyId) > 0) {     
      this.UpdateCompanyData(this.CompanyId);
      this.loadData(0);
    }
  }
  get fm() { return this.companyDepartmentMapForm.controls };
  get fmCompany() { return this.companyForm.controls };

  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.company).subscribe((response)=>{
if(response.status){
this.rights=response.data;
}else{
  this.rights=new RightsModel(); 
  this.rights.addRight=this.rights.ammendRight=this.rights.deleteRight=this.rights.importRight=this.rights.viewRight=false;
}
if(!this.rights.viewRight){
  alert('you have no view right')
  this.router.navigate(['welcome']);
}
    },(error)=>{
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

    this.userManagementService.getCompanyDepartment(status,this.CompanyId)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  loadDesignationRoles() {
    this.userManagementService.getDesignationRole(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.designationRoles = response.data;
        } else {
          this.designationRoles = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
 
  loadDepartments() {
    this.userManagementService.getDepartment(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.departments = response.data;
        } else {
          this.departments = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }

  onSubmit() {
    if(this.CompanyId<=0)
    {
      this.swal.info('Please add company first, before adding department HOD.');
    }
    else
    {
    this.companyDepartmentMapForm.controls.companyId.setValue(this.CompanyId);
    
    this.userManagementService.addCompanyDepartment(this.companyDepartmentMapForm.value)
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
  }

  Updatedata(id) {
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.userManagementService.getCompanyDepartmentById(id)
      .subscribe((response) => {
        if (response.status) {
          this.companyDepartmentMapForm.patchValue(response.data);
          this.pkey = response.data.companyDepartmentId;

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
          this.userManagementService.archiveCompanyDepartment(numSelected).subscribe(result => {
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

  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }

  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.companyDepartmentId
    })
    this.exportExcelService.exportAsExcelFile(data, 'Company Department Mapping', 'Company Department Mapping');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.companyDepartmentId
      })
    }
    else {
      data = [{ Company: '', Department: '', HOD: '' }];
    }
    this.exportExcelService.LoadSheet(data, 'CompanyDepartmentLoadSheet', 'Company Department Load Sheet',3);
  }
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data: { modalTitle: "Import Company Department", tablename: "tblCompanyDepartmentMapping" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }

  close() {
    this.companyDepartmentMapForm.reset();
    this.companyDepartmentMapForm.controls.companyDepartmentId.setValue(0);
    this.companyDepartmentMapForm.controls.companyId.setValue(0);
    this.companyDepartmentMapForm.controls.departmentId.setValue(0);
    this.companyDepartmentMapForm.controls.hodRoleId.setValue('');
    // (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    // (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
    this.router.navigateByUrl('/administration/company/'+this.CompanyId);
  }
  clear() {
    this.companyDepartmentMapForm.reset();
    this.companyDepartmentMapForm.controls.companyDepartmentId.setValue(0);
    this.companyDepartmentMapForm.controls.companyId.setValue(0);
    this.companyDepartmentMapForm.controls.departmentId.setValue(0);
    this.companyDepartmentMapForm.controls.hodRoleId.setValue('');
  }

  updateModuleAccessCheckbox(event: any) {
    let isChecked = event.target.checked;

    if (isChecked) {
      this.selectedAccessModules.push(event.target.value);
    } else {
      let rindex = this.selectedAccessModules.findIndex(rank => rank == event.target.value);
      if (rindex != -1) {
        this.selectedAccessModules.splice(rindex, 1)
      }
    }
    //remove empty elements from array Like ="", null, ,,,,
    const arrFiltered = this.selectedAccessModules.filter(el => { return el != null && el != ''; });
    this.selectedAccessModules = Array.from(new Set(arrFiltered)); //remove duplicate array
  }

  getModuleAccessChecked(item: string) {
    let index = this.selectedAccessModules.findIndex(x => x == item);
    if (index != -1) {
      return true;
    }
    else {
      return false;
    }
  }

  //#region Add Company Details
  loadcompanyType() {
    this.userManagementService.getCompanyType(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.companyType = response.data;
          (document.getElementById('abc') as HTMLElement).focus();
        } else {
          this.companyType = [];
          (document.getElementById('abc') as HTMLElement).focus();
        }
      },
        (error) => {
          console.log(error);
        })
  }

  onCompanySubmit() {
    this.fmCompany.moduleAccess.setValue(this.selectedAccessModules.join(','));
    this.fmCompany.departmentIds.setValue(this.selectedDepartments.join(','));
    const formData = new FormData();
    if (this.CompanyLogoFile != null) {
      formData.append('imagefile', this.CompanyLogoFile, this.CompanyLogoFile.name);
    }
    formData.append('data', JSON.stringify(this.companyForm.value));
    this.userManagementService.addCompany(formData)
      .subscribe(data => {
        this.companyName=this.companyForm.controls.companyName.value;
        if (data.message == "data saved") {
          this.swal.success('Added successfully.');
          this.CompanyId=data.companyId;
        }

        else if (data.message == "data updated") {
          this.swal.success('Data has been updated successfully.');
          this.CompanyId=data.companyId;
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          // this.CompanyId=data.companyId;
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          // this.CompanyId=data.companyId;
        }
        else {
        }
      });
  }

  UpdateCompanyData(id) {
    this.userManagementService.getCompanyById(id)
      .subscribe((response) => {
        if (response.status) {
          if (response.data.departmentIds != null)
            this.selectedDepartments = response.data.departmentIds.split(',')
          else
            this.selectedDepartments = [];
            if (response.data.moduleAccess != null) {
              this.selectedAccessModules = response.data.moduleAccess.split(',');
  
            }
            else
            this.selectedAccessModules = [];
          if (response.data.companyLogo && response.data.companyLogo.indexOf('.') !== -1) {
            this.logoName = response.data.companyLogo.substring(
              response.data.companyLogo.lastIndexOf("/") + 1
            )
          } else {
            this.logoName = "Choose file";
          }
          this.companyForm.patchValue(response.data); 
         this.companyName =this.companyForm.controls.companyName.value;     
        }
      },
        (error) => {

        });
  }


  onLogoFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.CompanyLogoFile = file;
      this.logoName = file.name;
      this.fmCompany.companyLogo.setValue(file.name);
      this.uploadlogo = file.name
    }
    else {
      this.uploadlogo = "Choose Company Logo";
    }
  }

  getChecked(departmentId: number) {
    let index = this.selectedDepartments.findIndex(x => x == departmentId);
    if (index != -1) {
      return true;
    }
  }

  updateCheckbox(event: any) {
    let isChecked = event.target.checked;

    if (isChecked) {
      this.selectedDepartments.push(event.target.value);
    } else {
      let rindex = this.selectedDepartments.findIndex(rank => rank == event.target.value);
      if (rindex != -1) {
        this.selectedDepartments.splice(rindex, 1)
      }
    }
    //remove empty elements from array Like ="", null, ,,,,
    const arrFiltered = this.selectedDepartments.filter(el => { return el != null && el != ''; });
    this.selectedDepartments = Array.from(new Set(arrFiltered)); //remove duplicate array
  }
  //#endregion

}
