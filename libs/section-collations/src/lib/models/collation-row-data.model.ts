export interface ICellData {
  mediumID: string;
  unitID: string;
  type: string;
  lacuna: boolean;
  startPage: number;
  startLine: number;
  startToken: number;
  endPage: number;
  endLine: number;
  endToken: number;
  images: string[];
  lemmas: string[];
  tokens: string[];
  states: string[];
  lines: number[];
  pages: number[];
  breaks: (number | null)[];
}

export interface IRowData {
  [siglum: string]: ICellData | undefined;
}
