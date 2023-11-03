import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { VesselManagementService } from 'src/app/services/vessel-management.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { UserManagementService } from 'src/app/services/user-management.service';
import { Router } from '@angular/router';
import { RightsModel } from '../../Models/page-rights';
import { administrationNavEnum } from '../../Shared/rights-enum';
declare let Swal, PerfectScrollbar: any;
@Component({
  selector: 'app-vessel-register',
  templateUrl: './vessel-register.component.html',
  styleUrls: ['./vessel-register.component.css']
})
export class VesselRegisterComponent implements OnInit {
  status: number = 0;
  shipTypes:any;
  @ViewChild('searchInput') searchInput: ElementRef;
  classifications:any;
  engineTypes:any;
  engineModels:any;
  ecdis:any;
  rights:RightsModel;
  deletetooltip:any;
  vesselForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'vesselNane','vesselCode','owners','shipId','flagId','callSign','imo','isActive'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private fb: FormBuilder, public dialog: MatDialog,
    private exportExcelService: ExportExcelService, private swal: SwalToastService,private vesselManagementService:VesselManagementService,
    private router:Router, private userManagementService: UserManagementService, private unitMasterService:UnitmasterService) {    this.dataSource.filterPredicate = (data, filter: string) => {
      const accumulator = (currentTerm, key) => {
        return this.nestedFilterCheck(currentTerm, data, key);
      };
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      // Transform the filter by converting it to lowercase and removing whitespace.
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };   

  }
  nestedFilterCheck(search, data, key) {
    if (typeof data[key] === 'object') {
      for (const k in data[key]) {
        if (data[key][k] !== null) {
          search = this.nestedFilterCheck(search, data[key], k);
        }
      }
    } else {
      search += data[key];
    }
    return search;
  }

  ngOnInit(): void {  
    this.loadRights();
    this.loadData(0);
    this.loadShipTypes();
    this.loadClassifications();
    this.loadEngineTypes();
    this.loadEngineModels();
    this.loadECDISs();
  } 

  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.vesselRegister).subscribe((response)=>{
if(response.status){
this.rights=response.data;
}else{
  this.rights=new RightsModel(); 
  this.rights.addRight=this.rights.ammendRight=this.rights.deleteRight=this.rights.importRight=this.rights.viewRight=false;
}
if(!this.rights.viewRight){
  alert('you have no view right')
  this.router.navigate(['welcome']);
}
    },(error)=>{
console.log(error);
    })
  }  

  loadData(status: number) {
    if (status == 1) {
      this.deletetooltip ='UnArchive';
      if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
        (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {
      this.deletetooltip='Archive';
      if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }

    this.vesselManagementService.getVessels(status)
      .subscribe(response => {
        this.flag = status;
        this.dataSource.data = response.data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
  }

  loadShipTypes() {
    this.vesselManagementService.getShipTypes(this.status)
      .subscribe((response) => {
        if (response.status) {
          this.shipTypes = response.data;
        } else {
          this.shipTypes = [];
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


  onSubmit(form: any) {
    this.vesselManagementService.addVessel(form.value)
      .subscribe(data => {
        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.clear();
          this.loadData(0);
        }

        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.clear();
          this.loadData(0);
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.loadData(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.loadData(0);
        }
        else {

        }
        
      });
  }

  Updatedata(id) {
    // (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    // (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    
    this.vesselManagementService.getVesselById(id)
      .subscribe((response) => {
        if (response.status) {
          this.vesselForm.patchValue(response.data);
          this.pkey = response.data.vesselId;
        }
      },
        (error) => {

        });
  }



  DeleteData() {
    var message = ""
    var title = "";

    if (this.flag == 1) {
      message = "Un-archived successfully.";
      title = "you want to un-archive data."
    }
    else {
      message = "Archived successfully.";
      title = "you want to archive data."

    }
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      Swal.fire({
        title: 'Are you sure?',
        text: title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.vesselManagementService.archiveVessel(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.loadData(this.flag);
          })
        }
      })
    } else {
      this.swal.info('Select at least one row');
    }
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  clearSearchInput(){
    this.searchInput.nativeElement.value ='';
    this.applyFilter(this.searchInput.nativeElement.value)
 }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(r => this.selection.select(r));
  }
  checkboxLabel(row: any): string {
    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }
  clear() {
    this.vesselForm.reset();
    this.vesselForm.controls.vesselId.setValue(0);
    this.vesselForm.controls.shipId.setValue(0);
    this.vesselForm.controls.classificationId.setValue(0);
    this.vesselForm.controls.engineTypeId.setValue(0);
    this.vesselForm.controls.engineModelId.setValue(0);
    this.vesselForm.controls.eCDIS1.setValue(0);
  }

  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.engineTypeId,delete item.engineSubTypeId,delete item.engineModelId,delete item.vesselId,delete item.engineModel,
     delete item.classification,delete item.company, delete item.countryMaster, delete item.ecdis, delete item.engineType, delete item.shipType,
     delete item.shipId,delete item.classificationId,delete item.ownerId,delete item.disponentOwnerId,delete item.principalId,
     delete item.keelLaid,delete item.launched,delete item.launched,delete item.delivery,delete item.takeoverDate,delete item.handoverDate,
     delete item.builderId,delete item.commercialManager1,delete item.commercialManager2,delete item.crewmanager1,delete item.crewmanager2,
     delete item.techManager1,delete item.techManager2,delete item.bunkermanager1,delete item.bunkermanager2,delete item.suez,
     delete item.isHighVoltageEquipment,delete item.mainEngine,delete item.mCR,delete item.aauxEngine1,delete item.auxKw1,
     delete item.panama,delete item.pi,delete item.hm,delete item.deductible1,delete item.deductible2,delete item.serviceSpeed,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'Vessel Register', 'Vessel Register');
  }

  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.engineTypeId,delete item.engineSubTypeId,delete item.engineType,item.engineModelId,item.vesselId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else
      data = [{ vesselName: '' }];
    this.exportExcelService.LoadSheet(data, 'VesselLoadSheet', 'Vessel Load Sheet',1);
  }

  openModal() {   
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data:{modalTitle: "Import Vessel",tablename:"tblVessel",columname:"vesselName"},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        
      }
    });
  }
}
