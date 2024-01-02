import { Component, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { RequisitionService } from 'src/app/services/requisition.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ExampleGroupFlatNode, TemplateTree } from 'src/app/Pages/Models/response-model';


@Component({
  selector: 'app-order-ref-direct-pop-up',
  templateUrl: './order-ref-direct-pop-up.component.html',
  styleUrls: ['./order-ref-direct-pop-up.component.css']
})
export class OrderRefDirectPopUpComponent implements OnInit {


  groupTableColumn: string[] = ['checkbox', 'groupName'];
  groupTableDataSource = new MatTableDataSource<any>();
  groupSelection = new SelectionModel<any>(true, []);
  selectedGroupsDropdown: { pmsGroupId: number, groupName: string, accountCode: any; }[] = [];

  spareItemsTableColumn: string[] = ['checkbox', 'inventoryName', 'componentName', 'itemCode', 'reqQty', 'minReq', 'dwg'];
  spareItemDataSource = new MatTableDataSource<any>();
  spareItemSelection = new SelectionModel<any>(true, []);

  storeItemsTableColumn: string[] = ['checkbox', 'inventoryName', 'componentName', 'itemCode', 'reqQty', 'minReq', 'dwg'];
  storeItemDataSource = new MatTableDataSource<any>();
  storeItemSelection = new SelectionModel<any>(true, []);

  dataSource = new MatTableDataSource<any>();

  public dataSourceTree: any;
  hasChild = (_: number, node: ExampleGroupFlatNode) => node.expandable;

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  selectedIndex: any;
  modalTitle: string;
  orderType: string;
  ComponentType: string;
  cartItemId: string = '';
  displayValue: string = '';
  saveValue: string = '';
  selectedComponentIds: number[] = [];
  selectedComponentName: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<OrderRefDirectPopUpComponent>,
    public requisitionService: RequisitionService, public dialog: MatDialog) { }

  ngOnInit(): void {
    debugger
    this.modalTitle = this.data.modalTitle;
    this.orderType = this.data.orderType;
    this.ComponentType = this.data.componentType;
    this.dataSourceTree = this.data.dataSourceTree
    this.groupTableDataSource.data = this.data.groupTableData
    this.spareItemDataSource.data = this.data.spareTableData
    this.storeItemDataSource.data = this.data.storeTableData
    if (this.dataSourceTree)
      this.bindData(this.dataSourceTree);
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  //#region this is for GroupItems Table Checkbox handling code 
  isAllGroupSelected() {

    const numSelected = this.groupSelection.selected.length;
    const numRows = !!this.groupTableDataSource && this.groupTableDataSource.data.length;
    return numSelected === numRows;
  }
  groupToggle() {

    this.isAllGroupSelected() ? this.groupSelection.clear() : this.groupTableDataSource.data.forEach(r => this.groupSelection.select(r));
  }
  groupLabel(row: any): string {

    if (!row) {
      return `${this.isAllGroupSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.groupSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.pmsGroupId + 1}`;
  }
  //#endregion

  //#region  this is for SpareItems Table Chekcbox handling code
  isAllSpareItemSelected() {

    const numSelected = this.spareItemSelection.selected.length;
    const numRows = this.getSpareItemsWithSameAccountCode();
    return numSelected === numRows.length;
  }
  onCheckAllSpareItemChange(checked: boolean): void {

    if (checked) {

      const itemsToCheck = this.getSpareItemsWithSameAccountCode();
      itemsToCheck.forEach(item => {

        item.checkboxState = true;
        this.spareItemSelection.select(item);
      });
    } else {
      this.spareItemDataSource.data.forEach(item => (item.checkboxState = false));
      this.spareItemSelection.clear();
      this.spareItemDataSource.data.forEach(item => item.checkboxDisabled = false);
    }

    // this.sortItems();
  }
  getSpareItemsWithSameAccountCode(): any[] {

    const selectedAccountCode = this.spareItemSelection.selected.length > 0 ? this.spareItemSelection.selected[0].accountCode : null;
    return selectedAccountCode ? this.spareItemDataSource.data.filter(item => item.accountCode === selectedAccountCode) : [];
  }
  onCheckboxSpareItemChange(checked: boolean, item: any): void {

    item.checkboxState = checked;

    const selectedItemsWithDifferentAccountCode = this.spareItemSelection.selected.filter(
      selectedItem => selectedItem.accountCode !== item.accountCode
    );

    if (selectedItemsWithDifferentAccountCode.length > 0) {
      // Display an alert for different account codes
      alert('Selected item(s) have different account codes.');
    }

    if (checked) {
      this.spareItemSelection.select(item);
    } else {
      this.spareItemSelection.deselect(item);
    }
    if (this.spareItemSelection.selected.length === 0) {

      this.spareItemDataSource.data.forEach(item => item.checkboxDisabled = false);
    }

    // this.sortItems();
  }
  //#endregion

  //#region  this is for StoreItems Table Chekcbox handling code
  isAllStoreItemSelected() {

    const numSelected = this.storeItemSelection.selected.length;
    const numRows = this.getStoreItemsWithSameAccountCode();
    return numSelected === numRows.length;
  }
  onCheckAllStoreItemChange(checked: boolean): void {

    if (checked) {

      const itemsToCheck = this.getStoreItemsWithSameAccountCode();
      itemsToCheck.forEach(item => {

        item.checkboxState = true;
        this.storeItemSelection.select(item);
      });
    } else {
      this.storeItemDataSource.data.forEach(item => (item.checkboxState = false));
      this.storeItemSelection.clear();
      this.storeItemDataSource.data.forEach(item => item.checkboxDisabled = false);
    }

    // this.sortItems();
  }
  getStoreItemsWithSameAccountCode(): any[] {

    const selectedAccountCode = this.storeItemSelection.selected.length > 0 ? this.storeItemSelection.selected[0].accountCode : null;
    return selectedAccountCode ? this.storeItemDataSource.data.filter(item => item.accountCode === selectedAccountCode) : [];
  }
  onCheckboxStoreItemChange(checked: boolean, item: any): void {

    item.checkboxState = checked;

    const selectedItemsWithDifferentAccountCode = this.storeItemSelection.selected.filter(
      selectedItem => selectedItem.accountCode !== item.accountCode
    );

    if (selectedItemsWithDifferentAccountCode.length > 0) {
      // Display an alert for different account codes
      alert('Selected item(s) have different account codes.');
    }

    if (checked) {
      this.storeItemSelection.select(item);
    } else {
      this.storeItemSelection.deselect(item);
    }
    if (this.storeItemSelection.selected.length === 0) {

      this.storeItemDataSource.data.forEach(item => item.checkboxDisabled = false);
    }

    // this.sortItems();
  }
  applyFilter(filterValue: string) {

    if (this.ComponentType === 'Group') {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
      this.groupTableDataSource.filter = filterValue;
    } else if (this.ComponentType === 'Spare') {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
      this.spareItemDataSource.filter = filterValue;
    } else if (this.ComponentType === 'Store') {
      filterValue = filterValue.trim();
      filterValue = filterValue.toLowerCase();
      this.storeItemDataSource.filter = filterValue;
    }

  }
  //#endregion

  saveComponent() {
    debugger
    this.displayValue = '';
    this.saveValue = '';
    switch (this.ComponentType) {
      case 'Component':
        debugger
        if (this.selectedComponentIds.length > 0 && this.selectedComponentName.length > 0) {
          const selectedCom = this.selectedComponentName.map(item => item).join(', ');
          const selectedComId = this.selectedComponentIds.map(item => item).join(',');
          this.displayValue = selectedCom
          this.saveValue = selectedComId

          const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType }

          this.requisitionService.updateSelectedItems(dataToSend);
          this.dialogRef.close();
        }
        break;
      case 'Group':
        this.selectedGroupsDropdown = this.groupTableDataSource.data.filter(row => this.groupSelection.isSelected(row));
        if (this.selectedGroupsDropdown.length > 0) {
          const selectedGroupName = this.selectedGroupsDropdown.map(item => item.groupName).join(', ');
          const selectedGroupId = this.selectedGroupsDropdown.map(item => item.pmsGroupId).join(',');

          this.displayValue = selectedGroupName
          this.saveValue = selectedGroupId

          const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType }

          this.requisitionService.updateSelectedItems(dataToSend);
          this.dialogRef.close();
        }
        break;
      case 'Spare':
        const SelctedSpareItems = this.spareItemDataSource.data.filter(row => this.spareItemSelection.isSelected(row));
        if (SelctedSpareItems.length > 0) {

          this.dataSource.data = SelctedSpareItems;
          const spareItemDisplayValue = this.spareItemDataSource.data
            .filter(row => this.spareItemSelection.isSelected(row))
            .map(item => item.inventoryName)
            .join(', ');
          const spareItemSaveValue = this.spareItemDataSource.data
            .filter(row => this.spareItemSelection.isSelected(row))
            .map(item => (item.shipSpareId).toString())
            .join(',');
          this.displayValue = spareItemDisplayValue;
          this.saveValue = spareItemSaveValue;
          const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType, cartItems: SelctedSpareItems }

          this.requisitionService.updateSelectedItems(dataToSend);
          this.dialogRef.close();
        }
        break;
      case 'Store':
        const SelctedStoreItems = this.storeItemDataSource.data.filter(row => this.storeItemSelection.isSelected(row));
        if (SelctedStoreItems.length > 0) {

          this.dataSource.data = SelctedStoreItems;
          const storeItemDisplayValue = this.storeItemDataSource.data
            .filter(row => this.storeItemSelection.isSelected(row))
            .map(item => item.inventoryName)
            .join(', ');
          const storeItemSaveValue = this.storeItemDataSource.data
            .filter(row => this.storeItemSelection.isSelected(row))
            .map(item => (item.shipStoreId).toString())
            .join(',');
          this.displayValue = storeItemDisplayValue;
          this.saveValue = storeItemSaveValue;
          const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType, cartItems: SelctedStoreItems }

          this.requisitionService.updateSelectedItems(dataToSend);
          this.dialogRef.close();
        }
        break;
      default:
    }
    // this.autoSave('header');
  }



  //#region PMS Hierarchy
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
    debugger
    this.dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSourceTree.data = data;
  }
  treeControl = new FlatTreeControl<ExampleGroupFlatNode>(
    node => node.level, node => node.expandable
  );
  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.subGroup
  );
  handleCheckboxChange(event: Event, node: ExampleGroupFlatNode) {
    debugger
    const checkbox = event.target as HTMLInputElement;
    node.selected = checkbox.checked;
    if (node.selected) {
      this.selectedComponentIds.push(node.groupId);
      this.selectedComponentName.push(node.groupName);
    } else {
      const index = this.selectedComponentIds.indexOf(node.groupId);
      if (index !== -1) {
        this.selectedComponentIds.splice(index, 1);
        this.selectedComponentName.splice(index, 1);
      }
    }
  }
  //#endregion
}
