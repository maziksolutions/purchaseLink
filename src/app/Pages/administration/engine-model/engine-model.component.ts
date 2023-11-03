import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { administrationNavEnum } from '../../Shared/rights-enum';
declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-engine-model',
  templateUrl: './engine-model.component.html',
  styleUrls: ['./engine-model.component.css']
})
export class EngineModelComponent implements OnInit {
  status: number = 0;
  engineTypes:any;
  engineSubTypes:any;
  rights:RightsModel;
  deletetooltip:any;
  searchForm: FormGroup;
  pageSize = 20;  currentPage = 0;page: number = 1; 
  pageTotal: any;
  pageEvent: PageEvent;
  pageSizeOptions: number[] = [20, 40, 60, 100];
  engineModelForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'model','maker','mobileNo','postCode','street','engineTypeId','engineSubTypeId'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService, private userManagementService: UserManagementService,private router:Router,private swal: SwalToastService,private vesselManagementService:VesselManagementService) { }

  ngOnInit(): void {
    this.engineModelForm = this.fb.group({
      engineModelId:[0],
      engineTypeId:['', [Validators.required]],
      engineSubTypeId:[0, [Validators.required]],
      model: ['', [Validators.required]],
      maker: ['',[Validators.required]],
      street: ['',[Validators.required]],
      postCode: ['',[Validators.required]],
      mobileNo: ['',[Validators.required]]
    });
    this.searchForm = this.fb.group({
      pageNumber:[''],
      pageSize:[this.pageSize],
      status: ['0'],
      keyword: ['']
    });
    this.loadRights();
    this.loadData(0);
    this.loadEngineTypes();
    this.loadEngineSubTypes();
  }
  get fm() { return this.engineModelForm.controls };
  get sfm() { return this.searchForm.controls };
  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.engineModel).subscribe((response)=>{
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
    this.sfm.pageNumber.setValue(this.currentPage );
    this.sfm.pageSize.setValue(this.pageSize )
    this.vesselManagementService.getEngineModels(this.searchForm.value)
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
  loadEngineTypes() {
    this.vesselManagementService.getEngineTypes(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.engineTypes = response.data;
        } else {
          this.engineTypes = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadEngineSubTypes() {
    this.vesselManagementService.getEngineSubTypess(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.engineSubTypes = response.data;
        } else {
          this.engineSubTypes = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  onSubmit(form: any) {
    this.vesselManagementService.addEngineModel(form.value)
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
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.vesselManagementService.getEngineModelById(id)
      .subscribe((response) => {
        if (response.status) {
          this.engineModelForm.patchValue(response.data);
          this.pkey = response.data.engineModelId;

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
          this.vesselManagementService.archiveEngineModel(numSelected).subscribe(result => {
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
    this.page = 1; this.currentPage = 0;
    this.loadData(0);
    this.pageChanged(this.pageEvent);
  }
  clearSearchInput(){
    this.sfm.keyword.setValue('');
    this.applyFilter()
 }
  pageChanged(event: PageEvent) {
    if(event == undefined)
    {

    }
    else{
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData(0);
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
  checkboxLabel(row: any): string {
    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  clear() {
    this.engineModelForm.reset();
    this.engineModelForm.controls.engineModelId.setValue(0);
    this.engineModelForm.controls.engineTypeId.setValue('');
    this.engineModelForm.controls.engineSubTypeId.setValue('');
    (document.getElementById('abc') as HTMLElement).focus();
  }

 
  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.engineTypeId,delete item.engineSubTypeId,item.engineModelId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Engine Model', 'Engine Model');
  }
  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data=data.map(item=>({
        model: item.model,maker:item.maker,street:item.street,postCode:item.postCode,mobileNo:item.mobileNo, engineType:item.engineType?.engineTypeName,engineSubType:item.engineSubTypes?.subType
       })); 
    }
    else
      data = [{ model: '',maker:'',street:'',postCode:'',mobileNo:'', engineType:'',engineSubType:''}];
    this.exportExcelService.LoadSheet(data, 'EngineModelLoadSheet', 'Engine Model Load Sheet',3);
  }

  close() {
    this.engineModelForm.reset();
    this.engineModelForm.controls.engineModelId.setValue(0);
    this.engineModelForm.controls.engineTypeId.setValue('');
    this.engineModelForm.controls.engineSubTypeId.setValue('');
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }

  openModal() {   
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Engine Model",columncheck:"Type1", tablename:"tblEngineModel",columname:"Model"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadData(this.flag);
      }
    });
  }
}
