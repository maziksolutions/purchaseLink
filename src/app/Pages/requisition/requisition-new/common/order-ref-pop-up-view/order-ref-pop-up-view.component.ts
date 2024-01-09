import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { OrderRefDirectPopUpComponent } from '../order-ref-direct-pop-up/order-ref-direct-pop-up.component';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-order-ref-pop-up-view',
  templateUrl: './order-ref-pop-up-view.component.html',
  styleUrls: ['./order-ref-pop-up-view.component.css']
})
export class OrderRefPopUpViewComponent implements OnInit {

  public dataSourceTree: any;
  public groupTableSourceTree: any;
  groupTableDataSource = new MatTableDataSource<any>();
  spareItemDataSource = new MatTableDataSource<any>();
  storeItemDataSource = new MatTableDataSource<any>();

  modalTitle: string;
  orderType: string;
  componentType: string;
  orderTypeId: number

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<OrderRefPopUpViewComponent>, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.modalTitle = this.data.modalTitle;
    this.orderType = this.data.orderType;
    this.componentType = this.data.componentType
    this.dataSourceTree = this.data.dataSourceTree;
    this.groupTableSourceTree = this.data.groupTableData
    this.spareItemDataSource.data = this.data.spareTableData
    this.storeItemDataSource.data = this.data.storeTableData
    this.orderTypeId = this.data.orderTypeId
  }

  openModal(type: string) {

    if (type === 'Component') {

      const dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type,
          dataSourceTree: this.dataSourceTree, orderTypeId: this.orderTypeId
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'success') {

        }
      })
    } else if (type === 'Group') {

      const dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type,
          groupTableData: this.groupTableSourceTree, orderTypeId: this.orderTypeId
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'success') {

        }
      })
    } else if (type === 'Spare') {

      const dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type,
          spareTableData: this.spareItemDataSource.data, orderTypeId: this.orderTypeId
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'success') {

        }
      })
    } else if (type === 'Store') {

      const dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type,
          storeTableData: this.storeItemDataSource.data, orderTypeId: this.orderTypeId
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'success') {

        }
      })
    }

    this.dialogRef.close();

  }

  closeModal(): void {
    this.dialogRef.close();
  }

}
