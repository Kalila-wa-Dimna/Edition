import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './data/data.service';
import { FacsimileWorkerService } from './data/facsimile-worker.service';
import { SearchWorkerService } from './data/search-worker.service';
import { MapWorkerService } from './data/map-worker.service';

@NgModule({
  imports: [CommonModule],
  providers: [DataService, FacsimileWorkerService, SearchWorkerService, MapWorkerService],
})
export class DataModule { }
