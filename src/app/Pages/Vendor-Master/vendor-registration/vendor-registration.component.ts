import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { SideNavService } from 'src/app/services/sidenavi-service';

@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  VendorMasterForm: FormGroup;

  constructor(private sideNavService:SideNavService,private route: Router,private fb: FormBuilder,) { 
    this.route.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sideNavService.initSidenav();
      }
    })
  }

  ngOnInit(): void {
    this.sideNavService.setActiveComponent(false)
    this.sideNavService.initSidenav()
    this.loadScript('assets/js/SideNavi.js')
    this.initForm()
    this.VendorMasterForm.get('vendorBusinessInfo')?.valueChanges.subscribe((headerValue) => {
      // if (headerValue && headerValue.requisitionId === 0) 
      this.autoSave('vendorBusinessInfo');
    })
  }

  initForm(): void{
    this.VendorMasterForm = this.fb.group({
      vendorInfo: this.fb.group({
        vendorId: [0],
        companyName: ['', [Validators.required]],
        companyShortName: ['', [Validators.required]],
        address: ['0', [Validators.required]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        country: ['', [Validators.required]]
      }),
      vendorBusinessInfo:this.fb.group({
        vendorBusinessId: [0],
        serviceCategory: ['', [Validators.required]],
        serviceType: ['', [Validators.required]],
        otherSpec: ['0', [Validators.required]],
        classApproval: ['0', [Validators.required]],
        makerApproval: ['', [Validators.required]],
        isoCertification: ['', [Validators.required]],
        otherCertification: ['', [Validators.required]],
        vendorId:[0, [Validators.required]],
      }),
      // vendorBranchInfo:this.fb.group({
      //   vendorBranchId: [0],
      //   branchName: ['', [Validators.required]],
      //   location: ['', [Validators.required]],
      //   otherSpec: ['0', [Validators.required]],
      //   classApproval: ['0', [Validators.required]],
      //   makerApproval: ['', [Validators.required]],
      //   isoCertification: ['', [Validators.required]],
      //   otherCertification: ['', [Validators.required]],
      //   vendorId:[0, [Validators.required]],
      // }),
    })
  }

  private loadScript(scriptUrl: string): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);
  }

  autoSave(partName: string): void{
    if (partName == 'vendorBusinessInfo'){
      debugger
      const formPart = this.VendorMasterForm.get(partName);
      formPart?.patchValue({
        vendorBusinessId: formPart?.value.vendorBusinessId,
        serviceCategory: formPart?.value.vendorBusinessId,
        serviceType: formPart?.value.vendorBusinessId,
        otherSpec: ['0', [Validators.required]],
        classApproval: ['0', [Validators.required]],
        makerApproval: ['', [Validators.required]],
        isoCertification: ['', [Validators.required]],
        otherCertification: ['', [Validators.required]],
        vendorId:[0, [Validators.required]],
      });
    }
  }

}
