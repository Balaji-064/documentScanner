import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessingCameraComponent } from './accessing-camera.component';

describe('AccessingCameraComponent', () => {
  let component: AccessingCameraComponent;
  let fixture: ComponentFixture<AccessingCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessingCameraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccessingCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
