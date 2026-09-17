export interface ICollationInfo {
  display: string;
  /** Folder/route id; falls back to siglum on newer data feeds */
  key: string;
  siglum: string;
  image: string;
  preface?: boolean;
}
