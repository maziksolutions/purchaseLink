import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountMasterService } from 'src/app/services/account-master.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { UserManagementService } from 'src/app/services/user-management.service';

declare let Swal, PerfectScrollbar: any; declare let $: any;
@Component({
  selector: 'app-add-currency',
  templateUrl: './add-currency.component.html',
  styleUrls: ['./add-currency.component.css']
})
export class AddCurrencyComponent implements OnInit {

  currencyForm: FormGroup; flag; pkey: number = 0; currencyId: any;
  displayedColumns: string[] = ['UpdateDate', 'UsdExcRate', 'UsdValue', 'GbpValue', 'FromDate', 'ToDate'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild('mainSort') mainSort = new MatSort();
  PageTotal: any;
  pageEvent: PageEvent;
  pageSizeOptions: number[] = [20, 40, 60, 100];
  deletetooltip: any;
  searchForm: FormGroup;
  pageSize = 20; currentPage = 0; page: number = 1;

  currencyHistory: any
  UsdValue: any
  usdInput: any;
  currencyCode: any
  GbpValue: any

  constructor(private fb: FormBuilder, public dialog: MatDialog, private exportExcelService: ExportExcelService,
    private swal: SwalToastService, private actService: AccountMasterService, private roote: ActivatedRoute,
    private router: Router, private userManagementService: UserManagementService) { }

  ngOnInit(): void {
    debugger
    const currencyIdParam = this.roote.snapshot.paramMap.get('currencyId');
    if (currencyIdParam !== null) {
      this.currencyId = parseInt(currencyIdParam, 10);
      if (this.currencyId > 0) {
        this.getCurrency(this.currencyId)
      }
    }

    this.currencyForm = this.fb.group({
      currencyId: [0],
      currencySign: ['', [Validators.required]],
      currencyName: ['', [Validators.required]],
      lastUpdate: [''],
      usdExcRate: ['', [Validators.required]],
      usdValue: ['', [Validators.required]],
      gbpValue: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]]
    });
  }
  get cmf() { return this.currencyForm.controls };

  getUsd(value: any) {
    debugger
    const gbpExcRate = parseFloat(value);
    const usdValue = 1 / gbpExcRate;
    const formattedUsdValue = '$' + usdValue.toFixed(5);
    this.usdInput = '$' + value
    this.UsdValue = formattedUsdValue
    // this.currencyForm.patchValue({ usdValue: usdValue.toFixed(3) })

    this.actService.getCurrencyData(0).subscribe(res => {
      debugger
      const usd = res.data.find(item => item.currencySign === 'USD')
      const gbp = res.data.find(item => item.currencySign === 'GBP');
      if (!gbp) {
        this.GbpValue = '£' + 1
      }
      else {
        if (usd) {
          if (this.currencyCode === 'USD') {
            this.GbpValue = '£' + gbp.usdValue
          } else if (this.currencyCode !== 'GBP') {
            const usdValue = parseFloat(gbp.usdValue)
            if (usdValue) {
              this.GbpValue = '£' + (1 / (value * usdValue)).toFixed(5)
            }
          }
        }
      }
    })
  }

  autoSave() {
    debugger
    if (this.currencyForm.valid && this.currencyForm.value != null) {
      debugger
      const currencyData = this.currencyForm.value
      const gbpValue = parseFloat(currencyData.gbpValue.replace(/[^\d.-]/g, ''));
      const usdExcRate = parseFloat(currencyData.usdExcRate.replace(/[^\d.-]/g, ''));
      const usdValue = parseFloat(currencyData.usdValue.replace(/[^\d.-]/g, ''));
      this.currencyForm.patchValue({ gbpValue: gbpValue, usdExcRate: usdExcRate, usdValue: usdValue, lastUpdate: '' })
      const fmdata = new FormData();
      fmdata.append('data', JSON.stringify(this.currencyForm.value));

      this.actService.addCurrency(fmdata)
        .subscribe(data => {
          debugger
          if (data.message == "data added") {
            this.swal.success('Added successfully.');
            this.router.navigate(['/Account/currencyMaster']);
            this.clear();
          }
          else if (data.message == "updated") {
            this.swal.success('Data has been updated successfully.');
            // this.router.navigate(['/Account/currencyMaster']);
            // this.clear(); 
            this.getCurrency(this.currencyId)
          }
          else if (data.message == "duplicate") {
            this.swal.info('Data already exist. Please enter new data');
            // this.loadData(0);
          }
          else if (data.message == "not found") {
            this.swal.info('Data exist not exist');
            // this.loadData(0);
          }
        });
    }
  }

  getCurrency(id) {
    this.actService.getCurrencyById(id).subscribe(res => {
      debugger
      if (res.status === true) {
        const currency = res.data;
        currency.lastUpdate = this.formatDate(currency.lastUpdate)
        currency.fromDate = this.formatDate(currency.fromDate)
        currency.toDate = this.formatDate(currency.toDate)
        currency.usdExcRate = '$' + currency.usdExcRate
        currency.usdValue = '$' + currency.usdValue
        currency.gbpValue = '£' + currency.gbpValue
        this.currencyForm.patchValue(currency);
        this.actService.getCurrencyHistory(id).subscribe(res => {
          if (res.status === true) {
            this.currencyHistory = []
            this.currencyHistory = res.data
          }
        })
      }
    })
  }
  private formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  clear() {
    this.currencyForm.reset()
    this.cmf.controls.value.currencyId(0)
  }
}
