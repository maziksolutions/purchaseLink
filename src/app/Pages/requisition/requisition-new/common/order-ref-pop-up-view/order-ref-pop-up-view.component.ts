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
  selectedCartItems:any

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<OrderRefPopUpViewComponent>, public dialog: MatDialog) { }

  ngOnInit(): void {   
    debugger 
    this.modalTitle = this.data.modalTitle;
    this.orderType = this.data.orderType;
    this.componentType = this.data.componentType
    this.dataSourceTree = this.data.dataSourceTree;
    this.groupTableSourceTree = this.data.groupTableData
    this.spareItemDataSource.data = this.data.spareTableData
    this.storeItemDataSource.data = this.data.storeTableData
    this.orderTypeId = this.data.orderTypeId
    this.selectedCartItems=this.data.selectedCartItems   
  }

  openModal(type: string) {
    let dialogRef: any
    if (type === 'Component') {

      dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type, orderType: this.orderType,
          dataSourceTree: this.dataSourceTree, orderTypeId: this.orderTypeId
        }
      });
    } else if (type === 'Group') {

      dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type,
          groupTableData: this.groupTableSourceTree, orderTypeId: this.orderTypeId
        }
      });
    } else if (type === 'Spare') {

      dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type, orderType: this.orderType,
          spareTableData: this.spareItemDataSource.data, orderTypeId: this.orderTypeId,
          selectedCartItems:this.selectedCartItems
        }
      });
    } else if (type === 'Store') {

      dialogRef = this.dialog.open(OrderRefDirectPopUpComponent, {
        width: '1000px',
        data: {
          modalTitle: "Order Reference", componentType: type,
          storeTableData: this.storeItemDataSource.data, orderTypeId: this.orderTypeId,
          selectedCartItems:this.selectedCartItems
        }
      });
    }
    dialogRef.afterClosed().subscribe(result => {
      debugger
      if (result) {
        if (result.result === 'success') {
          debugger
          this.dialogRef.close({
            result: 'success',
            dataToSend: result.DataToSend
          })
        }
      }else{
        this.dialogRef.close();
      }     
    })
  }

  closeModal(): void {
    this.dialogRef.close();
  }

}
