import { Injectable } from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as L from 'leaflet';
import {icon} from 'leaflet';
import proj4 from 'proj4';


@Injectable({
  providedIn: 'root'
})
export class GeoserverService {

  // UO Markers
  // Urban Observatory markers
  NO2Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [0, 0],
    iconUrl: 'assets/NO2.png',
    shadowUrl: ''
  });
  PM10Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/PM10.png',
    shadowUrl: ''
  });
  PM25Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/PM2.5.png',
    shadowUrl: ''
  });
  PM25PM10NO2Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/10_25_02.png',
    shadowUrl: ''
  });
  NO2PM10Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [0, 0],
    iconUrl: 'assets/02_10.png',
    shadowUrl: ''
  });
  NO2PM25Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [0, 0],
    iconUrl: 'assets/02_25.png',
    shadowUrl: ''
  });
  PM25PM10Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [0, 0],
    iconUrl: 'assets/10_25.png',
    shadowUrl: ''
  });

  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  async getTileLayer(layer) {
    return L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: layer,
      transparent: true,
      format: 'image/png',
      opacity: 0.8
    });
  }

  // ----- Create data layers
  async getDisabilityLayers() {
    const disabilityDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2011_by_oa_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.8
    });

    const disabilityDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2011_by_oa_gates',
      transparent: true,
      format: 'image/png',
      opacity: 0.8
    });
    const legend = await this.getFormattedLegend('disability_2011_by_oa_ncl');

    return {ncl: disabilityDataNcl, gates: disabilityDataGates, legend};
  }

  async createToSSDataLayer() {
    const ncl = await this.getTileLayer('to_space_syntax_ncl');
// todo add gateshead layer

    // create legend
    const legend = await this.legendTo2DecimalPlaces(await this.getLineLegend('to_space_syntax_ncl'));

    return {ncl, legend};
  }

  async createIMDLayers() {
    const ncl = await this.getTileLayer('imd_2015_by_lsoa_ncl');
    const gates = await this.getTileLayer('imd_2015_by_lsoa_gates')
    const legend = await this.getFormattedLegend('imd_2015_by_lsoa_ncl');

    return {ncl, gates, legend};
  }

  async createThroughSSDataLayer() {
    const ncl = await this.getTileLayer('through_space_syntax_ncl');
    // todo gateshead
   // const gates = await this.getTileLayer('imd_2015_by_lsoa_gates')
    const legend = await this.legendTo2DecimalPlaces(await this.getLineLegend('through_space_syntax_ncl'))

    return {ncl,  legend};
  }

  async createAgeAndPeopleLayers() {
    const age1Ncl = await this.getTileLayer('ages_oa_under16_ncl');
    const age2Ncl = await this.getTileLayer('ages_oa_16_65_ncl');
    const age3Ncl = await this.getTileLayer('ages_oa_66over_ncl');
    const age1Gates = await this.getTileLayer('ages_oa_under16_gates');
    const age2Gates = await this.getTileLayer('ages_oa_16_65_gates');
    const age3Gates = await this.getTileLayer('ages_oa_66over_gates');
    const ageLegend = await this.getFormattedLegend('ages_oa_under16_ncl');

    const popNcl = await this.getTileLayer('population_oa_ncl');
    const popGates = await this.getTileLayer('population_oa_gates');
    const workNcl = await this.getTileLayer('workers_oa_ncl');
    const workGates = await this.getTileLayer('workers_oa_gates');

    return {age1Ncl, age2Ncl, age3Ncl, age1Gates, age2Gates, age3Gates, ageLegend, popNcl, popGates, workNcl, workGates  }
  }

  // Data layers that include creating markers
 async processUOLayer(layerName) {
    const data = await this.getGeoJSON(layerName);

     // can't use 'this.' inside of nested function so get marker first.
     const marker = this.NO2Marker;
     const markers = L.markerClusterGroup({
       showCoverageOnHover: false,
       spiderfyOnMaxZoom: false,
       iconCreateFunction(cluster) {
         return L.divIcon({
           className: 'uoSensorCluster',
           html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
         });
       },
       maxClusterRadius: 40
     });
     // get lat long from conversion and create layer
     const layer = L.geoJSON(data, {
       coordsToLatLng: (p) => {
         const conversion = this.convertFromBNGProjection(p[0], p[1]);
         return L.latLng(conversion[0], conversion[1]);
       },
       pointToLayer(feature, latlng) {
         return L.marker(latlng, {
           icon: marker
         });
       },
       onEachFeature: this.clickUOSensor
     });
     markers.addLayer(layer);

     console.log(markers)
     return markers;

 }


  async createUOLayer() {
 const ncl = await this.processUOLayer('uo_sensors_ncl');
 const gates = await this.processUOLayer('uo_sensors_gates');
 console.log(ncl)
 return {ncl, gates};
  }

  clickUOSensor(feature, layer) {
    let content = feature.properties.broker;
    // if seats are known then include
    if (feature.properties.broker) {
      content = 'Broker: ' + content;
    }
    layer.bindPopup(content);
  }

  // ----- Geoserver connection functions
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

  async getGeoJSON(layer) {
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




  // legend functions
  legendTo2DecimalPlaces(legend) {
    legend.forEach((item) => {
      try {
        const numbers = item.title.split(' - ');
        const firstNumStr = numbers[0];
        const secondNumStr = numbers[1];
        const firstNum = parseFloat(firstNumStr);
        const secondNum = parseFloat(secondNumStr);

        if (Number.isNaN(firstNum) || Number.isNaN(secondNum)) {
          console.log('Got NaN for ' + item.title);
        }

        item.title  = firstNum.toFixed(2) + '-' + secondNum.toFixed(2);
      } catch {
        console.log('problem converting legend entry to 2 decimal places ' + item.title);
      }
    });
    return legend;
  }
  async getLineLegend(layer) {
    const legend = await this.getLegend(layer);
    const rules = legend.rules;
    const colourMapping = [];
    rules.forEach((rule) => {
      const colour = rule.symbolizers[0].Line.stroke;
      const title = rule.name;
      colourMapping.push({colour, title});
    });
    return colourMapping;
  }

  async getFormattedLegend(layer) {
    const legend = await this.getLegend(layer);
    const rules = legend.rules;
    const colourMapping = [];
    rules.forEach((rule) => {
      const colour = rule.symbolizers[0].Polygon.fill;
      const title = rule.name;
      colourMapping.push({colour, title});
    });
    return colourMapping;
  }

  // ----- Other functions

  convertFromBNGProjection(x, y) {
    // proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

    const conv = proj4('EPSG:27700', 'EPSG:4326').forward([x, y]).reverse();
    return [conv[0], conv[1]];
  }
}
