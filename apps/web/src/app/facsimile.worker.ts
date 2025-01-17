/// <reference lib="webworker" />
console.log('facsimile worker init');
const pageCache: Record<string, Record<number, string>> = {};

// const IMAGE_ROOT = "https://d5gomyglvpeib.cloudfront.net/srv/page/";
const IMAGE_ROOT = 'https://d3hlzh8nfbj1bb.cloudfront.net/srv/page/';
const PADDING = 2;
addEventListener('message', async ({ data }) => {
  const { info, url, points, rotation } = data;
  const pageDataUrl = await getPageDataUrl(
    info.siglum,
    info.page,
    url.replace('.jpg', '.webp')
  );
  const { FacsimileCropper } = await import('./cropper');
  const cropper = FacsimileCropper.new(base46(pageDataUrl));
  const p = new Uint32Array(points);
  const color = new Uint32Array([102, 144, 155]);
  const region = cropper.get_region(p, rotation, color, PADDING);
  cropper.free();
  postMessage({
    id: `${info.siglum}_${info.page}_${info.line}`,
    content: { ...info, dataUrl: region },
  });
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
  data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
