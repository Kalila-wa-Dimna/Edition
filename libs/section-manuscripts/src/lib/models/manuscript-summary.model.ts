export interface IManuscriptInfo {
  display: string;
  siglum: string;
  first_chapter:string;
  first_page:string;
  image: string;
}

export interface IChapterInfo{
  "manuscript":string
  "chapter": string,
  "first-page": string,
  "last-page": string
}
export interface IGalleryInfo{
  src:string;
  caption:string;
  thumb:string;
  subHtmlUrl:string;
}

export interface ImageListItem {
  src: string;
  caption: string;
  thumb:string;
  subHtmlUrl:string;
}

