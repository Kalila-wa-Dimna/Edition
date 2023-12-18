import { ICollationFacsimileHighlight } from '@kalila-edition/common-ui';
import { Observable, zip } from 'rxjs';

export default function createImageObjects(lines: Map<string, ICollationFacsimileHighlight & {
  dataUrl: string;
}>) {
  const imageObservables: Array<Observable<{ key: string, imageObj: HTMLImageElement, info: ICollationFacsimileHighlight }>> = [];
  for (const [key, imageDataUrl] of lines) {
    imageObservables.push(createImageObservable(key, imageDataUrl));
  }
  return zip(imageObservables);
}


function createImageObservable(key: string, data: ICollationFacsimileHighlight & {
  dataUrl: string;
}) {
  const { dataUrl, ...info } = data;

  return new Observable<{ key: string, imageObj: HTMLImageElement, info: ICollationFacsimileHighlight }>(function (observer) {
    const imageObj = new Image();

    imageObj.onload = () => {
      observer.next({ key, imageObj, info });
      observer.complete();
    }
    imageObj.src = dataUrl;
  })
}
