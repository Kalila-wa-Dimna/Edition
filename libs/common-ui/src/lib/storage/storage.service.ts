import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private db: IDBDatabase | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async initDb() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.db = await this.openDatabase('themeDB', 1);
      } catch (error) {
        console.error('Error', error);
      }
    }
  }

  private openDatabase(name: string, version: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(name, version);

      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains('theme')) {
          db.createObjectStore('theme');
        }
      };

      openRequest.onsuccess = () => {
        resolve(openRequest.result);
      };

      openRequest.onerror = () => {
        reject(openRequest.error);
      };
    });
  }

  async setTheme(theme: string) {
    if (!this.db) return;

    const transaction = this.db.transaction('theme', 'readwrite');
    const store = transaction.objectStore('theme');
    store.put(theme, 'theme');
  }

  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve('system');
        return;
      }

      const transaction = this.db.transaction('theme', 'readonly');
      const store = transaction.objectStore('theme');
      const request = store.get('theme');

      request.onsuccess = () => {
        resolve(request.result ?? 'system');
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
