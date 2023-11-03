import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator,PageEvent  } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UnitmasterService } from 'src/app/services/unitmaster.service';
import { ImportDataComponent } from '../../common/import-data/import-data.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { UserManagementService } from 'src/app/services/user-management.service';
import { administrationNavEnum } from '../../Shared/rights-enum';
import { RightsModel } from '../../Models/page-rights';
declare let Swal, $, PerfectScrollbar: any;

@Component({
  selector: 'app-code-list',
  templateUrl: './code-list.component.html',
  styleUrls: ['./code-list.component.css']
})
export class CodeListComponent implements OnInit {
  private selectedFunctions: any[] = [];  
  currentPage = 0;page: number = 1;   
  countryname: string="";  location: string="";  locationname: string="";  state: string="";coordinates: string="";
  functions: any;searchForm: FormGroup; pageTotal: number;
  codeListfrm: FormGroup; flag; pkey: number = 0;
  countries: any; 
  pageSizeOptions: number[] = [20, 40, 60, 100];
  pageSize = 20;  pageEvent: PageEvent;  
  status: number = 0;
  @ViewChild('searchInput') searchInput: ElementRef;
  rights:RightsModel;
  deletetooltip:any;
  displayedColumns: string[] = ['checkbox', 'countryId', 'location', 'locationName', 'state', 'coordinates'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []); 
  //@ViewChild(MatPaginator, { read: true }) paginator: MatPaginator;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private fb: FormBuilder, private exportExcelService: ExportExcelService, private route: ActivatedRoute,
    private router: Router,
    private swal: SwalToastService, public dialog: MatDialog,private unitmasterService: UnitmasterService,
    private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      pageNumber:[''],
      pageSize:[this.pageSize],
      status: ['0'],
      keyword: [''],
      country: [''],
      location: [''],
      locationname: [''],
      state: [''],
      Coordinates: [''],
    });
    this.codeListfrm = this.fb.group({
      locationId: [0],
      countryId: ['0', [Validators.required]],
      location: ['', [Validators.required]],
      locationName: ['', [Validators.required]],
      function: [''],
      state: ['', [Validators.required]],
      coordinates: ['', [Validators.required]]
    });
    this.loadRights();
    this.loaddata(0);
    this.loadCountries();
    this.loadFunctions();
  }
  get fm() { return this.codeListfrm.controls };
  get sfm() { return this.searchForm.controls };
  // ngAfterViewInit(): void {
  //   this.dataSource.paginator = this.paginator;
  // }

  loadRights(){
    this.userManagementService.checkAccessRight(administrationNavEnum.codeList).subscribe((response)=>{
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


  pageChanged(event: PageEvent) {
    if(event == undefined)
    {

    }
    else{
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loaddata(0);
    this.dataSource.paginator = this.paginator;
    }
  }
  filteredData() {
    this.page = 1;this.currentPage =0;    
    this.loaddata(0);
    this.pageChanged(this.pageEvent);
  }
  clearSearchInput(){
    this.sfm.keyword.setValue('');
    this.filteredData()
 }
  filterdataoncolumnbased()
  {
this.sfm.pageNumber.setValue(this.currentPage);
    this.sfm.pageSize.setValue(this.pageSize);
    this.sfm.country.setValue(this.countryname)
    this.sfm.location.setValue(this.location);
    this.sfm.locationname.setValue(this.locationname);
    this.sfm.state.setValue(this.state)
    this.sfm.Coordinates.setValue(this.coordinates);
    this.unitmasterService.getCodeList(this.searchForm.value)
    .subscribe(response => {      
      this.dataSource = new MatTableDataSource(response.data);
      this.dataSource.data = response.data;
      this.dataSource.paginator = this.paginator;
      this.pageTotal = response.total;     
      setTimeout(() => this.dataSource.paginator=this.paginator);
      setTimeout(() => this.dataSource.sort = this.sort);       
       this.dataSource.sort = this.sort;       
    });
  }

  loadCountries() {
    this.unitmasterService.GetCountry(this.status)
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
  loaddata(status: number) {
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
    this.sfm.pageNumber.setValue(this.currentPage );
    this.sfm.pageSize.setValue(this.pageSize )
    // if(this.searchForm.controls.keyword.value.length>=2)
    // {
    this.unitmasterService.getCodeList(this.searchForm.value)
      .subscribe(response => {      
        this.dataSource = new MatTableDataSource(response.data);
        this.dataSource.data = response.data;
        this.dataSource.paginator = this.paginator;
        this.pageTotal = response.total;     
        setTimeout(() => this.dataSource.paginator=this.paginator);
        setTimeout(() => this.dataSource.sort = this.sort);       
         this.dataSource.sort = this.sort;       
      });
    // }
  }
  loadFunctions() {
    this.unitmasterService.GetFunctionClassifier(0)
      .subscribe((response) => {
        if (response.status) {
          this.functions = response.data;
        } else {
          this.functions = [];
        }
      }, (error) => {
        console.log(error);
      })
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
          this.unitmasterService.deleteCodeList(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.loaddata(this.flag);
          })
        }
      })
    } else {
      this.swal.info('Select at least one row')
    }
  }
  onSubmit(form: any) {
    this.fm.function.setValue(this.selectedFunctions.join(','));
    
    this.unitmasterService.addCodeList(form.value)
      .subscribe(data => {
        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.clear();
          this.loaddata(0);
        }

        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.clear();
          this.loaddata(0);
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.loaddata(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.loaddata(0);
          
        }
        else {

        }
      });
  }

  resetform() {
    this.codeListfrm.reset();
    this.fm.locationId.setValue(0);
    this.codeListfrm.controls.countryId.setValue(0);
    this.selectedFunctions = [];
  }

  Updatedata(id) {
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.unitmasterService.getCodeListbyid(id)
      .subscribe((response) => {
        if (response.status) {
          if(response.data.function !=null)
            this.selectedFunctions = response.data.function.split(',')
          
             else
             this.selectedFunctions=[""];
          this.codeListfrm.patchValue(response.data);
          this.pkey = response.data.locationId;
        }
      },
        (error) => {

        });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
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
  openModal() {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '500px',
      data: {modalTitle: "Import CodeList Data", tablename: "tblCodeList", columname: "countryId",columname1: "location"}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {

      }
    });
  }

  clear() {
    this.selectedFunctions = [];
    this.codeListfrm.reset();
    this.codeListfrm.controls.locationId.setValue(0);
    this.codeListfrm.controls.countryId.setValue(0);
    //this.codeListfrm.controls.function.setValue('');
    (document.getElementById('abc') as HTMLElement).focus();
  }

  close() {
    this.codeListfrm.reset();
    this.selectedFunctions = [];
    this.codeListfrm.controls.locationId.setValue(0);
    this.codeListfrm.controls.countryId.setValue(0);
    //this.codeListfrm.controls.function.setValue('');
    (document.getElementById('collapse1') as HTMLElement).classList.add("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
  }
  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export')
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }

  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.locationId,item.countryId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
    })
    this.exportExcelService.exportAsExcelFile(data, 'CodeList', 'CodeList Master');
  }
  exportLoadSheet() {
    var data;
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      data = numSelected;
      data.forEach((item) => {
        delete item.locationId,item.countryId,
          delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy
      })
    }
    else
   
      data = [{ countryId: '', location: '', locationName: '', function: '', state: '' ,coordinates:''}];
    this.exportExcelService.LoadSheet(data, 'CodeListLoadSheet', 'CodeList Load Sheet',3);
  }

  updateCheckbox(event:any) {
    let isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedFunctions.push(event.target.value);
    } else {
      let rindex = this.selectedFunctions.findIndex(rank => rank == event.target.value);
      if (rindex != -1) {
        this.selectedFunctions.splice(rindex, 1)
      }
    }
    //remove empty elements from array Like ="", null, ,,,,
    const arrFiltered = this.selectedFunctions.filter(el => { return el != null && el != '';});
    this.selectedFunctions = Array.from(new Set(arrFiltered)); //remove duplicate array
  }

  getChecked(functionCode: any) {
    let index = this.selectedFunctions.findIndex(x => x == functionCode);
    if (index != -1) {
      return true;
    }
  }

}
