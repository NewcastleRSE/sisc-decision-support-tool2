import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayersComponent } from './data-layers.component';
import {MatIconModule} from '@angular/material/icon';
import {HttpClientModule} from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';

describe('DataLayersComponent', () => {
  let component: DataLayersComponent;
  let fixture: ComponentFixture<DataLayersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataLayersComponent ],
      imports: [
        MatIconModule,
        HttpClientModule,
        MatDialogModule
      ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


// once get all data back from geoserver service then emit message correctly
// if run into problem loading one type of data, what happens?
// open data info with correct topic
// toggles?
// clears?
// select local authority
// get correct la centre
