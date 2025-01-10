import { Component, OnDestroy, OnInit , NgZone} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FontSizeService } from '../../services/font-size.service';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { ManuscriptPageService } from '../../services/manuscript-page.resolver';
import { map } from 'rxjs/operators';
import {ManuscriptSetPageDataService} from"./../../services/manuscript-set-page-data.service"
import { concatMap, switchMap, exhaustMap } from 'rxjs/operators';
interface UnitData {
  unitCodes: string[];
  shortenedUnitNames: string[];
}
@Component({
    selector: 'kalila-edition-manuscript-page-text',
    templateUrl: './manuscript-page-text.component.html',
    styleUrls: ['./manuscript-page-text.component.scss'],
    standalone: false
})
export class ManuscriptPageTextComponent implements OnInit, OnDestroy {
  pageData$!: Observable<any>;
  combinedData$!: Observable<any>;
  text: any;
  englishText:any;
  data: any;
  concatenatedDataArray: any;
  unitPlaces: any;
  unitNames: any;
  hoveredUnitName: string | null = null;
  allUnits: any;
  unitNumbers: any = {}; // Object to store pre-processed unit numbers
  fontSize;
  sub?: Subscription;
  test:object={};
  private triggerObservable$: any;

  constructor(
    private manuscriptPageService: ManuscriptPageService,
    private route: ActivatedRoute,
    private fontSizeService: FontSizeService,
  ) {
    this.fontSize = this.fontSizeService.getFontSize();
    this.fontSizeService.getFontSizeObservable().subscribe((fontSize) => {
      this.fontSize = fontSize;
    });
  }

  ngOnInit() {
    this.readData(this.route.snapshot.data);

    this.sub = this.route.data.subscribe((data) => {
      const {pageData} = data;
      this.readData(pageData);
    });


    /*this.manuscriptSetPageDataService.getManuscriptPageDataObservable().subscribe((response: { manuscriptData: any }) => {
      this.ngZone.run(() => {
        const { manuscriptData } = response;
        this.test = manuscriptData;
        this.readData(this.test);
        console.log("tesst", this.test);
      });
    });*/

  }


 // Add a flag to track initialization
  readData(data: any) {
    this.text = {};
    this.unitPlaces = {};
    this.unitNames = {};
    this.text = data.lines;
    this.unitPlaces = data.unitPlaces;
    this.unitNames = data.unitNames;
    this.concatenatedDataArray = this.text;
    this.allUnits = data.unitNames;
  }

  isArabicLine(line: string): boolean {
    // Use a simple heuristic to check for Arabic characters
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicPattern.test(line);
  }
  getUnitsInLine(lineIndex: number, wordIndex: number): UnitData {
    const unitCodes: string[] = [];
    const shortenedUnitNames: string[] = [];

    for (let i = 0; i < this.unitPlaces.length; i++) {
      const [unitLine, unitWordIndex] = this.unitPlaces[i];

      if (unitLine === lineIndex && unitWordIndex === wordIndex) {
        const unitCode = this.unitNames[i][0];
        const unitName = this.unitNames[i][1];
        const shortenedUnitName = unitCode.substr(0, 2) + unitName;
        unitCodes.push(unitCode);
        shortenedUnitNames.push(shortenedUnitName);
      }
    }

    return {
      unitCodes,
      shortenedUnitNames,
    };
  }

  onUnitMouseEnter(unit: string): void {
    this.hoveredUnitName = unit;
  }

  onUnitMouseLeave(): void {
    this.hoveredUnitName = null;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
