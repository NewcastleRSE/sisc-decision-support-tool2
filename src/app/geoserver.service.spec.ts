import { TestBed } from '@angular/core/testing';

import { GeoserverService } from './geoserver.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MapComponent} from './map/map.component';

describe('GeoserverService', () => {
  let service: GeoserverService;

  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    //service = TestBed.inject(GeoserverService);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    service = new GeoserverService(httpClientSpy);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly take out legend values, put them to 2 decimals places and then correctly format the return', () => {
    const legend = [
      {colour: '#2c7bb6', title: '0.02567 - 0.0445'},
      {colour: '#4499ae', title: '0.0489 - 0.05123'},
      {colour: '#5cb7a5', title: '0.0567 - 0.065'}
      ];

    const expected = [
      {colour: '#2c7bb6', title: '0.03-0.04'},
      {colour: '#4499ae', title: '0.05-0.05'},
      {colour: '#5cb7a5', title: '0.06-0.07'}
    ];

    const actual = service.legendTo2DecimalPlaces(legend);

    expect(actual).toEqual(expected);
  });
});
// get tile layer called with correct layer from parameters

