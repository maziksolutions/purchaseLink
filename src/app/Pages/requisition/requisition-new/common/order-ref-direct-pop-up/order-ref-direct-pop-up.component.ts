import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { RequisitionService } from 'src/app/services/requisition.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ComponentFlatNode, ComponentTemplateTree, ExampleGroupFlatNode, GroupFlatNode, GroupTemplateTree, TemplateTree } from 'src/app/Pages/Models/response-model';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { EMPTY } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';


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
  public groupTableSourceTree: any;
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

  selectedGroupIds: number[] = [];
  selectedGroupName: string[] = [];

  orderTypeId: number
  private apiCalled = false;
  matchingAccountCodes: string[] = [];

  searchString: any = "";
  activeNode: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<OrderRefDirectPopUpComponent>, private swal: SwalToastService,
    public requisitionService: RequisitionService, public dialog: MatDialog, private cdr: ChangeDetectorRef, private zone: NgZone) { }

  ngOnInit(): void {
   
    this.modalTitle = this.data.modalTitle;
    this.orderType = this.data.orderType;
    this.ComponentType = this.data.componentType;
    this.dataSourceTree = this.data.dataSourceTree
    this.groupTableSourceTree = this.data.groupTableData
    this.spareItemDataSource.data = this.data.spareTableData
    this.storeItemDataSource.data = this.data.storeTableData
    this.orderTypeId = this.data.orderTypeId
    if (this.dataSourceTree)
      this.bindData(this.dataSourceTree);
    if (this.groupTableSourceTree) {
      this.bindGroup(this.groupTableSourceTree)
    }    
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
  onCheckboxChange(event: MatCheckboxChange, checked: boolean, item: any): void {

    if (this.spareItemSelection.selected.length === 0) {
      this.matchingAccountCodes = [];
      this.apiCalled = false;
    }
    const accountCode = item.accountCode
    if (accountCode !== null && accountCode !== undefined) {
      if (checked && !this.apiCalled) {
        this.requisitionService.checkAccountCode(accountCode, this.orderTypeId).subscribe(async res => {
          if (res.status === true) {
            if(res.accounts.length > 0){
              await this.matchingAccountCodes.push(res.accounts)
              if (this.matchingAccountCodes[0].length > 0) {
                this.apiCalled = true
                if (checked) {
                  this.spareItemSelection.select(item);
                } else {
                  this.spareItemSelection.deselect(item);
                }
              }
            }else {
              this.matchingAccountCodes.push(accountCode)
              this.apiCalled = true
              if (checked) {
                this.spareItemSelection.select(item);
              } else {
                this.spareItemSelection.deselect(item);
              }
            }           
          }
        })
      }
      else {
        const isInMatchingList = this.matchingAccountCodes[0].includes(accountCode.toString());
        if (isInMatchingList) {
          if (checked) {
            this.spareItemSelection.select(item);
          } else {
            this.spareItemSelection.deselect(item);
          }
        } else {
          this.zone.run(() => {
            this.cdr.detectChanges();
            event.source.checked = false;
            this.swal.info('Account Code not match. Please select another data');
          })
        }
      }
    } else {
      if (checked) {
        this.spareItemSelection.select(item);
      } else {
        this.spareItemSelection.deselect(item);
      }
    }
  }
  //#endregion

  //#region  this is for StoreItems Table Chekcbox handling code  
  onCheckboxStoreItemChange(event: MatCheckboxChange, checked: boolean, item: any): void {
    debugger
    if (this.storeItemSelection.selected.length === 0) {
      this.matchingAccountCodes = [];
      this.apiCalled = false;
    }
    const accountCode = item.accountCode
    if (accountCode !== null && accountCode !== undefined) {
      if (checked && !this.apiCalled) {
        this.requisitionService.checkAccountCode(accountCode, this.orderTypeId).subscribe(async res => {
          debugger
          if (res.status === true) {
            if (res.accounts.length > 0) {
              await this.matchingAccountCodes.push(res.accounts)
              if (this.matchingAccountCodes[0].length > 0) {
                this.apiCalled = true
                if (checked) {
                  this.storeItemSelection.select(item);
                } else {
                  this.storeItemSelection.deselect(item);
                }
              } else {
                if (checked) {
                  this.storeItemSelection.select(item);
                } else {
                  this.storeItemSelection.deselect(item);
                }
              }
            } else {
              this.matchingAccountCodes.push(accountCode)
              this.apiCalled = true
              if (checked) {
                this.storeItemSelection.select(item);
              } else {
                this.storeItemSelection.deselect(item);
              }
            }
          }
        })
      }
      else {
        debugger
        const isInMatchingList = this.matchingAccountCodes[0].includes(accountCode.toString());
        if (isInMatchingList) {
          if (checked) {
            this.storeItemSelection.select(item);
          } else {
            this.storeItemSelection.deselect(item);
          }
        } else {
          this.zone.run(() => {
            this.cdr.detectChanges();
            event.source.checked = false;
            this.swal.info('Account Code not match. Please select another data');
          })
        }
      }
    } else {
      if (checked) {
        this.storeItemSelection.select(item);
      } else {
        this.storeItemSelection.deselect(item);
      }
    }
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
        if (this.selectedComponentIds.length > 0 && this.selectedComponentName.length > 0) {
          const selectedCom = this.selectedComponentName.map(item => item).join(', ');
          const selectedComId = this.selectedComponentIds.map(item => item).join(',');
          this.displayValue = selectedCom
          this.saveValue = selectedComId

          if (this.orderType === 'Service') {
            const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType, defaultOrderType: this.orderType }
            this.requisitionService.updateSelectedItems(dataToSend);
          } else {
            const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType }
            this.requisitionService.updateSelectedItems(dataToSend);
          }

          this.dialogRef.close();
        }
        break;
      case 'Group':
        if (this.selectedGroupIds.length > 0 && this.selectedGroupName.length > 0) {
          debugger
          const selectedCom = this.selectedGroupName.map(item => item).join(', ');
          const selectedComId = this.selectedGroupIds.map(item => item).join(',');
          this.displayValue = selectedCom
          this.saveValue = selectedComId

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

          if (this.orderType === 'Service') {
            const dataToSend = {
              displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType,
              cartItems: SelctedSpareItems, defaultOrderType: this.orderType
            }
            this.requisitionService.updateSelectedItems(dataToSend);
          } else {
            const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType, cartItems: SelctedSpareItems }
            this.requisitionService.updateSelectedItems(dataToSend);
          }

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



  //#region Component Hierarchy
  private transformer = (node: ComponentTemplateTree, level: number) => {
    return {
      expandable: !!node.subGroup && node.subGroup.length > 0,
      groupName: node.groupName,
      groupId: node.groupId,
      groupAccountCode: node.groupAccountCode,
      componentAccountCode: node.componentAccountCode,
      type: node.type,
      level,
    };
  }

  bindData(data: any) {
    this.dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSourceTree.data = data;
  }
  treeControl = new FlatTreeControl<ComponentFlatNode>(
    node => node.level, node => node.expandable
  );
  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.subGroup
  );

  handleCheckboxChange(event: Event, node: ComponentFlatNode) {
    debugger
    if (this.selectedComponentIds.length === 0 && this.selectedComponentName.length === 0) {
      this.matchingAccountCodes = [];
      this.apiCalled = false;
    }
    const checkbox = event.target as HTMLInputElement;
    node.selected = checkbox.checked;
    const accountCodeToCheck = node.groupAccountCode !== null ? node.groupAccountCode : node.componentAccountCode;
    const accountCodeAsNumber = typeof accountCodeToCheck === 'string'
      ? parseInt(accountCodeToCheck, 10)
      : accountCodeToCheck
    if (!isNaN(accountCodeAsNumber)) {
      if (node.selected && !this.apiCalled && this.selectedGroupIds.length === 0) {
        this.requisitionService.checkAccountCode(accountCodeToCheck, this.orderTypeId).subscribe(res => {
          debugger
          if (res.status === true) {
            this.apiCalled = true
            if (res.accounts.length > 0) {
              this.matchingAccountCodes.push(res.accounts)
              if (this.matchingAccountCodes[0].length > 0) {
                this.handleSelectedComponent(node, node.selected ?? false);
              }
              else {
                this.handleSelectedComponent(node, node.selected ?? false);
              }
            }
            else {
              this.matchingAccountCodes.push(node.groupAccountCode.toString())
              this.handleSelectedComponent(node, node.selected ?? false);
            }
          }
        })
      } else {
        debugger
        if (this.matchingAccountCodes[0] === undefined) {
          checkbox.checked = false;
          if (node.selected) {
            this.swal.info('Account Code not match. Please select another data');
            node.selected = false
          }
        } else {
          const isInMatchingList = this.matchingAccountCodes[0].includes(accountCodeAsNumber.toString());
          if (!isInMatchingList) {
            // Uncheck the checkbox if the account code doesn't match
            checkbox.checked = false;
            if (node.selected) {
              this.swal.info('Account Code not match. Please select another data');
              node.selected = false
            }
          } else {
            this.handleSelectedComponent(node, node.selected ?? false)
          }
        }
      }
    }
    else {
      debugger
      if (this.matchingAccountCodes[0].length > 0) {
        if (isNaN(accountCodeAsNumber)) {
          checkbox.checked = false;
          if (node.selected) {
            this.swal.info('Account Code not match. Please select another data');
            node.selected = false
          } else {
            this.handleSelectedComponent(node, node.selected ?? false)
          }
        } else {
          const isInMatchingList = this.matchingAccountCodes[0].includes(accountCodeAsNumber.toString());
          if (!isInMatchingList) {
            // Uncheck the checkbox if the account code doesn't match
            checkbox.checked = false;
            if (node.selected) {
              this.swal.info('Account Code not match. Please select another data');
              node.selected = false
            }
          } else {
            this.handleSelectedComponent(node, node.selected ?? false)
          }
        }
      } else {
        this.handleSelectedComponent(node, node.selected ?? false)
      }
    }
  }

  filterParentNode(node: ComponentFlatNode): boolean {
    if (
      !this.searchString ||
      node.groupName.toLowerCase().indexOf(this.searchString?.toLowerCase()) !==
      -1
    ) {
      return false
    }
    const descendants = this.treeControl.getDescendants(node)

    if (
      descendants.some(
        (descendantNode) =>
          descendantNode.groupName
            .toLowerCase()
            .indexOf(this.searchString?.toLowerCase()) !== -1
      )
    ) {
      return false
    }

    return true
  }
  private handleSelectedComponent(node: ComponentFlatNode, addToSelection: boolean) {
    if (addToSelection) {
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

  //#region Group Hierarchy
  private transformerGroup = (node: GroupTemplateTree, level: number) => {
    return {
      expandable: !!node.subGroup && node.subGroup.length > 0,
      groupName: node.groupName,
      groupId: node.groupId,
      groupAccountCode: node.groupAccountCode,
      type: node.type,
      level,
    };
  }

  bindGroup(data: any) {
    this.groupTableSourceTree = new MatTreeFlatDataSource(this.treeGroupControl, this.treeGroupFlattener);
    this.groupTableSourceTree.data = data;
  }
  treeGroupControl = new FlatTreeControl<GroupFlatNode>(
    node => node.level, node => node.expandable
  );
  treeGroupFlattener = new MatTreeFlattener(
    this.transformerGroup, node => node.level, node => node.expandable, node => node.subGroup
  );

  handleGroupCheckboxChange(event: Event, node: GroupFlatNode) {

    if (this.selectedGroupIds.length === 0 && this.selectedGroupName.length === 0) {
      this.matchingAccountCodes = [];
      this.apiCalled = false;
    }
    const checkbox = event.target as HTMLInputElement;
    node.selected = checkbox.checked;
    const accountCodeAsNumber = typeof node.groupAccountCode === 'string'
      ? parseInt(node.groupAccountCode, 10)
      : node.groupAccountCode

    if (!isNaN(accountCodeAsNumber)) {
      if (node.selected && !this.apiCalled && this.selectedGroupIds.length === 0) {
        this.requisitionService.checkAccountCode(accountCodeAsNumber, this.orderTypeId).subscribe(res => {

          if (res.status === true) {
            this.apiCalled = true
            if (res.accounts.length > 0) {
              this.matchingAccountCodes.push(res.accounts)
              if (this.matchingAccountCodes[0].length > 0) {
                this.handleSelectedGroups(node, node.selected ?? false);
              }
              else {
                this.handleSelectedGroups(node, node.selected ?? false);
              }
            }
            else {
              this.matchingAccountCodes.push(node.groupAccountCode.toString())
              this.handleSelectedGroups(node, node.selected ?? false);
            }
          }
        })
      } else {

        if (this.matchingAccountCodes[0] === undefined) {
          checkbox.checked = false;
          if (node.selected) {
            this.swal.info('Account Code not match. Please select another data');
            node.selected = false
          }
        } else {
          const isInMatchingList = this.matchingAccountCodes[0].includes(node.groupAccountCode.toString());
          if (!isInMatchingList) {
            // Uncheck the checkbox if the account code doesn't match
            checkbox.checked = false;
            if (node.selected) {
              this.swal.info('Account Code not match. Please select another data');
              node.selected = false
            }
          } else {
            this.handleSelectedGroups(node, node.selected ?? false)
          }
        }
      }
    } else {

      if (this.matchingAccountCodes[0].length > 0) {
        if (isNaN(accountCodeAsNumber)) {
          checkbox.checked = false;
          if (node.selected) {
            this.swal.info('Account Code not match. Please select another data');
            node.selected = false
          } else {
            this.handleSelectedGroups(node, node.selected ?? false)
          }
        } else {
          const isInMatchingList = this.matchingAccountCodes[0].includes(node.groupAccountCode.toString());
          if (!isInMatchingList) {
            // Uncheck the checkbox if the account code doesn't match
            checkbox.checked = false;
            if (node.selected) {
              this.swal.info('Account Code not match. Please select another data');
              node.selected = false
            }
          } else {
            this.handleSelectedGroups(node, node.selected ?? false)
          }
        }
      } else {
        this.handleSelectedGroups(node, node.selected ?? false)
      }
    }
  }

  private handleSelectedGroups(node: GroupFlatNode, addToSelection: boolean) {
    if (addToSelection) {
      this.selectedGroupIds.push(node.groupId);
      this.selectedGroupName.push(node.groupName);
    } else {
      const index = this.selectedGroupIds.indexOf(node.groupId);
      if (index !== -1) {
        this.selectedGroupIds.splice(index, 1);
        this.selectedGroupName.splice(index, 1);
      }
    }
  }
  //#endregion  Group Hierarchy
}
