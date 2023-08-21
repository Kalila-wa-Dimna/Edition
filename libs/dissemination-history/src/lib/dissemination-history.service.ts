import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapPhase } from './data/map-phases';

@Injectable()
export class DisseminationHistoryService {
  phase$ = new BehaviorSubject<MapPhase>(MapPhase.intro);
}
