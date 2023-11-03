import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { UserManagementService } from 'src/app/services/user-management.service';
declare let Swal, $, PerfectScrollbar: any;
@Component({
  selector: 'app-role-based-access-rights',
  templateUrl: './role-based-access-rights.component.html',
  styleUrls: ['./role-based-access-rights.component.css']
})
export class RoleBasedAccessRightsComponent implements OnInit {
  copyForm:FormGroup;
  treeview:any;
 rights:any;
 status: number = 0;
 addRight: boolean;
 ammendRight: boolean;
 deleteRight: boolean;
 viewRight: boolean;
 importRight: boolean;
 postponeApproval:boolean;
 postponeRequest:boolean;
 userPositionId:any;
 pageCategoryId:any;
 positionRoles:any;
 rolename: string;
  vesselRights: any;
  vesselPositionRoles: any;

  fromRoles: any;
  toRoles: any;
  selectedUsers: string[] = [];
  dropdownToUser: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; tooltipField: string; };
  selectedVessel: never[];

  constructor(private fb: FormBuilder,private swal: SwalToastService,
    public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
    private unitmasterService: UnitmasterService,private userManagementService: UserManagementService,) { }

  ngOnInit(): void {
    this.copyForm = this.fb.group({
      site: [''],
      fromRole: ['0'],
      toRole: [''],
      module: [''],
      users:['']
    })
    this.dropdownToUser = {
      singleSelection: false,
      idField: 'userPositionId',
      textField: 'positionName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      tooltipField: 'description'
    };
    this.loadUsers();
  }
  get fm() {return this.copyForm.controls}

  loadUsers() {
    this.userManagementService.getUserPostions(this.status)
      .subscribe((response) => {
        this.positionRoles = response.data.filter(x=>x.siteRole=='Shore');
        this.vesselPositionRoles = response.data.filter(x=>x.siteRole=='Vessel');
      }, (error) => {
        console.log(error);
      })
  }

  loadRoleBasedRights(userPositionId) {
    this.userPositionId = userPositionId;
    this.unitmasterService.getAdministrationRightsByRole(userPositionId,"Administration")
      .subscribe((response) => {
        this.rights = response.data; 
  
      }, (error) => {
        console.log(error);
      })
  } 

  
  loadVesselRoleBasedRights(userPositionId) {
    this.userPositionId = userPositionId;
    this.unitmasterService.getAdministrationRightsByRole(userPositionId,"Administration")
      .subscribe((response) => {
        this.vesselRights = response.data; 
  
      }, (error) => {
        console.log(error);
      })
  } 

  saveAccessRight(event, right) {
    switch (right) {
      case "Add":
        this.addRight = event.target.checked;
        this.ammendRight = this.deleteRight = this.viewRight = false;
        break;
      case "Ammend":
        this.ammendRight = event.target.checked;
        this.addRight = this.deleteRight = this.viewRight = false;
        break;
      case "Delete":
        this.deleteRight = event.target.checked;
        this.addRight = this.ammendRight = this.viewRight = false;
        break;
      case "View":
        this.viewRight = event.target.checked;
        this.addRight = this.ammendRight = this.deleteRight = event.target.checked;
        break;
        case "Import":
        this.importRight = event.target.checked;
        this.addRight  = this.ammendRight = this.viewRight = false;
        break;
        case "PostponeApproval":
          this.postponeApproval = event.target.checked;
          this.addRight =  this.ammendRight = this.deleteRight = this.viewRight=this.importRight=this.postponeRequest = false;
          break;
          case "PostponeRequest":
            this.postponeRequest = event.target.checked;
            this.addRight =  this.ammendRight = this.deleteRight = this.viewRight=this.importRight=this.postponeApproval = false;
            break;
    }
 
    var jsonObj = {
      roleName: this.rolename,
      PageId: event.target.value,
      Right: right,
      addRight:this.addRight,
      ammendRight:this.ammendRight,
      deleteRight:this.deleteRight,
      viewRight:this.viewRight,
      importRight:this.importRight,
      postponeApproval:this.postponeApproval,
      postponeRequest:this.postponeRequest,
      userPositionId:this.userPositionId
    };
this.unitmasterService.addRights(jsonObj).subscribe((response)=>{
},(error)=>{
console.log(error);
});
  }



  checkAllInput(control,pageCategoryId){
    $(document).ready(function(){ 
      $(control.target).click(function(event) {
        var this_ = this
        //get closest collpse class and find all checkbox inside it
        var selector = $(this).closest(".collapse").find('.form-check-input')
        selector.each( function() {
          this.checked = this_.checked ? true : false;
        $(selector.value).prop('checked', this.checked);
  });
  });
  });
  this.CheckAllByPage(control,pageCategoryId)
  }
  CheckAllByPage(event,pageCategoryId){
    this.unitmasterService.CheckAllbyPage(event.target.checked,pageCategoryId,this.userPositionId).subscribe((response)=>{
      if (response.status) {
         location.reload();
      }
    })
  }
  CheckByRow(event ,Pageid){
    if(event.target.checked){
      var tr= $(event.target).closest('tr');
      $('td input:checkbox',tr).prop('checked',event.target.checked);
      var jsonObj = {
        //roleName: this.rolename,
        PageId: Pageid,
        Right: 'All',
        addRight:true,
        ammendRight:true,
        deleteRight:true,
        viewRight:true,
        importRight:true,
        postponeApproval:true,
       postponeRequest:true,
        userPositionId:this.userPositionId
      };
       this.unitmasterService.addRights(jsonObj).subscribe((response)=>{
    });
  }
  }


  openModal() {
    this.clear();
    $("#openModal").modal('show');
  }
  closeModal() {
    this.clear();
    $("#openModal").modal('hide');
  }
  SubmitRights() {    
    this.copyForm.controls.toUser.setValue(this.selectedUsers.join(','));
    this.copyForm.controls.users.setValue(null);
    this.copyForm.controls.module.setValue('Administration');
    let formValues = this.copyForm.value;
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(formValues));
    this.userManagementService.copyRights(fmdata)
      .subscribe(data => {
        if (data.message == "data added") {
          this.swal.success('Access rights copied successfully.');
          this.clear();
        }
        else {
        }
      });
  }

  clear() {
    this.copyForm.reset();
    this.copyForm.controls.site.setValue('');
    this.selectedVessel = [];
    this.fromRoles = [];
    this.toRoles = [];
    this.selectedUsers.length = 0;
  }

  filterUsers(site) {
    if (site == 'Vessel')
      this.fromRoles = this.vesselPositionRoles;
    else
      this.fromRoles = this.positionRoles;
  }

  filterToUsers(id) {
    this.selectedVessel = [];
    if (id > 0) {
      this.toRoles = [];
      this.selectedUsers.length = 0;
      this.toRoles = this.fromRoles.filter(x => x.userPositionId != id);
    }
    else {
      this.toRoles = [];
      this.selectedUsers.length = 0;
    }
  }
  //#region  Procedure Reference
  onUserSelect(event: any) {
    let isSelect = event.userPositionId;
    if (isSelect) {
      this.selectedUsers.push(event.userPositionId);
    }
  }
  onUserSelectAll(event: any) {
    if (event) {      
      this.selectedUsers = event.map((x: { userPositionId: any; }) => x.userPositionId);
    }
  }

  onUserDeSelect(event: any) {
    let rindex = this.selectedUsers.findIndex(userId => userId == event.userPositionId);
    if (rindex != -1) {
      this.selectedUsers.splice(rindex, 1)
    }
  }
  onUserDeSelectAll(event: any) {
    this.selectedUsers.length = 0;
    // this.selectedCountries.splice(0, this.selectedCountries.length);
  }

  //#endregion



}
