export class ReqItemsModel {
    itemsId: number;
    spareId: number;
    storeId: number;
    itemCode: string;
    itemName: string;
    partNo: string;
    dwg: string;
    maker: string;
    model: string;
    minRequired: number;
    reqQty: number;
    rob: number;
    lpp: number;
    lpd: number;
    aq: number;
    unit: number;
    uc: number;
    qu: number;
    dt: string;
    id: number;
    cost: number;
    cbc: number;
    lowest: number;
    itemRemarks: string;
    line: string;
    componentName: string;
    componentCode: string;
    equipmentName: string;
    prevReqdQty: string;
    approvedQty: string;
    qtyInUse: string;
    qtyRoB: string;
    reorderQty: string;
    reorderLevel: string;
    maxQuantity: string;
    split: boolean;
    asset: boolean;
    additionalRemarks: string;
    storageLocation: string;
    attachments: string;
    remarks: string;
    material:string;
    description:string;
    pmReqId: number
}

export interface ServiceTypeData {
    serviceReqId: number;
    serviceName: string;
    serviceDesc: string;
    remarks: string;
    jobList: any[];   
    pmReqId: number;
    isExpanded: boolean; 
  }