import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IllustrationsGalleryComponent } from './illustrations-gallery.component';

describe('IllustrationsGalleryComponent', () => {
  let component: IllustrationsGalleryComponent;
  let fixture: ComponentFixture<IllustrationsGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IllustrationsGalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IllustrationsGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
