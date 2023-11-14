import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ManuscriptSetPageDataService {

  manuscriptData: object = {"Hi":"hello","hi":"hello"};
  private ManuscriptPageDataSubject = new Subject<{ manuscriptData: any }>();

  getManuscriptPageData(): { manuscriptData: object } {
    return {
      manuscriptData: this.manuscriptData}
  }

  setManuscriptPageData(manuscriptData: object): void {
    this.manuscriptData = manuscriptData;
   // console.log('manuscript Data Page English',this.manuscriptData)
    this.ManuscriptPageDataSubject.next({manuscriptData});
  }

  getManuscriptPageDataObservable(): Observable<{ manuscriptData: any }> {
    return this.ManuscriptPageDataSubject.asObservable();
  }


}

