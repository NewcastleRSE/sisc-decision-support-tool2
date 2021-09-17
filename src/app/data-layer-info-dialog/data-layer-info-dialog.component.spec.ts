import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayerInfoDialogComponent } from './data-layer-info-dialog.component';

describe('DataLayerInfoDialogComponent', () => {
  let component: DataLayerInfoDialogComponent;
  let fixture: ComponentFixture<DataLayerInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataLayerInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataLayerInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
