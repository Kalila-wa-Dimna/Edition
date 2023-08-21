export interface ICollationViewSettings {
  cellWidth: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  facsimilePreviw: 'permanent' | 'fleeting' | 'external' | 'panel';
  map: 'bottom' | 'left-compact' | 'left-extended';
  showMap: boolean;
  showFacsimilePreview: boolean;
  fullWidth: boolean;
}
