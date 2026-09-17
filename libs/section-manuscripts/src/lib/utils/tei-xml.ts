import { IPageData } from '../models/page-data-model';

export interface TeiBuildOptions {
  manuscriptId: string;
  chapter: string;
  date?: string;
  note?: string;
}

interface TokenPos {
  line: number;
  word: number;
  text: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Strip leading chapter code from unit labels ("Lv Title" → "Title"). */
export function unitDisplayTitle(unitLabel: string): string {
  if (!unitLabel) {
    return '';
  }
  return unitLabel.replace(/^(ToC|[A-Za-z]{1,3})\s+/, '').trim() || unitLabel;
}

function flattenTokens(lines: string[][]): TokenPos[] {
  const tokens: TokenPos[] = [];
  for (let line = 0; line < lines.length; line++) {
    const words = lines[line] ?? [];
    for (let word = 0; word < words.length; word++) {
      tokens.push({ line, word, text: words[word] });
    }
  }
  return tokens;
}

function tokenIndex(
  tokens: TokenPos[],
  line: number,
  word: number
): number {
  return tokens.findIndex((t) => t.line === line && t.word === word);
}

function renderParagraphBody(tokens: TokenPos[]): string {
  if (!tokens.length) {
    return '';
  }
  const parts: string[] = [];
  let prevLine = tokens[0].line;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (i > 0 && token.line !== prevLine) {
      parts.push('\n        <lb/>\n\n        ');
    } else if (i > 0) {
      parts.push(' ');
    }
    parts.push(escapeXml(token.text));
    prevLine = token.line;
  }
  return parts.join('');
}

interface UnitSegment {
  title: string;
  tokens: TokenPos[];
}

function segmentByUnits(page: IPageData): UnitSegment[] {
  const lines = Array.isArray(page.lines) ? page.lines : [];
  const tokens = flattenTokens(lines);
  const places = Array.isArray(page.unitPlaces) ? page.unitPlaces : [];
  const names = Array.isArray(page.unitNames) ? page.unitNames : [];

  const starts: { line: number; word: number; title: string }[] = [];
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    if (!place || place.length < 2) {
      continue;
    }
    const label = Array.isArray(names[i]) ? String(names[i][0] ?? '') : '';
    starts.push({
      line: Number(place[0]),
      word: Number(place[1]),
      title: unitDisplayTitle(label),
    });
  }

  starts.sort((a, b) => a.line - b.line || a.word - b.word);

  if (!starts.length) {
    return [{ title: '', tokens }];
  }

  const segments: UnitSegment[] = [];
  // Text before the first unit marker (if any)
  const firstIdx = tokenIndex(tokens, starts[0].line, starts[0].word);
  if (firstIdx > 0) {
    segments.push({ title: '', tokens: tokens.slice(0, firstIdx) });
  }

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const from = tokenIndex(tokens, start.line, start.word);
    if (from < 0) {
      continue;
    }
    const next = starts[i + 1];
    const to = next
      ? tokenIndex(tokens, next.line, next.word)
      : tokens.length;
    segments.push({
      title: start.title,
      tokens: tokens.slice(from, to < 0 ? tokens.length : to),
    });
  }

  return segments.filter((s) => s.tokens.length > 0);
}

/** Plain transcription text with line breaks (no unit titles). */
export function pageToPlainText(page: IPageData): string {
  const lines = Array.isArray(page.lines) ? page.lines : [];
  return lines.map((line) => (line ?? []).join(' ')).join('\n');
}

/** Build TEI XML for a single manuscript page. */
export function buildPageTeiXml(
  page: IPageData,
  options: TeiBuildOptions
): string {
  const manuscriptId = options.manuscriptId || page.manuscript || '';
  const chapter = (options.chapter || '').replace(/English$/i, '') || '';
  const date = options.date || '';
  const note =
    options.note ||
    'Arabic manuscript witness for textual comparison.';
  const pageNumber = page.number ?? '';

  const segments = segmentByUnits(page);
  const paragraphs = segments
    .map((segment) => {
      const nAttr = segment.title
        ? ` n="${escapeXml(segment.title)}"`
        : '';
      const body = renderParagraphBody(segment.tokens);
      return `      <p${nAttr}>\n        ${body}\n      </p>`;
    })
    .join('\n\n');

  const dateLine = date
    ? `\n          <date>${escapeXml(date)}</date>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>

<TEI>
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Kalila wa Dimna</title>
      </titleStmt>

      <sourceDesc>
        <bibl>
          <title>Kalila wa Dimna Manuscript</title>
          <abbr>${escapeXml(manuscriptId)}</abbr>${dateLine}
          <note>${escapeXml(note)}</note>
        </bibl>
      </sourceDesc>
    </fileDesc>
  </teiHeader>

  <text>
    <body>

      <pb n="${escapeXml(String(pageNumber))}"/>

${paragraphs}

    </body>
  </text>
  <chapter>
    <chapter>${escapeXml(chapter)}</chapter>
  </chapter>
</TEI>
`;
}
