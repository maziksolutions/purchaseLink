import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Keys } from '../Shared/localKeys';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStatusService } from 'src/app/services/guards/auth-status.service';
declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  userId: any;
  param1 :any;
  constructor(private router: Router,private swal: SwalToastService, private userManagementService: UserManagementService,
    private authStatusService: AuthStatusService, private route: ActivatedRoute,) {
      this.route.queryParams.subscribe(params => {
        this.param1 = params['pms'];      
    });

     }

  ngOnInit(): void {
    // this.userId = this.authStatusService.userId();
    this.loginForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })

if(parseInt(this.param1)>0)
{
  this.userManagementService.getUserById(this.param1).subscribe((response) => {    
    if (response.status) {      
      localStorage.setItem(Keys.userId, response.data.userId);
      localStorage.setItem(Keys.userName, response.data.userName);
      localStorage.setItem(Keys.token, response.data.token);
      localStorage.setItem(Keys.refreshtoken, response.data.refreshToken);
      this.router.navigate(['/Requisition/RequisitionsNew'])
    }
    else {
      Swal.fire('', 'Username/Password not found', "error");
    }
  })
    
    
}
  }
  get formControl() {
    return this.loginForm.controls;
  }

  loginHandler() {
    if (this.formControl.userName.invalid) {
      this.swal.error('User name is required');
      return;
    }
    if (this.formControl.password.invalid) {
      this.swal.error('Password is required');
      return;
    }
    if (this.loginForm.invalid) return;
    this.userManagementService.Auth(this.loginForm.value).subscribe((response) => {
      if (response.success) {
        localStorage.setItem(Keys.userId, response.userId);
        localStorage.setItem(Keys.userName, response.userName);
        localStorage.setItem(Keys.token, response.token);
        localStorage.setItem(Keys.refreshtoken, response.refreshToken);
        this.router.navigateByUrl("/welcome");
      }
      else {
        Swal.fire('', 'Username/Password not found', "error");
      }
    })

  }

}
