import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-edit-req-qty',
  templateUrl: './edit-req-qty.component.html',
  styleUrls: ['./edit-req-qty.component.css']
})
export class EditReqQtyComponent implements OnInit {
  modalTitle: string;
  editedQuantity: number;
  itemName: string
  itemCode: string
  partNo: string
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EditReqQtyComponent>,
    public dialog: MatDialog) { this.editedQuantity = data.currentQuantity; }

  ngOnInit(): void {
    this.modalTitle = this.data.modalTitle;
    this.editedQuantity = this.data.reqQty;
    this.itemName=this.data.itemName
    this.itemCode=this.data.itemCode
    this.partNo=this.data.partNo
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  onClose(): void {
    debugger
    this.dialogRef.close({
      result: 'success',
      editedQuantity: this.editedQuantity,      
    });
  }
}
