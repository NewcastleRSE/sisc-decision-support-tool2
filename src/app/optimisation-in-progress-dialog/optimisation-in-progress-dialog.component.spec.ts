import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptimisationInProgressDialogComponent } from './optimisation-in-progress-dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogActions} from '@angular/material/dialog';

describe('OptimisationInProgressDialogComponent', () => {
  let component: OptimisationInProgressDialogComponent;
  let fixture: ComponentFixture<OptimisationInProgressDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OptimisationInProgressDialogComponent,
        MatProgressBarModule,
      MatDialogActions]
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
