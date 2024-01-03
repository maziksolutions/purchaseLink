export class response{
    status:boolean;
    data:any;
    total:number;
  static status: any;
}

export interface PrincipalListTree {
  principal: string;
  vesselName: string;
  vesselId: number;
  vesselTree: PrincipalListTree[];
}

export interface ExampleFlatNode {
  principal: string;
  vesselName: string;
  vesselId: number;
  expandable: boolean;
  level: number;
}

export interface TemplateTree {
  groupName: string;
  groupId: number;
  type:string;
  subGroup: TemplateTree[];
}


export interface ExampleGroupFlatNode {
  groupName: string;
  groupId: number; 
  type:string;
  expandable: boolean;
  level: number;
  selected?: boolean;
}

export interface GroupFlatNode {
  groupName: string;
  groupId: number; 
  type:string;
  expandable: boolean;
  level: number;
  subGroup?: ExampleGroupFlatNode[];
  selected?: boolean;
}