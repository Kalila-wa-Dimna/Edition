import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Inject,
  Injectable,
  PLATFORM_ID,
  TransferState,
  makeStateKey,
} from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: object,
    private http: HttpClient
  ) {}

  load<T>(dataPath: string, defaultValue: T): Observable<T> {
    const isBrowser = isPlatformBrowser(this.platformId);
    const KEY = makeStateKey<T>(dataPath);

    if (this.transferState.hasKey(KEY)) {
      const data = this.transferState.get(KEY, defaultValue);
      this.transferState.remove(KEY);
      return of(data);
    } else {
      const data$ = isBrowser
        ? this.getJSONDataClient<T>(dataPath)
        : this.getJSONDataServer<T>(dataPath);

      return data$.pipe(
        catchError((err) => {
          console.log({ err });
          return of(defaultValue);
        }),
        tap((data) => {
          if (!isBrowser) {
            this.transferState.set(KEY, data);
          }
        })
      );
    }
  }

  private getJSONDataClient<T>(filePath: string) {
    return this.http.get<T>(`/assets/data/${filePath}.json`);
  }

  private getJSONDataServer<T>(filePath: string): Observable<T> {
    const url = `http://localhost:3333/${filePath}`;

    return new Observable<T>((observer) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          observer.next(data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
