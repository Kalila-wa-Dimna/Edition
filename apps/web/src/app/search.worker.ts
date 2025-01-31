/// <reference lib="webworker" />

const LEMMATIZATION_ENDPOINT =
  'https://5cyy36myqkzlr3iwjtreaaxv5m0ebbjj.lambda-url.eu-central-1.on.aws/';
const DATA_ENDPOINT =
  'https://d3hlzh8nfbj1bb.cloudfront.net/srv/data/edition_data/collations'; // prod

let unitLemmas: Record<string, Record<string, string[][]>> | undefined =
  undefined;
let invertedLemma: Record<string, number[][]> | undefined = undefined;
let currentcollationKey: string | undefined = undefined;

async function init(collationKey: string) {
  unitLemmas = await fetch(`${DATA_ENDPOINT}/${collationKey}/lemmas.json`).then(
    (response) => response.json()
  );
  invertedLemma = await fetch(
    `${DATA_ENDPOINT}/${collationKey}/inverted_lemmas.json`
  ).then((response) => response.json());
  currentcollationKey = collationKey;
}

addEventListener('message', async ({ data }) => {
  const { requestType } = data;

  if (requestType === 'init') {
    const { collationKey } = data;
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
    // A dummy request to warm up the lambda function
    await fetch(LEMMATIZATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  if (requestType === 'reset') {
    postMessage({ type: 'clear' });
  }

  if (requestType === 'search') {
    const { sentence, collationKey } = data;
    if (collationKey !== currentcollationKey) {
      await init(collationKey);
    }
    const payload = {
      id: 'search',
      lines: [
        {
          order: 0,
          tokens: sentence.split(' '),
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
    const responseJson = await response.json();
    const searchLemmas: Record<string, string> = {};
    responseJson[0]?.lemmas?.forEach((lemma: string, index: number) => {
      searchLemmas[payload.lines[0].tokens[index]] = lemma;
    });
    const words = sentence.split(' ');
    const initialResults =
      (invertedLemma && words[0]
        ? invertedLemma[searchLemmas[words[0]] ?? words[0]]
        : []) ?? [];
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
          unitLemmas && column !== undefined ? unitLemmas[column] : {};
        const unit = result[0];
        const startLine = result[2];
        const startWord = result[3];
        let endLine = startLine;
        let endWord = startWord + 1;
        const currUnitLemmas = columnLemmas[unit];
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
          if (lemma !== currUnitLemmas[endLine][endWord]) {
            match = false;
            break;
          } else {
            pointer++;
            endWord++;
          }
        }
        if (match) {
          finalResults.push([
            unit,
            column,
            startLine,
            startWord,
            endLine,
            endWord,
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
      sentence,
      collationKey,
      type: 'results',
    });
  }
});
