import { IConfig } from '@kalila-edition/common-ui';
import version from './version';

export const environment: IConfig = {
  imagesEndPoint: '/edition_data/images/',
  dataEndPoint: '/edition_data/',
  pagesEndPoint: '/edition_data/page/',
  version,
};
