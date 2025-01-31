import { IConfig } from '@kalila-edition/common-ui';
import version from './version';

export const environment: IConfig = {
  imagesEndPoint:
    'https://d3hlzh8nfbj1bb.cloudfront.net/srv/data/edition_data/images/',
  dataEndPoint: 'https://d3hlzh8nfbj1bb.cloudfront.net/srv/data/edition_data/',
  pagesEndPoint: 'https://d3hlzh8nfbj1bb.cloudfront.net/srv/page/',
  version,
};
