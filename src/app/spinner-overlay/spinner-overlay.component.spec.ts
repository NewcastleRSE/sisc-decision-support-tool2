import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerOverlayComponent } from './spinner-overlay.component';
import {MatSpinner} from '@angular/material/progress-spinner';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('SpinnerOverlayComponent', () => {
  let component: SpinnerOverlayComponent;
  let fixture: ComponentFixture<SpinnerOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinnerOverlayComponent ],
      imports: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
