import { TestBed } from '@angular/core/testing';

import { GeoserverService } from './geoserver.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';

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
});
// get tile layer called with correct layer from parameters
// legend to 2 decimal places
