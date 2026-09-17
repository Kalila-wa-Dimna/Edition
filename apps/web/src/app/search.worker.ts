/// <reference lib="webworker" />

const LEMMATIZATION_ENDPOINT =
  'https://5cyy36myqkzlr3iwjtreaaxv5m0ebbjj.lambda-url.eu-central-1.on.aws/';
const DATA_ENDPOINT = '/edition_data/collations';

let unitLemmas: Record<string, Record<string, string[][]>> | undefined =
  undefined;
let invertedLemma: Record<string, number[][]> | undefined = undefined;
/** lowercased lemma → canonical key in invertedLemma (for English case folding). */
let invertedLemmaLower: Record<string, string> = {};
let lemmaGlosses: Record<string, { en?: string[]; de?: string[] }> = {};
let currentcollationKey: string | undefined = undefined;
let searchSeq = 0;

function normalizeArabic(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/\u0671/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasArabicLetters(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    text
  );
}

function isLatinScriptQuery(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && !hasArabicLetters(trimmed);
}

function normalizeLatinToken(token: string): string {
  return token
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

function tokenizeLatinQuery(sentence: string): string[] {
  return sentence
    .normalize('NFKC')
    .split(/\s+/)
    .map((w) => normalizeLatinToken(w))
    .filter(Boolean);
}

function tokenizeQuery(sentence: string): string[] {
  if (isLatinScriptQuery(sentence)) {
    return tokenizeLatinQuery(sentence);
  }
  return normalizeArabic(sentence)
    .split(/\s+/)
    .map((w) =>
      w.replace(
        /^[^\u0600-\u06FFa-zA-Z0-9\u0750-\u077F]+|[^\u0600-\u06FFa-zA-Z0-9\u0750-\u077F]+$/g,
        ''
      )
    )
    .filter(Boolean);
}

function lemmasEqual(a: string, b: string): boolean {
  return a === b || a.toLowerCase() === b.toLowerCase();
}

function lookupInverted(key: string): number[][] {
  if (!invertedLemma || !key) {
    return [];
  }
  if (invertedLemma[key]) {
    return invertedLemma[key];
  }
  const canonical = invertedLemmaLower[key.toLowerCase()];
  if (canonical && invertedLemma[canonical]) {
    return invertedLemma[canonical];
  }
  return [];
}

function mergePositionLists(
  existing: number[][],
  incoming: number[][]
): number[][] {
  const seen = new Set(existing.map((row) => row.join(',')));
  const merged = [...existing];
  for (const row of incoming) {
    const key = row.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged;
}

/** Arabic lemmas whose gloss lists include this Latin token. */
function arabicLemmasForLatinToken(token: string): string[] {
  const normalized = normalizeLatinToken(token);
  if (!normalized) {
    return [];
  }
  const matches: string[] = [];
  for (const [arabicLemma, gloss] of Object.entries(lemmaGlosses)) {
    const en = (gloss.en ?? []).map((alias) => normalizeLatinToken(alias));
    const de = (gloss.de ?? []).map((alias) => normalizeLatinToken(alias));
    if (en.includes(normalized) || de.includes(normalized)) {
      matches.push(arabicLemma);
    }
  }
  return matches;
}

function lookupLatinToken(token: string): number[][] {
  const normalized = normalizeLatinToken(token);
  let merged = lookupInverted(normalized);
  for (const arabicLemma of arabicLemmasForLatinToken(normalized)) {
    merged = mergePositionLists(merged, lookupInverted(arabicLemma));
  }
  return merged;
}

function lookupLemmaCluster(lemmaKey: string): number[][] {
  return lookupInverted(lemmaKey);
}

async function init(collationKey: string) {
  const [lemmasRes, invertedRes, glossRes] = await Promise.all([
    fetch(`${DATA_ENDPOINT}/${collationKey}/lemmas.json`),
    fetch(`${DATA_ENDPOINT}/${collationKey}/inverted_lemmas.json`),
    fetch(`${DATA_ENDPOINT}/${collationKey}/lemma_glosses.json`),
  ]);
  if (!lemmasRes.ok || !invertedRes.ok) {
    throw new Error(
      `Failed to load lemma indexes for ${collationKey}: ${lemmasRes.status}/${invertedRes.status}`
    );
  }
  unitLemmas = await lemmasRes.json();
  invertedLemma = await invertedRes.json();
  lemmaGlosses = glossRes.ok ? await glossRes.json() : {};
  invertedLemmaLower = {};
  for (const k of Object.keys(invertedLemma ?? {})) {
    const low = k.toLowerCase();
    if (!(low in invertedLemmaLower)) {
      invertedLemmaLower[low] = k;
    }
  }
  currentcollationKey = collationKey;
}

addEventListener('message', async ({ data }) => {
  const { requestType } = data;

  if (requestType === 'init') {
    const { collationKey } = data;
    try {
      await init(collationKey);
      const payload = {
        id: 'search',
        lines: [
          {
            order: 0,
            tokens: ['كلمة'],
          },
        ],
      };
      await fetch(LEMMATIZATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Search worker init failed', err);
    }
  }

  if (requestType === 'reset') {
    searchSeq++;
    postMessage({ type: 'clear' });
  }

  if (requestType === 'search') {
    const { sentence, collationKey } = data;
    const seq = ++searchSeq;
    try {
      if (collationKey !== currentcollationKey) {
        await init(collationKey);
      }
      const latinQuery = isLatinScriptQuery(sentence);
      const normalizedSentence = latinQuery
        ? sentence.normalize('NFKC').trim()
        : normalizeArabic(sentence);
      const words = tokenizeQuery(sentence);
      if (!words.length) {
        postMessage({
          results: [],
          indexedResults: {},
          sentence: normalizedSentence,
          collationKey,
          type: 'results',
        });
        return;
      }

      const searchLemmas: Record<string, string> = {};
      if (latinQuery) {
        for (const word of words) {
          searchLemmas[word] = word;
        }
      } else {
        const payload = {
          id: 'search',
          lines: [
            {
              order: 0,
              tokens: words,
            },
          ],
        };
        const response = await fetch(LEMMATIZATION_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`Lemmatizer HTTP ${response.status}`);
        }
        const responseJson = await response.json();
        if (seq !== searchSeq) {
          return; // stale
        }

        responseJson[0]?.lemmas?.forEach((lemma: string, index: number) => {
          const token = words[index];
          if (token) {
            searchLemmas[token] = lemma;
          }
        });
      }

      const firstKey = searchLemmas[words[0]] ?? words[0];
      const initialResults = latinQuery
        ? lookupLatinToken(firstKey)
        : lookupLemmaCluster(firstKey);
      const finalResults: number[][] = [];
      if (words.length === 1) {
        initialResults.forEach((result) => {
          const column = result[1];
          const unit = result[0];
          const startLine = result[2];
          const startWord = result[3];
          finalResults.push([
            unit,
            column,
            startLine,
            startWord,
            startLine,
            startWord,
          ]);
        });
      } else {
        for (const result of initialResults) {
          const column = result[1];
          const columnLemmas =
            unitLemmas && column !== undefined
              ? unitLemmas[column] ?? unitLemmas[String(column)]
              : {};
          const unit = result[0];
          const startLine = result[2];
          const startWord = result[3];
          let endLine = startLine;
          let endWord = startWord + 1;
          const currUnitLemmas =
            columnLemmas[unit] ?? columnLemmas[String(unit)];
          let match = currUnitLemmas !== undefined;
          let pointer = 1;
          while (match && pointer < words.length) {
            if (endLine > currUnitLemmas.length - 1) {
              match = false;
              break;
            }
            if (endWord > currUnitLemmas[endLine].length - 1) {
              endLine++;
              endWord = 0;
              continue;
            }
            const lemma = searchLemmas[words[pointer]] ?? words[pointer];
            if (!lemmasEqual(lemma, currUnitLemmas[endLine][endWord])) {
              match = false;
              break;
            } else {
              pointer++;
              endWord++;
            }
          }
          if (match) {
            // endWord is exclusive after the loop — store inclusive end for buildRages
            const inclusiveEndWord = Math.max(0, endWord - 1);
            finalResults.push([
              unit,
              column,
              startLine,
              startWord,
              endLine,
              inclusiveEndWord,
            ]);
          }
        }
      }

      const sortedResults = finalResults.sort((a, b) => {
        for (let i = 0; i < 4; i++) {
          if (a[i] < b[i]) return -1;
          if (a[i] > b[i]) return 1;
        }
        return 0;
      });

      const indexedResults: Record<
        number,
        Record<number, [number, number, number, number, number][]>
      > = {};

      sortedResults.forEach((result, index) => {
        const unit = result[0];
        const column = result[1];
        const startLine = result[2];
        const startToken = result[3];
        const endLine = result[4];
        const endToken = result[5];

        if (!indexedResults[unit]) {
          indexedResults[unit] = {};
        }
        if (!indexedResults[unit][column]) {
          indexedResults[unit][column] = [];
        }

        indexedResults[unit][column].push([
          index,
          startLine,
          startToken,
          endLine,
          endToken,
        ]);
      });

      postMessage({
        results: sortedResults,
        indexedResults,
        sentence: normalizedSentence,
        collationKey,
        type: 'results',
      });
    } catch (err) {
      console.error('Search worker search failed', err);
      if (seq === searchSeq) {
        const normalizedSentence = isLatinScriptQuery(sentence)
          ? sentence.normalize('NFKC').trim()
          : normalizeArabic(sentence);
        postMessage({
          results: [],
          indexedResults: {},
          sentence: normalizedSentence,
          collationKey,
          type: 'results',
        });
      }
    }
  }
});
