import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManuscriptPageGalleryViewerComponent } from './manuscript-page-gallery-viewer.component';

describe('ManuscriptPageGalleryViewerComponent', () => {
  let component: ManuscriptPageGalleryViewerComponent;
  let fixture: ComponentFixture<ManuscriptPageGalleryViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManuscriptPageGalleryViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManuscriptPageGalleryViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
