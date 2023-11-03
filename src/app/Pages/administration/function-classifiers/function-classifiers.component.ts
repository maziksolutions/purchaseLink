import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { Router } from '@angular/router';
import { UserManagementService } from 'src/app/services/user-management.service';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
declare let  Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-function-classifiers',
  templateUrl: './function-classifiers.component.html',
  styleUrls: ['./function-classifiers.component.css']
})
export class FunctionClassifiersComponent implements OnInit {
  functionClassifrm: FormGroup; flag;pkey : number=0;  modalTitle: string; tablename: string;
  displayedColumns: string[] = ['checkbox','functionDescription','functionCode'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('searchInput') searchInput: ElementRef;
  rights:RightsModel;
  deletetooltip:any;
  selection = new SelectionModel < any > (true, []);  
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(private fb: FormBuilder,public dialog: MatDialog,   private snackBar: MatSnackBar,
    private unitmasterService: UnitmasterService, private exportExcelService: ExportExcelService,private swal: SwalToastService,
    private router: Router, private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.functionClassifrm = this.fb.group({
      functionClassifierId :[0],
      functionDescription: ['', [Validators.required]],
      functionCode: ['', [Validators.required]]
    });
    this.loadRights();
    this.loaddata(0);
  }
  get fm() { return this.functionClassifrm.controls };

  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.functionClassifier).subscribe((response)=>{
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

  loaddata(status: number){
    if(status==1)
    {
      this.deletetooltip ='UnArchive';
      if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
    (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
    (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash","text-danger");
    }
  }
    else
    {
      this.deletetooltip ='Archive';
      if((document.querySelector('.fa-trash-restore') as HTMLElement)!=null)
      {
      (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash","text-danger");
      (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore","text-primary");
    }
  }

    this.unitmasterService.GetFunctionClassifier(status)
    .subscribe(response => {
      this.flag = status;
      this.dataSource.data = response.data;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  onSubmit(form: any){  
    this.unitmasterService.addFunctionClassifier(form.value)
    .subscribe(data => {
      
     if(data.message =="data added")
     {
      this.swal.success('Added successfully.');
      this.clear();
     this.loaddata(0);
     }
     else if(data.message == "updated")
     {
      this.swal.success('Data has been updated successfully.');
      this.clear();
      this.loaddata(0);
     }
     else if(data.message == "duplicate")
     {      
      this.swal.info('Data already exist. Please enter new data');
      this.loaddata(0);
     }
     else if(data.message == "not found")
     {     
      this.swal.info('Data exist not exist');
      this.loaddata(0);
     }
     else{

     }     
    });
  }
  resetform(){
    this.functionClassifrm.reset();
    this.fm.functionClassifierId.setValue(0);
  }
  openModal() {   
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import FunctionClassifier Data",tablename:"tblFunctionClassifiers",columname:"FunctionDescription",columname1:"FunctionCode"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loaddata(this.flag)
      }
    });
  }

  OnDelete(id)
  {
    if (confirm('Are you sure to change status of this record ?') === true) {
      this.unitmasterService.DeleteFunctionClassifier(id).subscribe(x => {
        this.unitmasterService.getFunctionClassifierbyid(0);
        this.loaddata(this.flag);
      });
    }
  }

  Updatedata(id)
  {
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse"); 
    (document.getElementById('collapse1') as HTMLElement).classList.add("show"); 
    this.unitmasterService.getFunctionClassifierbyid(id)
    .subscribe((response) => {
      if (response.status) {
        this.functionClassifrm.patchValue(response.data);
        this.pkey = response.data.functionClassifierId;
      }
    },
      (error) => {
    
      }); 
  }

  DeleteData() {  
    var message=""
    var title="";
    
if(this.flag==1)
{
message="Un-archived successfully.";
title="you want to un-archive data."
}
else
{
  message="Archived successfully.";
  title="you want to archive data."

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
      }).then((result)=>{
        if (result.value){
          this.unitmasterService.deleteFunctionClassifierData(numSelected).subscribe(result => {     
            this.selection.clear();            
              this.loaddata(this.flag);  
              this.swal.success(message);
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

showMessage(msg: string,type:string='') {
  this.snackBar.open(msg, '', {
    duration: 1500,   
    panelClass:type=='danger'? ['red-snackbar']:['blue-snackbar']
  });
}

  clear()
  {
    this.functionClassifrm.reset();
    this.functionClassifrm.controls.functionClassifierId.setValue(0);
    (document.getElementById('abc') as HTMLElement).focus();
  }
  close()
{    
  this.functionClassifrm.reset();
  this.functionClassifrm.controls.functionClassifierId.setValue(0);
  (document.getElementById('collapse1') as HTMLElement).classList.add("collapse"); 
  (document.getElementById('collapse1') as HTMLElement).classList.remove("show");     
}

generateExcel() {
  if (this.dataSource.data.length == 0)
  this.swal.info('No data to Export');
  else
    this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
}
exportAsXLSX(data: any[]): void {
  data.forEach((item)=>{     
    delete item.functionClassifierId,
    delete item.recDate,delete item.isDeleted,delete item.modifiedBy, delete item.modifiedDate,delete item.createdBy
  })
  this.exportExcelService.exportAsExcelFile(data, 'FunctionClassifiers','FunctionClassifiers Master');
}

exportLoadSheet() {
  var data;
  const numSelected = this.selection.selected;
  if (numSelected.length > 0) {
    data = numSelected;
    data.forEach((item) => {
      delete item.functionClassifierId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
  }
  else
    data = [{ functionDescription: '', functionCode: '' }];
  this.exportExcelService.LoadSheet(data, 'FunctionDescriptionLoadSheet', 'functionDescription Load Sheet',2);
}
}
