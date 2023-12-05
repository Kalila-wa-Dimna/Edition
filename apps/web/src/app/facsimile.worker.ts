/// <reference lib="webworker" />
console.log('facsimile worker init');
const pageCache: Record<string, Record<number, string>> = {};

const IMAGE_ROOT = "/assets/images/pages/";

addEventListener('message', async ({ data }) => {


  const { medium, page, url, line, points, rotation } = data;
  const pageDataUrl = await getPageDataUrl(medium, page, url);
  const { FacsimileCropper } = await import('./cropper');
  const cropper = FacsimileCropper.new(base46(pageDataUrl));
  const p = new Uint32Array(points);
  const color = new Uint32Array([102, 144, 155]);
  const region = cropper.get_region(p, rotation, color, 3);
  cropper.free();
  postMessage({ id: `${medium}_${page}_${line}`, region });
});

async function getPageDataUrl(medium: string, page: number, url: string) {
  if (!pageCache[medium]) {
    pageCache[medium] = {};
  }
  if (!pageCache[medium][page]) {
    pageCache[medium][page] = await loadImageAsDataUrl(`${IMAGE_ROOT}${url}`);
  }

  return pageCache[medium][page];
}

async function loadImageAsDataUrl(url: string) {
  const data: string = await fetch(url)
    .then((response) => {
      return response.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = function () {
            resolve(this.result as string);
          };
          reader.readAsDataURL(blob);
        })
    );

  return data;
}

const base46 = (data: string) =>
  data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
