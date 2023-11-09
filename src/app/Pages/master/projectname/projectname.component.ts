import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseMasterService } from '../../../services/purchase-master.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
declare let Swal, PerfectScrollbar: any;
import {  SelectionModel} from '@angular/cdk/collections';
import { ViewChild } from '@angular/core';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { registerNavEnum, unitMasterNavEnum } from '../../Shared/rights-enum';
declare var $: any;

@Component({
  selector: 'app-projectname',
  templateUrl: './projectname.component.html',
  styleUrls: ['./projectname.component.css']
})
export class ProjectnameComponent implements OnInit {
  projectnameForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'projectname','projectcode','services','remarks'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  rights:RightsModel;  serviceTypes: any;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip:any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedIndex: any;

  selectprojectname: string[] = [];
  selectedserviceType: string[] = [];
  dropdownOrderTypeSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean;  tooltipField:string;};

  constructor(private fb: FormBuilder, public dialog: MatDialog, private exportExcelService: ExportExcelService,
    private purchasemasterService: PurchaseMasterService, private swal: SwalToastService,
    private router:Router,private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.projectnameForm = this.fb.group({
      projectNameId: [0],
      projectName: ['', [Validators.required]],
      projectCode:['', [Validators.required]],
      serviceTypeId: ['', [Validators.required]],
      remarks:['']
    });

    this.dropdownOrderTypeSetting = {
      singleSelection: false,
      idField: 'serviceTypeId',
      textField: 'serviceType',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: false,
      tooltipField:'description'
    };

    //this.projectnameForm.controls.directCompletion.setValue('');
    this.LoadServiceType();
    // this.loadRights();
    this.loadData(0);
  }
  get fm() { return this.projectnameForm.controls };
  LoadServiceType() {
    this.purchasemasterService.getServicetypes(0)
      .subscribe(response => {
        this.serviceTypes = response.data;
        
      })
  }

  onProjectNameSelect(event: any) {
    
    let isSelect = event.serviceTypeId;
    if (isSelect) {
      this.selectedserviceType.push(event.serviceTypeId);
       
    }
  }

  onProjectNameSelectAll(event: any) {
    if (event)
      this.selectedserviceType = event.map((x: { serviceTypeId: any; }) => x.serviceTypeId);
  }

  onProjectNameDeSelect(event: any) {
    let rindex = this.selectedserviceType.findIndex(serviceTypeId => serviceTypeId == event.serviceTypeId);
    if (rindex == -1) {
      this.selectedserviceType.splice(rindex, 1)
    }
  }

  onProjectNameDeSelectAll(event: any) {
    this.selectedserviceType.length = 0;
    // this.selectedCountries.splice(0, this.selectedCountries.length);
  }



  loadRights(){
    this.userManagementService.checkAccessRight(unitMasterNavEnum.jobGroup).subscribe((response)=>{
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
    this.purchasemasterService.getprojectname(status)
      .subscribe(response => {
        console.log(response.data)
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.clear();
          (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }
  onSubmit(form: any) {
  
    form.value.serviceTypeId = this.selectedserviceType.join(',');
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));
   
console.log(form.value)
    this.purchasemasterService.addProjectname(fmdata)  
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
    this.selectedIndex=id;
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.purchasemasterService.getProjectnameById(id)
      .subscribe((response) => {
        if (response.status) {

          var objProcR = [];
          this.selectprojectname = [];
          if (response.data.serviceTypeId != '' && response.data.serviceTypeId != null) {
            objProcR = response.data.serviceTypeId.split(',')
            this.selectedserviceType = response.data.serviceTypeId.split(',');

            objProcR.forEach((item) => {
              this.selectprojectname.push(this.serviceTypes.filter(x => x.serviceTypeId == item));
            })
            const merge4 = this.selectprojectname.flat(1);
            this.selectprojectname = merge4;
          }
          response.data.serviceTypeId = this.selectprojectname;
          this.projectnameForm.patchValue(response.data);
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
          this.purchasemasterService.archiveProjectname(numSelected).subscribe(result => {
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
  applyFilter(filterValue: string) {
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
  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {
    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  clear() {
    this.projectnameForm.reset();
    this.projectnameForm.controls.projectNameId.setValue(0);
    this.projectnameForm.controls.projectCode.setValue(''); 
    this.projectnameForm.controls.serviceTypeId.setValue('');     
    this.projectnameForm.controls.projectName.setValue('');    
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
      delete item.projectNameId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Maintenance Group', 'Maintenance Group');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.projectNameId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else
      data = [{ jobGroup: '', directCompletion : '' }];
    this.exportExcelService.LoadSheet(data, 'JobGroupLoadSheet', 'Maintenance Group Load Sheet',2);
  }

  close() {
    this.projectnameForm.reset();
    this.projectnameForm.controls.projectNameId.setValue(0);
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

    //Open Modal Pop-up to Importdata
    openModal() {   
      const dialogRef = this.dialog.open(ImportDataComponent, {
        width: '500px',
        data:{modalTitle: "Import Maintenance Group Master",tablename:"tblJobGroup",columname:"JobGroup"},
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'success') {
          this.loadData(this.flag);
        }
      });
    }    
}