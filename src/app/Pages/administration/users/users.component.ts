import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
import { ActivatedRoute, Router } from '@angular/router';
declare let Swal, PerfectScrollbar: any;declare var $: any;
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  userForm: FormGroup; flag; pkey: number = 0;
  @ViewChild('searchInput') searchInput: ElementRef;
  displayedColumns: string[] = ['checkbox', 'photo','firstName','userName','userCode','companyId','site','lineManagerId','passwordChange'];
  selectedAccess: string[] = ['PMS', 'Crewlink','Purchase','Administration',' QSHE',];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  companies:any;
  status: number = 0;
  PhotoFile: File;
  isActive:boolean;
  pms:boolean;
  deletetooltip:any;
  crewlink:boolean;
  private selectedAccessModules: any[] = [];
  uploadPhoto: string = "Choose Image";
  photoName: string = '';
  lineManagers:any;
  backUpPersons:any;
  rights:RightsModel;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  userId: any;
  Id: any;
  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService,private route: ActivatedRoute,
     private userManagementService: UserManagementService, 
    private swal: SwalToastService ,private router:Router) { }

  ngOnInit(): void {
    this.userId =this.route.snapshot.paramMap.get('id');
    this.route.params.subscribe(params => {this.Id = params['id']; });


    this.userForm = this.fb.group({
      userId: [0],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      password: [''],    //  Auto generated(Hashed Password), later usrer'll change
      userCode: ['', [Validators.required]],   // //  User Input (3 letter code)
      companyId: ['0', [Validators.required]],
      site: ['0', [Validators.required]],
      dOB: ['', [Validators.required]],
      joiningDate: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required]],
      photo: [''],
      moduleAccess: ['', [Validators.required]],    // PMS, Crewlink, Purchase etc. (Comma separate data save)
      lineManagerId: ['0'],
      backUpPersonId: ['0'],
      // token: ['0'],
      // refreshToken: ['0'],
      // refreshTokenExpiryTime: ['0'],
      isActive: [''],
      activeDate: ['']
     });
     this.loadRights();
     this.loadData(0);
     this.loadCompany();
  }
  get fm() { return this.userForm.controls };

  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.users).subscribe((response)=>{
if(response.status){
this.rights=response.data;
console.log(response.data);
}else{
  this.rights=new RightsModel(); 
  this.rights.addRight=this.rights.ammendRight=this.rights.deleteRight=this.rights.importRight=this.rights.viewRight=false;
}
if(!this.rights.viewRight){
  alert('you have no view right')
 // this.router.navigate(['welcome']);
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
    if(this.Id>0)
    {
    this.userManagementService.getLineManagers(status)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
      $('#txtSearch').val(localStorage.getItem('searchCompany'));      
      this.applyFilter(localStorage.getItem('searchCompany') as string);
    }
    else
    {
      this.userManagementService.getLineManagers(status)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    }
  }

  loadCompany(){
    this.userManagementService.getCompany(this.status)
    .subscribe((response) => {
      if (response.status) {
        this.companies = response.data;       
    }else {
        this.companies = [];
      }
    },
      (error) => {
        console.log(error);
      })
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
          this.userManagementService.archiveUser(numSelected).subscribe(result => {
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
    localStorage.setItem('searchCompany',filterValue)
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  clearSearchInput(){
    this.searchInput.nativeElement.value ='';
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
      delete item.userId,delete item.companyId,delete item.password,delete item.lineManagerId,delete item.backUpPersonId,delete item.token,delete item.refreshToken,
      delete item.refreshTokenExpiryTime, delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'User', 'User');
  }
  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.userId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else {
      data = [{firstName : '' }];
    }
    this.exportExcelService.LoadSheet(data, 'UserLoadSheet', 'User Load Sheet',1);
  }

  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import User",tablename:"tblUser",columname:"firstName"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
  close() {
    this.userForm.reset();
    this.userForm.controls.userId.setValue(0);
    this.userForm.controls.companyId.setValue(0);
    this.userForm.controls.lineManagerId.setValue(0);
    this.userForm.controls.backUpPersonId.setValue(0);
    this.selectedAccessModules = [];
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

  clear() {
    this.userForm.reset();
    this.userForm.controls.userId.setValue(0);
    this.userForm.controls.companyId.setValue(0);
    this.userForm.controls.lineManagerId.setValue(0);
    this.userForm.controls.backUpPersonId.setValue(0);
    this.selectedAccessModules = [];
  }
  onPhotoSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.PhotoFile = file;
      this.photoName = file.name;
      this.fm.companyLogo.setValue(file.name);
      this.uploadPhoto=file.name;      
    } 
    else
    {
      this.uploadPhoto = "Choose Company Logo";
    }
  }
  isActiveCheck(e:any){
    let checked = e.target.checked;
    let date = Date.now();
    if(checked){
      this.fm.isActive.setValue(true)
    }
    else{
      this.fm.isActive.setValue(false)
      this.fm.activeDate.setValue(date)
    }
  }


  updateCheckbox(event:any) {
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
    const arrFiltered = this.selectedAccessModules.filter(el => { return el != null && el != '';});
    this.selectedAccessModules = Array.from(new Set(arrFiltered)); //remove duplicate array
  }
  getChecked(item: string) {
    let index = this.selectedAccessModules.findIndex(x => x == item);
    if (index != -1) {
      return true;
    }
  }
  Updatedata(id) {
    // (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    // (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.userManagementService.getUserById(id)
      .subscribe((response) => {
        if (response.status) {
          if(response.data.moduleAccess !=null)
          this.selectedAccessModules = response.data.moduleAccess.split(',')
        
           else
           this.selectedAccessModules=[];
          this.userForm.patchValue(response.data);
          this.pkey = response.data.userId;

        }
      },
        (error) => {

        });
  }

  resetpassword(id){   
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to reset Password',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.userManagementService.resetPassword(id)
          .subscribe((response) => {
            if (response.status) { 
                          
               this.loadData(0);
            }
          },
            (error) => {
              console.log(error);
            })
      }
    })      
  }




}
