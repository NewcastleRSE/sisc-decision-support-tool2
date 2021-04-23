import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {environment} from '../../environments/environment';
import {GeoserverService} from '../geoserver.service';
import {Map, Control, DomUtil, ZoomAnimEvent, Layer, MapOptions, tileLayer, latLng, LeafletEvent} from 'leaflet';


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
  public map: Map;
  public zoom: number;
  disabilityData;

  constructor(private geoserver: GeoserverService) { }


  ngOnDestroy() {
    this.map.clearAllEventListeners;
    this.map.remove();
  };

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



 // ngAfterViewInit(): void {
 //    this.initMap();
 //  }
 //
 //  initMap(): void {
 //    this.map = L.map('map', {
 //      center: [ 54.958455,  -1.6178 ],
 //      zoom: 11
 //    });
 //
 //    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 //      maxZoom: 18,
 //      minZoom: 3,
 //      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
 //    });
 //    tiles.addTo(this.map);
 //
 //    this.createDataLayers();
 //
 //    L.piechartMarker(
 //      L.latLng([37.7930, -122.4035]),
 //      {
 //        data: [
 //          { name: 'Apples', value: 25 },
 //          { name: 'Oranges', value: 35 },
 //          { name: 'Bananas', value: 20 },
 //          { name: 'Pineapples', value: 30 }
 //        ]
 //      }
 //    ).addTo(this.map);
 //  }



  // ----- Create data layers
  createDataLayers() {
    this.createDisabilityLayer();
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


  // ------ Data layer toggles

  toggleDisability() {
    if (this.map.hasLayer(this.disabilityData)) {
      this.map.removeLayer(this.disabilityData);
    } else {
      this.disabilityData.addTo(this.map);
    }
  }



}
