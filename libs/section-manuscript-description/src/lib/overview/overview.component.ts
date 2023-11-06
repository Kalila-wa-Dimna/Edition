import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { KeyValue } from '@angular/common';
import { MatColumnDef } from '@angular/material/table';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'kalila-edition-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit
{
   data: any;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  columnsToDisplay: string[] = [
    'siglum__siglum',
    'catalogue__title',
    'catalogue__commentary',
    'location__city',
    'location__library',
    'location__manuscript_id',
    'location__commentary',
    'dating__accuracy',
    'dating__gregorian_century',
    'dating__gregorian_year',
    'dating__hijri_century',
    'dating__hijri_year',
    'dating__gregorian_date',
    'dating__hijri_date',
    'dating__commentary',
    'preservation__status',
    'preservation__missing_parts',
    'preservation__restored_parts',
    'preservation__commentary',
    'binding__type',
    'binding__period',
    'binding__additional_features',
    'binding__commentary',
    'pagination__present',
    'pagination__used',
    'pagination__commentary',
    'composite_manuscript__commentary',
    'layout__frame',
    'layout__catchwords',
    'layout__lines_per_page',
    'layout__chapter_titles',
    'layout__text_division_symbols',
    'layout__commentary',
    'illustrations__presence',
    'illustrations__legend',
    'illustrations___commentary',
    'script__type',
    'script__hands',
    'script__execution',
    'script__size',
    'script__line_spacing',
    'script__letter_spacing',
    'script__stroke_direction',
    'script__lower_curves',
    'script__baseline',
    'script__letter_diacritics',
    'script__vowel_markers',
    'script__present_additional_writing_signs',
    'script__commentary',
    'orthography__tha_ta_shifts',
    'orthography__d_dh_shifts',
    'orthography__sin_sad_shifts',
    'orthography__za_dad_shifts',
    'orthography__use_of_hamza',
    'orthography__commentary',

  ];

  columnWidths: { [key: string]: number } = {
   'location__commentary': 400,
    'location__city': 120,
    'catalogue__commentary': 400,
    'dating__commentary': 400,
    'preservation__commentary': 400,
    'pagination__commentary': 400,
    'binding__commentary': 400,
    'layout__commentary': 400,
    'illustrations__commentary': 400,
    'script__commentary': 400,
    'orthography__commentary': 400,
    'illustrations___commentary':400,
    'composite_manuscript__commentary':400,
    'catalogue__title':200,
    'layout__chapter_titles':200,
    'layout__text_division_symbols':200,
    'preservation__restored_parts':200,
    'binding__additional_features':200,
    'script__present_additional_writing_signs':250,
    'siglum__siglum':120

  };



  groupedColumns: { key: string, value: string[] }[] = [];
  groupedColumnsKeys: string[]=[] ;
  modifiedColumnsToDisplay = this.columnsToDisplay.map((column) =>
    column
      .replace(/tha_ta_shifts/g, 'Thāʾ/tāʾ shifts')
      .replace(/sin_sad_shifts/g, 'Sīn/ṣād shifts')
      .replace(/za_dad_shifts/g,'Ḍād/ẓā shifts')
      .replace(/d_dh_shifts/g,'Dhāl/dāl shifts')
      .replace(/^(\w+)__/g, '')
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

    return groupedColumns;
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

  // Rest of your component code

  constructor(private route: ActivatedRoute,  @Inject(CONFIG_TOKEN) private config: IConfig, private domSanitizer: DomSanitizer) {
    this.data =this.route.snapshot.data;
    this.dataSource = new MatTableDataSource(this.data.manuscriptList);
  }
  groupColspans: { [key: string]: number } = {};

  groupWidths:{ [key: string]: number } = {};
  calculateGroupWidths(  groupedColumns: { key: string; value: string[] }[],
                         columnWidths: { [key: string]: number },
                         defaultWidth: number,
                         groupWidths: { [key: string]: number }
  ): { [key: string]: number } {

    // Loop through groupedColumns
    for (const group of groupedColumns) {
      const key = group.key;
      const groupColumns = group.value;

      // Initialize the width for this group
      let groupWidth = 0;

      // Loop through columns in the group and sum their widths
      for (const column of groupColumns) {
        groupWidth += columnWidths[column] || defaultWidth;
      }

      // Store the total width for this group
      groupWidths[key] = groupWidth;
    }

    return groupWidths;
  }


  getColspan(group: string): number {
    return this.groupColspans[group] || 1; // Set a default value if needed
  }
  getGroupColWidth(group:string):number{
    return this.groupWidths[group] || 1;
  }
  defaultWidth = 120;
  ngOnInit() {
    const totalMinimumWidth = this.columnsToDisplay.reduce((total, column) => {
      return total + (this.columnWidths[column.toLowerCase()] || 130);
    }, 0);
    //console.log(`Total Minimum Width: ${totalMinimumWidth}px`);
    this.groupedColumns = Object.entries(this.groupColumns(this.columnsToDisplay))
      .map(([key, value]) => ({ key, value }));

    this.groupedColumnsKeys= this.groupedColumns.map(group => group.key);
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
    //console.log("Total Width of All Groups:", totalWidth);

  }

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
