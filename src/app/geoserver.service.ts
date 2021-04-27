import { Injectable } from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class GeoserverService {

  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  // get a JSON representation of the legend for a particular layer from geoserver
  async getLegend(layer) {
    return await this.http.get(environment.GEOSERVERWMS + 'service=WMS&version=1.1.0&request=GetLegendGraphic&layer=' + layer +
      '&format=application/json', {
      headers: new HttpHeaders()
        .set('Content-Type', 'text/json'), responseType: 'text', observe: 'response'
    })
      .toPromise()
      .then((response) => {
        const fullResponse = JSON.parse(response.body);
        return fullResponse.Legend[0];
      })
      .catch(this.handleError);
}

// Use for data such as number of people of each age bracket in each output area
  async getFeatureInfo(layer) {
    return await this.http.get(environment.GEOSERVERWFS + 'service=WFS&version=2.0.0&request=GetFeature&typename=siss:' + layer +
      '&outputFormat=application/json', {
      headers: new HttpHeaders()
        .set('Content-Type', 'text/json'), responseType: 'text', observe: 'response'
    })
      .toPromise()
      .then((response) => {
        const fullResponse = JSON.parse(response.body);
        return fullResponse;
      })
      .catch(this.handleError);
  }

}
