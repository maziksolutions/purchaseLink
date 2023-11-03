import { Component, Inject, OnInit,inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnitmasterService } from '../../../services/unitmaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { ImportExcelService } from '../../../services/import-excel.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import * as XLSX from 'xlsx'; 
declare let  Swal,$, PerfectScrollbar: any;
@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css']
})
export class ImportDataComponent implements OnInit {
  fileToUpload: File;fileUrl;shownote:string;
  importfrm: FormGroup;
  FileName: string = "Choose file";
  tablename : string; column :string;column2 :string;
  constructor(public dialogRef: MatDialogRef<ImportDataComponent>,private swal: SwalToastService,private sanitizer: DomSanitizer,private fb: FormBuilder,
     private unitmasterService: UnitmasterService, private importexcelservice :ImportExcelService,private exportExcelService: ExportExcelService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.tablename = this.data.tablename; this.column = this.data.columname;
    this.column2 = this.data.columname1;
    this.importfrm = this.fb.group({
      attachment:[],
      tablename : [this.tablename],
      columnname : [this.column],
      columnname2 : [this.column2]
    });
    console.log(this.tablename)
    if(this.tablename =='tblComponentMaster' ||this.tablename =='tblMaintenanceMaster' ||this.tablename =='tblStoreMaster'||this.tablename =='tblSpareMaster')
    {
      this.shownote = 'true';
    }
  }
FileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.fileToUpload = file;
      this.FileName = file.name;
    } else {
      this.FileName = "Choose file";
    }
  }
  Importdata()
  {
     if (this.fileToUpload == null) {
      this.swal.info('Please select the data load file.');
      return true;
 }
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.importfrm.value));
    if (this.fileToUpload != null) {
       formData.append('attachment', this.fileToUpload, this.fileToUpload.name);
    }
    if(this.data.columncheck == "Type1" || this.data.tablename == "tblJobType" || this.data.tablename == "tblEngineModel" || this.data.tablename == "tblECDIS" || this.data.tablename == "tblShipType" || this.data.tablename == "tblEngineSubType" || this.data.tablename == "tblJobGroup" || this.data.tablename == "tblComponentType" || this.data.tablename == "tblComponentCondition"
    || this.data.tablename == "tblAttachmentType" || this.data.tablename == "tblEngineType" || this.data.tablename == "tblUserPosition"  || this.data.tablename == "tblMaintenanceCause" || this.data.tablename == "tblMaintenanceProcedure" || this.data.tablename == "tblMaintenanceReference")
   {
      this.unitmasterService.ImportSinglecolumn(formData).subscribe(response =>{       
        if(response.data[0].status == 0)
        {
          this.swal.info('Duplicate data found, data has not been imported.');
          response.data.forEach((item)=>{     
            delete item.status
          })
          // this.dyanmicDownloadByHtmlTag({
          //   fileName: 'duplicate data',
          //   text: JSON.stringify(response.data)
          // });
          this.dialogRef.close('success');
        }
        else
        {
          if(response.data.length >0)
          {
            response.data.forEach((item)=>{     
              delete item.status
            })
            // this.dyanmicDownloadByHtmlTag({
            //   fileName: 'duplicate data',
            //   text: JSON.stringify(response.data)
            // });
            if(response.data[0].columnname =="imported")
            this.swal.success('Data has been imported successfully.');
            else
            this.swal.info('Duplicate data found, data has not been imported.');
           // this.swal.success('New data has been imported successfully and duplicate has been discarded.');    
          }
          else
          {
            this.swal.success('Data has been imported successfully.');
          }
          this.dialogRef.close('success');
        }
            })
    }
    else if(this.data.tablename == "tblCodeList")
    {
      console.log(this.data.tablename);
      this.unitmasterService.ImportCodelist(formData).subscribe(response =>{
              //         this.dyanmicDownloadByHtmlTag({
              //   fileName: 'duplicate data',
              //   text: JSON.stringify(response.data)
              // });
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
            })
    }
    else if(this.data.tablename == "tblPMSGroup")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importpmsgroupdata(formData).subscribe(response =>{
              //         this.dyanmicDownloadByHtmlTag({
              //   fileName: 'duplicate data',
              //   text: JSON.stringify(response.data)
              // });
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
            })
    }
    else if(this.data.tablename == "tblMaintenanceMaster")
    {
      this.importexcelservice.importmaintenancemaster(formData).subscribe(response =>{       
        console.log(response,response.status)
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');
        XLSX.writeFile(wb, "Maintenance Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblComponentMaster")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importcomponentMaster(formData).subscribe(response =>{
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Component');
        XLSX.writeFile(wb, "Component Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblShipComponentMaster")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importShipPMSMaster(formData).subscribe(response =>{
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ship Component');
        XLSX.writeFile(wb, "Ship Component Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblShipMaintenanceMaster")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importShipJobsmaster(formData).subscribe(response =>{
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');
        XLSX.writeFile(wb, "Ship Maintenance Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblShipSpareMaster")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importShipsparesmaster(formData).subscribe(response =>{
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');
        XLSX.writeFile(wb, "Ship Maintenance Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblPosition")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importPositionMasterdata(formData).subscribe(response =>{
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
          if(response.data.length >0)
          {
            this.swal.success('Duplicate data is not imported. Please check the downloaded file.');
            this.dialogRef.close('success');
          }
          else
          {
            this.swal.success('Data has been imported successfully.');
            this.dialogRef.close('success');
          }              
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');
        XLSX.writeFile(wb, "Position_Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblStoreMaster")
    {     
      this.importexcelservice.importstoremaster(formData).subscribe(response =>{ 
        console.log(response,response.data.length);
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Store');
        XLSX.writeFile(wb, "Store Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblSpareMaster")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importSparePartsMaster(formData).subscribe(response =>{
        if (response.status == "-10") {          
          this.swal.error('Data is not imported. Please check the error. ' + response.Message);
        }
        else{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
        }
if(response.data.length >0)
{
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Spare');
        XLSX.writeFile(wb, "Spare Master.xlsx");          
}
            })
    }
    else if(this.data.tablename == "tblClassificationSurvey")
    {
      console.log(this.data.tablename);
      this.importexcelservice.importclassificationSurvey(formData).subscribe(response =>{
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
            })
    }
    else if(this.data.tablename == "tblMakerMaster")
    {
      this.unitmasterService.ImportMaker(formData).subscribe(response =>{
        if(response.data[0].status == 0)
        {
          this.swal.info('Duplicate data found, data has not been imported.');
          response.data.forEach((item)=>{     
            delete item.status
          })
          this.dialogRef.close('success');
        }
        else
        {
          if(response.data.length >0)
          {
            response.data.forEach((item)=>{     
              delete item.status
            })
            if(response.data[0].columnname =="imported")
            this.swal.success('Data has been imported successfully.');
            else
            this.swal.info('Duplicate data found, data has not been imported.');  
          }
          else
          {
            this.swal.success('Data has been imported successfully.');
          }
          this.dialogRef.close('success');
        }
            })
    }
    else if(this.data.tablename == "tblDepartment")
    {
      this.importexcelservice.importdepartment(formData).subscribe(response =>{
        console.log(response.data);console.log(response);
              this.dyanmicDownloadByHtmlTag({
                fileName: 'duplicate data',
                text: JSON.stringify(response.data)
              });
              this.swal.success('Data has been imported successfully.');
              this.dialogRef.close('success');
            })
    }
    // else if(this.data.tablename == "tblComponentCondition")
    // {
    //   this.unitmasterService.ImportSinglecolumn(formData).subscribe(response =>{
    //     console.log(response.data);console.log(response);
    //           this.dyanmicDownloadByHtmlTag({
    //             fileName: 'duplicate data',
    //             text: JSON.stringify(response.data)
    //           });
    //           this.swal.success('Data has been imported successfully.');
    //           this.dialogRef.close('success');
    //         })
    // }
    // else if(this.data.tablename == "tblAttachmentType")
    // {
    //   this.unitmasterService.ImportSinglecolumn(formData).subscribe(response =>{
    //     console.log(response.data);console.log(response);
    //           this.dyanmicDownloadByHtmlTag({
    //             fileName: 'duplicate data',
    //             text: JSON.stringify(response.data)
    //           });
    //           this.swal.success('Data has been imported successfully.');
    //           this.dialogRef.close('success');
    //         })
    // }
    else
    {
    this.unitmasterService.importunit(formData).subscribe(response =>{
console.log(response.data);console.log(response);
if(response.data[0].status == 0)
{
  this.swal.info('Duplicate data found, data has not been imported.');
  response.data.forEach((item)=>{     
    delete item.status
  })
  // this.dyanmicDownloadByHtmlTag({
  //   fileName: 'duplicate data',
  //   text: JSON.stringify(response.data)
  // });
  this.dialogRef.close('success');
}
else
{
  if(response.data.length >0)
  {
    response.data.forEach((item)=>{     
      delete item.status
    })
    // this.dyanmicDownloadByHtmlTag({
    //   fileName: 'duplicate data',
    //   text: JSON.stringify(response.data)
    // });
    if(response.data[0].columnname =="imported")
            this.swal.success('Data has been imported successfully.');
            else
            this.swal.info('Duplicate data found, data has not been imported.');
    //this.swal.success('New data has been imported successfully and duplicate has been discarded.');    
  }
  else
  {
    this.swal.success('Data has been imported successfully.');
  }
  this.dialogRef.close('success');
}
    })
  }
}

  private setting = {
    element: {
      dynamicDownload: null as unknown as HTMLElement
    }
  }
  private dyanmicDownloadByHtmlTag(arg: {
    fileName: string,
    text: string
  }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);
    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }
}
