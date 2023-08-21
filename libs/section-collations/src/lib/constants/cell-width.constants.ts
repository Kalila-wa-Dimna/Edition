import { ICollationViewSettings } from '../models/collation-view-settings.model';

export const CELL_WIDTH_MAP: {
  [key in ICollationViewSettings['cellWidth']]: number;
} = {
  xs: 75,
  sm: 75 + 50,
  md: 75 + 50 * 2,
  lg: 75 + 50 * 4,
  xl: 75 + 50 * 6,
};

export const CELL_PADDING = 5;
