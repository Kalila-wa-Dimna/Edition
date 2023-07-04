import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kd-collation-command-bar',
  // templateUrl: './collation-command-bar.component.html',
  template: `<a [routerLink]="['/collations']">Collations </a>`,
  styleUrls: ['./collation-command-bar.component.scss'],
})
export class CollationCommandBarComponent implements OnInit {
  ngOnInit(): void {
    console.log('Command bar mounted');
  }
}
