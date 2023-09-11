export interface IManuscriptInfo {
  display: string;
  siglum: string;
  first_chapter:string;
  first_page:string;
  image: string;
}

export interface IChapterInfo{
  "manuscript":string
  "from": number,
  "to": number
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

