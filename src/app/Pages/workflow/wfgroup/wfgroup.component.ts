import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { WorkflowService } from 'src/app/services/workflow.service';
declare let Swal, $: any;
@Component({
  selector: 'app-wfgroup',
  templateUrl: './wfgroup.component.html',
  styleUrls: ['./wfgroup.component.css']
})
export class WfgroupComponent implements OnInit {
  EventGroupForm: FormGroup; flag; pkey: number = 0;
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchInput') searchInput: ElementRef;
  deletetooltip: string;
  selectedIndex: any;
  displayedColumns: string[] = ['checkbox', 'groupName','eventLink'];
  eventlist: any;

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private swal: SwalToastService,
    private exportExcelService: ExportExcelService,
    private workflowservice : WorkflowService) { }

  ngOnInit(): void {
    this.EventGroupForm = this.fb.group({
      groupId: [0],
      groupName: ['', [Validators.required]],
      eventId: ['', [Validators.required]],
  
    });

    this.loadData(0);
    this. LoadEvent();
  }

  LoadEvent() {
    this.workflowservice.getWFEvent(0)
      .subscribe(response => {
        this.eventlist = response.data;

      })
  }



  clear() {
    this.EventGroupForm.reset();
    this.EventGroupForm.controls.groupId.setValue(0);
    this.EventGroupForm.controls.groupName.setValue('');
    this.EventGroupForm.controls.eventId.setValue('');

    (document.getElementById('abc') as HTMLElement).focus();
  }


  onSubmit(form: any) {
    
  
    const fmdata = new FormData();
    fmdata.append('data', JSON.stringify(form.value));

    this.workflowservice.addWFGroup(fmdata)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.loadData(0);
          this.clear();
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
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


  loadData(status: number) {
    if (status == 1) {
      this.deletetooltip = 'UnArchive';
      if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
        (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
        (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
      }
    }
    else {
      this.deletetooltip = 'Archive';
      if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
        (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
      }
    }

    this.workflowservice.getWFGroup(status)
      .subscribe(response => {

        this.flag = status;
debugger
        this.dataSource.data = response.data;       
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      
      });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  clearSearchInput() {
    this.searchInput.nativeElement.value = '';
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
    
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

  Updatedata(id) {

    this.selectedIndex = id;
    (document.getElementById('collapse1') as HTMLElement).classList.remove("collapse");
    (document.getElementById('collapse1') as HTMLElement).classList.add("show");
    this.workflowservice.getWFGroupById(id)
      .subscribe((response) => {
        
        if (response.status) {

          this.EventGroupForm.patchValue(response.data);

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
          this.workflowservice.archiveWFGroup(numSelected).subscribe(result => {
            this.selection.clear();
            this.swal.success(message);
            this.loadData(this.flag);
          })

        }
      })

    } else {
      this.swal.info('Select at least one row')
    }
  }

  generateExcel() {
    if (this.dataSource.data.length == 0)
      this.swal.info('No data to Export');
    else
      this.exportAsXLSX(JSON.parse(JSON.stringify(this.dataSource.data)));
  }
  exportAsXLSX(data: any[]): void {
    data.forEach((item) => {
      delete item.groupId,
        delete item.recDate, delete item.isDeleted, delete item.modifiedBy, delete item.modifiedDate, delete item.createdBy,
        delete item.eventId

        item.Events = item.wfEvents.tableName
           
    })
   this.exportExcelService.exportAsExcelFile(data, 'WorkFlowGroup', 'Work Flow Group');
  }

}
