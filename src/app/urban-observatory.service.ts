import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrbanObservatoryService {

  // general API parameters
  theme = 'Air Quality';
  sensorTypes = ['NO2', 'PM 2.5', 'PM10'];

  // newcastle API parameters
bbox_p1_xncl = -2.4163;
bbox_p1_yncl = 54.7373;
bbox_p2_xncl = -0.8356;
bbox_p2_yncl = 55.2079;


  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  async getNO2ncl() {
    return await this.http.get( 'http://uoweb3.ncl.ac.uk/api/v1.1/sensors/json/?theme=Air+Quality&bbox_p1_x=-2.4163&bbox_p1_y=54.7373&bbox_p2_x=-0.8356&bbox_p2_y=55.2079&sensor_type=NO2', {
      responseType: 'text',
      observe: 'response'
    })
      .toPromise()
      .then((response) => {
        const fullResponse = JSON.parse(response.body);
        return fullResponse['sensors'];
      })
      .catch(this.handleError);
  }

}
