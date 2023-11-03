import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { UserManagementService } from 'src/app/services/user-management.service';
declare let Swal, $, PerfectScrollbar: any;
@Component({
  selector: 'app-user-based-access-rights',
  templateUrl: './user-based-access-rights.component.html',
  styleUrls: ['./user-based-access-rights.component.css']
})
export class UserBasedAccessRightsComponent implements OnInit {
  copyForm: FormGroup;
  status: number = 0;
  users: any;
  rights: any;
  userId: any;
  module: any;
  addRight: boolean;
  ammendRight: boolean;
  deleteRight: boolean;
  viewRight: boolean;
  importRight: boolean;

  postponeRequest: boolean;
  postponeApproval: boolean;

  firstName: string;
  lastName: string;
  vesselUsers: any;
  vesselRights: any;

  fromUsers: any;
  toUsers: any;
  selectedUsers: string[] = [];
  dropdownToUser: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; tooltipField: string; };
  selectedVessel: never[];

  constructor(private fb: FormBuilder, private swal: SwalToastService,
    public dialog: MatDialog,
    private exportExcelService: ExportExcelService,
    private unitmasterService: UnitmasterService, private userManagementService: UserManagementService,) { }

  ngOnInit(): void {
    this.copyForm = this.fb.group({
      site: [''],
      fromUser: ['0'],
      toUser: [''],
      module: [''],
      users:['']
    })

    this.dropdownToUser = {
      singleSelection: false,
      idField: 'userId',
      textField: 'firstName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      tooltipField: 'description'
    };

    this.loadUsers();
  }
  get fm() { return this.copyForm.controls }

  loadUsers() {
    this.userManagementService.getByAccessUser(this.status)
      .subscribe((response) => {
        this.users = response.data.filter(x=>x.site!='Vessel');
        this.vesselUsers = response.data.filter(x=>x.site=='Vessel');
      }, (error) => {
        console.log(error);
      })
  }
  loadUserBasedRights(userId) {
    this.userId = userId;
    //this.module="Administration";
    this.unitmasterService.getRightsByUserAdministration(userId, "Administration")
      .subscribe((response) => {
        this.rights = response.data;
      }, (error) => {
        console.log(error);
      })
  }

  loadVesselUserBasedRights(userId) {
    this.userId = userId;
    //this.module="Administration";
    this.unitmasterService.getRightsByUserAdministration(userId, "Administration")
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
        this.ammendRight = this.deleteRight = this.viewRight = this.postponeApproval = this.postponeRequest = false;
        break;
      case "Ammend":
        this.ammendRight = event.target.checked;
        this.addRight = this.deleteRight = this.viewRight = this.postponeApproval = this.postponeRequest = false;
        break;
      case "Delete":
        this.deleteRight = event.target.checked;
        this.addRight = this.ammendRight = this.importRight = this.viewRight = this.postponeApproval = this.postponeRequest = false;
        break;
      case "View":
        this.viewRight = event.target.checked;
        this.addRight = this.ammendRight = this.deleteRight = this.postponeApproval = this.postponeRequest = this.importRight = false;
        break;
      case "Import":
        this.importRight = event.target.checked;
        this.addRight = this.ammendRight = this.deleteRight = this.viewRight = this.postponeApproval = this.postponeRequest = false;
        break;
      case "PostponeApproval":
        this.postponeApproval = event.target.checked;
        this.addRight = this.ammendRight = this.deleteRight = this.viewRight = this.importRight = this.postponeRequest = false;
        break;
      case "PostponeRequest":
        this.postponeRequest = event.target.checked;
        this.addRight = this.ammendRight = this.deleteRight = this.viewRight = this.importRight = this.postponeApproval = false;
        break;
    }
    var jsonObj = {
      PageId: event.target.value,
      firstName: this.firstName,
      lastName: this.lastName,
      Right: right,
      addRight: this.addRight,
      ammendRight: this.ammendRight,
      deleteRight: this.deleteRight,
      viewRight: this.viewRight,
      importRight: this.importRight,
      postponeApproval: this.postponeApproval,
      postponeRequest: this.postponeRequest,
      userId: this.userId
    };
    this.unitmasterService.addUserRights(jsonObj).subscribe((response) => {
    }, (error) => {
      console.log(error);
    });
  }

  CheckByRow(event, Pageid) {
    if (event.target.checked) {
      var tr = $(event.target).closest('tr');
      $('td input:checkbox', tr).prop('checked', event.target.checked);
      var jsonObj = {
        PageId: Pageid,
        Right: 'All',
        addRight: true,
        ammendRight: true,
        deleteRight: true,
        viewRight: true,
        importRight: true,
        postponeApproval: true,
        postponeRequest: true,
        userId: this.userId,
        firstName: this.firstName,
        lastName: this.lastName,
      };
      this.unitmasterService.addUserRights(jsonObj).subscribe((response) => {
      });
    }
  }

  checkAllInput(control, pageCategoryId) {
    $(document).ready(function () {

      $(control.target).click(function (event) {

        var this_ = this
        //get closest collpse class and find all checkbox inside it
        var selector = $(this).closest(".collapse").find('.form-check-input')
        selector.each(function () {
          this.checked = this_.checked ? true : false;
          $(selector.value).prop('checked', this.checked);

        });
      });
    });

    this.CheckAllByPage(control, pageCategoryId)

  }
  CheckAllByPage(event, pageCategoryId) {
    this.unitmasterService.UserCheckAllbyPage(event.target.checked, pageCategoryId, this.userId).subscribe((response) => {
      if (response.status) {
        location.reload();
      }
    })
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
    this.fromUsers = [];
    this.toUsers = [];
    this.selectedUsers.length = 0;
  }

  filterUsers(site) {
    if (site == 'Vessel')
      this.fromUsers = this.vesselUsers;
    else
      this.fromUsers = this.users;
  }

  filterToUsers(id) {
    this.selectedVessel = [];
    if (id > 0) {
      this.toUsers = [];
      this.selectedUsers.length = 0;
      this.toUsers = this.fromUsers.filter(x => x.userId != id);
    }
    else {
      this.toUsers = [];
      this.selectedUsers.length = 0;
    }
  }
  //#region  Procedure Reference
  onUserSelect(event: any) {
    let isSelect = event.userId;
    if (isSelect) {
      this.selectedUsers.push(event.userId);
    }
  }
  onUserSelectAll(event: any) {
    if (event) {      
      this.selectedUsers = event.map((x: { userId: any; }) => x.userId);
    }
  }

  onUserDeSelect(event: any) {
    let rindex = this.selectedUsers.findIndex(userId => userId == event.userId);
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
