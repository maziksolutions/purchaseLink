import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { RequisitionService } from 'src/app/services/requisition.service';

@Component({
  selector: 'app-edit-req-qty',
  templateUrl: './edit-req-qty.component.html',
  styleUrls: ['./edit-req-qty.component.css']
})
export class EditReqQtyComponent implements OnInit {
  modalTitle: string;
  dataStockReconciliation: any
  ship: any
  type: any
  editedROB: string = '';
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EditReqQtyComponent>, private service: RequisitionService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    debugger
    this.modalTitle = this.data.modalTitle;
    this.dataStockReconciliation = this.data.data
    this.type = this.data.data.spareId != null ? 'Spare' : this.data.data.storeId != null ? 'Store' : '';
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  handleROBChange(newValue: string) {
    debugger
    this.editedROB = newValue;
  }

  onClose(): void {
    debugger
    this.dialogRef.close({
      result: 'success',
      // editedQuantity: this.editedQuantity,      
    });
  }

  SubmitStockReconciliation() {
    debugger
    if (this.type === 'Spare') {
      const dataToSend = {
        spareId: this.dataStockReconciliation.spareId,
        newRob: this.editedROB,
        type: this.type
      }
      this.service.editRobData(dataToSend).subscribe(res => {
        debugger
        if (res.status == true) {
          this.dialogRef.close({
            result: 'success',
            data: dataToSend
          })
        }
      })
    }
    else {
      const dataToSend = {
        spareId: this.dataStockReconciliation.spareId,
        newRob: this.editedROB,
        type: this.type
      }
      this.service.editRobData(dataToSend).subscribe(res => {
        debugger
        if (res.status == true) {
          this.dialogRef.close({
            result: 'success',
            data: dataToSend
          })
        }
      })
    }   
  }

  CloseStockReconciliationModal() {

  }
}
