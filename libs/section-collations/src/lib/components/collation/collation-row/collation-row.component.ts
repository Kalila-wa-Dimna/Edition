import { Component, Input } from '@angular/core';
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
  @Input() sigla: string[] = [];
  @Input() chapterSiglum = '';
  @Input() searchResult = false;
  @Input() currentResult = false;

  @Input()
  rowData?: IRowData | undefined;

  cellWidth$ = this.settingsService.cellWidth$;
  cellPadding = CELL_PADDING;

  analyzing = false;
  isAnalyzed = false; // Track if this row is currently analyzed
  segments: string[] = [];

  constructor(
    private settingsService: CollationSettingsService,
    private analysisService: CollationAnalysisService,
    private segmentColorService: SegmentColorService
  ) {}

  analyzeRow() {
    // Toggle analysis on/off
    if (this.isAnalyzed) {
      // Clear analysis - remove colors
      console.log(`🔄 Clearing analysis for unit ${this.unit.order}`);
      this.segmentColorService.clearUnit(this.unit.order);
      this.isAnalyzed = false;
      this.segments = [];
      return;
    }

    // Start new analysis
    this.analyzing = true;
    this.analysisService
      .analyzeRow(this.unit.order, this.unit.formattedOrder, this.rowData ?? {})
      .subscribe({
        next: (result) => {
          console.log('✅ Analysis result:', result);
          this.segments = this.segmentColorService.getAllSegments(this.unit.order);
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
      return 'hourglass_empty'; // Loading icon
    }
    return this.isAnalyzed ? 'analytics' : 'analytics'; // Same icon, but we'll style it differently
  }

  getAnalysisTooltip(): string {
    if (this.analyzing) {
      return 'Analyzing...';
    }
    return this.isAnalyzed ? 'Clear analysis' : 'Analyze this unit';
  }

  getSegmentColor(segmentId: string): string {
    return this.segmentColorService.getSegmentColor(segmentId);
  }

  getSegmentDescription(segmentId: string): string {
    return this.segmentColorService.getSegmentDescription(this.unit.order, segmentId);
  }
}
