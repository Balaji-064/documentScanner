import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageToPdfConvertorComponent } from './image-to-pdf-convertor.component';

describe('ImageToPdfConvertorComponent', () => {
  let component: ImageToPdfConvertorComponent;
  let fixture: ComponentFixture<ImageToPdfConvertorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageToPdfConvertorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageToPdfConvertorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
