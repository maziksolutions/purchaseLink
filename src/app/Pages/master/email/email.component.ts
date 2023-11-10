import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router } from '@angular/router';
import { PurchaseMasterService } from 'src/app/services/purchase-master.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { ExampleGroupFlatNode, TemplateTree } from '../../Models/response-model';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})
export class EmailComponent implements OnInit {
  emailForm: FormGroup; flag; pkey: number = 0;
  displayedColumns: string[] = ['checkbox', 'folderTitle', 'vendor', 'folderPurpose', 'emailContent'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  deletetooltip: any;
  folderTitle: string[] = [];
  public dataSourceTree: any;
  constructor(private fb: FormBuilder, private purchaseService: PurchaseMasterService, private router: Router, private swal: SwalToastService) { }

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      emailId: [0],
      folderTitle: ['', [Validators.required]],
      vendor: ['', [Validators.required]],
      folderPurpose: [''],
      emailContent: ['', [Validators.required]]
    });
    this.loadData(0);
    this.LoadServiceType();
  }

  LoadServiceType() {
    this.purchaseService.getEmails(0)
      .subscribe(response => {
        
        this.folderTitle = response.data.map(item => item.folderTitle);
      })
  }

  onSubmit(form: any) {
    this.purchaseService.addEmailContent(form.value)
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

    this.purchaseService.getEmails(status)
      .subscribe(response => {
      
        this.flag = status;
        this.dataSource.data = response.data;
        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
        // this.clear();
        // (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }

  private transformer = (node: TemplateTree, level: number) => {
    return {
      expandable: !!node.subGroup && node.subGroup.length > 0,
      groupName: node.groupName,
      groupId: node.groupId,
      type: node.type,
      level,
    };
  }

  bindData(data: any) {
    this.dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSourceTree.data = data;

  }
  treeControl = new FlatTreeControl<ExampleGroupFlatNode>(
    node => node.level, node => node.expandable
  );
  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.subGroup
  );

  clear() {
    this.emailForm.reset();
    this.emailForm.controls.emailId.setValue(0);
    this.emailForm.controls.folderTitle.setValue('');
    this.emailForm.controls.vendor.setValue('');
    this.emailForm.controls.folderPurpose.setValue('');
    this.emailForm.controls.emailContent.setValue('');

    (document.getElementById('emailTitle') as HTMLElement).focus();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(r => this.selection.select(r));
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {
    //console.log(row);
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.UserId + 1}`;
  }

}
