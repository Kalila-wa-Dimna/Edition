// libs/section-collations/src/lib/services/units.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICollationUnit } from '../models/collation-page-data.model';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private unitsSubject = new BehaviorSubject<ICollationUnit[]>([]);
  units$ = this.unitsSubject.asObservable();

  setUnits(units: ICollationUnit[]) {
    this.unitsSubject.next(units);
  }
}
