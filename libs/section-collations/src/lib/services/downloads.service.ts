import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class DownloadsService {



  constructor(private httpClient: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig) { }


  collationName: string | null = null;
  unitTableEndpoint = (collationName: string) => `${this.config.dataEndPoint}collations/${collationName}/unit_table.csv`

  init(collationName: string) {
    this.collationName = collationName;
  }

  async downloadUnitTable() {
    if (!this.collationName) {
      throw new Error('Collation name is not set.');
    }

    const endpoint = this.unitTableEndpoint(this.collationName);
    try {
      const data = await firstValueFrom(this.httpClient.get(endpoint, { responseType: 'text' }));
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.collationName}_unit_table.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading unit table:', error);
    }
  }

}
