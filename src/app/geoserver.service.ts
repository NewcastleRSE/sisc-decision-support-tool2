import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import {icon} from 'leaflet';
import proj4 from 'proj4';
import oa_ncl from '../assets/oa_ncl.json';

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

  // primary school marker
  primarySchoolMarker = icon({
    iconSize: [18, 18],
    iconAnchor: [0, 0],
    iconUrl: 'assets/primaryIcon2.svg',
    shadowUrl: ''
  });
// primary #DB2518
  // secondary #5C100A #ac5718
  secondarySchoolMarker = icon({
    iconSize: [18, 18],
    iconAnchor: [0, 0],
    iconUrl: 'assets/secondaryIcon2.svg',
    shadowUrl: ''
  });

  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An http error occurred', error);
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
    const gates = await this.getTileLayer('to_space_syntax_gates');


    // create legend
    const legend = await this.legendTo2DecimalPlaces(await this.getLineLegend('to_space_syntax_ncl'));

    return {ncl, gates, legend};
  }

  async createEthnicityLayers() {
    const whiteNcl = await this.getTileLayer('white_ethnicity_by_oa_ncl');
    const whiteGates = await this.getTileLayer('white_ethnicity_by_oa_gates');
    const mixedNcl = await this.getTileLayer('mixed_ethnicity_by_oa_ncl');
    const mixedGates = await this.getTileLayer('mixed_ethnicity_by_oa_gates');
    const asianNcl = await this.getTileLayer('asian_ethnicity_by_oa_ncl');
    const asianGates = await this.getTileLayer('asian_ethnicity_by_oa_gates');
    const blackNcl = await this.getTileLayer('black_ethnicity_by_oa_ncl');
    const blackGates = await this.getTileLayer('black_ethnicity_by_oa_gates');
    const otherNcl = await this.getTileLayer('other_ethnicity_by_oa_ncl');
    const otherGates = await this.getTileLayer('other_ethnicity_by_oa_gates');
    const legend = await this.getFormattedLegend('white_ethnicity_by_oa_ncl');

    return {whiteNcl, whiteGates, mixedNcl, mixedGates, asianNcl, asianGates, blackNcl, blackGates, otherNcl, otherGates, legend};
  }

  async createIMDLayers() {
    const ncl = await this.getTileLayer('imd_2015_by_lsoa_ncl');
    const gates = await this.getTileLayer('imd_2015_by_lsoa_gates');
    const legend = await this.getFormattedLegend('imd_2015_by_lsoa_ncl');

    return {ncl, gates, legend};
  }

  async createThroughSSDataLayer() {
    const ncl = await this.getTileLayer('through_space_syntax_ncl');

    const gates = await this.getTileLayer('through_space_syntax_gates');
    const legend = await this.legendTo2DecimalPlaces(await this.getLineLegend('through_space_syntax_ncl'));

    return {ncl, gates, legend};
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

    return {age1Ncl, age2Ncl, age3Ncl, age1Gates, age2Gates, age3Gates, ageLegend, popNcl, popGates, workNcl, workGates  };
  }

  // Data layers that include creating markers
 async getProcessedUOLayer(layerName) {
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
    return markers;

 }


  async createUOLayer() {
 const ncl = await this.getProcessedUOLayer('uo_sensors_ncl');
 const gates = await this.getProcessedUOLayer('uo_sensors_gates');

 return {ncl, gates};
  }

  async getProcessedOALayer(layerName) {
     const data = await this.getGeoJSON(layerName);
     const centroids = [];

    // convert from bng projection and create centroid data
    // proj4 requires this strange conversion(!) to ensure we always have a finite number for the x and y values
     data.features.forEach((feature) => {
       // const conversion = this.convertFromBNGProjection(Number(parseFloat(feature.properties.centroid_x).toFixed(5)), Number(parseFloat(feature.properties.centroid_y).toFixed(5)));
       // centroids.push({x: conversion[0], y: conversion[1], oa11cd: feature.properties.code});
       const oa11cd = feature.properties.code;
       const xy = [Number(parseFloat(feature.properties.centroid_x).toFixed(5)),  Number(parseFloat(feature.properties.centroid_y).toFixed(5))];

       // convert centroids to lat long
       const latlng = this.createCentroidsAsLatLngs(xy);
       centroids.push(latlng);
       // centroids.push({latlng, oa11cd});
       });

     const myStyle = {
        fill: false,
        color: '#ff7800',
        weight: 1.5,
        opacity: 0.8
      };

     const geojson = await L.geoJSON(data, {
      coordsToLatLng: (p) => {
        const conversion = this.convertFromBNGProjection(p[0], p[1]);
        return L.latLng(conversion[0], conversion[1]);
      },
      style: myStyle,
      // onEachFeature: this.oaFeatureFunction
    });

     return {geojson, centroids};
  }

  createCentroidsAsLatLngs(xy) {
      const latlng = this.convertFromBNGProjection(xy[0], xy[1]);
      return L.latLng([latlng[0], latlng[1]]);

  }

  async createOALayer() {
    const s = performance.now();
    const ncl = await this.getProcessedOALayer('oa_ncl');
    const fin = performance.now();
    const gates = await this.getProcessedOALayer('oa_gates');


    return {ncl, gates};

  }


  // function that controls what happens for events triggered on output area events
  async oaFeatureFunction(feature, layer) {

    if (feature.properties) {
      // layer.bindPopup(feature.properties.code);
      // layer.on(
      //   'mouseover', function(e) {
      //     this.setStyle({
      //       fill: true,
      //       fillColor: '#ff7800'
      //     });
      //   });
      // layer.on(
      //   'mouseout', function(e) {
      //     this.setStyle({
      //       fill: false
      //     });
      //   });

    }
  }


  clickUOSensor(feature, layer) {
    let content = feature.properties.broker;
    // if seats are known then include
    if (feature.properties.broker) {
      content = 'Broker: ' + content;
    }
    layer.bindPopup(content);
  }

  async getProcessedSchoolLayer(layerName) {
    const schoolsData = await this.getGeoJSON(layerName);

      // can't use 'this.' inside of nested function so get marker first.
    const primary = this.primarySchoolMarker;
    const sec = this.secondarySchoolMarker;

      // create cluster
    const markers = L.markerClusterGroup({
        showCoverageOnHover: false,
        disableClusteringAtZoom: 12,
        spiderfyOnMaxZoom: false,
        iconCreateFunction(cluster) {
          return L.divIcon({
            className: 'schoolSensorCluster',
            html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
          });
        }
      });

    const layer =  L.geoJSON(schoolsData, {
        // for now group under primary for primary and middle, and secondary for secondary and post 16
        pointToLayer(feature, latlng) {
          if (feature.properties.ISPOST16 === 1 && feature.properties.ISSECONDARY === 0 && feature.properties.ISPRIMARY === 0) {
            return L.marker(latlng, {
              icon: sec
            });
          } else if (feature.properties.ISPOST16 === 1 && feature.properties.ISSECONDARY === 1 && feature.properties.ISPRIMARY === 0) {
            return L.marker(latlng, {
              icon: sec
            });
          } else  if (feature.properties.ISPOST16 === 0 && feature.properties.ISSECONDARY === 1 && feature.properties.ISPRIMARY === 0) {
            return L.marker(latlng, {
              icon: sec
            });
          } else  if (feature.properties.ISPOST16 === 0 && feature.properties.ISSECONDARY === 1 && feature.properties.ISPRIMARY === 1) {
            return L.marker(latlng, {
              icon: primary
            });
          } else {
            return L.marker(latlng, {
              icon: primary
            });
          }

        },
        onEachFeature: this.schoolsFeatures

      });
    const m = markers.addLayer(layer);
    console.log(m)
    return m;

    }

  // click event on schools
  schoolsFeatures(feature, layer) {
    let content = feature.properties.SCHNAME;
    // if seats are known then include
    if (feature.properties.SEATS) {
      content = content + '<br>' + feature.properties.SEATS + ' seats';
    }
    layer.bindPopup(content);
  }



  async createSchoolsLayers() {
   const ncl = await this.getProcessedSchoolLayer('schools_gov_data_ncl_with_locations');
   const gates = await this.getProcessedSchoolLayer('schools_gov_data_gates_with_locations');

   return {ncl, gates};
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
