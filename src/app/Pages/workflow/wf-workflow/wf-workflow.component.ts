import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { WorkflowService } from 'src/app/services/workflow.service';

declare let Swal, $: any;
@Component({
  selector: 'app-wf-workflow',
  templateUrl: './wf-workflow.component.html',
  styleUrls: ['./wf-workflow.component.css']
})
export class WfWorkflowComponent implements OnInit {
  WorkFlowForm: FormGroup; flag; pkey: number = 0;
  WorkFlowStateForm: FormGroup; flagsate; pkeystate: number = 0;
  dataSource = new MatTableDataSource<any>();
  dataSourceQueueState =new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  selectionQS = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator ;paginatorQS: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  grouplist: any;
  deletetooltip: string;
  selectedIndex: any;
  selectedIndexQueueState:any;
  displayedColumns: string[] = ['checkbox', 'workQueueName','edit'];
  displayedQueueStateColumns: string[] = ['checkbox','WorkQueueStateName','SiteType','StateType'];
  workqueueId: any;
  

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private swal: SwalToastService,
    private exportExcelService: ExportExcelService,
    private workflowservice : WorkflowService) { }

  ngOnInit(): void {
    this.WorkFlowForm = this.fb.group({
      workFlowId: [0],
      workQueueName: ['', [Validators.required]],
      groupId: ['', [Validators.required]],
  
    });

    this.WorkFlowStateForm = this.fb.group({
      workQueueStateId: [0],
      workQueueStateName: ['', [Validators.required]],
      siteType: ['', [Validators.required]],
      stateType: ['', [Validators.required]],
      workFlowId: ['', [Validators.required]],
  
    });
    this.loadWorkQueueData(0);
    this.LoadGroup();
  }

  LoadGroup() {
    this.workflowservice.getWFGroup(0)
      .subscribe(response => {
        this.grouplist = response.data;

      })
  }

  openModalWorkQueue(){
    this.WorkFlowForm.reset();
    this.WorkFlowForm.controls.workFlowId.setValue(0);
    this.WorkFlowForm.controls.workQueueName.setValue('');
    this.WorkFlowForm.controls.groupId.setValue('');
    $("#addModalWQ").modal('show');
  }

  closeModalWorkQueue(){
    this.WorkFlowForm.reset();
    this.WorkFlowForm.controls.workFlowId.setValue(0);
    this.WorkFlowForm.controls.workQueueName.setValue('');
    this.WorkFlowForm.controls.groupId.setValue('');
    this.selectedIndex = null;
    $("#addModalWQ").modal('hide');
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

  onSubmit(form: any) {
    
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.workflowservice.addWorkFlow(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {

          this.swal.success('Added successfully.');
           this.loadWorkQueueData(0);
           this.closeModalWorkQueue();
        }
        else if (data.message == "updated") {

          this.swal.success('Data has been updated successfully.');
            this.loadWorkQueueData(0);
           this.closeModalWorkQueue();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
            this.loadWorkQueueData(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
            this.loadWorkQueueData(0);
        }
        else {

        }

      });
  }

  loadWorkQueueData(status: number) {
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

    this.workflowservice.getWorkFlow(status)
      .subscribe(response => {
debugger
        this.flag = status;

        this.dataSource.data = response.data;       
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      
      });
  }

  UpdateWorkQueue(id){
    this.selectedIndex = id;
    $("#addModalWQ").modal('show');
    this.workflowservice.getWorkFlowById(id)
      .subscribe((response) => {
        
        if (response.status) {

          this.WorkFlowForm.patchValue(response.data);

        }
      },
        (error) => {

        });
  }

  DeleteWQData(){
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
          this.workflowservice.archiveWorkFlow(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.loadWorkQueueData(this.flag);
          })

        }
      })

    } else {
      this.swal.info('Select at least one row')
    }
  }

  //#region WorkState

  GetIdinWorkState(workqueueId){

    this.workqueueId = workqueueId;    
    this.loadWorkQueueState(this.workqueueId);
  }

  isAllSelectedQS() {
    const numSelected = this.selectionQS.selected.length;
    const numRows = !!this.dataSourceQueueState && this.dataSourceQueueState.data.length;
    return numSelected === numRows;
  }

  masterToggleQS() {
    this.isAllSelectedQS() ? this.selectionQS.clear() : this.dataSourceQueueState.data.forEach(r => this.selectionQS.select(r));
  }
  checkboxLabelQS(row: any): string {
    
    if (!row) {
      return `${this.isAllSelectedQS() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionQS.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }



  openModalWorkQueueState(){

    if(this.workqueueId != null){
      this.WorkFlowStateForm.reset();
      this.WorkFlowStateForm.controls.workQueueStateId.setValue(0);
      this.WorkFlowStateForm.controls.workQueueStateName.setValue('');
      this.WorkFlowStateForm.controls.siteType.setValue('');
      this.WorkFlowStateForm.controls.stateType.setValue('');
      this.WorkFlowStateForm.controls.workFlowId.setValue(this.workqueueId);
      $("#addModalWQS").modal('show');
    }
    else{
      this.swal.error('Please select work queue name.');
    }
   
  }

  closeModalWorkState(){
    this.WorkFlowStateForm.reset();
    this.WorkFlowStateForm.controls.workQueueStateId.setValue(0);
    this.WorkFlowStateForm.controls.workQueueStateName.setValue('');
    this.WorkFlowStateForm.controls.siteType.setValue('');
    this.WorkFlowStateForm.controls.stateType.setValue('');
    this.WorkFlowStateForm.controls.workFlowId.setValue(this.workqueueId);
    $("#addModalWQS").modal('hide');
  }

  onSubmitFlowState(form: any)
  {
    debugger
  const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.workflowservice.addWorkQueueState(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {

          this.swal.success('Added successfully.');
           this.loadWorkQueueState(this.workqueueId);
           this.closeModalWorkState();
        }
        else if (data.message == "updated") {

          this.swal.success('Data has been updated successfully.');
            this.loadWorkQueueState(this.workqueueId);
           this.closeModalWorkState();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
            this.loadWorkQueueState(this.workqueueId);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
            this.loadWorkQueueState(this.workqueueId);
        }
        else {

        }

      });
}

loadWorkQueueState(id) {


  this.workflowservice.getWorkQueueState(id)
    .subscribe(response => {
debugger
    
      this.dataSourceQueueState.data = response.data;       
      this.dataSourceQueueState.sort = this.sort;
      this.dataSourceQueueState.paginator = this.paginatorQS;
    
    });
}

UpdateWorkQueueState(id){
  this.selectedIndexQueueState = id;
  $("#addModalWQS").modal('show');
  this.workflowservice.getWorkQueueStateId(id)
    .subscribe((response) => {
      
      if (response.status) {

        this.WorkFlowStateForm.patchValue(response.data);

      }
    },
      (error) => {

      });
}

DeleteWQSData(){
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
  const numSelected = this.selectionQS.selected;
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
        this.workflowservice.archiveWorkQueueState(numSelected).subscribe(result => {
          this.selectionQS.clear();
          this.swal.success(message);
          this.loadWorkQueueState(this.workqueueId);
        })

      }
    })

  } else {
    this.swal.info('Select at least one row')
  }
}
  //#endregion

}
