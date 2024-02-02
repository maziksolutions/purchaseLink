export class StoreLinkedGroupsModel {
    ShipId: number;
    KeyWord: string;
    PageNumber: number;
    PageSize: number;
  
    constructor(shipId: number, keyword: string, pageNumber: number, pageSize: number) {
      this.ShipId = shipId;
      this.KeyWord = keyword;
      this.PageNumber = pageNumber;
      this.PageSize = pageSize;
    }
  }