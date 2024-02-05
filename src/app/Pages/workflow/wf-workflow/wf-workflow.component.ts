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
import { WorkflowService } from 'src/app/services/workflow.service';
import { filter } from 'rxjs/operators';

declare let Swal, $: any;
@Component({
  selector: 'app-wf-workflow',
  templateUrl: './wf-workflow.component.html',
  styleUrls: ['./wf-workflow.component.css']
})
export class WfWorkflowComponent implements OnInit {
  WorkFlowForm: FormGroup; flag; pkey: number = 0;
  WorkFlowStateForm: FormGroup; flagsate; pkeystate: number = 0;
  WorkStateRoleForm: FormGroup; flagSateRole; pkeyStateRole: number = 0;
  WorkQTForm: FormGroup; flagQT; pkeyQT: number = 0;
  WorkTransitionRoleForm:FormGroup; flagQTR; pKeyQT: number = 0;
  dataSource = new MatTableDataSource<any>();
  dataSourceQueueState =new MatTableDataSource<any>();
  dataSourceQueueStateRole =new MatTableDataSource<any>();
  dataSourceQueueTransition =new MatTableDataSource<any>();
  dataSourceQueueTransitionRole =new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  selectionQS = new SelectionModel<any>(true, []);
  // selectionQSR = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator ;paginatorQS: MatPaginator ;paginatorQSR: MatPaginator ;paginatorWQT: MatPaginator;paginatorQTR: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: string;
  selectedIndex: any;
  selectedIndexQueueState:any;
  selectedIndexQueueStateRole:any;
  selectedIndexQueueTransition:any;
  selectedIndexQueueTransitionRole:any;
  displayedColumns: string[] = ['groupName'];
  displayedQueueStateColumns: string[] = ['checkbox','WorkQueueStateName','Event','SiteType','StateType','edit'];
  displayedQueueStateRoleColumns: string[] = ['PositionName','rightall'];
  displayedQueueTransitionColumns: string[] = ['checkbox','currentWorkQueue','action','TargetWorkQueueStateName','edit'];
  displayedQueueTransitionRoleColumns: string[] = ['PositionNames','rightalls','fromTQR','toTQR','approvalNeeded'];



  groupId: any;
  workqueuestateId: any;
  WQstatusdata: any;
  userposition: any;
  currentworkstate: any;
  groupNameFix: any;
  workQueueStateName: any[];
  selectgroupname: any[];
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
  eventlist: any;
  Eventfinal: any;
  TargetWorkQueueStateData: any;
  transitionId: any;
  getStateRole: any[];
  viewTransitionRight: boolean;
  addTransitionRight: boolean;
  editTransitionRight: boolean;
  deleteTransitionRight: boolean;
  FromQTR: string;
  ToQTR: string;
  Yes_No_QTR: string;
  finalSiteType: string;
  
  

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private swal: SwalToastService,
    private exportExcelService: ExportExcelService,
    private workflowservice : WorkflowService,
    private usermanagementservice : UserManagementService) { }

  ngOnInit(): void {


    this.WorkFlowStateForm = this.fb.group({
      workQueueStateId: [0],
      workQueueStateName: ['', [Validators.required]],
      siteType: ['', [Validators.required]],
      stateType: ['', [Validators.required]],
      groupId: ['', [Validators.required]],
      eventId:['',[Validators.required]],
    });

    this.WorkStateRoleForm = this.fb.group({
      wQStateRoleId: [0],
      userPositionId: ['', [Validators.required]],
      isViewAllowed: [''],
      isCreateAllowed: [''],
      isEditAllowed: [''],
      isDeleteAllowed: [''],
      workQueueStateId: ['', [Validators.required]],
  
    });

    this.WorkQTForm = this.fb.group({
      workQueueTransitionId: [0],
      workQueueStateId: ['', [Validators.required]],
      workQueueStateCurrentId: ['', [Validators.required]],
      groupId: [''],
      eventId: [''],
      action: ['', [Validators.required]],
    
    });

    this.WorkTransitionRoleForm = this.fb.group({
      wqTransitionRoleId: [0],
      userPositionId: ['', [Validators.required]],
      isViewAllowed: [''],
      isCreateAllowed: [''],
      isEditAllowed: [''],
      isDeleteAllowed: [''],
      workQueueTransitionId: ['', [Validators.required]],
  
    });
   
    this.LoadGroup();
    this.loadDataWorkQueueState();
    this.LoadEvent();
    // this.loadUserPositions();
 
  }

  LoadGroup() {
    this.workflowservice.getWFGroup(0)
      .subscribe(response => {
        
 
        this.dataSource.data = response.data;       
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

      })
  }


  //#region WorkState

  GetIdinWorkState(groupId){
    this.groupId = groupId;   
    this.dataSourceQueueStateRole.data = []; 
    this.dataSourceQueueTransition.data =  [];
    this.dataSourceQueueTransitionRole.data = []
    this.loadWorkQueueState(this.groupId);
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

  LoadEvent() {
    this.workflowservice.getWFEvent(0)
      .subscribe(response => {
        this.eventlist = response.data;

      })
  }

  openModalWorkQueueState(){
    this.selectedIndexQueueState = null;
    if(this.groupId != null){
      
      this.WorkFlowStateForm.reset();
      this.WorkFlowStateForm.controls.workQueueStateId.setValue(0);
      this.WorkFlowStateForm.controls.workQueueStateName.setValue('');
      this.WorkFlowStateForm.controls.siteType.setValue('');
      this.WorkFlowStateForm.controls.stateType.setValue('');
      this.WorkFlowStateForm.controls.eventId.setValue('');
      this.WorkFlowStateForm.controls.groupId.setValue(this.groupId);
      this.groupNameFix = this.dataSource.data.filter(x=>x.groupId == this.groupId);
      let Eventget = this.groupNameFix.map(x => x.eventId); 
      let eventIdsString = Eventget.join(', ');    
      let eventIdsArray = eventIdsString.split(',');
      this.Eventfinal = this.eventlist.filter(x => eventIdsArray.includes(x.eventId.toString()));
            $("#addModalWQS").modal('show');
    }
    else{
      this.swal.error('Please select group name.');
    }
   
  }

  closeModalWorkState(){
    this.WorkFlowStateForm.reset();
    this.WorkFlowStateForm.controls.workQueueStateId.setValue(0);
    this.WorkFlowStateForm.controls.workQueueStateName.setValue('');
    this.WorkFlowStateForm.controls.siteType.setValue('');
    this.WorkFlowStateForm.controls.stateType.setValue('');
    this.WorkFlowStateForm.controls.eventId.setValue('');
    this.WorkFlowStateForm.controls.groupId.setValue('');
    $("#addModalWQS").modal('hide');
  }

  onSubmitFlowState(form: any)
  {
    
  const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.workflowservice.addWorkQueueState(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {

          this.swal.success('Added successfully.');
           this.loadWorkQueueState(this.groupId);
           this.closeModalWorkState();
        }
        else if (data.message == "updated") {

          this.swal.success('Data has been updated successfully.');
            this.loadWorkQueueState(this.groupId);
           this.closeModalWorkState();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
            this.loadWorkQueueState(this.groupId);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
            this.loadWorkQueueState(this.groupId);
        }
        else {

        }

      });
}

loadWorkQueueState(id) {

  this.workflowservice.getWorkQueueState(id)
    .subscribe(response => {
    
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

        this.groupNameFix = this.dataSource.data.filter(x=>x.groupId == response.data.groupId);
        let Eventget = this.groupNameFix.map(x => x.eventId); 
        let eventIdsString = Eventget.join(', ');    
        let eventIdsArray = eventIdsString.split(',');
        this.Eventfinal = this.eventlist.filter(x => eventIdsArray.includes(x.eventId.toString()));

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
          this.loadWorkQueueState(this.groupId);
        })

      }
    })

  } else {
    this.swal.info('Select at least one row')
  }
}
  //#endregion

  //#region workQueuestateRole

  GetIdinWorkStateRole(workqueuestateId){

   this.workqueuestateId = workqueuestateId;
   this.dataSourceQueueTransition.data =  [];
   this.dataSourceQueueTransitionRole.data = []
   this.loadWorkQSR(this.workqueuestateId);
   this.loadWorkQueueTransitionData(this.workqueuestateId);
  }

  loadDataWorkQueueState() {
    this.workflowservice.getWorkQueueStatefull(0)
      .subscribe(response => {
      
        this.WQstatusdata = response.data;          
      });
  }

  loadUserPositions() {
    this.usermanagementservice.getUserPostions(0)
      .subscribe(response => {
      
        this.userposition = response.data;          
        this.addmultipostion(this.userposition)
      });
  }

  openModalWorkQSRole(){
    this.selectedIndexQueueStateRole = null;
    if(this.workqueuestateId != null){
      this.WorkStateRoleForm.reset();
      this.WorkStateRoleForm.controls.wQStateRoleId.setValue(0);
      this.WorkStateRoleForm.controls.userPositionId.setValue('');
      this.WorkStateRoleForm.controls.isViewAllowed.setValue('');
      this.WorkStateRoleForm.controls.isCreateAllowed.setValue('');
      this.WorkStateRoleForm.controls.isEditAllowed.setValue('');
      this.WorkStateRoleForm.controls.isDeleteAllowed.setValue('');
      this.WorkStateRoleForm.controls.workQueueStateId.setValue(this.workqueuestateId);

     this.workQueueStateName= this.dataSourceQueueState.data.filter(x=>x.workQueueStateId == this.workqueuestateId);
     this.loadUserPositions();
    
      $("#addModalWQSR").modal('show');
    }
    else{
      this.swal.error('Please select work queue state name.');
    }
  }

  closeModalWorkStateRole(){
    this.selectedIndexQueueStateRole = null;
    this.WorkStateRoleForm.reset();
    this.WorkStateRoleForm.controls.wQStateRoleId.setValue(0);
    this.WorkStateRoleForm.controls.userPositionId.setValue('');
    this.WorkStateRoleForm.controls.isViewAllowed.setValue('');
    this.WorkStateRoleForm.controls.isCreateAllowed.setValue('');
    this.WorkStateRoleForm.controls.isEditAllowed.setValue('');
    this.WorkStateRoleForm.controls.isDeleteAllowed.setValue('');
    this.WorkStateRoleForm.controls.workQueueStateId.setValue('');
    $("#addModalWQSR").modal('hide');
  }

  loadWorkQSR(id) {

    this.workflowservice.getWorkQueueStateRole(id)
      .subscribe(response => {
        this.dataSourceQueueStateRole.data = response.data;       
        this.dataSourceQueueStateRole.sort = this.sort;
        this.dataSourceQueueStateRole.paginator = this.paginatorQSR;
      
      });
  }

  addmultipostion(userposition){

    let getsitetype =  this.dataSourceQueueState.data.filter(x=>x.workQueueStateId == this.workqueuestateId)
  if(getsitetype[0].siteType == "Shore")
   {
     this.finalSiteType = 'Shore';
  }
  if(getsitetype[0].siteType == "Ship"){
    this.finalSiteType = 'Vessel';
  }

  let selectuserposition = userposition.filter(x=>x.siteRole == this.finalSiteType);

  const userPositionIds = selectuserposition.map(position => position.userPositionId);

// Create a new list of positions with default rights
const positionsToAdd = userPositionIds.map(userPositionId => ({
  userPositionId: userPositionId,
  isViewAllowed: this.viewRight,
  isCreateAllowed: this.addRight,
  isEditAllowed: this.editRight,
  isDeleteAllowed: this.deleteRight,
  workQueueStateId: this.workqueuestateId,
}));

    this.workflowservice.multiAddPosition(positionsToAdd)
    .subscribe(response => {
 
       this.loadWorkQSR(this.workqueuestateId);
    });
  }

  saveAccessRight(id,event,right){

var oldData = this.dataSourceQueueStateRole.data.filter(x=>x.userPositionId == id) ;

 if(right == 'View'){
  this.viewRight =   event.target.checked;
 }
 else{
  this.viewRight = oldData[0].isViewAllowed;
 }
 if(right == 'Add'){
   this.addRight = event.target.checked
 }
 else{
  this.addRight = oldData[0].isCreateAllowed;
 }
 if(right == 'Edit'){
  this.editRight = event.target.checked
}
else{
  this.editRight = oldData[0].isEditAllowed;
 }
if(right == 'Delete'){
  this.deleteRight = event.target.checked
}
else{
  this.deleteRight = oldData[0].isDeleteAllowed;
 }
   

    var jsonObj = {
      userPositionId: id,
      isViewAllowed: this.viewRight,
      isCreateAllowed:  this.addRight,
      isEditAllowed:  this.editRight,
      isDeleteAllowed:  this.deleteRight,
      workQueueStateId:this.workqueuestateId,
   
    };
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(jsonObj));

    this.workflowservice.addWorkQueueStateRole(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {

          this.swal.success('Added successfully.');
           this.loadWorkQSR(this.workqueuestateId);
           this.closeModalWorkStateRole();
        }
        else if (data.message == "updated") {

          this.swal.success('Data has been updated successfully.');
            this.loadWorkQSR(this.workqueuestateId);
           this.closeModalWorkStateRole();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
            this.loadWorkQSR(this.workqueuestateId);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
           this.loadWorkQSR(this.workqueuestateId);
        }
        else {

        }

      });

  }


  UpdateWorkQSR(id){
    this.selectedIndexQueueStateRole = id;
    $("#addModalWQSR").modal('show');
    this.workflowservice.getWorkQSRId(id)
      .subscribe((response) => {
        
        if (response.status) {

          this.workQueueStateName= this.dataSourceQueueState.data.filter(x=>x.workQueueStateId == this.workqueuestateId);
          this.WorkStateRoleForm.patchValue(response.data);
  
        }
      },
        (error) => {
  
        });
  }
  //#endregion

  //#region WorkQueueTransition

  openModalWorkQT(){
    this.selectedIndexQueueTransition = null;
    if(this.workqueuestateId != null){
debugger
    this.WorkQTForm.reset();
    this.WorkQTForm.controls.workQueueTransitionId.setValue(0);
    this.WorkQTForm.controls.workQueueStateId.setValue('');
    this.WorkQTForm.controls.action.setValue('');
    this.WorkQTForm.controls.groupId.setValue('');
    this.WorkQTForm.controls.eventId.setValue('');
    this.selectgroupname = this.dataSource.data.filter(x=>x.groupId ==  this.groupId);
    this.currentworkstate =  this.dataSourceQueueState.data.filter(x=>x.workQueueStateId == this.workqueuestateId);
    this.WorkQTForm.controls.workQueueStateCurrentId.setValue(this.currentworkstate[0].workQueueStateId);

    $("#addModalWQT").modal('show');
     }
    else{
      this.swal.error('Please select work queue State name.');
    }
  }

  getTargetWorkQueue(action){
debugger
const selectedValue = (action.target as HTMLSelectElement).value;
    if(selectedValue == 'Approve'){
      this.TargetWorkQueueStateData = this.WQstatusdata.filter(x=>x.groupId == this.currentworkstate[0].groupId && x.eventId == this.currentworkstate[0].eventId
        && x.stateType == 'Approve');
    }
    if(selectedValue == 'Reject'){
      this.TargetWorkQueueStateData = this.WQstatusdata.filter(x=>x.groupId == this.currentworkstate[0].groupId && x.eventId == this.currentworkstate[0].eventId
        && x.stateType == 'Reject');
    }
    if(selectedValue == 'Manual' || selectedValue == 'Create' || selectedValue == 'Delete' || selectedValue == 'Cancel'){
      this.TargetWorkQueueStateData = this.WQstatusdata.filter(x=>x.groupId == this.currentworkstate[0].groupId && x.eventId == this.currentworkstate[0].eventId
        && x.stateType != 'Approve' && x.stateType != 'Reject');
    }
  }

  closeModalWorkQT(){
    this.WorkQTForm.reset();
    this.WorkQTForm.controls.workQueueTransitionId.setValue(0);
    this.WorkQTForm.controls.workQueueStateId.setValue('');
    this.WorkQTForm.controls.action.setValue('');
    this.WorkQTForm.controls.groupId.setValue('');
    this.WorkQTForm.controls.eventId.setValue('');
    this.selectgroupname = this.dataSource.data.filter(x=>x.groupId ==  this.groupId);
    this.currentworkstate =  this.dataSourceQueueState.data.filter(x=>x.workQueueStateId == this.workqueuestateId);
    this.WorkQTForm.controls.workQueueStateCurrentId.setValue(this.currentworkstate[0].workQueueStateId);
    $("#addModalWQT").modal('hide');   
  }

  onSubmitWorkQT(form: any){
    
    form.value.groupId = this.selectgroupname[0].groupId;
    form.value.eventId = this.currentworkstate[0].eventId;
     
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.workflowservice.addWorkQueueTransition(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {

          this.swal.success('Added successfully.');
          this.closeModalWorkQT();
           this.loadWorkQueueTransitionData(this.workqueuestateId);
          
        }
        else if (data.message == "updated") {

          this.swal.success('Data has been updated successfully.');
          this.closeModalWorkQT();
            this.loadWorkQueueTransitionData(this.workqueuestateId);
          
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
            this.loadWorkQueueTransitionData(this.workqueuestateId);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
           this.loadWorkQueueTransitionData(this.workqueuestateId);
        }
        else {

        }

      });
  }

  loadWorkQueueTransitionData(id) {

    this.workflowservice.getWorkQueueTransition(id)
      .subscribe(response => {

        this.flagQT = status;

        this.dataSourceQueueTransition.data = response.data;       
        this.dataSourceQueueTransition.sort = this.sort;
        this.dataSourceQueueTransition.paginator = this.paginatorWQT;
      
      });
  }

  UpdateWorkQT(id){
    this.selectedIndexQueueTransition = id;
    $("#addModalWQT").modal('show');
    this.workflowservice.getWorkQueueTransitionId(id)
      .subscribe((response) => {
        
        if (response.status) {
  
          this.selectgroupname = this.dataSource.data.filter(x=>x.groupId ==  this.groupId);
          this.currentworkstate =  this.dataSourceQueueState.data.filter(x=>x.workQueueStateId == this.workqueuestateId);
          const    selectedValue =  response.data.action;

          if(selectedValue == 'Approve'){
            this.TargetWorkQueueStateData = this.WQstatusdata.filter(x=>x.groupId == this.currentworkstate[0].groupId && x.eventId == this.currentworkstate[0].eventId
              && x.stateType == 'Approve');
          }
          if(selectedValue == 'Reject'){
            this.TargetWorkQueueStateData = this.WQstatusdata.filter(x=>x.groupId == this.currentworkstate[0].groupId && x.eventId == this.currentworkstate[0].eventId
              && x.stateType == 'Reject');
          }
          if(selectedValue == 'Manual' || selectedValue == 'Create' || selectedValue == 'Delete' || selectedValue == 'Cancel'){
            this.TargetWorkQueueStateData = this.WQstatusdata.filter(x=>x.groupId == this.currentworkstate[0].groupId && x.eventId == this.currentworkstate[0].eventId
              && x.stateType != 'Approve' && x.stateType != 'Reject');
          }


          
          this.WorkQTForm.patchValue(response.data);
  
        }
      },
        (error) => {
  
        });
  }

  //#endregion


  //#region Work Queue Transition Role

  
  GetintransitionId(transitionId){

    this.transitionId = transitionId;
    this.loadWorkQTR(this.transitionId);
  }

      loadWorkQTR(id) {

        this.workflowservice.getWorkQueueTransitionRole(id)
          .subscribe(response => {
            
            this.dataSourceQueueTransitionRole.data = response.data;       
            this.dataSourceQueueTransitionRole.sort = this.sort;
            this.dataSourceQueueTransitionRole.paginator = this.paginatorQTR;
          
          });
      }

  openModalWorkQTR(){
    
    this.selectedIndexQueueTransitionRole = null;
    if(this.transitionId != null){
      this.WorkTransitionRoleForm.reset();
      this.WorkTransitionRoleForm.controls.wqTransitionRoleId.setValue(0);
      this.WorkTransitionRoleForm.controls.userPositionId.setValue('');
      this.WorkTransitionRoleForm.controls.isViewAllowed.setValue('');
      this.WorkTransitionRoleForm.controls.isCreateAllowed.setValue('');
      this.WorkTransitionRoleForm.controls.isEditAllowed.setValue('');
      this.WorkTransitionRoleForm.controls.isDeleteAllowed.setValue('');
      this.WorkTransitionRoleForm.controls.workQueueTransitionId.setValue(this.transitionId);

      this.getStateRole= this.dataSourceQueueStateRole.data.filter(x=>x.workQueueStateId == this.workqueuestateId && x.isEditAllowed == true);
      this.addmultipostionintransition(this.getStateRole)
    
       $("#addModalWQTR").modal('show');
    }
    else{
      this.swal.error('Please select current work queue state.');
    }
  }

  closeModalWorkTransitionRole(){
    this.selectedIndexQueueTransitionRole = null;
    this.WorkTransitionRoleForm.reset();
    this.WorkTransitionRoleForm.controls.wqTransitionRoleId.setValue(0);
    this.WorkTransitionRoleForm.controls.userPositionId.setValue('');
    this.WorkTransitionRoleForm.controls.isViewAllowed.setValue('');
    this.WorkTransitionRoleForm.controls.isCreateAllowed.setValue('');
    this.WorkTransitionRoleForm.controls.isEditAllowed.setValue('');
    this.WorkTransitionRoleForm.controls.isDeleteAllowed.setValue('');
    this.WorkTransitionRoleForm.controls.workQueueTransitionId.setValue(this.transitionId);
    $("#addModalWQTR").modal('hide');
  }

  addmultipostionintransition(getStateRole){

    const PositionIdsGetStateRole = getStateRole.map(position => position.userPositionId);

    // Create a new list of positions with default rights
    const positionsToAddTransition = PositionIdsGetStateRole.map(userPositionId => ({
      userPositionId: userPositionId,
      isViewAllowed: false,
      isCreateAllowed: false,
      isEditAllowed: false,
      isDeleteAllowed: false,
      to:'0',
      from:'0',
      workQueueTransitionId: this.transitionId,
    }));

    this.workflowservice.multiAddPositioninTransition(positionsToAddTransition)
    .subscribe(response => {
 
       this.loadWorkQTR(this.transitionId);
    });
  }

  saveTransitionRight(id,event,right,type){

    var oldTransitionData = this.dataSourceQueueTransitionRole.data.filter(x=>x.userPositionId == id) ;
    
     if(right == 'View'){
      this.viewTransitionRight =   event.target.checked;
     }
     else{
      this.viewTransitionRight = oldTransitionData[0].isViewAllowed;
     }
     if(right == 'Add'){
       this.addTransitionRight = event.target.checked
     }
     else{
      this.addTransitionRight = oldTransitionData[0].isCreateAllowed;
     }
     if(right == 'Edit'){
      this.editTransitionRight = event.target.checked
    }
    else{
      this.editTransitionRight = oldTransitionData[0].isEditAllowed;
     }
    if(right == 'Delete'){
      this.deleteTransitionRight = event.target.checked
    }
    else{
      this.deleteTransitionRight = oldTransitionData[0].isDeleteAllowed;
     }
       

     if(type == "From"){
      this.FromQTR = right
     }
     else{
      this.FromQTR = oldTransitionData[0].from;
     }
     if(type == "To"){
      this.ToQTR = right
     }
     else{
      this.ToQTR = oldTransitionData[0].to;
     }
     if(type == "Yes"){
      this.Yes_No_QTR = 'Yes'
     } 
     if(type == "No"){
      this.Yes_No_QTR = 'No'
     }
    if(type !== "Yes" && type !== "No"){

      this.Yes_No_QTR ='null'

    }
        var jsonObj = {
          userPositionId: id,
          isViewAllowed: this.viewTransitionRight,
          isCreateAllowed:  this.addTransitionRight,
          isEditAllowed:  this.editTransitionRight,
          isDeleteAllowed:  this.deleteTransitionRight,
          workQueueTransitionId:this.transitionId,
          from:this.FromQTR,
          to:this.ToQTR,
          approvalNeeded:this.Yes_No_QTR,
        };
        // const wqtfmdata = new FormData();
        // wqtfmdata.append('data', JSON.stringify(jsonObj));
    
        this.workflowservice.addWorkQueueTransitionRole(jsonObj)
          .subscribe(data => {
    
            if (data.message == "data added") {
    
              this.swal.success('Added successfully.');
              this.loadWorkQTR(this.transitionId);
               this.closeModalWorkTransitionRole();
            }
            else if (data.message == "updated") {
    
              this.swal.success('Data has been updated successfully.');
              this.loadWorkQTR(this.transitionId);
               this.closeModalWorkTransitionRole();
            }
            else if (data.message == "duplicate") {
              this.swal.info('Data already exist. Please enter new data');
              this.loadWorkQTR(this.transitionId);
            }
            else if (data.message == "not found") {
              this.swal.info('Data exist not exist');
              this.loadWorkQTR(this.transitionId);
            }
            else {
    
            }
    
          });
    
      }

  UpdateWorkQTR(id){
    
  }

  //#endregion

}
