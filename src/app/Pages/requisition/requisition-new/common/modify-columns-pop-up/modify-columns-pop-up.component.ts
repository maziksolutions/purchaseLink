import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modify-columns-pop-up',
  templateUrl: './modify-columns-pop-up.component.html',
  styleUrls: ['./modify-columns-pop-up.component.css']
})
export class ModifyColumnsPopUpComponent implements OnInit {

  modalTitle: string;
  visibleColumns: boolean[]
  displayedColumns: string[] 

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ModifyColumnsPopUpComponent>,) { }

  ngOnInit(): void {
    this.modalTitle = this.data.modalTitle;
    this.visibleColumns = this.data.visibleColumns;
    this.displayedColumns = this.data.displayedColumns;    
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  toggleVisibility(index: number): void {
    this.visibleColumns[index] = !this.visibleColumns[index];
  }

  saveAndClose(): void {
    this.dialogRef.close({
      result: 'success',
      data: this.visibleColumns
    })
  }
}
