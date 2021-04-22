import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
private map;

  constructor() { }

 ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map', {
      center: [ 54.958455,  -1.6178 ],
      zoom: 11
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tiles.addTo(this.map);


    var districtLayer = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2015_by_lsoa',
      transparent: true,
      format: 'image/png'
    }).addTo(this.map);


  }

}
