import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'kd-collation',
  templateUrl: './collation.component.html',
  styleUrls: ['./collation.component.scss'],
})
export class CollationComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    console.log(this.route.snapshot.data['pageData']);
  }
}
