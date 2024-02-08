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
import { PurchaseMasterService } from 'src/app/services/purchase-master.service';


@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  VendorMasterForm: FormGroup; flags; pkeys: number = 0;
  vendorBranchInfo: FormGroup; 
  VendorSalesDepartFrom:FormGroup; flag; pkey: number = 0;
  searchEngCtrl: FormControl = new FormControl();
  searchEngCtrl2: FormControl = new FormControl();
  LocationList: any;
  isLoading: boolean;
  LocationListTwo: any;
  twoisLoading: boolean;
  vendorInfoId: any;

  dropdownCategorySetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  categoryDropdownList: { serviceCategoryId: number, serviceCategory: string }[] = [];
  categorySelectedItems: string[] = [];
  serviceCategory: any;

  dropdownServiceSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  dropdownList: { serviceTypeId: number, serviceType: string }[] = [];
  selectedItems: string[] = [];
  serviceTypes: any;

  constructor(private fb: FormBuilder, private sideNavService: SideNavService, private route: Router, private http: HttpClient,
    private purchaseService: PurchaseMasterService, private vendorService: VendorService, private swal: SwalToastService,) {
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
    // this.VendorMasterForm.get('vendorBusinessInfo')?.valueChanges.subscribe((headerValue) => {
    //   // if (headerValue && headerValue.requisitionId === 0) 
    //   this.autoSave('vendorBusinessInfo');
    // })

    this.LoadServiceType();
    this.loadCategoryType()

    this.dropdownServiceSetting = {
      singleSelection: false,
      idField: 'serviceTypeId',
      textField: 'serviceType',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    this.dropdownCategorySetting = {
      singleSelection: false,
      idField: 'serviceCategoryId',
      textField: 'serviceCategory',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    this.initForm()

    this.VendorSalesDepartFrom = this.fb.group({
      vendorSalesId: [0],
      contactPerson: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', Validators.required],
      contactNo: ['', Validators.required],      
      vendorId: [0, [Validators.required]],
    })

    // this.VendorMasterForm.get('vendorInfo')?.valueChanges.subscribe(() => {
    //   this.autoSave('vendorInfo');  
    // })
  }

  get vm() { return this.VendorMasterForm.controls };
  get vbo() { return this.VendorSalesDepartFrom.controls };

  LoadServiceType() {
    this.purchaseService.getServicetypes(0)
      .subscribe(response => {
        this.serviceTypes = response.data.map(item => ({
          serviceTypeId: item.serviceTypeId,
          serviceType: item.serviceType
        }))
      })
  }
  loadCategoryType() {
    this.purchaseService.getServiceCategories(0)
      .subscribe(response => {
        debugger
        this.serviceCategory = response.data.map(item => ({
          serviceCategoryId: item.serviceCategoryId,
          serviceCategory: item.serviceCategory
        }))
      })
  }

  initForm(): void {
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
      vendorBusinessInfo: this.fb.group({
        vendorBusinessId: [0],
        serviceType: ['', [Validators.required]],
        serviceCategory: ['', [Validators.required]],
        otherSpec: ['', [Validators.required]],
        classApproval: ['', [Validators.required]],
        makerApproval: ['', [Validators.required]],
        isoCertification: ['', [Validators.required]],
        otherCertification: ['', [Validators.required]],
        vendorId: [1, [Validators.required]],
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


  autoSave(partName: string): void {
    if (partName == 'vendorBusinessInfo') {
      debugger
      const formPart = this.VendorMasterForm.get(partName)

      if (formPart) {
        debugger
        const categoryIds = this.categorySelectedItems.join(',');
        const serviceTypeIds = this.selectedItems.join(',')
        const formValue = formPart.value;
        formValue.serviceCategory = categoryIds
        formValue.serviceType = serviceTypeIds        
      }    

      console.log('form Value :- ', formPart?.value)     

      // formPart?.patchValue({
      //   serviceCategory: categoryIds,
      //   serviceType: serviceTypeIds,
      // });
      const fmdata = new FormData();
      fmdata.append('data', JSON.stringify(formPart?.value));
      if (formPart != null && formPart.valid) {
        this.vendorService.addbusinessInfo(fmdata).subscribe(data => {
          debugger
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
        })
      }
      console.log(formPart?.value)
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

        this.vendorService.addvendorInfo(formData)
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

    this.vendorService.addBranchoffice(fmdata)
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

  //#region Service Category Dropdown 
  onSelectAllCat(event: any) {
    if (event)
      this.categorySelectedItems = event.map((x: { serviceCategoryId: any; }) => x.serviceCategoryId);
  }
  onItemSelectCat(event: any) {
    debugger
    let isSelect = event.serviceCategoryId;
    if (isSelect) {
      this.categorySelectedItems.push(event.serviceCategoryId);
    }
  }
  onCategoryDeSelect(event: any) {
    let rindex = this.categorySelectedItems.findIndex(categoryId => categoryId == event.serviceCategoryId);
    if (rindex !== -1) {
      this.categorySelectedItems.splice(rindex, 1)
    }
  }
  onCategoryDeSelectAll(event: any) {
    this.categorySelectedItems.length = 0;
  }
  //#endregion

  //#region Service Type Dropdown 
  onSelectAll(event: any) {
    if (event)
      this.selectedItems = event.map((x: { serviceTypeId: any; }) => x.serviceTypeId);
  }
  onItemSelect(event: any) {
    debugger
    let isSelect = event.serviceTypeId;
    if (isSelect) {
      this.selectedItems.push(event.serviceTypeId);
    }
  }
  onOrderTypeDeSelect(event: any) {
    debugger
    let rindex = this.selectedItems.findIndex(orderTypeId => orderTypeId == event.serviceTypeId);
    if (rindex !== -1) {
      this.selectedItems.splice(rindex, 1)
    }
  }
  onOrderTypeDeSelectAll(event: any) {
    this.selectedItems.length = 0;
  }
  //#endregion

  //#region Vendor Sales Department
  onAddSales(){

  }
}
