export interface IPageLink {
  index: number;
  page_number: number;
  page_link: string;
}

export type AllPagesData = IPageLink[];

export type ChapterPages = Record<string, IPageLink[]>;

