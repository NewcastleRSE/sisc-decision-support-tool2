import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseLADialogComponent } from './choose-ladialog.component';

describe('ChooseLADialogComponent', () => {
  let component: ChooseLADialogComponent;
  let fixture: ComponentFixture<ChooseLADialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseLADialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseLADialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
