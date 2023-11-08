import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router,ActivatedRoute,NavigationEnd, NavigationStart,RouteConfigLoadStart  } from '@angular/router';
import { RightsModel } from 'src/app/Pages/Models/page-rights';
import { Keys } from 'src/app/Pages/Shared/localKeys';
import { registerNavEnum } from 'src/app/Pages/Shared/rights-enum';
import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
declare let Swal, PerfectScrollbar: any,$: any;
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.css']
})
export class SiteLayoutComponent implements OnInit {
  userId:any;
  moduleAccess:any;
  PMS_View: boolean = false;
  QHSE_View: boolean = false;
  masterMenus: string[] = Object.keys(registerNavEnum).map(key => registerNavEnum[key]);
  Administration_View:boolean = false;
  Purchase_View:boolean = false;
  Crewlink_View:boolean = false;
  private modules: any[] = [];
  rights: RightsModel[] = [];
  masterView: boolean = false;
  notMatched: boolean=false;
  userName:any;
  designation:any;
  changePassForm: FormGroup;
  mouse_Enter:boolean = false;
  fullName:any;
  JoiningDate:any;
  userCode:any;
  DOB:any;
  MobileNumber:any;
  location:any;
  email:any;
  companyName:any;
  currentRoute: string;
  routeUrl:any;
  abUrl: string;
  //test
  purchaseroute:string;
  purchaseroutee:boolean=false;
  
  currentPath: string = '';

  constructor(private authStatusService: AuthStatusService,private userManagementService: UserManagementService
    ,private swal: SwalToastService,private router: Router, private fb: FormBuilder,private route: ActivatedRoute) {
      var url= window.location.href; 
      this.routeUrl=url.split('//')[1].split('/')[1].toString(); 
     }

  ngOnInit(): void {
   
    
    var userId = this.authStatusService.userId();
    this.changePassForm = this.fb.group({
      userId: [userId],
      oldPass: ['', Validators.required],
      newpassword: ['', [Validators.required,   Validators.pattern( /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),Validators.minLength(8),Validators.maxLength(20)]],
      confirmpassword: ['', [Validators.required,   Validators.pattern( /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),Validators.minLength(8),Validators.maxLength(20)]]
    })
    this.loadRights();
    this.loadModules();
    this.loadName();
    this.loadDesignation();
    this.loadNotificationMenuRights();
  }
  get fm() { return this.changePassForm.controls };

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


  loadModules(){
    let role = this.authStatusService.ModuleAccess();
  this.modules  =  role.split(',');
  
  if(this.modules.includes('PMS'))
  {
    this.PMS_View = true;
  }
   
  if(this.modules.includes(' QHSE'))
  {
    this.QHSE_View = true;
  }
  
  if(this.modules.includes('Administration'))
  {
    this.Administration_View = true;
  }
  if(this.modules.includes('Purchase'))
  {
    this.Purchase_View = true;
  }
  if(this.modules.includes('Crewlink'))
  {
    this.Crewlink_View = true;
  }
  
  }
  loadName(){  
    let userName = this.authStatusService.FullName();
  }
  loadDesignation(){    
    let designation = this.authStatusService.Designation();    
  }
  mouseEnter(div : string){
  
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
  resetpassword(userId){   
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
    }).then((result)=>{
      if (result.value){
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
  
          if(response.messageForRejection == "Incorrect old Password") {
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
  comparePwd()
{  
  if(this.fm.newpassword.value != this.fm.confirmpassword.value)
  this.notMatched=true;
  else
  this.notMatched=false;
}

// loadNotificationMenuRights()
//    {


//     this.router.events.subscribe((event) => {
//       if (event instanceof NavigationEnd) {
        
//         this.currentPath = event.url;
//         if(this.currentPath=="/Requisition/Requisitionslist")
//         this.purchaseroutee = true;
//       alert("if")
   
//       }
//       else
//       {
//         alert("else")
//         this.purchaseroutee = false;

//       }
//     });

//       }
   
// loadtest()
// {
//   this.router.events.subscribe((event) => {
//     if (event instanceof NavigationEnd) {
      
//       this.currentPath = event.url;
//   }};

//   if(this.currentPath=="/Requisition/Requisitionslist")
//   this.purchaseroutee = true;

//   else
//   {
//     this.purchaseroutee = false;

//   }
// }


// loadNotificationMenuRights() {
//   this.router.events.subscribe((event) => {
//     if (event instanceof  RouteConfigLoadStart) {
//       this.currentPath = event.url;
      
//       if (this.currentPath === "/Requisition/Requisitionslist") {
//         this.purchaseroutee = true;
      
        
//       } else {
//         this.purchaseroutee = false;
        
//       }
//     }
//   });
// }

loadNotificationMenuRights() {
   this.router.events.subscribe((event) => {
    if (event instanceof NavigationStart   ) {
 
      // Get the current URL from the router service
      const currentPath = this.router.url;
      
      if (currentPath === "/Requisition/Requisitionslist") {
   
        this.purchaseroutee = true;
      } else {
        this.purchaseroutee = false;
      }
    }


    if (event instanceof NavigationEnd   ) {

      // Get the current URL from the router service
      const currentPath = this.router.url;
      
      if (currentPath === "/Requisition/Requisitionslist") {
    
        this.purchaseroutee = true;
      } else {
        this.purchaseroutee = false;
      }
    }



  });
}







  }





