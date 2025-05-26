import { ComponentFixture, TestBed } from '@angular/core/testing';
import { McEngLeraComponent } from './Mc-Eng-Lera.component';

describe('McEngLeraComponent', () => {
  let component: McEngLeraComponent;
  let fixture: ComponentFixture<McEngLeraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McEngLeraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(McEngLeraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
