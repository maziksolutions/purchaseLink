import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SideNavService } from 'src/app/services/sidenavi-service';
import { environment } from 'src/environments/environment';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { VendorService } from 'src/app/services/vendor.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { MatTableDataSource } from '@angular/material/table';
import { PurchaseMasterService } from 'src/app/services/purchase-master.service';
import { RequisitionService } from 'src/app/services/requisition.service';

declare let Swal, $: any;


@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  VendorMasterForm: FormGroup; flags; pkeys: number = 0;
  vendorBranchInfo: FormGroup;
  VendorSalesDepartForm: FormGroup; VendorServiceDepartForm: FormGroup;
  VendorAccountDeptForm: FormGroup; BankInformationForm: FormGroup;
  searchEngCtrl: FormControl = new FormControl();
  searchEngCtrl2: FormControl = new FormControl();
  LocationList: any;
  isLoading: boolean;
  LocationListTwo: any;
  twoisLoading: boolean;
  vendorInfoId: any;
  deletetooltip: string;
  vendorSalesData: any
  modalTarget: string = '';
  modal: string = '';

  vendorServiceData: any
  serviceModalTarget: string = ''
  serviceModal: string = '';

  dropdownCategorySetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  categoryDropdownList: { serviceCategoryId: number, serviceCategory: string }[] = [];
  categorySelectedItems: string[] = [];
  serviceCategory: any;

  dropdownServiceSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  dropdownList: { serviceTypeId: number, serviceType: string }[] = [];
  selectedItems: string[] = [];
  serviceTypes: any;

  
  vendorAccountData: any

  vendorId: any

  dropdownLocationPortSetting: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  LocationPortList: any;
  selectedLocationPort: string[] = [];
  selectLocationPort: string[] = [];
  dataBranchOffice: any;
  vendorBranchId: any;
  ConvenientPortsList: { locationId: number, fullName: string }[] = [];
  vendorBankInfoData: any[];
  ConfirmOnCallCheck: boolean;
  fileToUpload: File;
  FileName: string = "";
  

  constructor(private fb: FormBuilder, private sideNavService: SideNavService, private route: Router, private http: HttpClient,
    private purchaseService: PurchaseMasterService, private vendorService: VendorService, private swal: SwalToastService, private roote: ActivatedRoute, 
    private requisitionService: RequisitionService,private zone : NgZone) {
    this.route.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sideNavService.initSidenav();
      }
    })
  }

  ngOnInit(): void {
    debugger
    this.sideNavService.setActiveComponent(false)
    this.sideNavService.initSidenav()
    this.loadScript('assets/js/SideNavi.js')
    // this.VendorMasterForm.get('vendorBusinessInfo')?.valueChanges.subscribe((headerValue) => {
    //   // if (headerValue && headerValue.requisitionId === 0) 
    //   this.autoSave('vendorBusinessInfo');
    // })
    const vendorIdParam = this.roote.snapshot.paramMap.get('vendorId');
    if (vendorIdParam !== null) {
      this.vendorId = parseInt(vendorIdParam, 10);
      if (this.vendorId > 0) {
        this.getVendorMaster(this.vendorId)
      }
    }

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

    this.dropdownLocationPortSetting = {
      singleSelection: false,
      idField: 'locationId',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    this.initForm()

    this.VendorSalesDepartForm = this.fb.group({
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

    this.VendorAccountDeptForm = this.fb.group({
      vendorAccountId: [0],
      contactPerson: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', Validators.required],
      contactNo: ['', Validators.required],
      vendorId: [0, [Validators.required]],
    })

    this.BankInformationForm = this.fb.group({
      vendorBankInfoId: [0],
      companyName: ['', Validators.required],
      companyShortName: ['', Validators.required],
      preferredCurrency: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAddress: ['', Validators.required],
      branchOffice: ['', Validators.required],
      beneficiaryName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      ibanSwiftCode: ['', Validators.required],
      vatNo: ['', Validators.required],
      remarks: ['', Validators.required],
      confirmOnCall: ['', Validators.required],
      attachments:[''],
      vendorId:[ 0, Validators.required],
    })

    // this.VendorMasterForm.get('vendorInfo')?.valueChanges.subscribe(() => {
    //   this.autoSave('vendorInfo');  
    // })
  }

  get vm() { return this.VendorMasterForm.controls };
  get vsf() { return this.VendorSalesDepartForm.controls };
  get vBranchf() { return this.vendorBranchInfo.controls }
  get vserF() { return this.VendorServiceDepartForm.controls };
  get vaf() { return this.VendorAccountDeptForm.controls };

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
        vendorId: [0, [Validators.required]],
      }),

    })

    this.vendorBranchInfo = this.fb.group({
        vendorBranchId: [0],
        branchName: ['', [Validators.required]],
        city: ['', [Validators.required]],
        country: ['', [Validators.required]],
        address: ['', [Validators.required]],
        contPersonName: ['', [Validators.required]],
        email: ['', [Validators.required]],
        contactNo: ['', [Validators.required]],
        convenientPorts: ['', [Validators.required]],     
        vendorId:[0],
      }),
    
      this.VendorAccountDeptForm = this.fb.group({
        vendorAccountId: [0],
        contactPerson: ['', Validators.required],
        designation: ['', Validators.required],
        email: ['', Validators.required],
        contactNo: ['', Validators.required],
        vendorId: [0, [Validators.required]],
      })
  
  

      this.FillLocation();
      this.FillLocationTwo();
      this.loadPortList();
      // this.loadData();
      // this.loadBankInformation();
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

  loadPortList() {
    this.requisitionService.GetPortList(0)
      .subscribe(response => {
debugger
        this.LocationPortList= response.data.map(item => ({
          locationId: item.locationId,
          fullName: `${item.locationName} ${item.countryMaster.countryName}`,

        }));

     
      });
  }

  onLocationPortSelect(event: any) {
    debugger
    let isSelect = event.locationId;
    if (isSelect) {
      this.selectedLocationPort.push(event.locationId);

    }
  }

  onLocationPortSelectAll(event: any) {
    if (event)
      this.selectedLocationPort = event.map((x: { locationId: any; }) => x.locationId);
  }

  onLocationPortDeSelect(event: any) {

    let rindex = this.selectLocationPort.findIndex(locationId => locationId == event.locationId);
    if (rindex !== -1) {
      this.selectedLocationPort.splice(rindex, 1)
    }
  }
  onLocationPortDeSelectAll(event: any) {

    this.selectedLocationPort.length = 0;
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
      if (this.vendorId != null) {
        debugger
        const formPart = this.VendorMasterForm.get(partName)

        if (formPart) {
          debugger
          const categoryIds = this.categorySelectedItems.join(',');
          const serviceTypeIds = this.selectedItems.join(',')
          const formValue = formPart.value;
          formValue.serviceCategory = categoryIds
          formValue.serviceType = serviceTypeIds
          formValue.vendorId = this.vendorId
        }

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

    if (partName == 'vendorInfo') {
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
    this.vendorBranchInfo.reset();
    this.vendorBranchInfo.controls.vendorBranchId.setValue(0);
    this.vendorBranchInfo.controls.branchName.setValue('');
    this.vendorBranchInfo.controls.city.setValue('');
    this.vendorBranchInfo.controls.address.setValue('');
    this.vendorBranchInfo.controls.contPersonName.setValue('');
    this.vendorBranchInfo.controls.email.setValue('');
    this.vendorBranchInfo.controls.contactNo.setValue('');
    this.vendorBranchInfo.controls.convenientPorts.setValue('');
    this.vendorBranchInfo.controls.country.setValue('');
    this.vendorBranchInfo.controls.vendorId.setValue(id);

    $("#branch-office").modal('show');
  }

  Closebranchoffice(){
    this.vendorBranchInfo.reset();
    this.vendorBranchInfo.controls.vendorBranchId.setValue(0);
    this.vendorBranchInfo.controls.branchName.setValue('');
    this.vendorBranchInfo.controls.city.setValue('');
    this.vendorBranchInfo.controls.address.setValue('');
    this.vendorBranchInfo.controls.contPersonName.setValue('');
    this.vendorBranchInfo.controls.email.setValue('');
    this.vendorBranchInfo.controls.contactNo.setValue('');
    this.vendorBranchInfo.controls.convenientPorts.setValue('');
    this.vendorBranchInfo.controls.country.setValue('');
    this.vendorBranchInfo.controls.vendorId.setValue(this.vendorInfoId);

    $("#branch-office").modal('hide');
  }

  onSubmitbranchoffice(form: any)
  {
    debugger
    form.value.vendorId = 1;
    form.value.convenientPorts = this.selectedLocationPort.join(',')
  const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.vendorService.addBranchoffice(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
         this.Closebranchoffice();
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.Closebranchoffice();
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.Closebranchoffice();
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.Closebranchoffice();
        }
        $("#branch-office").modal('hide');

      });
}


loadData() {
 let id= 1;
 alert(id)
  this.vendorService.getBranchoffice(id)
    .subscribe(response => {

      debugger
      this.dataBranchOffice = response.data;

      // this.dataSource.sort = this.sort;
      // this.dataSource.paginator = this.paginator;

    });
}

UpdateBranchoffice(id){

 
    this.vendorBranchId = id;
    alert(  this.vendorBranchId)
    $("#branch-office").modal('show');
    this.vendorService.getBranchofficeId(id)
      .subscribe((response) => {
        
        if (response.status) {
  debugger

  
  this.ConvenientPortsList = [];
  if (response.data.convenientPorts != '' && response.data.convenientPorts != null) {
    
    const objProcR = response.data.convenientPorts.split(',');

    this.ConvenientPortsList = objProcR.map(item => {
      return this.LocationPortList.find(x => x.locationId == item);
    });
    const merge4 = this.ConvenientPortsList.flat(1);
    this.ConvenientPortsList = merge4;  
    this.selectedLocationPort.length=0; 
    this.ConvenientPortsList.map(item=>{
      this.selectedLocationPort.push(item.locationId.toString());
    })       
  }
  
  response.data.convenientPorts = this.ConvenientPortsList;

          this.vendorBranchInfo.controls.country.setValue(response.data.country);
          this.vendorBranchInfo.patchValue(response.data);
        
        }
      },
        (error) => {
  
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
  onAddSales() {
    debugger
    this.VendorSalesDepartForm.patchValue({ vendorId: 1 })
    const formValues = this.VendorSalesDepartForm.value;
    const formData = new FormData();
    formData.append('data', JSON.stringify(formValues));
    if (this.VendorSalesDepartForm != null && this.VendorSalesDepartForm.valid) {
      this.vendorService.addSalesInfo(formData).subscribe(data => {
        debugger
        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.loadVendorSalesData();
          this.VendorSalesDepartForm.reset();
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
    this.vendorService.getSalesInfoById(id).subscribe(res => {
      if (res.status == true) {
        debugger
        const data = res.data;
        this.VendorSalesDepartForm.reset()
        this.VendorSalesDepartForm.patchValue({
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
  deleteSalesData(id) {
    debugger
    this.vendorService.archiveSalesInfo(id).subscribe(res => {
      if (res) {
        debugger
        this.loadVendorSalesData()
        $("#sales-contact").modal('hide')
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
          this.VendorServiceDepartForm.reset();
          this.VendorServiceDepartForm.controls.vendorServiceId.setValue(0)
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.loadVendorServiceData();
          this.VendorServiceDepartForm.reset();
          this.VendorServiceDepartForm.controls.vendorServiceId.setValue(0)
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
        this.VendorAccountDeptForm.reset()
        this.VendorAccountDeptForm.patchValue({
          vendorAccountId: data.vendorAccountId,
          contactPerson: data.contactPerson,
          designation: data.designation,
          email: data.email,
          contactNo: data.contactNo,
        })
        $("#accounts-contact").modal('show');
      }
    })
  }
  deleteAccountData(id) {
    debugger
    this.vendorService.archiveAccountInfo(id).subscribe(res => {
      if (res) {
        debugger
        // this.loadVendorAccountData();
        this.VendorAccountDeptForm.reset()
        this.VendorAccountDeptForm.controls.vendorAccountId.setValue(0)
        $("#accounts-contact").modal('hide');
      }
    })
  }
  //#endregion

  //#region Edit VendorMaster Method
  getVendorMaster(id) {
    this.vendorService.getVendorInfoById(id).subscribe(res => {
      debugger
      if (res.status === true) {
        const vendorMasterData = res.data;
        const formPart = this.VendorMasterForm.get('vendorInfo');
        if (formPart) {
          formPart.patchValue({
            vendorId: vendorMasterData.vendorId,
            companyName: vendorMasterData.companyName,
            companyShortName: vendorMasterData.companyShortName,
            address: vendorMasterData.address,
            city: vendorMasterData.city,
            postalCode: vendorMasterData.postalCode,
            country: vendorMasterData.country
          });
          this.vendorService.getBusinessInfoByVendorId(id).subscribe(res => {
            if (res.status === true) {
              debugger
              const vendorBusinessData = res.data;
              const businessform = this.VendorMasterForm.get('vendorBusinessInfo');
              if (businessform) {
                this.dropdownList = [];
                this.categoryDropdownList = []
                if (vendorBusinessData.serviceType != '' && vendorBusinessData.serviceType != null) {
                  const objProcR = vendorBusinessData.serviceType.split(',');
                  this.dropdownList = objProcR.map(item => {
                    return this.serviceTypes.find(x => x.serviceTypeId == item);
                  });
                  const merge4 = this.dropdownList.flat(1);
                  this.dropdownList = merge4;
                  this.selectedItems.length = 0;
                  this.dropdownList.map(item => {
                    this.selectedItems.push(item.serviceTypeId.toString());
                  })
                }
                if (vendorBusinessData.serviceCategory != '' && vendorBusinessData.serviceCategory != null) {
                  const objProcR = vendorBusinessData.serviceCategory.split(',');
                  this.categoryDropdownList = objProcR.map(item => {
                    return this.serviceCategory.find(x => x.serviceCategoryId == item);
                  });
                  const merge4 = this.categoryDropdownList.flat(1);
                  this.categoryDropdownList = merge4;
                  this.categorySelectedItems.length = 0;
                  this.categoryDropdownList.map(item => {
                    this.categorySelectedItems.push(item.serviceCategoryId.toString());
                  })
                }
                businessform.patchValue({
                  vendorBusinessId: vendorBusinessData.vendorBusinessId,
                  // serviceType: vendorBusinessData.serviceType,
                  // serviceCategory: vendorBusinessData.serviceCategory,
                  otherSpec: vendorBusinessData.otherSpec,
                  classApproval: vendorBusinessData.classApproval,
                  makerApproval: vendorBusinessData.makerApproval,
                  isoCertification: vendorBusinessData.isoCertification,
                  otherCertification: vendorBusinessData.otherCertification,
                })
              }
            }
          })
        }
      }
    })
  }

  onAddAccount(){

  }

  // deleteSalesData(id){

  // }

  //#region Bank Information


ClearBankInfoModal(){
  this.BankInformationForm.reset();
  this.BankInformationForm.controls.vendorBankInfoId.setValue(0);
  this.BankInformationForm.controls.companyName.setValue('');
  this.BankInformationForm.controls.companyShortName.setValue('');
  this.BankInformationForm.controls.preferredCurrency.setValue('');
  this.BankInformationForm.controls.bankName.setValue('');
  this.BankInformationForm.controls.bankAddress.setValue('');
  this.BankInformationForm.controls.branchOffice.setValue('');
  this.BankInformationForm.controls.beneficiaryName.setValue('');
  this.BankInformationForm.controls.accountNumber.setValue('');
  this.BankInformationForm.controls.ibanSwiftCode.setValue('');
  this.BankInformationForm.controls.vatNo.setValue('');
  this.BankInformationForm.controls.remarks.setValue('');
  this.BankInformationForm.controls.confirmOnCall.setValue('');
  this.BankInformationForm.controls.attachments.setValue('');
  this.BankInformationForm.controls.vendorId.setValue(this.vendorInfoId);
  this.FileName=""
  $("#bank-details").modal('show');

}

  onSubmitBankInformation(form: any){
debugger
const files = document.getElementById('formFile') as HTMLInputElement;

     if (files !== null) { 
         const file = files.files;
         if (file) {         
          const fileName = file[0].name;
          form.value.attachments = fileName;
         } 
     }
     form.value.vendorId = 1;
     const fmdata = new FormData();
     fmdata.append('data', JSON.stringify(form.value));
 
     this.vendorService.addBankInformation(fmdata)
       .subscribe(data => {
 
         if (data.message == "data added") {
           this.swal.success('Added successfully.');
           this.ClearBankInfoModal();
          this.loadBankInformation();
         }
         else if (data.message == "updated") {
           this.swal.success('Data has been updated successfully.');
           this.ClearBankInfoModal();
           this.loadBankInformation();
         }
         else if (data.message == "duplicate") {
           this.swal.info('Data already exist. Please enter new data');
           this.ClearBankInfoModal();
           this.loadBankInformation();
         }
         else if (data.message == "not found") {
           this.swal.info('Data exist not exist');
           this.ClearBankInfoModal();
           this.loadBankInformation();
         }
         else {
 
         }
 
       });

  }

  loadBankInformation() {
    
    this.vendorService.getBankInformation(1).subscribe(res => {
      if (res.status == true) {
        debugger
        // this.zone.run(() => {
          debugger
          this.vendorBankInfoData = []
          this.vendorBankInfoData = res.data;
        // })
      }
    });
  }

  editvendorBankInfo(id){
    $("#bank-details").modal('show');
    this.vendorService.getBankInformationId(id).subscribe(res => {
      if (res.status == true) {
        debugger
        if(res.data.confirmOnCall == true){
          this.ConfirmOnCallCheck = true;
          
        }
        this.FileName = res.data.attachments  
        this.BankInformationForm.patchValue(res.data)
      
       
      }
    })
  }

  FileSelect(event) {  

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.fileToUpload = file;   
      this.FileName = file.name; 
      
    } else {
      this.FileName = "Choose file";
    }
  }
  //#endregion
}
