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



export interface IManuscriptList {
  binding__additional_features: string;
  binding__commentary: string;
  binding__period: string;
  binding__type: string;
  catalogue__commentary: string;
  catalogue__title: string;
  composite_manuscript__bound_with: any[]; // Replace 'any' with the appropriate type
  composite_manuscript__commentary: string;
  dating__accuracy: string;
  dating__commentary: string;
  dating__georgian_century: number;
  dating__georgian_date: string;
  dating__georgian_year: number;
  dating__hijri_century: number;
  dating__hijri_date: string;
  dating__hijri_year: number;
  illustrations___commentary: string;
  illustrations__legend: string;
  illustrations__presence: string;
  layout__catchwords: string;
  layout__chapter_titles: string;
  layout__commentary: string;
  layout__frame: string;
  layout__highlighted_text: any[]; // Replace 'any' with the appropriate type
  layout__lines_per_page: number;
  layout__text_division_symbols: string[];
  location__city: string;
  location__commentary: string;
  location__library: string;
  location__manuscript_id: string;
  orthography__commentary: string;
  orthography__d_dh_shifts: string;
  orthography__sin_sad_shifts: string;
  orthography__tha_ta_shifts: string;
  orthography__use_of_hamza: string;
  orthography__za_dad_shifts: string;
  pagination__commentary: string;
  pagination__present: string[];
  pagination__used: string;
  preservation__commentary: string;
  preservation__missing_parts: string[];
  preservation__restored_parts: string[];
  preservation__status: string;
  script__baseline: string;
  script__commentary: string;
  script__execution: string;
  script__hands: string;
  script__letter_diacritics: string;
  script__letter_spacing: string;
  script__line_spacing: string;
  script__lower_curves: string;
  script__present_additional_writing_signs: string[];
  script__size: string;
  script__stroke_direction: string;
  script__stroke_thickness: string;
  script__type: string;
  script__vowel_markers: string;
  script__word_spacing: string;
  siglum: string;
  _created_at: string;
  // Add more properties if needed
}
