/// <reference lib="webworker" />

const LEMMATIZATION_ENDPOINT = "https://camel.kalila-and-dimna.de/"
const DATA_ENDPOINT = "https://d5gomyglvpeib.cloudfront.net/srv/data/edition_data/collations"


let unitLemmas: Record<string, Record<string, string[][]>> | undefined = undefined;
let invertedLemma: Record<string, number[][]> | undefined = undefined;
let currentCollationName: string | undefined = undefined;

async function init(collationName: string) {
  unitLemmas = await fetch(`${DATA_ENDPOINT}/${collationName}/lemmas.json`).then(response => response.json());
  invertedLemma = await fetch(`${DATA_ENDPOINT}/${collationName}/inverted_lemmas.json`).then(response => response.json());
  currentCollationName = collationName;
}

addEventListener('message', async ({ data }) => {

  const { requestType } = data;

  if (requestType === 'init') {
    const { collationName } = data;
    await init(collationName);
  }

  if (requestType === 'search') {
    const { sentence, collationName } = data;
    if (collationName !== currentCollationName) {
      await init(collationName);
    }
    const response = await fetch(LEMMATIZATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentence })
    });
    const searchLemmas: Record<string, string> = await response.json();
    const words = sentence.split(' ');
    const initialResults = (invertedLemma && words[0] ? invertedLemma[searchLemmas[words[0]] ?? words[0]] : []) ?? [];
    const finalResults: number[][] = [];
    if (words.length === 1) {
      initialResults.forEach(result => {
        const column = result[1];
        const unit = result[0];
        const startLine = result[2];
        const startWord = result[3];
        finalResults.push([unit, column, startLine, startWord, startLine, startWord]);
      })
    } else {
      for (const result of initialResults) {
        const column = result[1];
        const columnLemmas = unitLemmas && column !== undefined ? unitLemmas[column] : {};
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
          finalResults.push([unit, column, startLine, startWord, endLine, endWord]);
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


    const indexedResults: Record<number, Record<number, [number, number, number, number, number][]>> = {};

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

      indexedResults[unit][column].push([index, startLine, startToken, endLine, endToken]);
    });

    postMessage({ results: sortedResults, indexedResults, sentence, collationName, type: 'results' });
  }

});

