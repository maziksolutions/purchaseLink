import { FormArray } from '@angular/forms';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { DatePipe } from '@angular/common';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
import * as logo from './logo.js';

const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {
  constructor(public datepipe: DatePipe) { }
  public exportAsExcelFile(json: any[], excelFileName: string, filetile: string): void {
    var fileTitle = "";
    var range1 = "";
    var range2 = "";
    if (filetile.includes('(')) {
      fileTitle = filetile.split('(')[0].toString();
      if (filetile.split('(')[1].split(')')[0].toString().includes('TO')) {
        range1 = filetile.split('(')[1].split(')')[0].toString().split('TO')[0].toString();
        range2 = filetile.split('(')[1].split(')')[0].toString().split('TO')[1].toString();
      }
    }
    else
      fileTitle = filetile;

    let header:any = [];
    header.push("Srno");
    for (let item of Object.keys(json[0])) {
      header.push(item);
     
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('data');

    // Add new row
    worksheet.addRow([]);
    if (filetile.includes('Vessel Certificate Expiry Report') || filetile.includes('Appreciation Report')) {
      let titleRow = worksheet.addRow(['', '', '', '', 'From', 'To', 'Report Date']);
      titleRow.font = { name: 'Calibri Light', family: 4, size: 14, bold: true, underline: 'single' };
      titleRow.height = 19;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    else if (filetile.includes('Vessel Certificate Missing Report')) {
      let titleRow = worksheet.addRow(['', '', '', '', '', '', 'Report Date']);
      titleRow.font = { name: 'Calibri Light', family: 4, size: 14, bold: true, underline: 'single' };
      titleRow.height = 19;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    else if (filetile.includes('Crew Expiry Document Status')) {
      let titleRow = worksheet.addRow(['', '', '', '', '', '', '', 'From', 'To', 'Report Date']);

      titleRow.font = { name: 'Calibri Light', family: 4, size: 14, bold: true, underline: 'single' };
      titleRow.height = 19;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    else if (filetile.includes('(')) {
      let titleRow = worksheet.addRow(['', '', '', '', '', '', 'From', 'To', 'Report Date']);

      titleRow.font = { name: 'Calibri Light', family: 4, size: 14, bold: true, underline: 'single' };
      titleRow.height = 19;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    else  if (filetile.includes('Read Status')) {
      let titleRow = worksheet.addRow(['', '', '', '', 'Report Date']);

      titleRow.font = { name: 'Calibri Light', family: 4, size: 14, bold: true, underline: 'single' };
      titleRow.height = 19;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    else {
      let titleRow = worksheet.addRow(['', '', '', '', '','', 'Report Date']);

      titleRow.font = { name: 'Calibri Light', family: 4, size: 14, bold: true, underline: 'single' };
      titleRow.height = 19;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    //Add Image
    let myLogoImage = workbook.addImage({
      base64: logo.imgBase64,
      extension: 'png',
    });
    //worksheet.mergeCells('A1:A3');
    // worksheet.addImage(myLogoImage, 'A1:A3');
    worksheet.addImage(myLogoImage, {
      tl: { col: 0, row: 1 },
      ext: { width: 160, height: 75 }
    });

    //worksheet.addImage(myLogoImage, 'A2:B3');

    if (filetile.includes('Vessel Certificate') || filetile.includes('Appreciation Report') || filetile.includes('Document Read Status') ) 
    {
      if (filetile.includes('Vessel Certificate Missing Report') || filetile.includes('Document Read Status')) {
        worksheet.mergeCells('C2:D3');
        worksheet.getCell("D3").alignment = {
          vertical: 'middle',
          horizontal: 'centerContinuous'
        }
        worksheet.getCell("D3").value = fileTitle;

        worksheet.getCell("C2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

      }    

      else {
        worksheet.mergeCells('C2:C3');
        worksheet.getCell("C3").alignment = {
          vertical: 'middle',
          horizontal: 'centerContinuous'
        }
        worksheet.getCell("C3").value = fileTitle;

        worksheet.getCell("C2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

      }    

      if (filetile.includes('(')) {
        worksheet.getCell("E2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: {} };
        worksheet.getCell("F2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {} };
        worksheet.getCell("E3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: {} };
        worksheet.getCell("F3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {} };
      }      
      
      if (filetile.includes('Document Read Status')) {
        worksheet.getCell("E2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
        worksheet.getCell("E3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };      
  
  
        worksheet.getCell("E2").font = {
          name: 'Calibri Light',
          family: 2,
          bold: true,
          size: 11,
          underline: 'none'
        }         
  
        worksheet.getCell("E3").font = {
          name: 'Calibri Light',
          family: 2,
          bold: false,
          size: 11
        }  
        worksheet.getCell("E3").alignment = { vertical: 'middle', horizontal: 'center' };   
  
        worksheet.getRow(3).height = 19;
        worksheet.getColumn(1).width = 20; 
       
        worksheet.getCell("E3").value = this.datepipe.transform(new Date(), 'dd-MMM-yy');

      }
      else
      {
      worksheet.getCell("G2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
      worksheet.getCell("G3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };      


      worksheet.getCell("E2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: true,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("F2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: true,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("G2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("E3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }

      worksheet.getCell("F3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11,
      }

      worksheet.getCell("G3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }
      worksheet.getCell("E3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("F3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("G3").alignment = { vertical: 'middle', horizontal: 'center' };


      worksheet.getRow(3).height = 19;
      worksheet.getColumn(1).width = 20;
      //Range Row to show Date Range
      let rangeRow = worksheet.addRow([]);
      rangeRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
      rangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.getCell("E3").value = range1;
      worksheet.getCell("F3").value = range2;
      worksheet.getCell("G3").value = this.datepipe.transform(new Date(), 'dd-MMM-yy');
     }
    }
    else if (filetile.includes('Crew Expiry Document Status')) {
      worksheet.mergeCells('C2:F3');
      worksheet.getCell("F3").alignment = {
        vertical: 'middle',
        horizontal: 'centerContinuous'
      }
      worksheet.getCell("F3").value = fileTitle;

      worksheet.getCell("C2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };


      if (filetile.includes('(')) {
        worksheet.getCell("H2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: {} };
        worksheet.getCell("I2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {} };
        worksheet.getCell("H3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: {} };
        worksheet.getCell("I3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {} };
      }


      worksheet.getCell("J2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
      worksheet.getCell("J3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };



      worksheet.getCell("H2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: true,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("I2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: true,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("J2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("H3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }

      worksheet.getCell("I3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11,
      }

      worksheet.getCell("J3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }
      worksheet.getCell("H3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("I3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("J3").alignment = { vertical: 'middle', horizontal: 'center' };


      worksheet.getRow(3).height = 19;
      worksheet.getColumn(1).width = 20;
      //Range Row to show Date Range
      let rangeRow = worksheet.addRow([]);
      rangeRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
      rangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.getCell("H3").value = range1;
      worksheet.getCell("I3").value = range2;
      worksheet.getCell("J3").value = this.datepipe.transform(new Date(), 'dd-MMM-yy');
    }
    else {
      worksheet.mergeCells('C2:E3');
      worksheet.getCell("E3").alignment = {
        vertical: 'middle',
        horizontal: 'centerContinuous'
      }
      worksheet.getCell("E3").value = fileTitle;

      worksheet.getCell("C2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };


      if (filetile.includes('(')) {
        worksheet.getCell("G2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: {} };
        worksheet.getCell("H2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {} };
        worksheet.getCell("G3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: {} };
        worksheet.getCell("H3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {} };

        worksheet.getCell("I2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
        worksheet.getCell("I3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      }
      else
      {
        worksheet.getCell("G2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
        worksheet.getCell("G3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      }    



      worksheet.getCell("G2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: true,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("H2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: true,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("I2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11,
        underline: 'none'
      }

      worksheet.getCell("G3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }

      worksheet.getCell("H3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11,
      }

      worksheet.getCell("I3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }
      worksheet.getCell("G3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("H3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("I3").alignment = { vertical: 'middle', horizontal: 'center' };


      worksheet.getRow(3).height = 19;
      worksheet.getColumn(1).width = 20;
      //Range Row to show Date Range
      let rangeRow = worksheet.addRow([]);
      rangeRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
      rangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.getCell("G3").value = range1;
      worksheet.getCell("H3").value = range2;
      if (filetile.includes('(')) {
      worksheet.getCell("I3").value = this.datepipe.transform(new Date(), 'dd-MMM-yy');
      }
      else{
        worksheet.getCell("G3").value = this.datepipe.transform(new Date(), 'dd-MMM-yy');
      }
    }

    //Show Report Date Row
    // let reportRow = worksheet.addRow(['', 'Date: ' + this.datepipe.transform(new Date(), 'dd-MMM-yy')]);
    // reportRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
    // worksheet.getCell("C4").alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.addRow([]);
    for (var i = 0; i < header.length; i++) {
      header[i] = this.capatilizeWord(header[i]);
    }
    let headerRow = worksheet.addRow(header);
    headerRow.height = 18;
    headerRow.eachCell((cell, number) => {


     
      const contentWidth = cell.value ? cell.value.toString().length * 1.5 : 0;

//       // Set the width of the column
    worksheet.getColumn(number).width = contentWidth;
    worksheet

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '253b5b' }
        
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 12,
        color: { argb: 'FFFFFF' },
        
      }
      cell.alignment = {
        vertical: 'middle', horizontal: 'centerContinuous'
      }

    })

    
    for (var i = 0; i < json.length; i++) {
      let x2 = Object.keys(json[i]);
      let temp:any = [];
      temp.push(i + 1);
      for (let y of x2) {
        if (json[i][y] != null)
          temp.push(json[i][y])
        else
          temp.push('-')
      }
      let rowData = worksheet.addRow(temp)
      // if (filetile.includes('Date Of Availability Report') == false || filetile.includes('Appraisal Report') == false)
        // rowData.height=19;     
        rowData.eachCell(cell => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
          rowData.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' }
          }
          cell.font = {
            name: 'Calibri Light',
            family: 2,
            bold: false,
            size: 11,
            color: { argb: '000000' }
          }
          cell.alignment = {
            vertical: 'middle', horizontal: 'left', wrapText: true
          }
        })
    }      
    
    worksheet.columns.forEach(column => {
        var maxLength =0;       
        column["eachCell"]?(function (cell) {    
          var columnLength = cell.value ? cell.value.toString().length : 25;
          if (columnLength > maxLength) {
            maxLength = columnLength + 2;
          }
        }):(maxLength =maxLength);
      column.width = maxLength < 15 ? 15 : maxLength;
    });  


    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, excelFileName + EXCEL_EXTENSION);
    })
  }
  capatilizeWord(s) {
    s = s.replace(/([A-Z])/g, ' $1').trim();
    switch (s) {  
      case "company H O D": s = "Company HOD"; break;    
      case "rank Id": s = "Rank"; break;
      case "cba Id": s = "CBA"; break;
      case "cdc": case "CDC": case "cdcno":
      s = "CDC No.";
      break;   
      case "coltype": s = "Type"; break;    
      case "totalpayable": s = "Total payable"; break;  
      case "ex_ New Hand":
        s = "Ex/New Hand";
        break;
      case "bmi":
        s = "BMI";
        break;
      case "bmi Status":
        s = "BMI status";
        break;
      case "cdc Number":
        s = "CDC No.";
        break;

     

      case "Srno":
        s = "Sr. No.";
        break;
      case "code":
        s = "Rank";
        break;

      case "new Recruitment Rate":
        s = "New Recruitment Rate(%) ";
        break;

      case "oil Expiry":
        s = "Oil DCE expiry date";
        break;
      case "chem Expiry":
        s = "Chemical DCE expiry date";
        break;
      case "gas Expiry":
        s = "Gas DCE expiry date";
        break;

      case "crewname":
        s = "Crew name";
        break;
      case "exp Date":
        s = " Expiry date";
        break;
      case "nation":  s = " Nationality";  break;
      case "emp Number":  s = " Employment number";  break;
      case "doa":  s = " DOA";  break;       

      
      case "first Medicaldate": s = " First medical date"; break;
      case "second Medicaldate": s = " Second medical date"; break;

      case "signoff Date": s = " Sign-Off date"; break;
      case "signon Date": s = " Sign-On date"; break;
      case "sign Off Reason": s = " Sign-Off Reason"; break;
      case "endDate": s = "To date"; break;
      case "fromDate": s = "Start date"; break;
      case "totaldays": s = "Total days"; break;
      case "totalamount": s = "Total amount"; break; 
      case "fromvessel": s = "From vessel"; break;   
      case "tovessel": s = "To vessel"; break;  
      case "marks1": s = "1st Vessel Appraisal %"; break;   
      case "marks2": s = "2nd Vessel Appraisal %"; break;   
      case "marks3": s = "3rd Vessel Appraisal %"; break;   

      case "dob": s = " Date of birth"; break;
      case "crewstatus": s = " Crew status"; break;
      case "shipcategory": s = " Ship category"; break;
      case "rankname": s = "Rank name"; break;
      case "grouprank": s = "Group rank"; break;
      case "docname": s = "Document name";
        break;
      case "issuedate": s = "Issue date";
        break;
      case "timeperiod": s = "Time Period";
        break;
      case "reliefdate": s = "Relief date";
        break;
      case "signondate": s = "Signon date";
        break;
      case "signoffdate": s = "Signoff date";
        break;
      case "vesselname": s = "Vessel";
        break;
      case "expirydate": s = "Expiry date";
        break;
      case "doctype": s = "Document type";
        break;
      case "crewrank": s = "Rank name";
        break;
      case "licenseno": s = "License no";
        break;
      case "inform P N I Date": s = "Inform PNI date"
        break;
      case "doi": s = "Date of incident"; break;
      case "level1": s = "Level"; break;
      case "attachment": s = "Payslip status"; break;      
      case "certof Comp": s = "Certificate of competency"; break;
      case "tanker Cert": s = "Tanker certificate"; break;
      case "radio Qual": s = "Radio qualification"; break;
      case "english Prof": s = "English proficiency"; break;
      case "operator Exp": s = "Operator experience"; break;
      case "tanker Exp": s = "Tanker experience"; break;
      case "all Tanker Exp": s = "All tanker experience"; break;    

      case "add Service": s = "Service Type"; break;   
      case "add Service Group": s = "Service Group"; break;   
      case "vendor Register": s = "Vendor Name"; break;   

      default:
        s = s[0].toUpperCase() + s.slice(1).toLowerCase();
        break;
    }
    return s;
  } 


  //#region Load sheet Code
  public LoadSheet(data: any[], excelFileName: string, filetile: string,columns: number): void { 
    let workbook = new Workbook();    
    var worksheet = workbook.addWorksheet(filetile, {properties:{tabColor:{argb:'FFC0000'}}});
    let header:any = [];   
    for (let item of Object.keys(data[0])) {
      header.push(item);
    }   
    
    for (var i = 0; i < header.length; i++) {
      header[i] = header[i];
    }
    let headerRow = worksheet.addRow(header);
    headerRow.height = 18;
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '253b5b' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 12,
        color: { argb: 'FFFFFF' }
      }
      cell.alignment = {
        vertical: 'middle', horizontal: 'centerContinuous'
      }

    })

    for (var i = 0; i < data.length; i++) {
      let x2 = Object.keys(data[i]);
      let temp:any = [];    
      for (let y of x2) {
        if (data[i][y] != null)
          temp.push(data[i][y])
        else
          temp.push('-')
      }
      let rowData = worksheet.addRow(temp)
      // if (filetile.includes('Date Of Availability Report') == false || filetile.includes('Appraisal Report') == false)
        // rowData.height=19;     
        rowData.eachCell(cell => {

          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
          rowData.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' }
          }
          cell.font = {
            name: 'Calibri Light',
            family: 2,
            bold: false,
            size: 11,
            color: { argb: '000000' }
          }
          cell.alignment = {
            vertical: 'middle', horizontal: 'left', wrapText: true
          }
        })
    }  

    worksheet.columns.forEach(function (column, i) {
      var maxLength = 0;      
        column.width = maxLength < 20 ? 20 : maxLength;

    });
    if(columns ==1)
    {
      ['A1'].map(key => {
        worksheet.getCell(key).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' },
          bgColor: { argb: '000000' }
        };
        worksheet.getCell(key).font = {
          color: { argb: '000000' },   
          };
  });
    }
   else if(columns ==2)
    {
      ['A1','B1'].map(key => {
        worksheet.getCell(key).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' },
          bgColor: { argb: '000000' }
        };
        worksheet.getCell(key).font = {
          color: { argb: '000000' },   
          };
  });
    }
    else if(columns ==3)
    {
      ['A1','B1','C1'].map(key => {
        worksheet.getCell(key).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' },
          bgColor: { argb: '000000' }
        };
        worksheet.getCell(key).font = {
          color: { argb: '000000' },   
          };
  });
    }
    else if(columns ==4)
    {
      ['A1','B1','C1','D1'].map(key => {
        worksheet.getCell(key).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' },
          bgColor: { argb: '000000' }
        };
        worksheet.getCell(key).font = {
          color: { argb: '000000' },   
          };
  });
    }
    else if(columns ==7)
    {
      ['A1','B1','C1','D1','E1','F1','G1'].map(key => {
        worksheet.getCell(key).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' },
          bgColor: { argb: '000000' }
        };
        worksheet.getCell(key).font = {
          color: { argb: '000000' },   
          };
  });
    }
    const excelBuffer: any = workbook.xlsx.writeBuffer();
    workbook.xlsx.writeBuffer()
        .then(function(buffer) {
            // done buffering
            const data: Blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
            FileSaver.saveAs(data, excelFileName);
        });
    }
    //#endregion
  }



