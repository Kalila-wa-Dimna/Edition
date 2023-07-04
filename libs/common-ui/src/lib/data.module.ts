import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './data/data.service';

@NgModule({
  imports: [CommonModule],
  providers: [DataService],
})
export class DataModule {}
