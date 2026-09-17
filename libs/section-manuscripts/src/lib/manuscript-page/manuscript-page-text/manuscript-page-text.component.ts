import {
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  Inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FontSizeService } from '../../services/font-size.service';
import {
  ManuscriptViewMode,
  ManuscriptViewModeService,
} from '../../services/manuscript-view-mode.service';
import {
  ManuscriptContentMode,
  ManuscriptContentModeService,
} from '../../services/manuscript-content-mode.service';
import { ManuscriptDownloadsService } from '../../services/manuscript-downloads.service';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { IPageData } from '../../models/page-data-model';
import { Subscription, catchError, of } from 'rxjs';

interface UnitData {
  unitCodes: string[];
  shortenedUnitNames: string[];
}

interface PagePane {
  label: string;
  lines: string[][];
  unitPlaces: number[][];
  unitNames: any[];
  pageLabel: string;
  isRtl: boolean;
}

@Component({
  selector: 'kalila-edition-manuscript-page-text',
  templateUrl: './manuscript-page-text.component.html',
  styleUrls: ['./manuscript-page-text.component.scss'],
  standalone: false,
})
export class ManuscriptPageTextComponent implements OnInit, OnDestroy {
  text: any;
  concatenatedDataArray: any[] = [];
  unitPlaces: any;
  unitNames: any;
  hoveredUnitName: string | null = null;
  allUnits: any;
  fontSize = '15px';
  fontSizePx = 15;
  readonly minFontSize = 11;
  readonly maxFontSize = 36;
  readonly fontSizeStep = 2;
  pageLabel = '';
  viewMode: ManuscriptViewMode = 'source';
  contentMode: ManuscriptContentMode = 'transcription';
  pageXml = '';
  sourcePane: PagePane | null = null;
  translationPane: PagePane | null = null;
  companionLoading = false;

  private routeSub?: Subscription;
  private modeSub?: Subscription;
  private contentSub?: Subscription;
  private fontSub?: Subscription;
  private companionSub?: Subscription;
  private primaryPageData: any;

  constructor(
    private route: ActivatedRoute,
    private fontSizeService: FontSizeService,
    private viewModeService: ManuscriptViewModeService,
    private contentModeService: ManuscriptContentModeService,
    private downloads: ManuscriptDownloadsService,
    private http: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig
  ) {
    this.applyFontSize(parseInt(this.fontSizeService.getFontSize(), 10) || 15);
    this.fontSub = this.fontSizeService
      .getFontSizeObservable()
      .subscribe((fontSize) => {
        this.applyFontSize(parseInt(fontSize, 10));
      });
  }

  get isBothMode(): boolean {
    return this.viewMode === 'both';
  }

  get showTranscription(): boolean {
    return this.contentMode === 'transcription' || this.contentMode === 'both';
  }

  get showXml(): boolean {
    return this.contentMode === 'xml' || this.contentMode === 'both';
  }

  @HostBinding('class.both-mode')
  get bothModeHostClass(): boolean {
    return this.isBothMode || this.contentMode === 'both';
  }

  @HostBinding('class.xml-mode')
  get xmlModeHostClass(): boolean {
    return this.contentMode === 'xml';
  }

  get isRtlPage(): boolean {
    const firstLine = this.concatenatedDataArray?.[0];
    return !!firstLine && this.isRtlLine(firstLine);
  }

  ngOnInit() {
    this.viewMode = this.viewModeService.mode;
    this.contentMode = this.contentModeService.mode;
    this.readData(this.route.snapshot.data['pageData']);

    this.routeSub = this.route.data.subscribe((data) => {
      this.readData(data['pageData']);
      this.refreshCompanion();
    });

    this.modeSub = this.viewModeService.mode$.subscribe((mode) => {
      this.viewMode = mode;
      this.refreshCompanion();
      this.refreshXml();
    });

    this.contentSub = this.contentModeService.mode$.subscribe((mode) => {
      this.contentMode = mode;
      this.refreshXml();
    });
  }

  readData(data: any) {
    this.primaryPageData = data;
    this.text = data?.lines ?? [];
    this.unitPlaces = data?.unitPlaces ?? [];
    this.unitNames = data?.unitNames ?? [];
    this.concatenatedDataArray = Array.isArray(this.text) ? this.text : [];
    this.allUnits = this.unitNames;
    const manuscript = data?.manuscript;
    const number = data?.number;
    this.pageLabel =
      manuscript && number != null ? `${manuscript} · p. ${number}` : '';
    this.refreshXml();
  }

  private refreshXml(): void {
    if (!this.showXml) {
      this.pageXml = '';
      return;
    }
    const page = this.primaryPageData as IPageData;
    if (!page?.lines) {
      this.pageXml = '';
      return;
    }
    const { id, chapter } = this.route.snapshot.params;
    const chapterCode = (chapter || '').replace(/English$/i, '');
    this.pageXml = this.downloads.buildTei(
      page,
      id || page.manuscript || '',
      chapterCode
    );
  }

  downloadXml(): void {
    if (!this.pageXml) {
      return;
    }
    const page = this.primaryPageData as IPageData;
    const { id } = this.route.snapshot.params;
    this.downloads.downloadXml(
      this.pageXml,
      `${id || page?.manuscript || 'page'}_p${page?.number ?? ''}.xml`
    );
  }

  private refreshCompanion(): void {
    this.companionSub?.unsubscribe();
    this.sourcePane = null;
    this.translationPane = null;

    if (this.viewMode !== 'both') {
      this.companionLoading = false;
      return;
    }

    const { id, chapter, pageNumber } = this.route.snapshot.params;
    if (!id || !pageNumber) {
      return;
    }

    const primaryIsEnglish = (chapter || '').endsWith('English');
    const sourceChapter = (chapter || '').replace('English', '') || 'Mc';
    const englishChapter = `${sourceChapter}English`;

    this.companionLoading = true;

    if (primaryIsEnglish) {
      this.translationPane = this.toPane(
        this.primaryPageData,
        'Translation',
        false
      );
      this.companionSub = this.loadPage(id, sourceChapter, pageNumber).subscribe(
        (data) => {
          this.sourcePane = data
            ? this.toPane(data, 'Transcription', true)
            : this.emptyPane('Transcription', true);
          this.companionLoading = false;
        }
      );
    } else {
      this.sourcePane = this.toPane(
        this.primaryPageData,
        'Transcription',
        true
      );
      this.companionSub = this.loadPage(
        id,
        englishChapter,
        pageNumber
      ).subscribe((data) => {
        this.translationPane = data
          ? this.toPane(data, 'Translation', false)
          : this.emptyPane('Translation', false);
        this.companionLoading = false;
      });
    }
  }

  private loadPage(id: string, chapter: string, pageNumber: string) {
    const url = `${this.config.dataEndPoint}manuscripts/${id}/${chapter}/${pageNumber}.json`;
    return this.http.get<any>(url).pipe(catchError(() => of(null)));
  }

  private toPane(
    data: any,
    label: string,
    preferRtlFallback: boolean
  ): PagePane {
    const lines = Array.isArray(data?.lines) ? data.lines : [];
    const manuscript = data?.manuscript;
    const number = data?.number;
    const firstLine = lines[0];
    const isRtl = firstLine ? this.isRtlLine(firstLine) : preferRtlFallback;
    return {
      label,
      lines,
      unitPlaces: Array.isArray(data?.unitPlaces) ? data.unitPlaces : [],
      unitNames: Array.isArray(data?.unitNames) ? data.unitNames : [],
      pageLabel:
        manuscript && number != null ? `${manuscript} · p. ${number}` : '',
      isRtl,
    };
  }

  private emptyPane(label: string, isRtl: boolean): PagePane {
    return {
      label,
      lines: [],
      unitPlaces: [],
      unitNames: [],
      pageLabel: '',
      isRtl,
    };
  }

  isArabicLine(line: string | string[]): boolean {
    const text = Array.isArray(line) ? line.join(' ') : line;
    return /[\u0600-\u06FF\u0750-\u077F]/.test(text ?? '');
  }

  isHebrewLine(line: string | string[]): boolean {
    const text = Array.isArray(line) ? line.join(' ') : line;
    return /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(text ?? '');
  }

  isRtlLine(line: string | string[]): boolean {
    return this.isArabicLine(line) || this.isHebrewLine(line);
  }

  getUnitsInLine(lineIndex: number, wordIndex: number): UnitData {
    return this.getUnitsForPane(
      lineIndex,
      wordIndex,
      this.unitPlaces,
      this.unitNames
    );
  }

  getUnitsForPane(
    lineIndex: number,
    wordIndex: number,
    unitPlaces: any,
    unitNames: any
  ): UnitData {
    const unitCodes: string[] = [];
    const shortenedUnitNames: string[] = [];

    if (!Array.isArray(unitPlaces) || !Array.isArray(unitNames)) {
      return { unitCodes, shortenedUnitNames };
    }

    for (let i = 0; i < unitPlaces.length; i++) {
      const [unitLine, unitWordIndex] = unitPlaces[i];

      if (unitLine === lineIndex && unitWordIndex === wordIndex) {
        const unitCode = unitNames[i][0];
        const unitName = unitNames[i][1];
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

  increaseFontSize(): void {
    this.setFontSize(this.fontSizePx + this.fontSizeStep);
  }

  decreaseFontSize(): void {
    this.setFontSize(this.fontSizePx - this.fontSizeStep);
  }

  private setFontSize(size: number): void {
    this.applyFontSize(size);
    this.fontSizeService.setFontSize(this.fontSize);
  }

  private applyFontSize(size: number): void {
    if (Number.isNaN(size)) {
      return;
    }
    this.fontSizePx = Math.min(
      this.maxFontSize,
      Math.max(this.minFontSize, size)
    );
    this.fontSize = `${this.fontSizePx}px`;
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.modeSub?.unsubscribe();
    this.contentSub?.unsubscribe();
    this.fontSub?.unsubscribe();
    this.companionSub?.unsubscribe();
  }
}
