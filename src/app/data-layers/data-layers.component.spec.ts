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
    // geoserverServiceSpy = jasmine.createSpyObj('GeoserverService', ['getDisabilityLayers']);

    const geoserverResponse = {ncl: 'nclData', gates: 'gatesData', legend: 'legendData'};
    const geoserverResponseOA = {ncl: {geojson: 'nclData', centroids: 'cent'}, gates: {geojson: 'gatesData', centroids: 'cent'}, legend: 'legendData', };

    geoserverServiceSpy = jasmine.createSpyObj('GeoserverService', {
      getDisabilityLayers: new Promise((resolve, reject) => { resolve(geoserverResponse);}),
      createToSSDataLayer: new Promise((resolve, reject) => { resolve(geoserverResponse); }),
      createIMDLayers: new Promise((resolve, reject) => { resolve(geoserverResponse); }),
      createThroughSSDataLayer: new Promise((resolve, reject) => { resolve(geoserverResponse); }),
      createAgeAndPeopleLayers: new Promise((resolve, reject) => { resolve(geoserverResponse); }),
      createUOLayer: new Promise((resolve, reject) => { resolve(geoserverResponse); }),
      createOALayer: new Promise((resolve, reject) => { resolve(geoserverResponseOA); }),
      createSchoolsLayers: new Promise((resolve, reject) => { resolve(geoserverResponse); }),
      createEthnicityLayers: new Promise((resolve, reject) => { resolve(geoserverResponse); })
    });

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
   // geoserverService.getDisabilityLayers.and.returnValue(new Promise((resolve, reject) => { resolve({ncl:'nclData'});}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create disability layer', async() => {
    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.disabilityDataNcl).toEqual('nclData');
    expect(component.disabilityDataGates).toEqual('gatesData');
    expect(component.disabilityDataLegend).toEqual('legendData');
    expect(component.disabilityDataReady).toEqual(true);
  });

  it('should create toSS layer', async() => {
    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.toSSDataNcl).toEqual('nclData');
    expect(component.toSSDataGates).toEqual('gatesData');
    expect(component.toSSLegend).toEqual('legendData');
    expect(component.toSSDataReady).toEqual(true);
  });

  it('should create IMDData layer', async() => {
    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.IMDDataNcl).toEqual('nclData');
    expect(component.IMDDataGates).toEqual('gatesData');
    expect(component.IMDLegend).toEqual('legendData');
    expect(component.IMDDataReady).toEqual(true);
  });

  it('should create throughSS layer', async() => {
    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.throughSSDataNcl).toEqual('nclData');
    expect(component.throughSSDataGates).toEqual('gatesData');
    expect(component.throughSSLegend).toEqual('legendData');
    expect(component.throughSSDataReady).toEqual(true);
  });

  it('should create UO layer', async() => {
    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.uoDataNcl).toEqual('nclData');
    expect(component.uoDataGates).toEqual('gatesData');
    expect(component.uoDataReady).toEqual(true);
  });

  it('should create OA layer and emit message', async() => {
    // watch message emitter
    spyOn(component.oaDataLoaded, 'emit');

    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.oaNcl).toEqual('nclData');
    expect(component.oaGates).toEqual('gatesData');
    expect(component.uoDataReady).toEqual(true);
    expect(component.oaDataLoaded.emit).toHaveBeenCalledWith({
      ncl: {geojson: 'nclData', centroids: 'cent'},
      gates: {geojson: 'gatesData', centroids: 'cent'},
    });
  });

  it('should create schools layer', async() => {
    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.schoolsDataNcl).toEqual('nclData');
    expect(component.schoolsDataGates).toEqual('gatesData');
    expect(component.schoolsDataReady).toEqual(true);
  });

  it('should emit message when data layers are loaded', async () => {
    // watch message emitter
    spyOn(component.loadedData, 'emit');

    // wait until data layers have time to load
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loadedData.emit).toHaveBeenCalledWith('loaded');
  });


});


// if run into problem loading one type of data, what happens?

// toggles?
// clears?

