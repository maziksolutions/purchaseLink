import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Keys } from '../Shared/localKeys';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
declare let Swal, PerfectScrollbar: any, $: any;
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  userId: any;
  moduleAccess: any;
  changePassForm: FormGroup;

  alertForm: FormGroup;
  PMS_View: boolean = false;
  QHSE_View: boolean = false;
  Administration_View: boolean = false;
  Purchase_View: boolean = false;
  Crewlink_View: boolean = false;
  mouse_Enter: boolean = false;
  private modules: any[] = [];
  notMatched: boolean = false;
  userName: any;
  email: any;
  companyName: any;
  fullName: any;
  JoiningDate: any;
  userCode: any;
  designation: any;
  DOB: any;
  MobileNumber: any;
  location: any;
  settings: any;
  pkey;
//#region  User Fleet 
selectVessel: string[] = [];
  dropdownVesselSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  vesselss: any;
  userFleetForm: FormGroup;
  objProcR:any;
  userFleetdataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[] = ['fleetName', 'vessels'];
  vesselIds:any;
  vesselsName:any;
  selectedVessel: string[] = [];
//#endregion



  constructor(private authStatusService: AuthStatusService, private userManagementService: UserManagementService 
    , private swal: SwalToastService, private fb: FormBuilder, private router: Router,private vesselManagementService: VesselManagementService,) { }

  ngOnInit(): void {
    this.userId = this.authStatusService.userId();
    this.changePassForm = this.fb.group({
      userId: [this.userId],
      oldPass: ['', Validators.required],
      newpassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/), Validators.minLength(8), Validators.maxLength(20)]],
      confirmpassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/), Validators.minLength(8), Validators.maxLength(20)]]
    });
    this.userFleetForm = this.fb.group({
      userFleetId:[0],
      userId: [this.userId],
      fleetName:['', [Validators.required]],
      vessels:[''],      
    });
    this.dropdownVesselSetting = {
      singleSelection: false,
      idField: 'vesselId',
      textField: 'vesselName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };
    this.loadUserFleetData(0);
    this.loadModules();
    this.loadName();
    this.loadDesignation();
    this.loadAlertSettings();
    this.loadVessels();
  }
  get fm() { return this.changePassForm.controls };
  get uflfm() { return this.userFleetForm.controls };

  loadModules() {
    let role = this.authStatusService.ModuleAccess();
    this.modules = role.split(',');
    if (this.modules.includes('PMS')) {
      this.PMS_View = true;
    }

    if (this.modules.includes(' QHSE')) {
      this.QHSE_View = true;
    }

    if (this.modules.includes('Administration')) {
      this.Administration_View = true;
    }
    if (this.modules.includes('Purchase')) {
      this.Purchase_View = true;
    }
    if (this.modules.includes('Crewlink')) {
      this.Crewlink_View = true;
    }

  }

  loadVessels() {
    this.vesselManagementService.getVessels(0)
      .subscribe((response) => {
        if (response.status) {
          this.vesselss = response.data;
          this.vesselsName = response.data.vesselName;
        } else {
          this.vesselss = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }


  loadName() {
    let userName = this.authStatusService.FullName();
    let id = this.authStatusService.userId();
    this.email = this.authStatusService.Email();


  }
  loadDesignation() {
    let designation = this.authStatusService.Designation();

  }
  mouseEnter(div: string) {

    this.fullName = this.authStatusService.FullName();
    this.userName = this.authStatusService.userName();
    this.designation = this.authStatusService.Designation();
    this.mouse_Enter = true;
    this.companyName = this.authStatusService.companyName();
    this.userCode = this.authStatusService.userCode();
    this.JoiningDate = this.authStatusService.JoiningDate();
    this.DOB = this.authStatusService.DOB();
    this.MobileNumber = this.authStatusService.MobileNumber();
    this.location = this.authStatusService.location();
    // console.log(userName);
    // console.log(designation);
  }
  logout() {
    var title = "";
    Swal.fire({
      title: 'Are you sure to logout?',
      text: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result)=>{
      if (result.value){
        this.userManagementService.logout();
      }
      else {
        // this.swal.info('Select at least one row')
      }
    })
  }

  openModal() {    
    $("#changePassModal").modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  closeModal() {
    $("#changePassModal").modal('hide');
  }

  openAlertModal() {
    this.loadAlertSettings();
    $("#openAlertSettings").modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  closeAlert() {
    $("#openAlertSettings").modal('hide');
  }


  addHandler() {
    if (this.changePassForm.invalid) {
      return;
    }
    //this.password(this.changePassForm.value);

    if (this.fm.newpassword.value != this.fm.confirmpassword.value) {
      this.swal.error('Confirm password not match');
    }
    else {
      const formData = new FormData();
      formData.append('data', JSON.stringify(this.changePassForm.value));

      this.userManagementService.changeUserPassword(formData)
        .subscribe((response) => {
          if (response.messageForRejection == "Incorrect old Password") {
            Swal.fire('', 'The Password You Entered Is Incorrect. Please Try Again', "error");
          }
          else if (response.status) {
            // this.employees = response.data;
            localStorage.setItem(Keys.token, response.token);
            localStorage.setItem(Keys.refreshtoken, response.refreshToken);
            this.swal.success('Password Updated');
            this.closeModal();
          }
        },
          (error) => {
            console.log(error);
          })
      //}
    }
  }
  comparePwd() {
    if (this.fm.newpassword.value != this.fm.confirmpassword.value)
      this.notMatched = true;
    else
      this.notMatched = false;
  }

  saveAlert(event, right) {
    var jsonObj = {
      alertConfigId: event.target.value,
      alerts: (right == 'alert' ? event.target.checked : null),
      notification: (right == 'notification' ? event.target.checked : null),
      userId: this.userId,

    };
    this.userManagementService.addAlertSetting(jsonObj).subscribe((response) => {
      if (response.status) {
        this.loadAlertSettings();
      }
    }, (error) => {
      console.log(error);
    });
  }

  loadAlertSettings() {
    this.userManagementService.getAlertSettings(this.userId)
      .subscribe((response) => {
        this.settings = response.data;
      }, (error) => {
        console.log(error);
      })
  }

  //#region  Vessle Multi-Select-Dropdown
  onvesselSelect(event: any) {
    let isSelect = event.vesselId;
    if (isSelect) {
      this.selectVessel.push(event.vesselId);
    }
  }
  onVesselSelectAll(event: any) {
    if (event)
      this.selectVessel = event.map((x: { vesselId: any; }) => x.vesselId);
  }
  onVesselDeSelect(event: any) {
    let rindex = this.selectVessel.findIndex(vesselId => vesselId == event.vesselId);
    if (rindex != -1) {
      this.selectVessel.splice(rindex, 1)
    }
  }
  onVesselDeSelectAll(event: any) {
    this.selectVessel.length = 0;
    // this.selectedCountries.splice(0, this.selectedCountries.length);
  }



  //#endregion

//#region  User Fleet


close() {
  this.clear();
  this.userFleetForm.reset();
  this.userFleetForm.controls.userFleetId.setValue(0);
  this.selectVessel= [];
  //this.userFleetForm.controls.vessels.setValue('');
  (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
  (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
}

onSubmitUserFleet(form: any) {
  this.uflfm.userId.setValue(this.userId.value);
 this.uflfm.vessels.setValue(this.selectVessel.join(','));
   let formValues = form.value;
  //   formValues.vessels = this.selectVessel.join(',');
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(formValues));
  this.userManagementService.addUserFleet(fmdata)
    .subscribe(data => {
     
      if (data.message == "data added") {
        this.swal.success('Added successfully.');
        this.clear();
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
        this.loadUserFleetData(0);
      }
      else if (data.message == "updated") {
        this.swal.success('Data has been updated successfully.');
        this.clear();
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      this.loadUserFleetData(0);
      }
      else if (data.message == "duplicate") {
        this.swal.info('Data already exist. Please enter new data');
     this.loadUserFleetData(0);
      }
      else if (data.message == "not found") {
        this.swal.info('Data exist not exist');
    this.loadUserFleetData(0);
      }
      else {

      }
    });
}

loadUserFleetData(status: number) {
  this.userManagementService.loadUserFleet(0)
  .subscribe(response => {
    // var objProcR = [];
    this.userFleetdataSource.data = response.data;
    this.userFleetdataSource.sort = this.sort;
    this.userFleetdataSource.paginator = this.paginator;
    
    // var objProcR = [];
    // this.selectVessel = [];
    // objProcR = response.data.vessels.split(',');
    // console.log(objProcR)
    // objProcR.forEach((item)=>{
    //   this.selectVessel.push(this.vesselss.filter(x => x.vesselId == item));
    // })
    // this.vesselNames = 
    
  
    this.clear();
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  });
}

getvessels(ids){
  var vesselData:any[]=ids.split(',');
  var vessel=this.vesselss.filter(x =>vesselData.includes(x.vesselId.toString()));
  return vessel.map(x=>x.vesselName).join(',');
}
clear() {
  this.userFleetForm.reset();
  this.userFleetForm.controls.userFleetId.setValue(0);
  this.uflfm.vessels.setValue('');
  this.selectVessel.length=0;
  this.selectVessel=[];
  this.selectedVessel=[];
 // (document.getElementById('abc') as HTMLElement).focus();
}


Updatedata(id) {
      (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
      (document.getElementById('collapse1') as HTMLElement).classList.add("show");
      this.userManagementService.getUserFleetById(id)
        .subscribe((response) => {
          if (response.status) {          
            this.userFleetForm.patchValue(response.data);
            this.pkey = response.data.userFleetId;
            var objDocR = [];         
            this.selectedVessel = [];
          if (response.data.vessels != '' && response.data.vessels != null) {
            objDocR = response.data.vessels.split(',');
            this.selectVessel = response.data.vessels.split(',');
            objDocR.forEach((item) => {              
              this.selectedVessel.push(this.vesselss.filter(x => x.vesselId.toString() == item));
            })           
            const merge3 = this.selectedVessel.flat(1);
            this.selectedVessel = merge3;          
            }  
          }
        },
          (error) => {
  
          });
    }

//#endregion


}
