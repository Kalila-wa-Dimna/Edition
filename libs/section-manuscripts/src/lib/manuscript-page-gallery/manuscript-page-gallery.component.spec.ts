import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManuscriptPageGalleryComponent } from './manuscript-page-gallery.component';

describe('ManuscriptPageGalleryComponent', () => {
  let component: ManuscriptPageGalleryComponent;
  let fixture: ComponentFixture<ManuscriptPageGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManuscriptPageGalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManuscriptPageGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
