import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ManuscriptPageService} from "../services/manuscript-page.resolver";
import {ActivatedRoute, Router} from "@angular/router";
import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'kalila-edition-manuscript-page',
  templateUrl: './manuscript-page.component.html',
  styleUrls: ['./manuscript-page.component.scss'],
})
export class ManuscriptPageComponent  implements OnInit {
  combinedData$!: Observable<any>;
  constructor( private manuscriptPageService: ManuscriptPageService, private cdr: ChangeDetectorRef, private route: ActivatedRoute,private router: Router) {
  }
  ngOnInit(){
    console.log(this.route.snapshot.data);
  }
  }
