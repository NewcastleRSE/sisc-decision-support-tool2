import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayersComponent } from './data-layers.component';
import {MatIconModule} from '@angular/material/icon';
import {HttpClientModule} from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import {GeoserverService} from '../geoserver.service';
import {of} from 'rxjs';

describe('DataLayersComponent', () => {
  let component: DataLayersComponent;
  let fixture: ComponentFixture<DataLayersComponent>;
  let geoserverService;
  let geoserverServiceSpy;

  beforeEach(async(() => {
    // // mock returns from geoserver
    geoserverServiceSpy = jasmine.createSpyObj('GeoserverService', ['getDisabilityLayers']);

    TestBed.configureTestingModule({
      declarations: [DataLayersComponent],
      imports: [
        MatIconModule,
        HttpClientModule,
        MatDialogModule
      ],
      providers: [{provide: GeoserverService, useValue: geoserverServiceSpy}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataLayersComponent);
    component = fixture.componentInstance;
    geoserverService = TestBed.get(GeoserverService);
    geoserverService.getDisabilityLayers.and.returnValue(of(Promise.resolve({ncl: 'nclData', gates: 'gatesData', legend: 'legendData'})));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create2', () => {
    expect(component.disabilityDataNcl).toEqual('nclData');


  });

});

// once get all data back from geoserver service then emit message correctly
// if run into problem loading one type of data, what happens?
// open data info with correct topic
// toggles?
// clears?
// select local authority
// get correct la centre
