import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpTextInfoDialogComponent } from './help-text-info-dialog.component';

describe('DataLayerInfoDialogComponent', () => {
  let component: HelpTextInfoDialogComponent;
  let fixture: ComponentFixture<HelpTextInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpTextInfoDialogComponent ]
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
