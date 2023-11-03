import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { DatePipe } from '@angular/common';
import * as logo from './logo.js';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root'
})
export class ExcelExportService { 

  // constructor(public datepipe: DatePipe) { }
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
    let worksheet = workbook.addWorksheet('Data');

    // Add new row
    worksheet.addRow([]);
    if (filetile.includes('Salary')) {
      let titleRow = worksheet.addRow(['', '', '', '', '','From Date', 'To date','Report Date']);
      titleRow.font = { name: 'Calibri Light', family: 4, size: 12, bold: true, underline: 'single' };
      titleRow.height = 14;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    } 
    else if (filetile.includes('(')) {
      let titleRow = worksheet.addRow(['', '', '', '', 'Report Date','','From Date', 'To date']);
      titleRow.font = { name: 'Calibri Light', family: 4, size: 12, bold: true, underline: 'single' };
      titleRow.height = 14;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    else if (filetile.includes('Wages')){
      let titleRow = worksheet.addRow(['', '', '', '',  'Report Date']);
      titleRow.font = { name: 'Calibri Light', family: 4, size: 12, bold: true, underline: 'single' };
      titleRow.height = 14;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    else
    {
      let titleRow = worksheet.addRow(['','','','','Report Date']);
      titleRow.font = { name: 'Calibri Light', family: 4, size: 12, bold: true, underline: 'single' };
      titleRow.height = 14;
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    //Add Image
    let myLogoImage = workbook.addImage({
      base64: logo.imgBase64,
      extension: 'png',
    });
    // worksheet.mergeCells('A1:A3');
    // worksheet.addImage(myLogoImage, 'A1:A3');
    worksheet.addImage(myLogoImage, {
      tl: { col: 0, row: 1 },
      ext: { width: 103, height: 60 }
    });

    //worksheet.addImage(myLogoImage, 'A2:B3');
 if (filetile.includes('Salary')) {
      worksheet.mergeCells('B2:C3');
      worksheet.getCell("C3").alignment = {
        vertical: 'middle',
        horizontal: 'centerContinuous'
      }
      worksheet.getCell("C3").value = fileTitle;
      worksheet.getCell("B2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
 if (filetile.includes('(')) {
        worksheet.getCell("F2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: {} };
        worksheet.getCell("G2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {} };
        worksheet.getCell("H2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {style: 'medium'} };        
        worksheet.getCell("F3").border = { top: {}, left: {style: 'medium'}, bottom: {style: 'medium'}, right: {} };
        worksheet.getCell("G3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {} };
        worksheet.getCell("H3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {style: 'medium'} };
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

      worksheet.getCell("F3").font = {
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
      worksheet.getCell("G3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("H3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("F2").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("F3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(3).height = 19;
      worksheet.getColumn(1).width = 20;
      //Range Row to show Date Range
      let rangeRow = worksheet.addRow([]);
      rangeRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
      rangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.getCell("F3").value = range1;
      worksheet.getCell("G3").value = range2;
     // worksheet.getCell("H3").value = this.datepipe.transform(new Date(), 'dd-MMM-yyyy');
      // worksheet.getCell("F2").value = range2;      
    }
    else if (filetile.includes('Wages'))  {    
      worksheet.mergeCells('B2:C3');
    worksheet.getCell("C3").alignment = {
      vertical: 'middle',
      horizontal: 'centerContinuous'
    }
    worksheet.getCell("C3").value = fileTitle;
    worksheet.getCell("B2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

    if (filetile.includes('(')) {
      worksheet.getCell("G2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: {} };
      worksheet.getCell("H2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {} };
      worksheet.getCell("G3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: {} };
      worksheet.getCell("H3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {} };
    }


    worksheet.getCell("E2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
    worksheet.getCell("E3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

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
    worksheet.getCell("F2").font = {
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
    worksheet.getCell("F2").font = {
      name: 'Calibri Light',
      family: 2,
      bold: false,
      size: 11
    }

    worksheet.getCell("F3").font = {
      name: 'Calibri Light',
      family: 2,
      bold: false,
      size: 11
    }
    worksheet.getCell("G3").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("H3").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("F2").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("F3").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("E3").alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getRow(3).height = 19;
    worksheet.getColumn(1).width = 20;
    //Range Row to show Date Range
    let rangeRow = worksheet.addRow([]);
    rangeRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
    rangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getCell("G3").value = range1;
    worksheet.getCell("H3").value = range2;
   // worksheet.getCell("E3").value = this.datepipe.transform(new Date(), 'dd-MMM-yyyy');      
    }
    else if (filetile.includes('Company Holidays'))  {    
      worksheet.mergeCells('B2:C3');
    worksheet.getCell("C3").alignment = {
      vertical: 'middle',
      horizontal: 'centerContinuous'
    }
    worksheet.getCell("C3").value = fileTitle;
    worksheet.getCell("B2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

    if (filetile.includes('(')) {
      worksheet.getCell("G2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: {} };
      worksheet.getCell("H2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {} };
      worksheet.getCell("G3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: {} };
      worksheet.getCell("H3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {} };
    }


    worksheet.getCell("E2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
    worksheet.getCell("E3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

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
    worksheet.getCell("F2").font = {
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
    worksheet.getCell("F2").font = {
      name: 'Calibri Light',
      family: 2,
      bold: false,
      size: 11
    }

    worksheet.getCell("F3").font = {
      name: 'Calibri Light',
      family: 2,
      bold: false,
      size: 11
    }
    worksheet.getCell("G3").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("H3").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("F2").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("F3").alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell("E3").alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getRow(3).height = 19;
    worksheet.getColumn(1).width = 20;
    //Range Row to show Date Range
    let rangeRow = worksheet.addRow([]);
    rangeRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
    rangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getCell("G3").value = range1;
    worksheet.getCell("H3").value = range2;
  //  worksheet.getCell("E3").value = this.datepipe.transform(new Date(), 'dd-MMM-yyyy');      
    }
    else {
      worksheet.mergeCells('B2:C3');
      worksheet.getCell("C3").alignment = {
        vertical: 'middle',
        horizontal: 'centerContinuous'
      }
      worksheet.getCell("C3").value = fileTitle;
      worksheet.getCell("B2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    
      if (filetile.includes('(')) {
        worksheet.getCell("G2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: {} };
        worksheet.getCell("H2").border = { top: { style: 'medium' }, left: {}, bottom: {}, right: {} };
        worksheet.getCell("G3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: {} };
        worksheet.getCell("H3").border = { top: {}, left: {}, bottom: { style: 'medium' }, right: {} };
      }
      worksheet.getCell("E2").border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: {}, right: { style: 'medium' } };
      worksheet.getCell("E3").border = { top: {}, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
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
      worksheet.getCell("F2").font = {
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
      worksheet.getCell("F2").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }
      worksheet.getCell("F3").font = {
        name: 'Calibri Light',
        family: 2,
        bold: false,
        size: 11
      }
      worksheet.getCell("G3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("H3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("F2").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("F3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell("E3").alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(3).height = 19;
      worksheet.getColumn(1).width = 20;
      //Range Row to show Date Range
      let rangeRow = worksheet.addRow([]);
      rangeRow.font = { name: 'Calibri Light', family: 2, size: 10, bold: false };
      rangeRow.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.getCell("G3").value = range1;
      worksheet.getCell("H3").value = range2;
     // worksheet.getCell("E3").value = this.datepipe.transform(new Date(), 'dd-MMM-yy');
      // worksheet.getCell("F2").value = range2;      
    }
    worksheet.addRow([]);
    for (var i = 0; i < header.length; i++) {
      header[i] = this.capatilizeWord(header[i]);
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
    // worksheet.columns.forEach(function (column, i) {
    //   var maxLength = 0;
    //   column["eachCell"]({ includeEmpty: true }, function (cell) {
      

    //     if (cell.value == 'Healthy Weight') {
    //       cell.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: '50B445' }
    //       }
    //     }
    //     if (cell.value == 'Over Weight') {
    //       cell.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: 'F58900' }
    //       }
    //     }
    //     if (cell.value == 'Under Weight') {
    //       cell.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: 'D2D2D2' }
    //       }
    //     }
    //     if (cell.value == 'Obese') {
    //       cell.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: 'D00000' }
    //       }
    //     }

    //     // cell.height=19; 
    //     var columnLength = cell.value ? cell.value.toString().length : 10;
    //     if (columnLength > maxLength) {
    //       maxLength = columnLength + 2;
    //     }
    //   });

    //   if (column.values?.includes("Srno") && column.values.includes(" ") == false)
    //     column.width = 10;
    //   else if (column.values?.includes("Remarks") || column.values?.includes("Improvement required") || column.values?.includes("Supt comments") || column.values?.includes("Office comments") || column.values?.includes("Subject") || column.values?.includes("Message") || column.values?.includes("Last action") || column.values?.includes("Email")) {
    //     column.width = 40;        
    //   }
    //   else
    //     column.width = maxLength < 15 ? 15 : maxLength;

    // });










    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, excelFileName + EXCEL_EXTENSION);
    })
  }




  capatilizeWord(s) {
    s = s.replace(/([A-Z])/g, ' $1').trim();
    switch (s) { 
      case "Srno": s = "Sr. No.";  break; 
      case "final Balance": s = "Carried Forward"; break;
      case "amountHold": s = "Amount Retained"; break;
      case "allotment": s = "Remittance Made"; break;
      case "code" : s = "Code";  break;
      case "first Medicaldate": s = " First medical date"; break;
      case "second Medicaldate": s = " Second medical date"; break;
      case "signoff Date": s = " Sign-Off date"; break;
      case "signon Date": s = " Sign-On date"; break;
      case "sign Off Reason": s = " Sign-Off Reason"; break;
      case "endDate": s = "To date"; break;
      case "fromDate": s = "Start date"; break;
      case "totaldays": s = "Total days"; break;
      case "totalamount": s = "Total amount"; break;  
      case "dob": s = " Date of birth"; break;
      case "crewstatus": s = " Crew status"; break;
      case "shipcategory": s = " Ship category"; break;
      case "rankname": s = "Rank name"; break;
      case "grouprank": s = "Group rank"; break;
      case "docname": s = "Document name";        break;
      case "issuedate": s = "Issue date";        break;
      case "timeperiod": s = "Time Period";        break; 
      case "doctype": s = "Document type";        break;
      case "crewrank": s = "Rank name"; break;
      case "licenseno": s = "License no"; break;
      case "inform P N I Date": s = "Inform PNI date";  break;
      case "doi": s = "Date of incident"; break;
      case "level1": s = "Level"; break;
      case "countryName": s = "Country Name"; break;
      case "trainingCTC": s = "Training CTC"; break;
      case "companyPF": s = "Company PF"; break;
      case "employeePF": s = "Employee PF"; break;
      case "hra": s = "HRA"; break;
      case "tds": s = "TDS"; break;
      case "holidayDate": s = "Holiday Date";  break;    
      case "holidayName": s = "Holiday Name";  break;       
      
      default:
        s = s[0].toUpperCase() + s.slice(1).toLowerCase();
        break;
    }
    return s;
  }
}


