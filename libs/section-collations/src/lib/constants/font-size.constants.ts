import { ICollationViewSettings } from '../models/collation-view-settings.model';

export const FONT_SIZE_MAP: {
  [key in ICollationViewSettings['fontSize']]: number;
} = {
  xs: 10,
  sm: 10 + 4,
  md: 10 + 4 * 2,
  lg: 10 + 4 * 3,
  xl: 10 + 4 * 4,
};
