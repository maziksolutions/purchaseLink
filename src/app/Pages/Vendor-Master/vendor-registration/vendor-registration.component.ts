import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { SideNavService } from 'src/app/services/sidenavi-service';
import { environment } from 'src/environments/environment';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { VendorService } from 'src/app/services/vendor.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
declare let Swal, $: any;
@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  VendorMasterForm: FormGroup; flag; pkey: number = 0;
  vendorBranchInfo: FormGroup; 
  searchEngCtrl: FormControl = new FormControl();
  searchEngCtrl2: FormControl = new FormControl();
  LocationList: any;
  isLoading: boolean;
  LocationListTwo: any;
  twoisLoading: boolean;
  vendorInfoId: any;

  constructor(private fb: FormBuilder,private sideNavService:SideNavService,private route: Router, private http: HttpClient,
    private vendorservice :VendorService,private swal: SwalToastService,) { 
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

    // this.VendorMasterForm.get('vendorInfo')?.valueChanges.subscribe(() => {
    //   this.autoSave('vendorInfo');  
    // })
  }

  initForm(): void{
    this.VendorMasterForm = this.fb.group({
      vendorInfo: this.fb.group({
        vendorId: [0],
        companyName: ['', [Validators.required]],
        companyShortName: ['', [Validators.required]],
        address: ['', [Validators.required]],
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

    })

    this.vendorBranchInfo = this.fb.group({
        vendorBranchId: [0],
        branchName: ['', [Validators.required]],
        city: ['', [Validators.required]],
        address: ['', [Validators.required]],
        contPersonName: ['', [Validators.required]],
        email: ['', [Validators.required]],
        contactNo: ['', [Validators.required]],
        convenientPorts: ['', [Validators.required]],
        country: ['', [Validators.required]],
        vendorId:[0, [Validators.required]],
      }),
    

  

      this.FillLocation();
 this.FillLocationTwo();
  }

  private loadScript(scriptUrl: string): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);
  }

  FillLocation() {  
    this.searchEngCtrl.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.LocationList = [];
          this.isLoading = true;
         
        }),
        switchMap(value => this.http.get(environment.apiurl + "categoryMaster/searchLocation?search=" + value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe(data => {
        if (data == undefined) {
          this.LocationList = [];
        } else {
          debugger
          this.LocationList = data;

        }
      });
  }

  FillLocationTwo() {       
    this.searchEngCtrl2.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.twoisLoading = true;
          this.LocationListTwo = [];
         
        }),
        switchMap(value => this.http.get(environment.apiurl + "categoryMaster/searchLocation?search=" + value)
          .pipe(
            finalize(() => {
              this.twoisLoading = false
            }),
          )
        )
      )
      .subscribe(data => {
     
        if (data == undefined) {
          this.LocationListTwo = [];
        } else {
        debugger
          this.LocationListTwo = data;
        }
      });
  }

  displayFn(user: any) {
    if (user) { return user.location; }
    else {
      return "";
    }
  }

  getEngPosts(City) {
   
    const vendorform = this.VendorMasterForm.get('vendorInfo');

    vendorform?.patchValue({
      city: City.locationName + ',' + City.state,
      country: City.countryMaster?.countryName,
      
    });
  }

  getCCBranch(City) {

    this.vendorBranchInfo.controls.city.setValue(City.locationName + ',' + City.state);
    this.vendorBranchInfo.controls.country.setValue(City.countryMaster?.countryName);
  }

  autoSave(partName: string): void{
    if (partName == 'vendorBusinessInfo'){
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

    if(partName == 'vendorInfo'){
      debugger
      const vendorform = this.VendorMasterForm.get(partName);
      
      vendorform?.patchValue({
         vendorId: vendorform.value.vendorId,
         companyName: vendorform.value.companyName,
         companyShortName: vendorform.value.companyShortName,
         address: vendorform.value.address,
         city: vendorform.value.city,
         postalCode: vendorform.value.postalCode,
         country: vendorform.value.country,
        
      });
      
      if (partName == 'vendorInfo' && vendorform != null && vendorform.valid) {
        const formData = new FormData();
        debugger
        formData.append('data', JSON.stringify(vendorform.value))

        this.vendorservice.addvendorInfo(formData)
        .subscribe(data => {
          this.vendorInfoId = data.data
          if (data.message == "data added") {
            this.swal.success('Added successfully.');

          }
          else if (data.message == "updated") {
            this.swal.success('Data has been updated successfully.');
          
          }
          else if (data.message == "duplicate") {
            this.swal.info('Data already exist. Please enter new data');
            
          }
          else if (data.message == "not found") {
            this.swal.info('Data exist not exist');
            
          }
          else {
  
          }
  
        });
      }
    }
  }

  openbranchoffice(id){
    alert(id)
  
    $("#branch-office").modal('show');
  }

  onSubmitbranchoffice(form: any)
  {
    
  const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.vendorservice.addBranchoffice(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
      
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
         
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');

        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
           
        }
        else {

        }

      });
}

}
