import { Component, Input, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ICollationUnit } from '../../../models/collation-page-data.model';
import { CELL_PADDING } from '../../../constants/size.constants';
import { CollationSettingsService } from '../../../services/collation-settings.service';
import { IRowData } from '../../../models/collation-row-data.model';
import { CollationAnalysisService } from '../../../services/collation-analysis.service';
import { SegmentColorService } from '../../../services/segment-color.service';

@Component({
  selector: 'kd-collation-row',
  templateUrl: './collation-row.component.html',
  styleUrls: ['./collation-row.component.scss'],
  standalone: false,
})
export class CollationRowComponent {
  @Input() unit!: ICollationUnit;
  /** 0-based index in units / segment_data (not unit.order). */
  @Input() unitArrayIndex = 0;
  @Input() sigla: string[] = [];
  @Input() chapterSiglum = '';
  @Input() searchResult = false;
  @Input() currentResult = false;
  @Input() mapFocused = false;

  @Input()
  rowData?: IRowData | undefined;

  // ViewChild to access the menu trigger
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  cellWidth$ = this.settingsService.cellWidth$;
  cellPadding = CELL_PADDING;

  /** English / Latin columns should read left-to-right. */
  isLatinSiglum(siglum: string): boolean {
    return /english|mc-english|\beng\b|latin/i.test(siglum || '');
  }

  analyzing = false;
  isAnalyzed = false;
  groups: number[] = [];

  // Selected options in the menu
  selectedPipeline: 'v1' | 'v2' | 'v3' = 'v3';
  selectedThreshold: number = 0.75;

  // Available thresholds
  thresholds = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5];

  constructor(
    private settingsService: CollationSettingsService,
    private analysisService: CollationAnalysisService,
    private segmentColorService: SegmentColorService
  ) {}

  onAnalysisIconClick() {
    // If already analyzed, clear it
    if (this.isAnalyzed) {
      console.log(`🔄 Clearing analysis for unit ${this.unit.order}`);
      this.segmentColorService.clearUnit(this.unit.order);
      this.isAnalyzed = false;
      this.groups = [];
      return;
    }
    // Otherwise, menu will open automatically
  }

  selectPipeline(pipeline: 'v1' | 'v2' | 'v3') {
    this.selectedPipeline = pipeline;
  }

  selectThreshold(threshold: number) {
    this.selectedThreshold = threshold;
  }

  startAnalysis() {
    // Close the menu
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }

    this.analyzing = true;
    console.log(`🚀 Starting analysis with Pipeline ${this.selectedPipeline}, Threshold ${this.selectedThreshold}`);

    this.analysisService
      .analyzeRow(
        this.unit.order,
        this.unit.formattedOrder,
        this.rowData ?? {},
        this.selectedPipeline,
        this.selectedThreshold
      )
      .subscribe({
        next: (result) => {
          console.log('✅ Analysis result:', result);
          this.groups = this.segmentColorService.getAllSegments(this.unit.order);
          this.analyzing = false;
          this.isAnalyzed = true;
        },
        error: (err) => {
          console.error('❌ Analysis error:', err);
          this.analyzing = false;
          this.isAnalyzed = false;
        },
      });
  }

  getAnalysisIcon(): string {
    if (this.analyzing) {
      return 'hourglass_empty';
    }
    return this.isAnalyzed ? 'analytics' : 'analytics';
  }

  getAnalysisTooltip(): string {
    if (this.analyzing) {
      return 'Analyzing...';
    }
    return this.isAnalyzed ? 'Clear analysis' : 'Configure and analyze';
  }

  getThresholdLabel(threshold: number): string {
    if (threshold === 0.75) return `${threshold} (Default)`;
    if (threshold >= 0.9) return `${threshold} (Strict)`;
    if (threshold <= 0.6) return `${threshold} (Loose)`;
    return `${threshold}`;
  }

  getSegmentColor(groupIndex: number): string {
    return this.segmentColorService.getSegmentColor(groupIndex);
  }

  getSegmentDescription(groupIndex: number): string {
    return this.segmentColorService.getSegmentDescription(this.unit.order, groupIndex);
  }
}
