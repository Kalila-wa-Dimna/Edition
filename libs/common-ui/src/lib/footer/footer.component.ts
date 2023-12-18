import {Component, Inject} from '@angular/core';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";

@Component({
  selector: 'kd-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {

  manuscriptEndPoint = this.config.imagesEndPoint + 'manuscripts/';
  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {
  }
}
