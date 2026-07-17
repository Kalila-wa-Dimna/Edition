import { Injectable } from '@angular/core';

export interface GroupData {
  groups: Array<{
    sources: string[];
    fragments: Array<{
      [siglum: string]: string;
    }>;
    ranges: Array<{
      [siglum: string]: number[];
    }>;
  }>;
  uniqueFragments: {
    [siglum: string]: Array<[string, number[]]>;
  };
  settings: {
    fragmentationInstructions: any;
    refinementInstructions: any;
    threshold: number;
  };
  unitId: string;
  appVersion: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class SegmentColorService {
  // Mild color muster — pink reserved for unique tokens only
  private segmentColors: string[] = [
    'rgba(167, 206, 91, 0.55)',  // Mild Green #A7CE5B
    'rgba(252, 192, 55, 0.55)',  // Mild Gold #FCC037
    'rgba(253, 105, 71, 0.5)',   // Mild Vermilion #FD6947
    'rgba(149, 179, 238, 0.55)', // Mild Dark Blue #95B3EE
    'rgba(46, 89, 167, 0.4)',    // #2E59A7
    'rgba(246, 255, 85, 0.55)',  // Mild Citrus Green #F6FF55
    'rgba(83, 233, 227, 0.5)',   // Mild Summer Green #53E9E3
    'rgba(134, 152, 243, 0.55)', // Mild Lavender #8698F3
    'rgba(110, 207, 247, 0.55)', // Mild Cyan #6ECFF7
  ];

  private uniqueTokenColor = 'rgba(249, 118, 181, 0.55)'; // Mild Fuchsia — unique only
  private noGroupColor = 'transparent'; // No color for tokens not in any group

  private groupDataByUnit: Map<number, GroupData> = new Map();
  private analyzedUnits: Set<number> = new Set();

  // Map: unitIndex -> siglum -> all tokens array
  private allTokensByUnit: Map<number, Map<string, string[]>> = new Map();

  setSegmentData(unitIndex: number, data: GroupData, rowData: any): void {

    // Clear any existing data for this unit first
    this.clearUnit(unitIndex);

    this.groupDataByUnit.set(unitIndex, data);
    this.analyzedUnits.add(unitIndex);

    // Store all tokens for this unit
    const allTokensMap = new Map<string, string[]>();
    Object.entries(rowData).forEach(([siglum, cellData]: [string, any]) => {
      if (cellData?.tokens && Array.isArray(cellData.tokens)) {
        const tokens: string[] = cellData.tokens.flat();
        allTokensMap.set(siglum, tokens);
      }
    });
    this.allTokensByUnit.set(unitIndex, allTokensMap);

    // Log group information with ranges
    if (data.groups) {
      data.groups.forEach((group, groupIndex) => {
        // Log ranges for this group
        const rangesObj = group.ranges[0];
        if (rangesObj) {
          Object.entries(rangesObj).forEach(([siglum, range]) => {
            // console.log(`  ${siglum}: tokens [${range[0]}-${range[1]}]`);
          });
        }
      });
    }

    // Log unique fragments
    if (data.uniqueFragments && Object.keys(data.uniqueFragments).length > 0) {
      Object.entries(data.uniqueFragments).forEach(([siglum, fragments]) => {
        // console.log(`  ${siglum}:`, fragments);
      });
    }
  }

  isUnitAnalyzed(unitIndex: number): boolean {
    return this.analyzedUnits.has(unitIndex);
  }

  getSegmentForPosition(
    unitIndex: number,
    siglum: string,
    tokenIndex: number
  ): {
    groupIndex: number;
    color: string;
    isUnique: boolean;
  } | null {
    const groupData = this.groupDataByUnit.get(unitIndex);
    if (!groupData) {
      return null;
    }

    // FIRST: Check if this token is in uniqueFragments
    if (groupData.uniqueFragments && groupData.uniqueFragments[siglum]) {
      const uniqueFrags = groupData.uniqueFragments[siglum];
      for (const [text, range] of uniqueFrags) {
        const [start, end] = range;
        if (start === -1 && end === -1) continue; // Skip invalid ranges
        if (tokenIndex >= start && tokenIndex <= end) {
          return {
            groupIndex: -1,
            color: this.uniqueTokenColor,
            isUnique: true
          };
        }
      }
    }

    // SECOND: Check group assignments
    if (!groupData.groups) {
      return null;
    }

    // Check each group
    for (let groupIndex = 0; groupIndex < groupData.groups.length; groupIndex++) {
      const group = groupData.groups[groupIndex];

      // Check if this siglum is in this group's sources
      if (!group.sources.includes(siglum)) {
        continue;
      }

      // Get the ranges for this siglum in this group
      const rangesArray = group.ranges;
      if (!rangesArray || rangesArray.length === 0) {
        continue;
      }

      // ranges is an array, but typically has just one element
      // Each element is an object with siglum -> [start, end]
      for (const rangeObj of rangesArray) {
        const range = rangeObj[siglum];

        if (!range || range.length !== 2) {
          continue;
        }

        const [start, end] = range;

        // Special handling for [-1, -1] which means "not in this group"
        if (start === -1 && end === -1) {
          continue;
        }

        // Check if token index falls within this range
        if (tokenIndex >= start && tokenIndex <= end) {
          const color = this.segmentColors[groupIndex % this.segmentColors.length];

          return {
            groupIndex,
            color,
            isUnique: false
          };
        }
      }
    }

    // THIRD: Token not in any group
    return {
      groupIndex: -2,
      color: this.noGroupColor,
      isUnique: false
    };
  }

  getSegmentColor(groupIndex: number): string {
    if (groupIndex === -1) return this.uniqueTokenColor;
    if (groupIndex === -2) return this.noGroupColor;
    return this.segmentColors[groupIndex % this.segmentColors.length];
  }

  getAllSegments(unitIndex: number): number[] {
    const groupData = this.groupDataByUnit.get(unitIndex);
    if (!groupData || !groupData.groups) {
      return [];
    }
    return groupData.groups.map((_, index) => index);
  }

  getSegmentDescription(unitIndex: number, groupIndex: number): string {
    if (groupIndex === -1) return 'فريد لهذه النسخة (Unique to this manuscript)';
    if (groupIndex === -2) return 'لا يوجد في مجموعة (Not in any group)';

    const groupData = this.groupDataByUnit.get(unitIndex);
    if (!groupData || !groupData.groups[groupIndex]) {
      return '';
    }

    const group = groupData.groups[groupIndex];

    // Get the fragment text for this group
    const fragmentExample = group.fragments[0];
    const exampleText = fragmentExample ? Object.values(fragmentExample)[0] : '';

    return `Group ${groupIndex + 1}\nSources: ${group.sources.join(', ')}\nExample: ${exampleText}`;
  }

  clearUnit(unitIndex: number): void {
    this.groupDataByUnit.delete(unitIndex);
    this.analyzedUnits.delete(unitIndex);
    this.allTokensByUnit.delete(unitIndex);
  }
}
