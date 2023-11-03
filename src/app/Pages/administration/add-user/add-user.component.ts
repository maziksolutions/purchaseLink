import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
//import {MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { moveCursor } from 'readline';
declare let Swal, PerfectScrollbar: any;
import { PrincipalListTree, ExampleFlatNode } from 'src/app/Pages/Models/response-model';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import { CompressImageService } from 'src/app/services/compress-image.service';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  userForm: FormGroup;
  userMapForm: FormGroup;
  userVesselForm: FormGroup;
  flag;

  operatingVessels: any[] = [];
  submitted = false;
  submittedForUserMAp = false;
  displayedColumns: string[] = ['checkbox', 'departmentName', 'roleName', 'companyName'];
  selectedAccess: string[] = ['PMS', 'Crewlink', 'Purchase', 'Administration', ' QHSE',];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  companies: any;
  moduleAccessByComp: any[] = [];
  companyModuleAccess: any;
  status: number = 0;
  PhotoFile: File;
  moduleAccessId: any;
  isActive: boolean;
  pms: boolean;
  crewlink: boolean;
  private selectedAccessModules: any[] = [];
  uploadPhoto: string = "Choose Image";
  photoName: string = '';
  lineManagers: any;
  backUpPersons: any;
  UserId: any;
  departments: any;
  companyDepartments: any;
  designations: any;
  userName: any;
  mAcess: any;
  rights:RightsModel;
  deletetooltip:any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  companyId: any;
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  oldAccessRight: any;
  @ViewChild('searchInput') searchInput: ElementRef;
  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService, private compressImage: CompressImageService,
    private userManagementService: UserManagementService,
    private swal: SwalToastService, private router: Router, private route: ActivatedRoute, private datePicker: MatDatepickerModule) {

  }

  ngOnInit(): void {
    this.UserId = this.route.snapshot.paramMap.get('id');
    this.userForm = this.fb.group({
      userId: [0],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      password: [''],    //  Auto generated(Hashed Password), later usrer'll change
      userCode: ['', [Validators.required]],   // //  User Input (3 letter code)
      companyId: ['', [Validators.required]],
      site: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      joiningDate: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required]],
      photo: [''],
      moduleAccess: [''],    // PMS, Crewlink, Purchase etc. (Comma separate data save)
      lineManagerId: ['0'],
      backUpPersonId: ['0'],
      designation: [''],
      accessRights: ['Role Based'],
      token: ['0'],
      // refreshToken: ['0'],
      refreshTokenExpiryTime: [''],
    });

    this.userMapForm = this.fb.group({
      userRoleId: [0],
      companyId: ['0'],
      userId: ['0'],
      departmentId: ['', [Validators.required]],
      roleId: ['', [Validators.required]]
    });

    this.userVesselForm = this.fb.group({
      UserVesselId: [0],
      userId: ['0'],
      vessels: ['']
    });
    this.loadCompany();   
    this.loadDepartment();
    this.loadDesignationRoles();   
    this.loadLinemanagers();
    this.loadRights();  
    this.onChangeCompany();
    if (parseInt(this.UserId) > 0) {
      this.Updatedata(this.UserId);
      this.loadData(0);
    }
    this.loadPrincipalListTree();
    this.GetUserVessels();
  }
  get fm() { return this.userForm.controls };
  get umfm() { return this.userMapForm.controls };
  
  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.users).subscribe((response)=>{
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
    this.userManagementService.getUserRole(status, this.UserId)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });


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

  loadCompany() {
    this.userManagementService.getAllCompanies(this.status)
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
  loadDepartment() {
    this.userManagementService.getDepartment(this.status)
      .subscribe((response) => {
        
        if (response.status) {
          this.departments = response.data;
          (document.getElementById('abc') as HTMLElement).focus();
        } else {
          this.departments = [];
          (document.getElementById('abc') as HTMLElement).focus();
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadDesignationRoles() {
    this.userManagementService.getDesignationRole(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.designations = response.data;
        } else {
          this.designations = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadLinemanagers() {
    this.userManagementService.getLineManagers(this.status)
      .subscribe(response => {
        if (response.status) {
          this.lineManagers = response.data.filter(x => x.userId != this.UserId);
          this.backUpPersons = response.data.filter(x => x.userId != this.UserId);
        } else {
          this.lineManagers = [];
          this.backUpPersons = [];
        }
        // this.flag = status;
      });
  }

  onPhotoSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.compressImage.compress(file)
        .pipe().subscribe(compressedImage => {
          this.PhotoFile = compressedImage;
          this.photoName = file.name;
          this.fm.photo.setValue(file.name);
          this.uploadPhoto = file.name;
          // now you can do upload the compressed image 
        })
    }
    else {
      this.uploadPhoto = "Choose User Photo";
    }
  }
  updateCheckbox(event: any) {
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
  getChecked(item: string) {
    let index = this.selectedAccessModules.findIndex(x => x == item);
    if (index != -1) {
      return true;
    }
    else {
      return false;
    }
  }

  onSubmit(form: any) {
    this.submitted = true;
    if (this.userForm.valid == false) {
      this.swal.error('Please enter data in required fields.')

      return;
    }
    this.fm.password.setValue("AAA");
    this.fm.moduleAccess.setValue(this.selectedAccessModules.join(','));
    const formData = new FormData();
    if (this.PhotoFile != null) {
      formData.append('photofile', this.PhotoFile, this.PhotoFile.name);
    }
    if (this.fm.accessRights.value == 'Role Based' && this.oldAccessRight=='User Based') {
      Swal.fire({
        title: 'Do you want to change access rights? It will remove all user specific rights of this user & role based access rights will be applicable. Please confirm if you want to proceed!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((response) => {
        if (response.value) {
          this.fm.accessRights.setValue('Role Based')
          formData.append('data', JSON.stringify(this.userForm.value));
          this.userManagementService.addUser(formData)
            .subscribe(data => {
              if (data.message == "data added") {
                this.swal.success('Added successfully.');
                this.UserId = data.userId;
                this.companyId = this.userForm.controls.companyId.value;
                this.filterDepartment(this.companyId);
                this.onChangeCompany();
              }
              else if (data.message == "updated") {
                this.swal.success('Data has been updated successfully.');
                this.UserId = data.userId;
                this.companyId = this.userForm.controls.companyId.value;
                this.filterDepartment(this.companyId);
                this.onChangeCompany();
              }
              else if (data.message == "duplicate") {
                this.swal.info('Data already exist. Please enter new data');
              }
              else if (data.message == "not found") {
                this.swal.info('Data exist not exist');
              }
              else {
              }
            });
        }
      })

    }
    else{      
      formData.append('data', JSON.stringify(this.userForm.value));
      this.userManagementService.addUser(formData)
        .subscribe(data => {
          if (data.message == "data added") {
            this.swal.success('Added successfully.');
            this.UserId = data.userId;
            this.companyId = this.userForm.controls.companyId.value;
            this.filterDepartment(this.companyId);
            this.onChangeCompany();
          }
          else if (data.message == "updated") {
            this.swal.success('Data has been updated successfully.');
            this.UserId = data.userId;
            this.companyId = this.userForm.controls.companyId.value;
            this.filterDepartment(this.companyId);
            this.onChangeCompany();
          }
          else if (data.message == "duplicate") {
            this.swal.info('Data already exist. Please enter new data');
          }
          else if (data.message == "not found") {
            this.swal.info('Data exist not exist');
          }
          else {
          }
        });

    }

  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  UpdateUserRoledata(id) {
    (document.getElementById('collapse2') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse2') as HTMLElement).classList.add("show");
    this.userManagementService.getUserRoleById(id)
      .subscribe((response) => {
        if (response.status) {
          this.userMapForm.patchValue(response.data);

        }
      },
        (error) => {

        });
  }
  Updatedata(id) {
    this.userManagementService.getUserById(id)
      .subscribe((response) => {
        if (response.status) {
          this.companyId = response.data.companyId;
          if (response.data.moduleAccess != null) {
            this.selectedAccessModules = response.data.moduleAccess.split(',');

          }
          else
            this.selectedAccessModules = [];
          // this.fm.dob.setValue(response.data.dob.split('T')[0], 'dd-MM-yyyy');
          // this.fm.joiningDate.setValue(response.data.joiningDate.split('T')[0], 'dd-MM-yyyy');
        this.oldAccessRight=response.data['accessRights'];
          this.userForm.patchValue(response.data);

          this.filterDepartment(response.data.companyId);
          this.onChangeCompany();
        }
      },
        (error) => {

        });
  }
  close() {
    this.userForm.reset();
    this.userForm.controls.userId.setValue(0);
    this.userForm.controls.companyId.setValue(0);
    this.userForm.controls.lineManagerId.setValue(0);
    this.userForm.controls.backUpPersonId.setValue(0);
    this.selectedAccessModules = [];
    this.router.navigateByUrl('/administration/users/'+0);
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
          this.userManagementService.archiveUserRole(numSelected).subscribe(result => {
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

  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.userRoleId, delete item.userId, delete item.site
    })
    this.exportExcelService.exportAsExcelFile(data, 'User Role Mapping', 'User Role Mapping');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.userRoleId
      })
    }
    else {
      data = [{ Department: '', Role: '', Company: '' }];
    }
    this.exportExcelService.LoadSheet(data, 'UserRoleLoadSheet', 'User Role Load Sheet',3);
  }
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data: { modalTitle: "Import User Role", tablename: "tblUserRoleMapping" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }

  clear() {
    this.userMapForm.reset();
    this.userMapForm.controls.departmentId.setValue('');
    this.userMapForm.controls.companyId.setValue('');
    this.userMapForm.controls.userRoleId.setValue(0);
    this.userMapForm.controls.roleId.setValue('');
    this.selectedAccessModules = [];
  }

  closeUserRole() {
    this.userMapForm.reset();
    this.userMapForm.controls.userRoleId.setValue(0);
    this.userMapForm.controls.roleId.setValue('');
    this.userMapForm.controls.departmentId.setValue('');
    this.userMapForm.controls.companyId.setValue(0);
    (document.getElementById('collapse2') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse2') as HTMLElement).classList.remove("show");
  }

  onUserRoleSubmit() {
    this.submittedForUserMAp = true;
    if (this.UserId <= 0) {
      this.swal.error('Please add User first.');
    }
    if (this.userMapForm.valid == false) {
      this.swal.error('Please enter data in required fields.')

      return;
    }
    else {
      this.userMapForm.controls.userId.setValue(this.UserId);
      this.userManagementService.addUserRole(this.userMapForm.value)
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

  filterDepartment(companyId: any) {
    var departments = this.companies.filter(x => x.companyId == companyId)[0].departmentIds.split(',');
    this.companyDepartments = this.departments.filter(x => departments.indexOf(parseInt(x.departmentId).toString()) != -1);   
  }

  onChangeCompany() {

    if (this.fm.companyId.value == 0 || this.fm.companyId.value == null) {
      // console.log(this.selectedAccess)
      this.selectedAccess;
    }
    if (this.fm.companyId.value > 0) {

      var mAcess = this.companies.filter(x => x.companyId == this.fm.companyId.value)[0].moduleAccess;

      return this.selectedAccess = mAcess.split(',');
      // this.moduleAccessByComp.push(this.selectedAccess);
      // this.selectedAccess = this.moduleAccessByComp;    
    }
    //this.selectedAccess = this.companies.filter(x=> mAcess.indexOf(parseInt(x.moduleAccess).toString())!=-1);
    //return this.selectedAccess = (mAcess)[0].split(',');
    // return  this.selectedAccess=this.mAcess[this.fm.moduleAccess.value].mAcess.split(',');
  }

  //#region   Access rights
  // insert values in array
  updateOperatingVessels(event, vesselId: number) {
    let isChecked = event.target.checked;
    if (isChecked) {
      this.operatingVessels.push(vesselId);
    } else {
      let rindex = this.operatingVessels.findIndex(x => x.includes(vesselId));
      if (rindex != -1) {
        this.operatingVessels.splice(rindex, 1)
      }
    }
    this.operatingVessels = Array.from(new Set(this.operatingVessels)); //remove duplicate array 
  }

  //get data to make a documents list tree
  loadPrincipalListTree() {
    this.userManagementService.getPrincipalTree()
      .subscribe((data: PrincipalListTree[]) => {
        this.bindData(data);
      });
  }
  
  public dataSourceTree: any;

  bindData(data: any) {
    this.dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSourceTree.data = data;
  }

  private transformer = (node: PrincipalListTree, level: number) => {
    return {
      expandable: !!node.vesselTree && node.vesselTree.length > 0,
      principal: node.principal,
      vesselName: node.vesselName,
      vesselId: node.vesselId,
      level: level
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.vesselTree
  );
  //#endregion

  saveVesselMap() {
    this.userVesselForm.controls.userId.setValue(this.UserId);
    this.userVesselForm.controls.vessels.setValue(this.operatingVessels.join(',').toString());
    this.userManagementService.vesselMap(this.userVesselForm.value)
      .subscribe((response) => {
        if (response.message == "data added") {
          this.swal.success('Added successfully.');
          this.GetUserVessels();
        }
        else if (response.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.clear();
          this.loadData(0);
        }
      },
        (error) => {
          console.log(error);
        });
  }
  getVesselsChecked(vesselId: number) {

    let index = this.operatingVessels.findIndex(vessel => vessel == vesselId);
    if (index != -1) {
      return true;
    }
  }

  GetUserVessels() {
    this.userManagementService.getUserVessels(this.UserId)
      .subscribe((response) => {
        if (response.status) {

          this.operatingVessels = response.data['vessels'].split(',');
        } else {
          this.operatingVessels = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }

}
