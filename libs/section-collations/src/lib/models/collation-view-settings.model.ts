export interface ICollationViewSettings {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  facsimilePreviw: 'permanent' | 'fleeting' | 'external' | 'panel';
  map: 'bottom' | 'left-compact' | 'left-extended';
  showMap: boolean;
  showFacsimilePreview: boolean;
  fullWidth: boolean;
}
