import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PHASE_DESCRIPRIONS } from './data/phase-description';
import { MatTabGroup } from '@angular/material/tabs';
import { DisseminationHistoryService } from './dissemination-history.service';

@Component({
  selector: 'kd-dissemination-history',
  template: `
    <kd-layout>
      <span title>Dissemination History</span>
      <main pageContent>
        @if(show) {
        <kd-dissemination-history-map></kd-dissemination-history-map>
        }
        <div>
          <button
            [disabled]="selected.value === phaseTexts.length - 1"
            (click)="selected.setValue((selected.value ?? 0) + 1)"
            mat-flat-button
            color="primary"
          >
            Next
          </button>
          <button
            [disabled]="selected.value !== phaseTexts.length - 1"
            (click)="onStartOver()"
            mat-flat-button
            color="primary"
          >
            Start over
          </button>
        </div>
        <mat-tab-group
          [selectedIndex]="selected.value"
          (selectedIndexChange)="onIndexChange($event)"
          dynamicHeight
        >
          <mat-tab
            *ngFor="let phase of phaseTexts; let i = index"
            [disabled]="isTabDisabled(i)"
          >
            <ng-template mat-tab-label>
              <div class="label">
                <p *ngIf="phase.dating">
                  <span [innerHTML]="phase.dating"></span>
                  <span>&nbsp;|&nbsp;</span>
                </p>
                <p>{{ phase.name }}</p>
              </div>
            </ng-template>
            <mat-card appearance="outlined">
              <mat-card-content>
                <span
                  class="phase-description"
                  *ngFor="let line of phase.content"
                  [innerHTML]="line"
                ></span>
              </mat-card-content>
            </mat-card>
          </mat-tab>
        </mat-tab-group>
      </main>
    </kd-layout>
  `,
  styleUrls: ['./dissemination-history.component.scss'],
  standalone: false,
})
export class DisseminationHistoryComponent {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  selected = new FormControl(0);

  show = true;
  phaseTexts = Object.values(PHASE_DESCRIPRIONS);
  phases = Object.keys(PHASE_DESCRIPRIONS);

  constructor(
    private disseminationHistoryService: DisseminationHistoryService
  ) {}

  onStartOver() {
    this.show = false;
    this.selected.setValue(0);
    setTimeout(() => {
      this.show = true;
    }, 10);
  }

  onIndexChange(index: number) {
    this.selected.setValue(index);
    this.disseminationHistoryService.phase$.next(index);
  }

  isTabDisabled(index: number) {
    return this.selected.value !== index;
  }
}
