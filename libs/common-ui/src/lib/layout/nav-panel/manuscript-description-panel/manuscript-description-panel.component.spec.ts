import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManuscriptDescriptionPanelComponent } from './manuscript-description-panel.component';

describe('ManuscriptDescriptionPanelComponent', () => {
  let component: ManuscriptDescriptionPanelComponent;
  let fixture: ComponentFixture<ManuscriptDescriptionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManuscriptDescriptionPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManuscriptDescriptionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
