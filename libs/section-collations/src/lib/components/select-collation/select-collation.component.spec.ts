import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectCollationComponent } from './select-collation.component';

describe('SelectCollationComponent', () => {
  let component: SelectCollationComponent;
  let fixture: ComponentFixture<SelectCollationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectCollationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectCollationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
