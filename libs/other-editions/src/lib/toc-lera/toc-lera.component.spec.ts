import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TocLeraComponent } from './toc-lera.component';

describe('OtherEditionsComponent', () => {
  let component: TocLeraComponent;
  let fixture: ComponentFixture<TocLeraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocLeraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TocLeraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
