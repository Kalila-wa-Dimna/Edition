import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';
import { IPageData } from '../models/page-data-model';
import { buildPageTeiXml, pageToPlainText } from '../utils/tei-xml';
import { ZipEntry, createZipBlob } from '../utils/zip';

export interface ManuscriptPageRef {
  page_number?: number;
  number?: number;
  page_link?: string;
  image?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ManuscriptDownloadsService {
  constructor(
    private http: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig
  ) {}

  imageUrlFromPage(page: IPageData | ManuscriptPageRef): string {
    const raw =
      (page as IPageData).imageUrl ||
      (page as ManuscriptPageRef).image ||
      '';
    if (!raw) {
      return '';
    }
    const webp = raw.replace(/\.jpe?g$/i, '.webp');
    return `${this.config.pagesEndPoint}${webp}`;
  }

  /**
   * Prefer same-origin /edition_data URLs (dev proxy) so downloads are not
   * blocked when CloudFront returns a cached 200 without CORS headers.
   */
  private toFetchableUrl(url: string): string {
    if (!url) {
      return url;
    }
    try {
      const cdn = 'https://d6p1tcxn3fqqp.cloudfront.net';
      if (url.startsWith(cdn)) {
        return url.slice(cdn.length);
      }
      if (url.startsWith('//d6p1tcxn3fqqp.cloudfront.net')) {
        return url.slice('//d6p1tcxn3fqqp.cloudfront.net'.length);
      }
    } catch {
      /* ignore */
    }
    return url;
  }

  /** Candidate image URLs: prefer webp, then original jpg/jpeg/png on 404 only. */
  private imageUrlCandidates(
    page: IPageData | ManuscriptPageRef
  ): string[] {
    const raw =
      (page as IPageData).imageUrl ||
      (page as ManuscriptPageRef).image ||
      '';
    if (!raw) {
      return [];
    }
    const base = this.config.pagesEndPoint;
    const urls: string[] = [];
    if (/\.jpe?g$/i.test(raw)) {
      urls.push(`${base}${raw.replace(/\.jpe?g$/i, '.webp')}`);
      urls.push(`${base}${raw}`);
    } else if (/\.webp$/i.test(raw)) {
      urls.push(`${base}${raw}`);
      // jpg only as missing-file fallback (most pages are webp-only on CDN)
      urls.push(`${base}${raw.replace(/\.webp$/i, '.jpg')}`);
    } else {
      urls.push(`${base}${raw}`);
    }
    return [...new Set(urls.map((u) => this.toFetchableUrl(u)))];
  }

  /**
   * Fetch binary bytes.
   * - 'ok': usable image bytes
   * - 'missing': HTTP 404 (try next extension)
   * - 'error': network/CORS/other (do not try jpg after webp CORS fail)
   */
  private async fetchBinary(
    url: string
  ): Promise<'missing' | 'error' | ArrayBuffer> {
    try {
      const response = await fetch(this.toFetchableUrl(url), {
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
      });
      if (response.status === 404) {
        return 'missing';
      }
      if (!response.ok) {
        return 'error';
      }
      const data = await response.arrayBuffer();
      if (!data || data.byteLength < 32) {
        return 'error';
      }
      const bytes = new Uint8Array(data);
      if (bytes[0] === 0x3c /* < */) {
        return 'error';
      }
      return data.slice(0);
    } catch {
      // TypeError from CORS / network — not a missing alternate extension.
      return 'error';
    }
  }

  private isLikelyImage(data: ArrayBuffer): boolean {
    const b = new Uint8Array(data);
    // JPEG
    if (b[0] === 0xff && b[1] === 0xd8) {
      return true;
    }
    // PNG
    if (
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47
    ) {
      return true;
    }
    // WEBP (RIFF....WEBP)
    if (
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50
    ) {
      return true;
    }
    return false;
  }

  private async fetchImageBytes(
    page: IPageData | ManuscriptPageRef
  ): Promise<{ data: ArrayBuffer; ext: string } | null> {
    for (const url of this.imageUrlCandidates(page)) {
      const result = await this.fetchBinary(url);
      if (result === 'missing') {
        // File not at this extension — try the next candidate.
        continue;
      }
      if (result === 'error') {
        // CORS/network failed for an existing URL; alternate .jpg will 404.
        return null;
      }
      if (!this.isLikelyImage(result)) {
        continue;
      }
      const ext = url.toLowerCase().includes('.webp')
        ? 'webp'
        : url.toLowerCase().includes('.png')
          ? 'png'
          : 'jpg';
      return { data: result, ext };
    }
    return null;
  }

  private async fetchImageBytesWithRetry(
    page: IPageData | ManuscriptPageRef,
    attempts = 4
  ): Promise<{ data: ArrayBuffer; ext: string } | null> {
    for (let i = 0; i < attempts; i++) {
      const fetched = await this.fetchImageBytes(page);
      if (fetched) {
        return fetched;
      }
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
    return null;
  }

  private async loadGallery(
    manuscriptId: string
  ): Promise<Array<{ pageNumber: number; src: string }> | null> {
    const url = this.toFetchableUrl(
      `${this.config.dataEndPoint}manuscripts/${manuscriptId}/gallery.json`
    );
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        return null;
      }
      return data
        .map((item: { pageNumber?: number; src?: string }) => ({
          pageNumber: Number(item.pageNumber),
          src: String(item.src || ''),
        }))
        .filter(
          (item: { pageNumber: number; src: string }) =>
            Number.isFinite(item.pageNumber) && item.src.length > 0
        )
        .sort(
          (
            a: { pageNumber: number },
            b: { pageNumber: number }
          ) => a.pageNumber - b.pageNumber
        );
    } catch {
      return null;
    }
  }

  /** Build a de-duplicated page→image map from gallery + allPages. */
  private buildImageJobs(
    manuscriptId: string,
    gallery: Array<{ pageNumber: number; src: string }> | null,
    pages: ManuscriptPageRef[]
  ): Array<{ pageNum: number; image: string }> {
    const byPage = new Map<number, string>();

    for (const item of gallery ?? []) {
      if (item.src) {
        byPage.set(item.pageNumber, item.src);
      }
    }

    for (const ref of pages ?? []) {
      const pageNum = Number(ref.page_number ?? ref.number);
      const image = ref.image || '';
      if (!Number.isFinite(pageNum) || !image) {
        continue;
      }
      if (!byPage.has(pageNum)) {
        byPage.set(pageNum, image);
      }
    }

    return [...byPage.entries()]
      .map(([pageNum, image]) => ({ pageNum, image }))
      .sort((a, b) => a.pageNum - b.pageNum);
  }

  private pageFileName(
    manuscriptId: string,
    pageNum: number | string,
    ext: string
  ): string {
    const n = Number(pageNum);
    const padded = Number.isFinite(n)
      ? String(Math.trunc(n)).padStart(4, '0')
      : String(pageNum);
    return `${manuscriptId}_p${padded}.${ext}`;
  }

  triggerDownload(blob: Blob, filename: string): void {
    saveAs(blob, filename);
  }

  downloadText(content: string, filename: string): void {
    this.triggerDownload(
      new Blob([content], { type: 'text/plain;charset=utf-8' }),
      filename
    );
  }

  downloadXml(content: string, filename: string): void {
    this.triggerDownload(
      new Blob([content], { type: 'application/xml;charset=utf-8' }),
      filename
    );
  }

  downloadJson(content: unknown, filename: string): void {
    const text =
      typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    this.triggerDownload(
      new Blob([text], { type: 'application/json;charset=utf-8' }),
      filename
    );
  }

  buildTei(
    page: IPageData,
    manuscriptId: string,
    chapter: string
  ): string {
    return buildPageTeiXml(page, {
      manuscriptId,
      chapter,
    });
  }

  /** Resolve chapter + page number from a gallery/allPages link. */
  parsePageLink(
    pageLink: string
  ): { chapter: string; pageNumber: string } | null {
    if (!pageLink) {
      return null;
    }
    const parts = pageLink.replace(/^\//, '').split('/');
    // manuscripts / id / chapter / pageNumber
    if (parts.length < 4) {
      return null;
    }
    return { chapter: parts[2], pageNumber: parts[3] };
  }

  async loadPageJson(
    manuscriptId: string,
    chapter: string,
    pageNumber: string | number
  ): Promise<IPageData | null> {
    const path = `${this.config.dataEndPoint}manuscripts/${manuscriptId}/${chapter}/${pageNumber}.json`;
    try {
      return await firstValueFrom(this.http.get<IPageData>(path));
    } catch {
      return null;
    }
  }

  async downloadCurrentPageXml(
    page: IPageData,
    manuscriptId: string,
    chapter: string
  ): Promise<void> {
    const xml = this.buildTei(page, manuscriptId, chapter);
    this.downloadXml(xml, `${manuscriptId}_p${page.number ?? ''}.xml`);
  }

  async downloadCurrentPageJson(
    page: IPageData,
    manuscriptId: string
  ): Promise<void> {
    this.downloadJson(page, `${manuscriptId}_p${page.number ?? ''}.json`);
  }

  async downloadAllPagesAsText(
    manuscriptId: string,
    pages: ManuscriptPageRef[],
    onProgress?: (done: number, total: number) => void
  ): Promise<void> {
    const entries: ZipEntry[] = [];
    const unique = this.uniquePages(pages);
    let done = 0;
    for (const ref of unique) {
      const parsed = this.parsePageLink(ref.page_link || '');
      if (!parsed) {
        done++;
        onProgress?.(done, unique.length);
        continue;
      }
      const page = await this.loadPageJson(
        manuscriptId,
        parsed.chapter,
        parsed.pageNumber
      );
      if (page) {
        entries.push({
          name: `${manuscriptId}_p${page.number ?? parsed.pageNumber}.txt`,
          data: pageToPlainText(page),
        });
      }
      done++;
      onProgress?.(done, unique.length);
    }
    this.triggerDownload(
      createZipBlob(entries),
      `${manuscriptId}_pages_text.zip`
    );
  }

  async downloadAllPagesAsXml(
    manuscriptId: string,
    pages: ManuscriptPageRef[],
    onProgress?: (done: number, total: number) => void
  ): Promise<void> {
    const entries: ZipEntry[] = [];
    const unique = this.uniquePages(pages);
    let done = 0;
    for (const ref of unique) {
      const parsed = this.parsePageLink(ref.page_link || '');
      if (!parsed) {
        done++;
        onProgress?.(done, unique.length);
        continue;
      }
      const page = await this.loadPageJson(
        manuscriptId,
        parsed.chapter,
        parsed.pageNumber
      );
      if (page) {
        entries.push({
          name: `${manuscriptId}_p${page.number ?? parsed.pageNumber}.xml`,
          data: this.buildTei(page, manuscriptId, parsed.chapter),
        });
      }
      done++;
      onProgress?.(done, unique.length);
    }
    this.triggerDownload(
      createZipBlob(entries),
      `${manuscriptId}_pages_xml.zip`
    );
  }

  async downloadAllPagesAsJson(
    manuscriptId: string,
    pages: ManuscriptPageRef[],
    onProgress?: (done: number, total: number) => void
  ): Promise<void> {
    const entries: ZipEntry[] = [];
    const unique = this.uniquePages(pages);
    let done = 0;
    for (const ref of unique) {
      const parsed = this.parsePageLink(ref.page_link || '');
      if (!parsed) {
        done++;
        onProgress?.(done, unique.length);
        continue;
      }
      const page = await this.loadPageJson(
        manuscriptId,
        parsed.chapter,
        parsed.pageNumber
      );
      if (page) {
        entries.push({
          name: `${manuscriptId}_p${page.number ?? parsed.pageNumber}.json`,
          data: JSON.stringify(page, null, 2),
        });
      }
      done++;
      onProgress?.(done, unique.length);
    }
    this.triggerDownload(
      createZipBlob(entries),
      `${manuscriptId}_pages_json.zip`
    );
  }

  async downloadAllPagesAsImages(
    manuscriptId: string,
    pages: ManuscriptPageRef[],
    onProgress?: (done: number, total: number) => void
  ): Promise<void> {
    const entries: ZipEntry[] = [];
    const skipped: string[] = [];
    const includedPages: number[] = [];

    const gallery = await this.loadGallery(manuscriptId);
    const jobs = this.buildImageJobs(manuscriptId, gallery, pages);

    if (!jobs.length) {
      throw new Error(
        `No page images were found for ${manuscriptId}.`
      );
    }

    // Fetch in small parallel batches to reduce timeouts without overloading CDN.
    const batchSize = 4;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (job) => {
          const fetched = await this.fetchImageBytesWithRetry({
            image: job.image,
            page_number: job.pageNum,
          });
          return { job, fetched };
        })
      );

      for (const { job, fetched } of results) {
        if (fetched) {
          entries.push({
            name: this.pageFileName(manuscriptId, job.pageNum, fetched.ext),
            data: fetched.data,
          });
          includedPages.push(job.pageNum);
        } else {
          skipped.push(`p.${job.pageNum}`);
        }
      }

      onProgress?.(
        Math.min(i + batch.length, jobs.length),
        jobs.length
      );
    }

    // Final pass for anything still missing (e.g. p.251 flaky CDN).
    if (skipped.length) {
      const stillMissing: string[] = [];
      for (const label of skipped) {
        const pageNum = Number(label.replace(/^p\./, ''));
        const job = jobs.find((j) => j.pageNum === pageNum);
        if (!job) {
          stillMissing.push(label);
          continue;
        }
        const fetched = await this.fetchImageBytesWithRetry(
          { image: job.image, page_number: job.pageNum },
          5
        );
        if (fetched) {
          entries.push({
            name: this.pageFileName(manuscriptId, job.pageNum, fetched.ext),
            data: fetched.data,
          });
          includedPages.push(job.pageNum);
        } else {
          stillMissing.push(label);
        }
      }
      skipped.length = 0;
      skipped.push(...stillMissing);
    }

    if (!entries.length) {
      throw new Error(
        `No page images could be downloaded for ${manuscriptId}.`
      );
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    const notes: string[] = [
      `Manuscript ${manuscriptId}`,
      `Images included: ${includedPages.length} of ${jobs.length}`,
      skipped.length
        ? `Skipped (download failed): ${skipped.join(', ')}`
        : 'Skipped: none',
      '',
      'Included pages: ' +
        includedPages
          .slice()
          .sort((a, b) => a - b)
          .join(', '),
    ];
    entries.push({
      name: `${manuscriptId}_download_notes.txt`,
      data: notes.join('\n'),
    });

    this.triggerDownload(
      createZipBlob(entries),
      `${manuscriptId}_pages_images.zip`
    );

    if (skipped.length) {
      throw new Error(
        `Downloaded ${includedPages.length} images, but ${skipped.length} failed (${skipped.slice(0, 12).join(', ')}${skipped.length > 12 ? '…' : ''}). Check ${manuscriptId}_download_notes.txt in the zip.`
      );
    }
  }

  /** Prefer first occurrence of each page number. */
  private uniquePages(pages: ManuscriptPageRef[]): ManuscriptPageRef[] {
    const seen = new Set<string>();
    const out: ManuscriptPageRef[] = [];
    for (const page of pages ?? []) {
      const key = String(page.page_number ?? page.number ?? page.page_link);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      out.push(page);
    }
    return out;
  }
}
