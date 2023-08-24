import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManuscriptPageGalleryCommandBarComponent } from './manuscript-page-gallery-command-bar.component';

describe('ManuscriptPageGalleryCommandBarComponent', () => {
  let component: ManuscriptPageGalleryCommandBarComponent;
  let fixture: ComponentFixture<ManuscriptPageGalleryCommandBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManuscriptPageGalleryCommandBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManuscriptPageGalleryCommandBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
