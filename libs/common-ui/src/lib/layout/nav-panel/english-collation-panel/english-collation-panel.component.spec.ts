import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnglishCollationPanelComponent } from './english-collation-panel.component';

describe('EnglishCollationPanelComponent', () => {
  let component: EnglishCollationPanelComponent;
  let fixture: ComponentFixture<EnglishCollationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnglishCollationPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EnglishCollationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
