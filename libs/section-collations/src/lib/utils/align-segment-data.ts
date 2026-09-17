import { ICollationUnit } from '../models/collation-page-data.model';
import { IRowData } from '../models/collation-row-data.model';

/** First non-empty unitId found in a segment row. */
export function rowUnitId(row: IRowData | undefined | null): string | null {
  if (!row) {
    return null;
  }
  for (const cell of Object.values(row)) {
    if (cell?.unitId) {
      return cell.unitId;
    }
  }
  return null;
}

/**
 * Align content-only segment_data (dividers omitted) to the full units list.
 *
 * Preferred strategy for Di-style data: walk units in order; for each
 * non-divider take the next segment_data row; dividers get `{}`.
 * Falls back to unitId matching when counts differ.
 */
export function alignSegmentDataToUnits(
  units: ICollationUnit[],
  segmentData: IRowData[]
): IRowData[] {
  if (!units?.length) {
    return segmentData ?? [];
  }
  if (!segmentData?.length) {
    return units.map(() => ({}));
  }

  const contentUnits = units.filter((u) => !u.isDivider);

  // Di-style: one segment row per non-divider unit, same order.
  if (segmentData.length === contentUnits.length) {
    let contentIdx = 0;
    return units.map((unit) => {
      if (unit.isDivider) {
        return {};
      }
      return segmentData[contentIdx++] ?? {};
    });
  }

  // Already padded 1:1 (e.g. Lj with empty divider slots).
  if (segmentData.length === units.length) {
    return segmentData;
  }

  // Fallback: match by unitId.
  const byId = new Map<string, IRowData>();
  for (const row of segmentData) {
    const id = rowUnitId(row);
    if (id && !byId.has(id)) {
      byId.set(id, row);
    }
  }
  if (byId.size === 0) {
    return units.map((_, i) => segmentData[i] ?? {});
  }
  return units.map((unit) => {
    if (unit.isDivider) {
      return {};
    }
    return byId.get(unit.id) ?? {};
  });
}

/**
 * Maps content-only row index (search / lemmas) → full units array index.
 * Content rows are non-divider units in order.
 */
export function buildContentIndexToUnitIndex(
  units: ICollationUnit[]
): number[] {
  const map: number[] = [];
  units.forEach((unit, index) => {
    if (!unit.isDivider) {
      map.push(index);
    }
  });
  return map;
}
