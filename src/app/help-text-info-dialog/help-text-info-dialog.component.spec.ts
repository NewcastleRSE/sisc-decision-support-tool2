import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpTextInfoDialogComponent } from './help-text-info-dialog.component';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';

describe('HelpTextInfoDialogComponent', () => {
  let component: HelpTextInfoDialogComponent;
  let fixture: ComponentFixture<HelpTextInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpTextInfoDialogComponent ],
      imports: [MatDialogModule],
      providers: [MatDialogRef]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpTextInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
