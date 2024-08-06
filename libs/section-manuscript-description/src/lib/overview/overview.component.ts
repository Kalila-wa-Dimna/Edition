import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { KeyValue } from '@angular/common';
import { MatColumnDef } from '@angular/material/table';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Component({
  selector: 'kalila-edition-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  data: any;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  columnsToDisplay: string[] = [
    'siglum__siglum',
    'catalogue__title',
    'catalogue__link',
    'catalogue__location',
    'publications__publications',
    'dating__date',
    'dating__commentary',
    'preservation__status',
    'preservation__missing_parts',
    'preservation__restored_parts',
    'preservation__commentary',
    'binding__features',
    'binding__commentary',
    'pagination__present',
    'pagination__used',
    'pagination__commentary',
    'composite_manuscript__commentary',
    'layout__description',
    'layout__formatting',
    'layout__commentary',
    'illustrations__presence',
    'illustrations__legend',
    'illustrations___commentary',
    'script__general',
    'script__details',
    'script__present_additional_writing_signs',
    'script__commentary',
    'orthography__sound_shifts',
    'orthography__commentary',
    'place_in_textual_tradition__classification',
    'place_in_textual_tradition__commentary',
    'place_in_textual_tradition__related_manuscripts'
  ];

  columnWidths: { [key: string]: number } = {
    'publications__publications': 400,
    'catalogue__link': 400,
    'dating__commentary': 250,
    'preservation__commentary': 300,
    'pagination__commentary': 200,
    'binding__commentary': 200,
    'layout__commentary': 400,
    'illustrations__commentary': 400,
    'layout__formatting':200,
    'script__details':150,
    'script__commentary': 400,
    'orthography__commentary': 400,
    'illustrations___commentary': 300,
    'composite_manuscript__commentary': 400,
    'catalogue__title': 200,
    'preservation__restored_parts': 200,
    'binding__additional_features': 200,
    'script__present_additional_writing_signs': 250,
    'orthography__sound_shifts':160,
    'catalogue__location':160,
    'place_in_textual_tradition__classification':300,
    'place_in_textual_tradition__commentary':300,
    'place_in_textual_tradition__related_manuscripts':300
  };

  groupedColumns: { key: string, value: string[] }[] = [];
  groupedColumnsKeys: string[] = [];
  modifiedColumnsToDisplay = this.columnsToDisplay.map((column) =>
    column
      .replace(/tha_ta_shifts/g, 'Thāʾ/tāʾ shifts')
      .replace(/sin_sad_shifts/g, 'Sīn/ṣād shifts')
      .replace(/za_dad_shifts/g, 'Ḍād/ẓā shifts')
      .replace(/d_dh_shifts/g, 'Dhāl/dāl shifts')
      .replace(/city_library_manuscript_id/g, 'City'+'<br>'+'Library'+'<br>'+'Manuscript ID')
      .replace(/date/g, 'Calendar')
      .replace(/^(\w+)__/g, '')
      .replace(/^(\w+)__(\w)/g, '/n')
      .replace(/(\w)([^\s]*)/, (match, p1, p2) => p1.toUpperCase() + p2)
      .replace(/__(\w)/g, (match, firstLetter) => `<br>${firstLetter.toUpperCase()}`)
      .replace(/__+/g, '<br>')
      .replace(/_/g, ' ')
  );

  groupColumns(columns: string[]): Record<string, string[]> {
    const groupedColumns: Record<string, string[]> = {};
    columns.forEach(column => {
      const categoryName = column.split('__')[0];
      if (!groupedColumns[categoryName]) {
        groupedColumns[categoryName] = [];
      }
      groupedColumns[categoryName].push(column);
    });

    // Merge specific columns under 'location'

    return groupedColumns;
  }

  isWhiteBackground(i: number): boolean {
    return i % 2 === 0;
  }

  modifiedColumnWidths = { ...this.columnWidths };

  sanitizeDataInDataSource(data: any[]): any[] {
    return data.map(row => {
      const sanitizedRow: Record<string, SafeHtml> = {}; // Explicitly define the type of sanitizedRow
      for (const column in row) {
        if (row.hasOwnProperty(column)) {
          sanitizedRow[column] = this.sanitizeData(row[column]);
        }
      }
      return sanitizedRow;
    });
  }

  sanitizeData(input: any) {
    // Ensure that input is a string
    const inputString = (input || '').toString();

    // Replace commas with a dash symbol
    const sanitizedInput = inputString.replace(/,(?![ ])/g, ', ');

    // Replace newline characters with line breaks
    const sanitizedInputWithLineBreaks = sanitizedInput.replace(/\n/g, '<br>');
    return this.domSanitizer.bypassSecurityTrustHtml(sanitizedInput);
  }

  constructor(
    private route: ActivatedRoute,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private domSanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    this.data = this.route.snapshot.data;
    this.dataSource = new MatTableDataSource(this.data.manuscriptList);
  }

  groupColspans: { [key: string]: number } = {};
  groupWidths: { [key: string]: number } = {};

  calculateGroupWidths(
    groupedColumns: { key: string; value: string[] }[],
    columnWidths: { [key: string]: number },
    defaultWidth: number,
    groupWidths: { [key: string]: number }
  ): { [key: string]: number } {

    for (const group of groupedColumns) {
      const key = group.key;
      const groupColumns = group.value;
      let groupWidth = 0;

      for (const column of groupColumns) {
        groupWidth += columnWidths[column] || defaultWidth;
      }

      groupWidths[key] = groupWidth;
    }
    console.log('this valueeeeee',groupWidths)

    return groupWidths;
  }

  getColspan(group: string): number {
    return this.groupColspans[group] || 1; // Set a default value if needed
  }

  getGroupColWidth(group: string): number {
    return this.groupWidths[group] || 1;
  }

  defaultWidth = 120;

  ngOnInit() {
    const totalMinimumWidth = this.columnsToDisplay.reduce((total, column) => {
      return total + (this.columnWidths[column.toLowerCase()] || 130);
    }, 0);
    //put this value in the scss totalMinimumWidth,  min-width: totalMinimumWidth;
    this.groupedColumns = Object.entries(this.groupColumns(this.columnsToDisplay))
      .map(([key, value]) => ({ key, value }));

    this.groupedColumnsKeys = this.groupedColumns.map(group => group.key);
    this.groupedColumns.forEach((group) => {
      this.groupColspans[group.key] = group.value.length;
    });

    for (const column of this.columnsToDisplay) {
      if (this.modifiedColumnWidths[column] === undefined) {
        this.modifiedColumnWidths[column] = this.defaultWidth;
      }
    }

    this.groupWidths = this.calculateGroupWidths(this.groupedColumns, this.columnWidths, this.defaultWidth, {});

    let totalWidth = Object.values(this.groupWidths).reduce((total, width) => total + width, 0);
    console.log("Total Width of All Groups:", totalWidth);
  }





downloadExcel(): void {
    // Path to the Excel file in the assets folder
    const filePath = 'assets/manuscriptDescriptionAll.xlsx';

    // Send a GET request to download the Excel file
    this.http.get(filePath, { responseType: 'blob' }).subscribe((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Save the Excel file
      saveAs(blob, 'downloaded_data.xlsx');
    }, (error) => {
      console.error('Error downloading the Excel file', error);
    });
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    // Remove underscores and capitalize the first letter
    const sanitizedText = text.replace(/_/g, ' ');
    return sanitizedText.charAt(0).toUpperCase() + sanitizedText.slice(1);
  }
}
