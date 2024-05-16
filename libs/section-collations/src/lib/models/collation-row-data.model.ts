
export interface IRangeDefinition {
  start: [number, number];
  end: [number, number];
  color: string;
}

export interface IRange {
  text: string;
  color?: string;
}


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
  ranges?: IRange[];
  pages: number[];
  breaks: (number | null)[];
}

export interface IRowData {
  [siglum: string]: ICellData | undefined;
}
// TODO add search results to ICelldata, listen to search results in the main collation component and update the row data accordingly
