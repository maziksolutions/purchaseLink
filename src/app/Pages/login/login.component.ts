import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Keys } from '../Shared/localKeys';
import { Router } from '@angular/router';
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
  constructor(private swal: SwalToastService, private userManagementService: UserManagementService,
    private router: Router, private authStatusService: AuthStatusService) { }

  ngOnInit(): void {
    // this.userId = this.authStatusService.userId();
    this.loginForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
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
        console.log(response)
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
