import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-add-vessel',
  templateUrl: './add-vessel.component.html',
  styleUrls: ['./add-vessel.component.css']
})
export class AddVesselComponent implements OnInit {
  addVesselForm: FormGroup; flag; pkey: number = 0;
  submitted = false;
  VesselId: any;
  status: number = 0;
  shipTypes: any;
  classifications: any;
  engineTypes: any;
  engineModels: any;
  ecdis: any;
  countries: any;
  seaports: any;
  companies: any;
  displayedColumns: string[] = ['checkbox', 'vesselNane', 'vesselCode', 'shipId'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  owners: any;
  disponentOwners: any;
  managers: any;
  principals: any;
  builders: any;
  rights: RightsModel;

  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService, private swal: SwalToastService, private vesselManagementService: VesselManagementService,
    private unitMasterService: UnitmasterService, private route: ActivatedRoute, private router: Router, private administrationService: UserManagementService,
    private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.VesselId = this.route.snapshot.paramMap.get('id');
    this.addVesselForm = this.fb.group({
      vesselId: [0],
      vesselName: ['', [Validators.required]],
      previousName: [''],
      shipId: ['', [Validators.required]],
      callSign: [''],
      mmsi: [''],
      imo: ['', [Validators.required]],
      official: [''],
      classificationId: ['', [Validators.required]],
      classNotation: [''],
      vesselCode: ['', [Validators.required]],
      iceClass: [''],
      flagId: ['', [Validators.required]],
      portOfRegistry: [''],
      ownerId: ['', [Validators.required]],
      disponentOwnerId: [0],
      principalId: ['', [Validators.required]],
      hullNo: ['', [Validators.required]],
      keelLaid: [''],
      launched: [''],
      delivery: [''],
      takeoverDate: [''],
      gtHour: [''],
      portOfTakeover: [0],
      portOfHandover: [0],
      handoverDate: [''],
      builderId: [0],
      operatingArea: [''],
      classNo: [''],
      commercialManager1: [0],
      commercialManager2: [0],
      crewmanager1: [0],
      crewmanager2: [0],
      techManager1: [0],
      techManager2: [0],
      net: [''],
      gross: ['', [Validators.required]],
      suez: [''],
      panama: [''],
      pi: [0],
      hm: [0],
      deductible1: [''],
      deductible2: [''],
      loa: ['', [Validators.required]],
      lbp: [''],
      breadth: ['', [Validators.required]],
      depth: [''],
      height: [''],
      serviceSpeed: [''],
      isHighVoltageEquipment: [''],
      engineTypeId: [''],
      engineModelId: [''],
      mCR: [''],
      kw: [''],
      aauxEngine1: [''],
      auxModel1: [''],
      auxMake1: [''],
      auxKw1: [''],
      auxEngine2: [''],
      auxModel2: [''],
      auxMake2: [''],
      auxKw2: [''],
      auxEngine3: [''],
      auxModel3: [''],
      auxMake3: [''],
      auxKw3: [''],
      auxBoiler: [''],
      auxModel4: [''],
      auxMake4: [''],
      kGHR: [''],
      equipmentName: [''],
      equpModel5: [''],
      equpMake5: [''],
      propulsion: [''],
      lifeBoat: [''],
      capacity: [''],
      seqCapacity: [''],
      remarks: [''],
      lifeRaft1: [''],
      lifeRaft2: [''],
      lifeRaft3: [''],
      cargoEquipment: [''],
      communicationEquipment: [''],
      vesselParticulars: [''],
      anniversaryDate: [''],
      eCDIS1: [''],
      eCDIS2: [''],
      eCDIS2Model: [''],
      eCDIS2Mode2: [''],
      eCDIS2Maker1: [''],
      eCDIS2Maker2: [''],
      summer: [''],
      summerFreeboard: [''],
      summerDraft: [''],
      summerDeadWeight: ['', [Validators.required]],
      summerDisplacement: [''],
      winter: [''],
      winterFreeboard: [''],
      winterDraft: [''],
      winterDeadWeight: [''],
      winterDisplacement: [''],
      tropical: [''],
      tropicalFreeboard: [''],
      tropicalDraft: [''],
      tropicalDeadWeight: [''],
      tropicalDisplacement: [''],
      lightship: [''],
      lightshipFreeboard: [''],
      lightshipDraft: [''],
      lightshipDeadWeight: [''],
      lightshipDisplacement: [''],
      ballast: [''],
      ballastFreeboard: [''],
      ballastDraft: [''],
      ballastDeadweight: [''],
      ballastDisplacement: [''],
      freshWater: [''],
      freshWaterFreeboard: [''],
      freshWaterDraft: [''],
      FreshWaterDeadweight: [''],
      freshWaterDisplacement: [''],
      tropicalFreshWater: [''],
      tropicalFreshWaterFreeboard: [''],
      tropicalFreshWaterDraft: [''],
      tropicalFreshWaterDeadWeight: [''],
      tropicalFreshWaterDisplacement: [''],
      winterAtlantic: [''],
      winterAtlanticFreeboard: [''],
      winterAtlanticDraft: [''],
      winterAtlanticDeadWeight: [''],
      winterAtlanticDisplacement: [''],
      accommodationBerth: [0],
      hospitalBerth: [0],
      treatmentDays: [0],
      treatmentRemark: [''],
      satBPhone: [''],
      satBFax: [''],
      fleet77Phone: [''],
      fleet77Fax: [''],
      fBBPhone: [''],
      fBBFax: [''],
      sATCTelex: [''],
      email: [''],
      notificationEmail: [''],
      accountInchargeEmail: [''],
      vsatPhone: [''],
      vSATFax: [''],
      mobileNo: [''],
      mobileNo1: [''],
      mobileNo2: [''],
      iSP: [''],
      vesselImage: ['0'],
      isActive: [false],
      transitWageApplicable: [false],
      bow: [''],
      stern: [''],
      cpp: [''],
      cargoTanks: [''],
      cargoHolds: [''],
      cargoCoating: [''],
      cargoPump: [''],
      cargoCranesMaker: [''],
      cargoPumpType: [''],
      cranesModel: [''],
      pumpCapacity: [''],
      cranesCapacity: [''],
      cranesNumber: [''],
      ballastPump: [0],
      grabMaker: [''],
      ballastPumpType: [''],
      grabCapacity: [''],
      ballastEductor: [''],
      grabsNumber: [0],
      ecdisId1: [''],
      ecdisId2: [''],
      ecdisId3: [''],
      ecdisType1: [''],
      ecdisType2: [''],
      ecdisType3: [''],
      qualifiedIndividual: [''],
      mainEngineCount: [0],
      suezCabinBerth: [0],
      isOperational: [false]
    });
    this.loadRights();   
    this.loadCompany(); 
    this.loadShipTypes();
    this.loadClassifications();
    this.loadEngineTypes();
    this.loadEngineModels();
    this.loadECDISs();
    this.loadCountry();
    this.loadSeaport(); 
  }
  ngAfterViewInit()
  {
    if (parseInt(this.VesselId) > 0) {
      this.Updatedata(this.VesselId);     
    }
  }
  get fm() { return this.addVesselForm.controls };

  loadRights() {
    this.userManagementService.checkAccessRight(administrationNavEnum.vesselRegister).subscribe((response) => {
      if (response.status) {
        this.rights = response.data;
      } else {
        this.rights = new RightsModel();
        this.rights.addRight = this.rights.ammendRight = this.rights.deleteRight = this.rights.importRight = this.rights.viewRight = false;
      }
      if (!this.rights.viewRight) {
        alert('you have no view right')
        this.router.navigate(['welcome']);
      }
    }, (error) => {
      console.log(error);
    })
  }
  onSubmit(form: any) {
    this.submitted = true;
    if (this.addVesselForm.valid == false) {
      this.swal.error('Please enter data in required fields.')

      return;
    }
    this.fm.pi.setValue(1);
    this.fm.hm.setValue(1);
    this.fm.vesselImage.setValue('abcd');
    this.vesselManagementService.addVessel(form.value)
      .subscribe(data => {
        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.clear();
          this.router.navigateByUrl('/administration/vesselRegister');       
        }

        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.router.navigateByUrl('/administration/vesselRegister');
          this.clear();         
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
  close() {
    this.addVesselForm.reset();
    this.addVesselForm.controls.vesselId.setValue(0);
    this.addVesselForm.controls.shipId.setValue(0);
    this.addVesselForm.controls.classificationId.setValue(0);
    this.addVesselForm.controls.engineTypeId.setValue(0);
    this.addVesselForm.controls.engineModelId.setValue(0);
    this.addVesselForm.controls.eCDIS1.setValue(0);
    this.router.navigateByUrl('/administration/vesselRegister');
  }

  clear() {
    this.addVesselForm.reset();
    this.addVesselForm.controls.vesselId.setValue(0);
    this.addVesselForm.controls.shipId.setValue(0);
    this.addVesselForm.controls.classificationId.setValue(0);
    this.addVesselForm.controls.engineTypeId.setValue(0);
    this.addVesselForm.controls.engineModelId.setValue(0);
    this.addVesselForm.controls.eCDIS1.setValue(0);
  }

  loadShipTypes() {
    this.vesselManagementService.getShipTypes(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.shipTypes = response.data;
          (document.getElementById('abc') as HTMLElement).focus();
        } else {
          this.shipTypes = [];
          (document.getElementById('abc') as HTMLElement).focus();
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadCountry() {
    this.unitMasterService.GetCountry(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.countries = response.data;
        } else {
          this.countries = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }

  loadCompany() {
    this.administrationService.getAllCompanies(this.status)
      .subscribe((response) => {
        if (response.status) {         
          this.owners = response.data.filter(x => x.companyType.companyTypeName == 'OWNER');        
          this.disponentOwners = response.data.filter(x => x.companyType.companyTypeName == 'DISPONENT OWNER');
          this.managers = response.data.filter(x => x.companyType.companyTypeName == 'MANAGER');
          this.principals = response.data.filter(x => x.companyType.companyTypeName == 'PRINCIPAL');
          this.builders = response.data.filter(x => x.companyType.companyTypeName == 'BUILDER');
        } else {
          this.owners = [];        
          this.disponentOwners =[];
          this.managers = [];
          this.principals =[];
          this.builders = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadSeaport() {
    this.unitMasterService.getPorts()
      .subscribe((response) => {
        if (response.status) {
          this.seaports = response.data;
        } else {
          this.seaports = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadClassifications() {
    this.unitMasterService.getClassificationList(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.classifications = response.data;
        } else {
          this.classifications = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }

  loadEngineTypes() {
    this.vesselManagementService.getEngineTypes(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.engineTypes = response.data;
        } else {
          this.engineTypes = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadEngineModels() {
    this.vesselManagementService.getEngineModels(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.engineModels = response.data;
        } else {
          this.engineModels = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }
  loadECDISs() {
    this.vesselManagementService.getECDIS(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.ecdis = response.data;
        } else {
          this.ecdis = [];
        }
      },
        (error) => {
          console.log(error);
        })
  }


  Updatedata(id) {
    // (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    // (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.vesselManagementService.getVesselById(id)
      .subscribe((response) => {
        if (response.status) {
          this.addVesselForm.patchValue(response.data);
          this.pkey = response.data.vesselId;

        }
      },
        (error) => {

        });
  }

}
