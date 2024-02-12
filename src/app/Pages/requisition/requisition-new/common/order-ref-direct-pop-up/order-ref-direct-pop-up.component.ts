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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StoreLinkedGroupsModel } from 'src/app/Pages/Models/storeLinkedGroupsModel';


@Component({
  selector: 'app-order-ref-direct-pop-up',
  templateUrl: './order-ref-direct-pop-up.component.html',
  styleUrls: ['./order-ref-direct-pop-up.component.css']
})
export class OrderRefDirectPopUpComponent implements OnInit {

  pageSizeOptions: number[] = [20, 40, 60, 100];
  pageTotal: any;
  pageEvent: PageEvent;
  searchForm: FormGroup;
  pageSize = 20; currentPage = 0; page: number = 1;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  groupTableColumn: string[] = ['checkbox', 'groupName'];
  groupTableDataSource = new MatTableDataSource<any>();
  groupSelection = new SelectionModel<any>(true, []);
  selectedGroupsDropdown: { pmsGroupId: number, groupName: string, accountCode: any; }[] = [];

  spareItemsTableColumn: string[] = ['checkbox', 'inventoryName', 'componentName', 'itemCode', 'reqQty', 'minReq', 'dwg', 'partNo'];
  spareItemDataSource = new MatTableDataSource<any>();
  spareItemSelection = new SelectionModel<any>(true, []);

  storeItemsTableColumn: string[] = ['checkbox', 'inventoryName', 'componentName', 'itemCode', 'reqQty', 'minReq', 'dwg', 'partNo'];
  storeItemDataSource = new MatTableDataSource<any>();
  storeItemSelection = new SelectionModel<any>(true, []);

  dataSource = new MatTableDataSource<any>();

  public dataSourceTree: any;
  public groupTableSourceTree: any;
  hasChild = (_: number, node: ExampleGroupFlatNode) => node.expandable;

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
  selectedCartItems: any
  vesselId: any

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<OrderRefDirectPopUpComponent>,
    private swal: SwalToastService, private fb: FormBuilder,
    public requisitionService: RequisitionService, public dialog: MatDialog, private cdr: ChangeDetectorRef, private zone: NgZone) { }

  ngOnInit(): void {
    debugger
    this.modalTitle = this.data.modalTitle;
    this.orderType = this.data.orderType;
    this.ComponentType = this.data.componentType;
    this.dataSourceTree = this.data.dataSourceTree
    // this.groupTableSourceTree = this.data.groupTableData
    this.groupTableDataSource.data = this.data.groupTableData
    this.groupTableDataSource.sort = this.sort;
    this.groupTableDataSource.paginator = this.paginator;
    this.spareItemDataSource.data = this.data.spareTableData
    this.storeItemDataSource.data = this.data.storeTableData
    this.orderTypeId = this.data.orderTypeId
    this.selectedCartItems = this.data.selectedCartItems
    this.vesselId = parseInt(this.data.vesselId)

    if (this.spareItemDataSource.data && this.selectedCartItems) {
      debugger
      this.spareItemDataSource.data.forEach(spare => {
        // Check if the spare item's ID exists in the selectedSpares array
        const isSelected = this.selectedCartItems.some(selectedSpare => selectedSpare.spareId === spare.shipSpareId);
        // If the spare item is selected, mark it as selected
        if (isSelected) {
          debugger
          this.spareItemSelection.select(spare);
        }
      });
    } else if (this.storeItemDataSource.data && this.selectedCartItems) {
      debugger
      this.storeItemDataSource.data.forEach(store => {
        // Check if the spare item's ID exists in the selectedSpares array
        const isSelected = this.selectedCartItems.some(selectedSpare => selectedSpare.storeId === store.shipStoreId);
        // If the spare item is selected, mark it as selected
        if (isSelected) {
          debugger
          this.storeItemSelection.select(store);
        }
      });
    }

    if (this.ComponentType === 'Component') {
      this.requisitionService.getTemplateTree().subscribe(res => {
        this.dataSourceTree = res;
        this.bindData(this.dataSourceTree);
      })
    }

    // if (this.dataSourceTree)
    //   this.bindData(this.dataSourceTree);
    // if (this.groupTableSourceTree) {
    //   this.bindGroup(this.groupTableSourceTree)
    // }

    this.searchForm = this.fb.group({
      shipId: this.vesselId,
      pageNumber: ['0'],
      pageSize: [this.pageSize],
      status: ['0'],
      keyword: ['']
    });

    this.loadGroupsComponent()

    this.paginator.page.subscribe((pageEvent) => {
      debugger
      // Update page size and load data for the new page
      this.searchForm.patchValue({
        pageNumber: pageEvent.pageIndex + 1,
        pageSize: pageEvent.pageSize
      });
      this.loadGroupsComponent();
    });
    console.log(this.spareItemDataSource.data)
  }

  get sfm() { return this.searchForm.controls };

  closeModal(): void {
    this.dialogRef.close();
  }

  onPageChange(event: PageEvent) {

    const newPageIndex = event.pageIndex;
    if (newPageIndex > this.currentPage) {
      // Incrementing page
      this.currentPage = newPageIndex;
    } else {
      // Decrementing page
      this.currentPage = newPageIndex;
    }
    this.searchForm.patchValue({
      pageNumber: this.currentPage,
      pageSize: event.pageSize,

    });
    this.loadGroupsComponent();
  }

  loadGroupsComponent() {

    if (this.vesselId) {
      const request = new StoreLinkedGroupsModel(
        this.searchForm.value.shipId,
        this.searchForm.value.keyword,
        this.searchForm.value.pageNumber,
        this.searchForm.value.pageSize
      );
      this.requisitionService.GetStoreByShipId(request).subscribe(res => {

        this.groupTableDataSource.data = [];
        this.groupTableDataSource.data = res.data
        this.pageTotal = res.total;
        // this.groupTableDataSource.sort = this.sort;
        // this.groupTableDataSource.paginator = this.paginator;
      })
    }
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
            if (res.accounts.length > 0) {
              await this.matchingAccountCodes.push(res.accounts)
              if (this.matchingAccountCodes[0].length > 0) {
                this.apiCalled = true
                if (checked) {
                  this.spareItemSelection.select(item);
                } else {
                  this.spareItemSelection.deselect(item);
                }
              }
            } else {
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
      this.searchForm.patchValue({
        keyword: filterValue
      });
      this.loadGroupsComponent();
      // this.groupTableDataSource.filter = filterValue;
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
            // this.requisitionService.updateSelectedItems(dataToSend);
            this.dialogRef.close({
              result: 'success',
              dataToSend: dataToSend
            })
          } else {
            const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType }
            // this.requisitionService.updateSelectedItems(dataToSend);
            this.dialogRef.close({
              result: 'success',
              dataToSend: dataToSend
            })
          }
        }
        break;
      case 'Group':
        if (this.groupSelection.selected.length > 0) {

          const selectedGroups = this.groupSelection.selected;

          // Extracting group names and IDs from the selected groups
          this.selectedGroupName = selectedGroups.map(group => group.groupName);
          this.selectedGroupIds = selectedGroups.map(group => group.pmsGroupId);

          const selectedCom = this.selectedGroupName.map(item => item).join(', ');
          const selectedComId = this.selectedGroupIds.map(item => item).join(',');
          this.displayValue = selectedCom
          this.saveValue = selectedComId

          const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType }

          // this.requisitionService.updateSelectedItems(dataToSend);
          this.dialogRef.close({
            result: 'success',
            dataToSend: dataToSend
          })
        }
        break;
      case 'Spare':
        const SelectedSpareItems = this.spareItemDataSource.data.filter(row => this.spareItemSelection.isSelected(row));
        if (SelectedSpareItems.length > 0) {
          debugger
          this.dataSource.data = SelectedSpareItems;
          console.log(SelectedSpareItems)
          const uniqueSpareItems = [...new Set(SelectedSpareItems.map(item =>
            `${item.spareAssembly?.components?.shipComponentName ?? ""}/${item.spareAssembly?.components?.serialNo ?? ""}`.trim() +
            `/${item.spareAssembly?.components?.modelNo ?? ""}/${item.spareAssembly?.components?.maker?.makerName ?? ""}`.trim()
          ))].map(value => value === "null" ? "" : value);
          const spareItemDisplayValue = uniqueSpareItems.join(', ');
          const spareItemSaveValue = this.spareItemDataSource.data
            .filter(row => this.spareItemSelection.isSelected(row))
            .map(item => (item.shipSpareId).toString())
            .join(',');
          this.displayValue = spareItemDisplayValue;
          this.saveValue = spareItemSaveValue;

          if (this.orderType === 'Service') {
            const dataToSend = {
              displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType,
              cartItems: SelectedSpareItems, defaultOrderType: this.orderType
            }
            // this.requisitionService.updateSelectedItems(dataToSend);
            this.dialogRef.close({
              result: 'success',
              dataToSend: dataToSend
            })
          } else {
            const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType, cartItems: SelectedSpareItems }
            // this.requisitionService.updateSelectedItems(dataToSend);
            this.dialogRef.close({
              result: 'success',
              dataToSend: dataToSend
            })
          }
        }
        break;
      case 'Store':
        const SelctedStoreItems = this.storeItemDataSource.data.filter(row => this.storeItemSelection.isSelected(row));
        if (SelctedStoreItems.length > 0) {

          this.dataSource.data = SelctedStoreItems;
          const storeItemDisplayValue = this.storeItemDataSource.data
            .filter(row => this.storeItemSelection.isSelected(row))
            .map(item => item.group.groupName)
            .join(', ');
          const storeItemSaveValue = this.storeItemDataSource.data
            .filter(row => this.storeItemSelection.isSelected(row))
            .map(item => (item.shipStoreId).toString())
            .join(',');
          this.displayValue = storeItemDisplayValue;
          this.saveValue = storeItemSaveValue;
          const dataToSend = { displayValue: this.displayValue, saveValue: this.saveValue, orderReferenceType: this.ComponentType, cartItems: SelctedStoreItems }

          this.dialogRef.close({
            result: 'success',
            dataToSend: dataToSend
          })
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
    if (!isNaN(accountCodeAsNumber) && accountCodeAsNumber != null) {
      if (node.selected && !this.apiCalled && this.selectedComponentIds.length === 0) {
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
              this.matchingAccountCodes.push(accountCodeToCheck.toString())
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
      if (this.matchingAccountCodes.length > 0) {
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
        debugger
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
    debugger
    if (this.selectedGroupIds.length === 0 && this.selectedGroupName.length === 0) {
      this.matchingAccountCodes = [];
      this.apiCalled = false;
    }
    const checkbox = event.target as HTMLInputElement;
    node.selected = checkbox.checked;
    const accountCodeAsNumber = typeof node.groupAccountCode === 'string'
      ? parseInt(node.groupAccountCode, 10)
      : node.groupAccountCode

    if (!isNaN(accountCodeAsNumber) && accountCodeAsNumber != null) {
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

      if (this.matchingAccountCodes.length > 0) {
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
