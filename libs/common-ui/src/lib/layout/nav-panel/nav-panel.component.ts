import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kd-nav-panel',
  templateUrl: './nav-panel.component.html',
  styleUrls: ['./nav-panel.component.scss'],
})
export class NavPanelComponent {
  @Output() closeClicked = new EventEmitter();
  collationPanelOpen = false;
  manuscriptPanelOpen = false;
}
