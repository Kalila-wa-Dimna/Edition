import { Component, OnInit } from '@angular/core';
import { ICollationInfo } from '../../models/collation-summary.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kd-select-collation',
  templateUrl: './select-collation.component.html',
  styleUrls: ['./select-collation.component.scss'],
})
export class SelectCollationComponent implements OnInit {
  data: ICollationInfo[] = [];
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.data = this.route.snapshot.data['collationsList'];
  }
}
