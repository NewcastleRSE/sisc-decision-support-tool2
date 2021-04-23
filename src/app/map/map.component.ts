import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {environment} from '../../environments/environment';
import {GeoserverService} from '../geoserver.service';
import {Map, Control, DomUtil, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, LeafletEvent, circle, polygon, icon} from 'leaflet';

import * as L from 'leaflet';
import proj4 from 'proj4';

//
// https://medium.com/runic-software/the-simple-guide-to-angular-leaflet-maps-41de83db45f1

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy{
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Input() options: MapOptions = {
    layers: [tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: 0.7,
      maxZoom: 19,
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })],
    zoom: 11,
    center: latLng(54.958455,  -1.6178)
  };

  // layersControl = {
  //   baseLayers: {
  //     'Open Street Map': tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
  //     'Open Cycle Map': tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
  //   },
  //   overlays: {
  //     'Big Circle': circle([ 46.95, -122 ], { radius: 5000 }),
  //     'Big Square': polygon([[ 46.8, -121.55 ], [ 46.9, -121.55 ], [ 46.9, -121.7 ], [ 46.8, -121.7 ]])
  //   }
  // };

  public map: Map;
  public zoom: number;
  disabilityData;
  ageData;


  // configure leaflet marker
  markerIcon = icon({
    iconSize: [ 25, 41 ],
    iconAnchor: [ 13, 41 ],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
  });

  constructor(private geoserver: GeoserverService) { }


  ngOnDestroy() {
    this.map.clearAllEventListeners;
    this.map.remove();
  }

  onMapReady(map: Map) {
    this.map = map;
    this.map$.emit(map);
    this.zoom = map.getZoom();
    this.zoom$.emit(this.zoom);

    this.createDataLayers();

  }

  onMapZoomEnd(e: LeafletEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }


  // ----- Create data layers
  createDataLayers() {
    this.createDisabilityLayer();
    this.createAgeLayer();
  }

  async getLegend(layer) {
    const legend = await this.geoserver.getLegend(layer);
    const rules =  legend.rules;
    const colourMapping = [];
    rules.forEach((rule) => {
      const colour = rule.symbolizers[0].Polygon.fill;
      const title = rule.name;
      colourMapping.push({colour, title});
    });
    return colourMapping;
  }

  async createDisabilityLayer() {
    this.disabilityData = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2015_by_lsoa',
      transparent: true,
      format: 'image/png'
    });

    // create legend
    const legend = await this.getLegend('disability_2015_by_lsoa');
    console.log('Disability legend:');
    console.log(legend);
  }

  async createAgeLayer() {
    const ageDataSummary = await this.geoserver.getFeatureInfo('tyne_and_wear_ageranges_summary');
    console.log('Age data to eventually display, perhaps in pie chart:');
    console.log(ageDataSummary);
  }


  // ------ Data layer toggles

  toggleDisability() {
    if (this.map.hasLayer(this.disabilityData)) {
      this.map.removeLayer(this.disabilityData);
    } else {
      this.disabilityData.addTo(this.map);
    }
  }

  toggleAge() {
    if (this.map.hasLayer(this.ageData)) {
      this.map.removeLayer(this.ageData);
    } else {
      this.ageData.addTo(this.map);
    }
  }


  // ----- Other functions

  convertFromBNGProjection(x, y) {
    // proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

    const conv = proj4('EPSG:27700', 'EPSG:4326').forward( [x, y] ).reverse();
    return [conv[0], conv[1]];
  }


}
