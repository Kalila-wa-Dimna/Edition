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
import { CONFIG_TOKEN, IConfig } from '../config.module';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(CONFIG_TOKEN) private config: IConfig,
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
    return this.http.get<T>(`${this.config.dataEndPoint}${filePath}.json`);
  }

  private getJSONDataServer<T>(filePath: string): Observable<T> {
    const url = `${this.config.dataApi}${filePath}`;
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
