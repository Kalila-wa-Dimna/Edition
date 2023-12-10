/// <reference lib="webworker" />

const LEMMATIZATION_ENDPOINT = ""

addEventListener('message', ({ data }) => {
  const response = `worker response to ${data}`;
  console.log(LEMMATIZATION_ENDPOINT);
  postMessage(response);
});

