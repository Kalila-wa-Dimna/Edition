import { Injectable } from '@angular/core';

export interface SegmentData {
  segments: {
    [segmentId: string]: {
      description: string;
      ranges: {
        [siglum: string]: number[][];
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class SegmentColorService {
  private segmentColors: { [key: string]: string } = {
    SegmentA: 'rgba(59, 130, 246, 0.3)',   // blue
    SegmentB: 'rgba(34, 197, 94, 0.3)',    // green
    SegmentC: 'rgba(168, 85, 247, 0.3)',   // purple
    SegmentD: 'rgba(249, 115, 22, 0.3)',   // orange
    SegmentE: 'rgba(236, 72, 153, 0.3)',   // pink
    SegmentF: 'rgba(14, 165, 233, 0.3)',   // sky blue
    Segment1: 'rgba(59, 130, 246, 0.3)',   // blue
    Segment2: 'rgba(34, 197, 94, 0.3)',    // green
    Segment3: 'rgba(168, 85, 247, 0.3)',   // purple
    Segment4: 'rgba(249, 115, 22, 0.3)',   // orange
    Segment5: 'rgba(236, 72, 153, 0.3)',   // pink
    Segment6: 'rgba(14, 165, 233, 0.3)',   // sky blue
  };

  private uniqueTokenColor = 'rgba(239, 68, 68, 0.5)'; // bright red for unique
  private variantTokenColor = 'rgba(156, 163, 175, 0.2)'; // light gray for variants
  private defaultSegmentColor = 'rgba(251, 191, 36, 0.3)'; // amber as fallback

  private segmentDataByUnit: Map<number, SegmentData> = new Map();
  private analyzedUnits: Set<number> = new Set();

  // Map: unitIndex -> siglum -> Set of unique words
  private uniqueTokensByUnit: Map<number, Map<string, Set<string>>> = new Map();

  // Map: unitIndex -> siglum -> all tokens array
  private allTokensByUnit: Map<number, Map<string, string[]>> = new Map();

  setSegmentData(unitIndex: number, data: SegmentData, rowData: any) {
    console.log(`🎨 Setting segment data for unit ${unitIndex}:`, data);

    // Clear any existing data for this unit first
    this.clearUnit(unitIndex);

    this.segmentDataByUnit.set(unitIndex, data);
    this.analyzedUnits.add(unitIndex);

    // Dynamically assign colors to any new segments
    if (data.segments) {
      Object.keys(data.segments).forEach((segmentId, index) => {
        if (!this.segmentColors[segmentId]) {
          const colorIndex = index % 6;
          const colors = [
            'rgba(59, 130, 246, 0.3)',
            'rgba(34, 197, 94, 0.3)',
            'rgba(168, 85, 247, 0.3)',
            'rgba(249, 115, 22, 0.3)',
            'rgba(236, 72, 153, 0.3)',
            'rgba(14, 165, 233, 0.3)',
          ];
          this.segmentColors[segmentId] = colors[colorIndex];
          console.log(`Assigned color to ${segmentId}: ${colors[colorIndex]}`);
        }
      });
    }

    // Analyze unique tokens FOR THIS UNIT ONLY
    this.analyzeUniqueTokensForUnit(unitIndex, rowData);
  }

  private analyzeUniqueTokensForUnit(unitIndex: number, rowData: any) {
    console.log(`🔍 Analyzing unique tokens for unit ${unitIndex}`);

    const allTokensMap = new Map<string, string[]>();

    // Map to track which witnesses contain each unique word (as a set, not counting duplicates)
    const wordToWitnesses = new Map<string, Set<string>>();

    // Collect all tokens from all witnesses in THIS ROW
    Object.entries(rowData).forEach(([siglum, data]: [string, any]) => {
      if (data?.tokens && Array.isArray(data.tokens)) {
        const tokens: string[] = data.tokens.flat();
        allTokensMap.set(siglum, tokens);

        // Get unique words in this witness (remove duplicates)
        const uniqueWordsInWitness = new Set<string>(tokens);

        // Track which witnesses have each word
        uniqueWordsInWitness.forEach((word) => {
          if (!wordToWitnesses.has(word)) {
            wordToWitnesses.set(word, new Set<string>());
          }
          wordToWitnesses.get(word)!.add(siglum);
        });
      }
    });

    // Find unique words for each witness
    // A word is unique if it appears in ONLY this witness (not in any other witness)
    const uniqueMap = new Map<string, Set<string>>();

    allTokensMap.forEach((tokens, siglum) => {
      const uniqueWords = new Set<string>();

      // Get unique words in this witness
      const wordsInThisWitness = new Set<string>(tokens);

      // Check each word to see if it's unique to this witness
      wordsInThisWitness.forEach((word) => {
        const witnessesWithThisWord = wordToWitnesses.get(word);

        // Word is unique if it appears in ONLY this witness
        if (witnessesWithThisWord &&
          witnessesWithThisWord.size === 1 &&
          witnessesWithThisWord.has(siglum)) {
          uniqueWords.add(word);
        }
      });

      uniqueMap.set(siglum, uniqueWords);

      if (uniqueWords.size > 0) {
        console.log(`  ${siglum}: ${uniqueWords.size} unique words:`,
          Array.from(uniqueWords).slice(0, 10).join(', '));
      }
    });

    this.uniqueTokensByUnit.set(unitIndex, uniqueMap);
    this.allTokensByUnit.set(unitIndex, allTokensMap);
  }

  isUnitAnalyzed(unitIndex: number): boolean {
    return this.analyzedUnits.has(unitIndex);
  }

  isTokenUnique(unitIndex: number, siglum: string, token: string): boolean {
    const uniqueMap = this.uniqueTokensByUnit.get(unitIndex);
    if (!uniqueMap) {
      return false;
    }

    const uniqueWords = uniqueMap.get(siglum);
    return uniqueWords ? uniqueWords.has(token) : false;
  }

  getSegmentForPosition(
    unitIndex: number,
    siglum: string,
    lineIndex: number,
    tokenIndex: number
  ): {
    segmentId: string;
    color: string;
    isUnique: boolean;
  } | null {
    // Get the actual token at this position
    const allTokens = this.allTokensByUnit.get(unitIndex)?.get(siglum);
    let actualToken: string | undefined;

    if (allTokens && allTokens.length > tokenIndex) {
      actualToken = allTokens[tokenIndex];

      // FIRST PRIORITY: Check if this word is unique to this manuscript
      if (this.isTokenUnique(unitIndex, siglum, actualToken)) {
        return {
          segmentId: 'unique',
          color: this.uniqueTokenColor,
          isUnique: true
        };
      }
    }

    // SECOND PRIORITY: Check segment assignment
    const segmentData = this.segmentDataByUnit.get(unitIndex);
    if (!segmentData) {
      return null;
    }

    for (const [segmentId, segment] of Object.entries(segmentData.segments)) {
      const ranges = segment.ranges[siglum];
      if (!ranges) continue;

      if (ranges.length === 2) {
        const start = ranges[0];
        const end = ranges[1];

        const startLine = start[0];
        const startToken = start[1];
        const endLine = end[0];
        const endToken = end[1];

        if (
          (lineIndex > startLine || (lineIndex === startLine && tokenIndex >= startToken)) &&
          (lineIndex < endLine || (lineIndex === endLine && tokenIndex <= endToken))
        ) {
          const color = this.segmentColors[segmentId] || this.defaultSegmentColor;
          return {
            segmentId,
            color,
            isUnique: false
          };
        }
      }
    }

    // THIRD PRIORITY: Token not in any segment - mark as variant
    return {
      segmentId: 'variant',
      color: this.variantTokenColor,
      isUnique: false
    };
  }

  getSegmentColor(segmentId: string): string {
    if (segmentId === 'unique') return this.uniqueTokenColor;
    if (segmentId === 'variant') return this.variantTokenColor;
    return this.segmentColors[segmentId] || this.defaultSegmentColor;
  }

  getAllSegments(unitIndex: number): string[] {
    const segmentData = this.segmentDataByUnit.get(unitIndex);
    return segmentData ? Object.keys(segmentData.segments) : [];
  }

  getSegmentDescription(unitIndex: number, segmentId: string): string {
    if (segmentId === 'unique') return 'فريد لهذه النسخة (Unique to this manuscript)';
    if (segmentId === 'variant') return 'قراءة مختلفة (Variant reading)';

    const segmentData = this.segmentDataByUnit.get(unitIndex);
    return segmentData?.segments[segmentId]?.description || '';
  }

  getUniqueTokensForWitness(unitIndex: number, siglum: string): string[] {
    const uniqueMap = this.uniqueTokensByUnit.get(unitIndex);
    if (!uniqueMap) return [];

    const uniqueWords = uniqueMap.get(siglum);
    return uniqueWords ? Array.from(uniqueWords) : [];
  }

  clearUnit(unitIndex: number) {
    console.log(`🧹 Clearing unit ${unitIndex}`);
    this.segmentDataByUnit.delete(unitIndex);
    this.analyzedUnits.delete(unitIndex);
    this.uniqueTokensByUnit.delete(unitIndex);
    this.allTokensByUnit.delete(unitIndex);
  }
}
