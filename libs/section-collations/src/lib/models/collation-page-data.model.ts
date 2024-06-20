import { IRowData } from './collation-row-data.model';
import { ICollationInfo } from './collation-summary.model';

export interface IFacsimileInfo {
  url: string;
  lines: Record<number, number[]>;
}
export interface ICollationColumn {
  siglum: string;
  id: string;
  order: number;
  facsimiles: Record<number, IFacsimileInfo>;
}

export interface ICollationUnit {
  id: string;
  parentID: string;
  title: string;
  order: number;
  frame: string;
  formattedOrder: string;
  longestSegment: string;
  isDivider: boolean;
}

export interface ICollationPageData {
  columns: ICollationColumn[];
  units: ICollationUnit[];
  summary: ICollationInfo;
  segmentData: IRowData[];
}
