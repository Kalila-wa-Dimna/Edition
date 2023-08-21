import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SiteOptions = 'theme' | 'font' | 'collationSettings';
const OPTION_LIST: SiteOptions[] = ['theme', 'font', 'collationSettings'];
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private db: IDBDatabase | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async initDb() {
    if (isPlatformBrowser(this.platformId) && !this.db) {
      try {
        this.db = await this.openDatabase(
          'kalilaEditionUserSetting',
          1,
          OPTION_LIST
        );
      } catch (error) {
        console.error('Error', error);
      }
    }
  }

  private openDatabase(
    name: string,
    version: number,
    stores: string[]
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(name, version);

      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        });
      };

      openRequest.onsuccess = () => {
        resolve(openRequest.result);
      };

      openRequest.onerror = () => {
        reject(openRequest.error);
      };
    });
  }

  async setOption<T>(name: SiteOptions, value: T) {
    if (!this.db) return;

    const transaction = this.db.transaction(name, 'readwrite');
    const store = transaction.objectStore(name);
    store.put(value, name);
  }

  async getOption<T>(name: SiteOptions, defaultValue: T): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(defaultValue);
        return;
      }

      const transaction = this.db.transaction(name, 'readonly');
      const store = transaction.objectStore(name);
      const request = store.get(name);

      request.onsuccess = () => {
        resolve(request.result ?? defaultValue);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
