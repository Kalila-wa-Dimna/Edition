export interface ICellData {
  mediumId: string;
  unitId: string;
  type: string;
  lacuna: boolean;
  startPage: number;
  startLine: number;
  startToken: number;
  endPage: number;
  endLine: number;
  endToken: number;
  images: string[];
  tokens: string[][];
  lines: number[];
  pages: number[];
  breaks: (number | null)[];
}

export interface IRowData {
  [siglum: string]: ICellData | undefined;
}
