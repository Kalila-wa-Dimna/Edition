import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManuscriptOverviewComponent } from './manuscript-overview.component';

describe('ManuscriptOverviewComponent', () => {
  let component: ManuscriptOverviewComponent;
  let fixture: ComponentFixture<ManuscriptOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManuscriptOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManuscriptOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
