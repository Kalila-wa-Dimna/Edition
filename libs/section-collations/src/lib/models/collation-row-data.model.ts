
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
  orderInMs: number;
  adjustedOrder: number;
  tokens: string[][];
  lines: number[];
  pages: number[];
  images: string[];
  breaks: number[];
  ranges?: IRange[];

}

export interface IRowData {
  [siglum: string]: ICellData | undefined;
}
// TODO add search results to ICelldata, listen to search results in the main collation component and update the row data accordingly
