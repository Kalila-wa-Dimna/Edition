import { ICollationViewSettings } from '../models/collation-view-settings.model';

export const SIZE_MAP: {
  [key in ICollationViewSettings['size']]: { cell: number, font: number };
} = {
  xs: { cell: 75 + 20, font: 12 },
  sm: { cell: 75 + 50, font: 10 + 4 },
  md: { cell: 75 + 50 * 2, font: 10 + 4 * 2 },
  lg: { cell: 75 + 50 * 4, font: 10 + 4 * 3 },
  xl: { cell: 75 + 50 * 6, font: 10 + 4 * 4 },
};

export const CELL_PADDING = 5;
