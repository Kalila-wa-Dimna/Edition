import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IRowData } from '../models/collation-row-data.model';
import { SegmentColorService, SegmentData } from './segment-color.service';

@Injectable({
  providedIn: 'root',
})
export class CollationAnalysisService {
  private url = 'https://wuctdp6d5e.execute-api.eu-central-1.amazonaws.com/prod/segment-raw-merged';

  constructor(
    private http: HttpClient,
    private segmentColorService: SegmentColorService
  ) {}

  analyzeRow(unitIndex: number, unitOrder: string | number, rowData: IRowData): Observable<any> {
    const formattedData = {
      mode: 'tokens',
      ai_mode: 'multi',
      simple_output: true,
      range_format: 'matrix',
      max_seconds: 200,
      data: {} as { [key: string]: { tokens: string[][] } },
    };

    Object.entries(rowData).forEach(([siglum, data]) => {
      formattedData.data[siglum] = {
        tokens: data?.tokens ?? [],
      };
    });

    console.log(`📤 Sending data for unit ${unitOrder}`, formattedData);

    return this.http.post<SegmentData>(this.url, formattedData).pipe(
      tap((result) => {
        console.log('📥 API result:', result);
        // Store the segment data with the unitIndex AND rowData for unique token analysis
        this.segmentColorService.setSegmentData(unitIndex, result, rowData);
        console.log(`✅ Segment data stored for unit ${unitIndex}`);
      })
    );
  }
}
