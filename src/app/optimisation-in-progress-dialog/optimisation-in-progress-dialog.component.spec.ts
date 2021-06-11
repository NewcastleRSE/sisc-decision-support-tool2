import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptimisationInProgressDialogComponent } from './optimisation-in-progress-dialog.component';

describe('OptimisationInProgressDialogComponent', () => {
  let component: OptimisationInProgressDialogComponent;
  let fixture: ComponentFixture<OptimisationInProgressDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimisationInProgressDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimisationInProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
