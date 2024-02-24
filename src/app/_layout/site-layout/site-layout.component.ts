import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart, RouteConfigLoadStart } from '@angular/router';
import { RightsModel } from 'src/app/Pages/Models/page-rights';
import { Keys } from 'src/app/Pages/Shared/localKeys';
import { registerNavEnum } from 'src/app/Pages/Shared/rights-enum';
import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
declare let Swal, PerfectScrollbar: any, $: any;
import { filter } from 'rxjs/operators';
import { RouteService } from 'src/app/services/route.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { environment } from 'src/environments/environment';
import { RequisitionService } from 'src/app/services/requisition.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.css']
})
export class SiteLayoutComponent implements OnInit {  
  userId: any;
  moduleAccess: any;
  PMS_View: boolean = false;
  QHSE_View: boolean = false;
  masterMenus: string[] = Object.keys(registerNavEnum).map(key => registerNavEnum[key]);
  Administration_View: boolean = false;
  Purchase_View: boolean = false;
  Crewlink_View: boolean = false;
  private modules: any[] = [];
  rights: RightsModel[] = [];
  masterView: boolean = false;
  notMatched: boolean = false;
  userName: any;
  designation: any;
  changePassForm: FormGroup;
  userFleetForm: FormGroup;
  mouse_Enter: boolean = false;
  fullName: any;
  JoiningDate: any;
  userCode: any;
  DOB: any;
  MobileNumber: any;
  location: any;
  email: any;
  companyName: any;
  currentRoute: string;
  routeUrl: any;
  abUrl: string;
  //test
  activeRouteResult: boolean = false;
  currentPath: string = '';
  targetLoc: string;
  VesselId: any;
  vesselsName: any;
  Vessels: any;
  selectedVesselId: number = 0;
  dropdownVesselSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  userFleetdataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectVessel: string[] = [];
  displayedColumns: string[] = ['fleetName', 'vessels'];
  selectedVessel: any;

  constructor(private authStatusService: AuthStatusService, private userManagementService: UserManagementService, private activeRoute: RouteService,
    private swal: SwalToastService, private router: Router, private fb: FormBuilder, private route: ActivatedRoute,
    private reqService: RequisitionService, private vesselService: VesselManagementService) {
    var url = window.location.href;
    this.routeUrl = url.split('//')[1].split('/')[1].toString();
  }

  ngOnInit(): void {   
    this.targetLoc = environment.location;
    if (this.targetLoc == 'Vessel') {
      this.VesselId = environment.vesselId;
    }

    this.userFleetForm = this.fb.group({
      userFleetId: [0],
      userId: [this.userId],
      fleetName: ['', [Validators.required]],
      vessels: [''],
    });

    this.userId = this.authStatusService.userId();
    this.changePassForm = this.fb.group({
      userId: [this.userId],
      oldPass: ['', Validators.required],
      newpassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/), Validators.minLength(8), Validators.maxLength(20)]],
      confirmpassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/), Validators.minLength(8), Validators.maxLength(20)]]
    })
    this.loadRights();
    this.loadModules();
    this.loadName();
    this.loadDesignation();

    this.activeRoute.getCurrentRoute().subscribe((currentRoute) => {

      this.activeRouteResult = this.router.url === '/Requisition/Requisitionslist' ||
        this.router.url === '/Requisition/RequisitionTracking' || this.router.url === '/Requisition/Rfqlist';
    })

    this.dropdownVesselSetting = {
      singleSelection: false,
      idField: 'vesselId',
      textField: 'vesselName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };  
  }
  get fm() { return this.changePassForm.controls };
  get uflfm() { return this.userFleetForm.controls };

  openFleetModal() {
    $("#userFleetModal").modal('show'); this.loadVessels();
    this.loadUserFleetData(0);
  }
  loadVessels() {
    this.vesselService.getVessels(0)
      .subscribe((response) => {
        if (response.status) {
          this.Vessels = response.data;
          this.vesselsName = response.data.vesselName;
        } else {
          this.Vessels = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadUserFleetData(status: number) {
    this.userManagementService.loadUserFleet(0, this.userId)
      .subscribe(response => {
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
        (document.getElementById('collapseFleet') as HTMLElement).classList.remove("show");
      });
  }
  onSubmitUserFleet(form: any) {
    
    this.uflfm.userId.setValue(this.userId);
    this.uflfm.vessels.setValue(this.selectVessel.join(','));
    let formValues = form.value;
    //   formValues.vessels = this.selectVessel.join(',');
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(formValues));
    this.userManagementService.addUserFleet(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          // this.clear();
          (document.getElementById('collapseFleet') as HTMLElement).classList.remove("show");
          this.loadUserFleetData(0);
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          // this.clear();
          (document.getElementById('collapseFleet') as HTMLElement).classList.remove("show");
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
  getvessels(ids) {
    var vesselData: any[] = ids.split(',');
    var vessel = this.Vessels.filter(x => vesselData.includes(x.vesselId.toString()));
    return vessel.map(x => x.vesselName).join(',');
  }
  Updatedata(id) {
    (document.getElementById('collapseFleet') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapseFleet') as HTMLElement).classList.add("show");
    this.userManagementService.getUserFleetById(id)

      .subscribe((response) => {
        if (response.status) {
          this.userFleetForm.patchValue(response.data);
          var objDocR = [];
          this.selectedVessel = [];
          if (response.data.vessels != '' && response.data.vessels != null) {
            objDocR = response.data.vessels.split(',');
            this.selectVessel = response.data.vessels.split(',');
            objDocR.forEach((item) => {
              this.selectedVessel.push(this.Vessels.filter(x => x.vesselId.toString() == item));
            })
            const merge3 = this.selectedVessel.flat(1);
            this.selectedVessel = merge3;
          }
        }
      },
        (error) => {

        });
  }
  close() {
    this.clear();
    this.userFleetForm.reset();
    this.userFleetForm.controls.userFleetId.setValue(0);
    this.selectVessel = [];
    //this.userFleetForm.controls.vessels.setValue('');
    (document.getElementById('collapseFleet') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapseFleet') as HTMLElement).classList.remove("show");
  }
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
  clear() {
    this.userFleetForm.reset();
    this.userFleetForm.controls.userFleetId.setValue(0);
    this.uflfm.vessels.setValue('');
    this.selectVessel.length = 0;
    this.selectVessel = [];
    this.selectedVessel = [];
    // (document.getElementById('abc') as HTMLElement).focus();
  }
  // filterVessel() {
  //   this.reqService.filterRequisitionMasterwithvessel(this.selectedVesselId)
  //     .subscribe(response => {

  //       this.flag = status;

  //       this.dataSource.data = response.data;
  //       this.dataSource.sort = this.sort;
  //       this.dataSource.paginator = this.paginator;

  //       (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  //     });
  // }

  loadRights() {
    this.userManagementService.checkAccessRightByUrlList(this.masterMenus.join(',')).subscribe((response) => {
      if (response.status) {
        this.rights = response.data;
        if (this.rights.find(x => x.viewRight) === undefined) {
          this.masterView = false;
        } else {
          this.masterView = true;
        }
      }
    }, (error) => {
      console.log(error);
    })
  }


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
  loadName() {
    let userName = this.authStatusService.FullName();
  }
  loadDesignation() {
    let designation = this.authStatusService.Designation();
  }
  mouseEnter(div: string) {

    this.userName = this.authStatusService.FullName();
    this.designation = this.authStatusService.Designation();
    this.mouse_Enter = true;
    this.companyName = this.authStatusService.companyName();
    this.userCode = this.authStatusService.userCode();
    this.JoiningDate = this.authStatusService.JoiningDate();
    this.DOB = this.authStatusService.DOB();
    this.MobileNumber = this.authStatusService.MobileNumber();
    this.location = this.authStatusService.location();
    this.email = this.authStatusService.Email();
  }
  resetpassword(userId) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to reset Password',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.userManagementService.resetPassword(userId)
          .subscribe((response) => {
            if (response.status) {
              this.swal.success('Mail send of Password change successfully')
              //this.loadData(0);
              this.router.navigateByUrl("/login");
            }
          },
            (error) => {
              console.log(error);
            })
      }
    })
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
    }).then((result) => {
      if (result.value) {
        this.userManagementService.logout();
      }
      else {
        // this.swal.info('Select at least one row')
      }
    })
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
  closeModal() {
    $("#changePassModal").modal('hide');
  }
  comparePwd() {
    if (this.fm.newpassword.value != this.fm.confirmpassword.value)
      this.notMatched = true;
    else
      this.notMatched = false;
  }

}





