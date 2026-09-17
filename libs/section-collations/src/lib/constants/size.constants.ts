import { ICollationViewSettings } from '../models/collation-view-settings.model';

export type CollationSize = ICollationViewSettings['size'];

export const SIZE_MAP: {
  [key in CollationSize]: { cell: number; font: number };
} = {
  xs: { cell: 110, font: 12 },
  sm: { cell: 150, font: 14 },
  md: { cell: 210, font: 16 },
  lg: { cell: 320, font: 18 },
  xl: { cell: 420, font: 20 },
};

/** Inner spacing (top/right/bottom/left) inside each collation segment cell. */
export const CELL_PADDING = 8;

/**
 * Fewer manuscripts → wider cells.
 * e.g. 4 columns → LG so each segment has more reading room.
 */
export function recommendedSizeForColumns(columnCount: number): CollationSize {
  if (columnCount <= 2) {
    return 'xl';
  }
  if (columnCount <= 4) {
    return 'lg';
  }
  if (columnCount <= 6) {
    return 'md';
  }
  // Many manuscripts: SM (not XS)
  return 'sm';
}
