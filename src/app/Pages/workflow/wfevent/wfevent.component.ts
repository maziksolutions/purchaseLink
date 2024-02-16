import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { WorkflowService } from 'src/app/services/workflow.service';

declare let Swal, $: any;
@Component({
  selector: 'app-wfevent',
  templateUrl: './wfevent.component.html',
  styleUrls: ['./wfevent.component.css']
})
export class WfeventComponent implements OnInit {
  EventForm: FormGroup; flag; pkey: number = 0;

  pages: any;
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: string;
  selectedIndex: any;
  displayedColumns: string[] = ['checkbox', 'description','tableName','page'];
  Allcompany: any;
  selectCompanyId: any;


  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private pageService: UnitmasterService,
    private swal: SwalToastService,
    private exportExcelService: ExportExcelService,
    private workflowservice : WorkflowService,
    private userManagementService : UserManagementService)  { }

  ngOnInit(): void {

    this.EventForm = this.fb.group({
      eventId: [0],
      description: ['', [Validators.required]],
      tableName: ['', [Validators.required]],
      pageId: ['', [Validators.required]],
      companyId:['0'],
    });

    this.loadCompany();
    this.loadData(0);
    this.LoadPage();
    
    

  }

  //#region Work Flow Event 

  LoadPage() {
    this.pageService.getRequisitionPages(0)
      .subscribe(response => {
        this.pages = response.data;
      })
  }

  loadCompany(){
    this.userManagementService.getAllCompanies(0)
    .subscribe(response => {
      this.Allcompany = response.data;
  
    })  
  }

  filterCompany(event){

  this.selectCompanyId =event.target.value;
  this.workflowservice.getEventByCompany(this.selectCompanyId)
  .subscribe(response => {
    this.dataSource.data = response.data;       
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    $("#collapse1").collapse('hide');
  })  


  }

  clear() {
    if(this.selectCompanyId == '0' || this.selectCompanyId == '' || this.selectCompanyId == undefined){
      this.swal.error('Please select company');
    }
    else{
      this.EventForm.reset();
      this.EventForm.controls.eventId.setValue(0);
      this.EventForm.controls.description.setValue('');
      this.EventForm.controls.tableName.setValue('');
      this.EventForm.controls.pageId.setValue('');
      this.EventForm.controls.companyId.setValue(this.selectCompanyId);
      (document.getElementById('abc') as HTMLElement).focus();
      $("#collapse1").collapse('show');
    }
    
  }

  Cancel(){
    this.EventForm.reset();
    this.EventForm.controls.eventId.setValue(0);
    this.EventForm.controls.description.setValue('');
    this.EventForm.controls.tableName.setValue('');
    this.EventForm.controls.pageId.setValue('');
    this.EventForm.controls.companyId.setValue(this.selectCompanyId);
    (document.getElementById('abc') as HTMLElement).focus();
    $("#collapse1").collapse('hide');
  }


  onSubmit(form: any) {
    
    form.value.companyId = this.selectCompanyId;

    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.workflowservice.addWFEvent(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.loadData(0);
           this.Cancel();
           this.EventForm.controls.companyId.setValue('0');
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          //  this.loadData(0);
          location.reload();
           this.Cancel();
           this.EventForm.controls.companyId.setValue('0');

        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data'); 
          this.loadData(0);
           this.EventForm.controls.companyId.setValue('0');
        }
        else if (data.message == "not found") {  
          this.swal.info('Data exist not exist');    
           this.loadData(0);
           this.EventForm.controls.companyId.setValue('0');
          
        }
        else {

        }

      });
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
  checkboxLabel(row: any): string {
    
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
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

    this.workflowservice.getWFEvent(status)
      .subscribe(response => {

        this.flag = status;

        this.dataSource.data = response.data;       
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
       
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
          this.workflowservice.archiveWFEvent(numSelected).subscribe(result => {
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

  Updatedata(id) {

    this.selectedIndex = id;
    if(this.selectCompanyId == '0' || this.selectCompanyId == '' || this.selectCompanyId == undefined){
      this.swal.error('Please select company');
    }
else{
    this.workflowservice.getWFEventById(id)
      .subscribe((response) => {
        if (response.status) {
          this.EventForm.patchValue(response.data);
          $("#collapse1").collapse('show');
        }
      },
        (error) => {

        });
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
      delete item.eventId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy,
        delete item.pageId
           
        item.pageMaster = item.pageMaster.page
    })
   this.exportExcelService.exportAsExcelFile(data, 'WorkFlowEvent', 'Work Flow Event');
  }

//#endregion

}
