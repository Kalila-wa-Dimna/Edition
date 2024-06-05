export interface IPageData {
  id: string;
  number: number;
  manuscript: string;
  imageUrl: string;
  lines: string[][];
  unitPlaces: [number, number][];
  unitNames: [string, number][];
  version: number;
}
