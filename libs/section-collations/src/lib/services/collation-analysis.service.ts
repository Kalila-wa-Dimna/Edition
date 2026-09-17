import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, retry, timeout, throwError } from 'rxjs';
import { IRowData } from '../models/collation-row-data.model';
import { SegmentColorService, GroupData } from './segment-color.service';

// Neue Interfaces für bessere Type Safety
interface CrossAnalysisRequest {
  appVersion: 'v1' | 'v2' | 'v3';
  unitId: string;
  name: string;
  threshold: number;
  fragmentationInstructions: string | null;
  refinementInstructions: string | null;
  passages: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class CollationAnalysisService {
  // Lambda Function URL (API Gateway times out at 30s; analysis often needs longer)
  private url = 'https://aeruohct3uyoz6daswbg4orwp40nyxfb.lambda-url.eu-central-1.on.aws/';

  // Konfigurierbare Optionen
  private readonly TIMEOUT_MS = 120000; // 2 Minuten für große Analysen
  private readonly MAX_RETRIES = 2; // Anzahl der Wiederholungen bei Fehlern

  // Standard-Pipeline-Version (kann über Methoden-Parameter überschrieben werden)
  private defaultPipeline: 'v1' | 'v2' | 'v3' = 'v3';

  constructor(
    private http: HttpClient,
    private segmentColorService: SegmentColorService
  ) {}

  /**
   * Analysiert eine Zeile mit konfigurierbarer Pipeline-Version
   * @param unitIndex - Index der Unit
   * @param unitOrder - Reihenfolge der Unit
   * @param rowData - Zeilendaten
   * @param pipelineVersion - Optional: Pipeline-Version (v1, v2, v3)
   * @param threshold - Optional: Threshold-Wert (Standard: 0.9)
   */
  analyzeRow(
    unitIndex: number,
    unitOrder: string | number,
    rowData: IRowData,
    pipelineVersion: 'v1' | 'v2' | 'v3' = this.defaultPipeline,
    threshold = 0.9
  ): Observable<GroupData> {

    const firstSiglum = Object.keys(rowData)[0];
    const actualUnitId = rowData[firstSiglum]?.unitId || unitOrder.toString();

    const formattedData: CrossAnalysisRequest = {
      appVersion: pipelineVersion,
      unitId: actualUnitId,
      name: `unit_${unitOrder}`,
      threshold: threshold,
      fragmentationInstructions: null,
      refinementInstructions: null,
      passages: {}
    };
    // Passages extrahieren
    Object.entries(rowData).forEach(([siglum, data]) => {
      if (data && data.tokens && Array.isArray(data.tokens)) {
        const passage = data.tokens
          .flat()
          .join(' ')
          .trim();

        // Nur hinzufügen, wenn Text vorhanden
        if (passage) {
          formattedData.passages[siglum] = passage;
        }
      }
    });
    console.log('=== API REQUEST ===smcwmcwemcwemcwmcwlmcwlcmwlem');
    console.log('📤 Sending analysis request:', formattedData);

    // Validierung: Mindestens 2 Passagen erforderlich
    const passageCount = Object.keys(formattedData.passages).length;
    if (passageCount < 2) {
      console.warn(`⚠️ Nur ${passageCount} Passage(n) gefunden. Mindestens 2 erforderlich.`);
      return throwError(() => new Error(
        `Mindestens 2 Textpassagen erforderlich, aber nur ${passageCount} gefunden`
      ));
    }


    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<GroupData>(this.url, formattedData, { headers }).pipe(
      // Timeout für Lambda Cold Start
      timeout({
        each: this.TIMEOUT_MS,
        with: () => throwError(() => new Error(
          `Anfrage-Timeout nach ${this.TIMEOUT_MS / 1000} Sekunden. ` +
          `Die Analyse dauert zu lange. Versuchen Sie es erneut.`
        ))
      }),

      // Retry bei transienten Fehlern (503, 429, Netzwerkfehler)
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          // Nur bei bestimmten Fehlern wiederholen
          if (this.shouldRetry(error)) {
            const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
            console.log(`⏳ Wiederhole Anfrage (${retryCount}/${this.MAX_RETRIES}) in ${delayMs}ms...`);
            return new Observable(observer => {
              setTimeout(() => {
                observer.next();
                observer.complete();
              }, delayMs);
            });
          }
          // Bei anderen Fehlern sofort abbrechen
          return throwError(() => error);
        }
      }),

      tap({
        next: (result) => {
          console.log('=== API RESPONSE ===');
          console.log('📥 API result:', result);
          console.log(`✅ Analysis complete for unit ${unitIndex}`);
          console.log('===================');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🎉 SUCCESS - FULL API RESPONSE:');
          console.log(JSON.stringify(result, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          // Store the segment data
          this.segmentColorService.setSegmentData(unitIndex, result, rowData);
        },
        error: (err) => {
          console.error('=== API ERROR ===');
          console.error('Error Status:', err.status);

        }
      }),

      // Zentrales Error Handling
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error, unitIndex, unitOrder));
      })
    );
  }

  /**
   * Batch-Analyse mehrerer Zeilen
   * Führt Analysen sequenziell aus, um Lambda nicht zu überlasten
   */
  analyzeMultipleRows(
    rows: Array<{ unitIndex: number; unitOrder: string | number; rowData: IRowData }>,
    pipelineVersion: 'v1' | 'v2' | 'v3' = this.defaultPipeline,
    threshold = 0.75,
    delayBetweenRequests = 1000 // 1 Sekunde Pause zwischen Requests
  ): Observable<GroupData[]> {
    return new Observable(observer => {
      const results: GroupData[] = [];
      let currentIndex = 0;

      const processNext = () => {
        if (currentIndex >= rows.length) {
          observer.next(results);
          observer.complete();
          return;
        }

        const row = rows[currentIndex];
        console.log(`📊 Verarbeite Zeile ${currentIndex + 1}/${rows.length}`);

        this.analyzeRow(
          row.unitIndex,
          row.unitOrder,
          row.rowData,
          pipelineVersion,
          threshold
        ).subscribe({
          next: (result) => {
            results.push(result);
            currentIndex++;

            // Pause vor nächster Anfrage
            setTimeout(processNext, delayBetweenRequests);
          },
          error: (error) => {
            console.error(`❌ Fehler bei Zeile ${currentIndex + 1}:`, error);
            observer.error(error);
          }
        });
      };

      processNext();
    });
  }

  /**
   * Setzt die Standard-Pipeline-Version
   */
  setDefaultPipeline(version: 'v3'): void {
    this.defaultPipeline = version;
    console.log(`🔧 Standard-Pipeline auf ${version} gesetzt`);
  }

  /**
   * Prüft, ob bei diesem Fehler ein Retry sinnvoll ist
   */
  private shouldRetry(error: any): boolean {
    // Retry bei Service Unavailable (Lambda Cold Start)
    if (error.status === 503) return true;

    // Retry bei Rate Limiting
    if (error.status === 429) return true;

    // Retry bei Gateway Timeout
    if (error.status === 504) return true;

    // Retry bei Netzwerkfehlern (Status 0)
    if (error.status === 0) return true;

    // Kein Retry bei Client-Fehlern (4xx außer 429) oder Server-Fehlern (5xx außer 503, 504)
    return false;
  }

  /**
   * Zentrales Error Handling mit benutzerfreundlichen Nachrichten
   */
  private handleError(error: HttpErrorResponse, unitIndex: number, unitOrder: string | number): Error {
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';

    if (error.error instanceof ErrorEvent) {
      // Client-seitiger oder Netzwerkfehler
      errorMessage = `Netzwerkfehler: ${error.error.message}`;
    } else {
      // Server-seitiger Fehler
      switch (error.status) {
        case 0:
          errorMessage = 'Keine Verbindung zum Server möglich. Prüfen Sie Ihre Internetverbindung.';
          break;
        case 400:
          errorMessage = `Ungültige Anfrage für Unit ${unitOrder}: ${error.error?.error || error.message}`;
          break;
        case 401:
          errorMessage = 'Nicht autorisiert. Authentifizierung erforderlich.';
          break;
        case 403:
          errorMessage = 'Zugriff verweigert.';
          break;
        case 404:
          errorMessage = 'API-Endpoint nicht gefunden. Bitte überprüfen Sie die URL.';
          break;
        case 429:
          errorMessage = 'Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
          break;
        case 500:
          errorMessage = `Interner Server-Fehler bei Unit ${unitOrder}. ` +
            `Details: ${error.error?.error || 'Keine weiteren Informationen'}`;
          break;
        case 503:
          errorMessage = 'Service vorübergehend nicht verfügbar. Dies kann bei Lambda Cold Start vorkommen. ' +
            'Bitte versuchen Sie es erneut.';
          break;
        case 504:
          errorMessage = 'Gateway Timeout. Die Analyse dauert zu lange. ' +
            'Versuchen Sie es mit weniger oder kürzeren Textpassagen.';
          break;
        default:
          errorMessage = `Server-Fehler ${error.status} bei Unit ${unitOrder}: ${error.message}`;
      }
    }

    console.error(`❌ Fehler bei Unit ${unitIndex} (${unitOrder}):`, errorMessage);
    return new Error(errorMessage);
  }
}
