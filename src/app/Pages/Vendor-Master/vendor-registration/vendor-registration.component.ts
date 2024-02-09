import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { SideNavService } from 'src/app/services/sidenavi-service';
import { environment } from 'src/environments/environment';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { PurchaseMasterService } from 'src/app/services/purchase-master.service';
import { VendorService } from 'src/app/services/vendor.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { MatTableDataSource } from '@angular/material/table';

declare var $: any;
declare let Swal;

@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  VendorMasterForm: FormGroup; VendorSalesDepartFrom: FormGroup; VendorServiceDepartForm: FormGroup; flag; pkey: number = 0;
  searchEngCtrl: FormControl = new FormControl();
  LocationList: any;
  isLoading: boolean;

  dropdownCategorySetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  categoryDropdownList: { serviceCategoryId: number, serviceCategory: string }[] = [];
  categorySelectedItems: string[] = [];
  serviceCategory: any;

  dropdownServiceSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  dropdownList: { serviceTypeId: number, serviceType: string }[] = [];
  selectedItems: string[] = [];
  serviceTypes: any;

  vendorSalesData: any
  modalTarget: string = '';
  modal: string = '';

  vendorServiceData: any
  serviceModalTarget: string = ''
  serviceModal: string = '';

  constructor(private fb: FormBuilder, private sideNavService: SideNavService, private route: Router, private http: HttpClient, private zone: NgZone,
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

    this.VendorServiceDepartForm = this.fb.group({
      vendorServiceId: [0],
      contactPerson: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', Validators.required],
      contactNo: ['', Validators.required],
      vendorId: [0, [Validators.required]],
    })
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
        address: ['0', [Validators.required]],
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


    this.VendorMasterForm.get('vendorInfo')?.valueChanges.subscribe(() => {


    })

    this.FillLocation();
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
          this.LocationList = data;
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
      // vendorId: 0,
      // address: 'fdf',
      city: City.locationName + ',' + City.state,
      // postalCode: 23,
      country: City.countryMaster?.countryName,

    });
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

    }
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
  onAddSales() {
    debugger
    this.VendorSalesDepartFrom.patchValue({ vendorId: 1 })
    const formValues = this.VendorSalesDepartFrom.value;
    const formData = new FormData();
    formData.append('data', JSON.stringify(formValues));
    if (this.VendorSalesDepartFrom != null && this.VendorSalesDepartFrom.valid) {
      this.vendorService.addSalesInfo(formData).subscribe(data => {
        debugger
        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.loadVendorSalesData();
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.loadVendorSalesData();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
        }
        $("#sales-contact").modal('hide');
      })
    }
  }

  loadVendorSalesData() {
    this.vendorService.getSalesInfoByVendorId(1).subscribe(res => {
      if (res.status == true) {
        debugger
        this.zone.run(() => {
          this.vendorSalesData = []
          this.vendorSalesData = res.data;
        })
      }
    });
  }

  editSalesData(id) {
    debugger
    this.modal = 'modal'
    this.modalTarget = '#sales-contact'
    this.vendorService.getSalesInfoById(id).subscribe(res => {
      if (res.status == true) {
        debugger
        const data = res.data;
        this.VendorSalesDepartFrom.reset()
        this.VendorSalesDepartFrom.patchValue({
          vendorSalesId: data.vendorSalesId,
          contactPerson: data.contactPerson,
          designation: data.designation,
          email: data.email,
          contactNo: data.contactNo,
        })
        $("#sales-contact").modal('show');
      }
    })
  }
  //#endregion

  //#region Vendor Service Department
  onAddService() {
    debugger
    this.VendorServiceDepartForm.patchValue({ vendorId: 1 })
    const formValues = this.VendorServiceDepartForm.value;
    const formData = new FormData();
    formData.append('data', JSON.stringify(formValues));
    if (this.VendorServiceDepartForm != null && this.VendorServiceDepartForm.valid) {
      this.vendorService.addServiceInfo(formData).subscribe(data => {
        debugger
        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.loadVendorServiceData();
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.loadVendorServiceData();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
        }
        $("#service-contact").modal('hide');
      })
    }
  }

  loadVendorServiceData() {
    debugger
    this.vendorService.getServiceInfoByVendorId(1).subscribe(res => {
      if (res.status == true) {
        debugger
        this.zone.run(() => {
          debugger
          this.vendorServiceData = []
          this.vendorServiceData = res.data;
        })
      }
    });
  }

  editServiceData(id) {
    debugger
    this.modal = 'modal'
    this.modalTarget = '#service-contact'
    this.vendorService.getServiceInfoById(id).subscribe(res => {
      if (res.status == true) {
        debugger
        const data = res.data;
        this.VendorServiceDepartForm.reset()
        this.VendorServiceDepartForm.patchValue({
          vendorServiceId: data.vendorServiceId,
          contactPerson: data.contactPerson,
          designation: data.designation,
          email: data.email,
          contactNo: data.contactNo,
        })
        $("#service-contact").modal('show');
      }
    })
  }
  deleteServiceData(id){
    debugger
    this.modal = 'modal'
    this.modalTarget = '#service-contact'
    this.vendorService.getServiceInfoById(id).subscribe(res => {
      if (res.status == true) {
        debugger
        const data = res.data;
        this.VendorServiceDepartForm.reset()
        this.VendorServiceDepartForm.patchValue({
          vendorServiceId: data.vendorServiceId,
          contactPerson: data.contactPerson,
          designation: data.designation,
          email: data.email,
          contactNo: data.contactNo,
        })
        $("#service-contact").modal('show');
      }
    })
  }
  //#endregion

}
