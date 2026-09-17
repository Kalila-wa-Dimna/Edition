import { IConfig } from '@kalila-edition/common-ui';
import version from './version';

/**
 * Local serve uses same-origin /edition_data via proxy.config.json so
 * fetch()/HttpClient can read CDN bytes without CloudFront CORS cache gaps.
 * Production keeps absolute CloudFront URLs (see environment.prod.ts).
 */
export const environment: IConfig = {
  imagesEndPoint: '/edition_data/images/',
  dataEndPoint: '/edition_data/',
  pagesEndPoint: '/edition_data/page/',
  version,
};
