import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router } from '@angular/router';
import { SideNavService } from 'src/app/services/sidenavi-service';
import { VendorService } from 'src/app/services/vendor.service';

@Component({
  selector: 'app-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.css']
})
export class VendorDetailsComponent implements OnInit {
  flag; pkey: number = 0;
  selectedIndex: any;
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = ['checkbox', 'vendorName', 'vendorLocation', 'status', 'serviceType',
    'serviceCategory', 'branchOffices', 'convenientPorts', 'classApproval', 'makerApproval'];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  deletetooltip: any;

  constructor(private sideNavService: SideNavService, private route: Router, private vendorService: VendorService) {
    this.route.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.sideNavService.initSidenav()
      }
    })
  }

  ngOnInit(): void {
    this.sideNavService.setActiveComponent(false);
    this.sideNavService.initSidenav()
    this.loadScript('assets/js/SideNavi.js')
    this.loadData(0);
  }

  private loadScript(scriptUrl: string): void {
    const script = document.createElement('script')
    script.type = 'text/javascript';
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script)
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
    this.vendorService.getVendorInfo(status)
      .subscribe(response => {        
        this.flag = status;
        // this.documentHeaderList =response.data.map(x=>x.documentHeader.replace(/\D/g, '')) 

        this.dataSource.data = response.data;
        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;

        // (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
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
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.vendorId + 1}`;
  }

  editVendorMaster(row: any): void {    
    this.route.navigate(['/Vendor-Master/VendorRegistration', row.vendorId]);
  }

}
