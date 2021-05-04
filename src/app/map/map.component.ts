import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {environment} from '../../environments/environment';
import {GeoserverService} from '../geoserver.service';
import {
  Map,
  Control,
  DomUtil,
  ZoomAnimEvent,
  Layer,
  MapOptions,
  tileLayer,
  latLng,
  LeafletEvent,
  circle,
  polygon,
  icon,
  LeafletMouseEvent
} from 'leaflet';

import * as L from 'leaflet';
import proj4 from 'proj4';

import 'leaflet-geometryutil';
import {WebSocketService} from '../web-socket.service';
//
// https://medium.com/runic-software/the-simple-guide-to-angular-leaflet-maps-41de83db45f1

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy, OnInit{
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

  // data
  disabilityData;
  ageData;
  centroids;

  // optimisation form
  nSensors = 10;
  theta = 500;
  minAge = 0;
  maxAge = 90;
  populationWeight = 1;
  workplaceWeight = 0;

  jobInProgress = false;
  jobProgressPercent = 0;

  // configure leaflet marker
  markerIcon = icon({
    iconSize: [ 25, 41 ],
    iconAnchor: [ 13, 41 ],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
  });

  constructor(private geoserver: GeoserverService, private webSocket: WebSocketService) { }

  ngOnInit() {
    // connect to web socket

  }

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
    this.createCentroidLayer();
    this.createDraggableSnapToNearestCentroidMarker();
    this.snapToNearestCentroid();
    this.centroids.addTo(this.map);
  }

  createDraggableMarker() {
    // create draggable marker
    const draggableMarker = L.marker([54.958455,  -1.6178], {icon: this.markerIcon, draggable: true})
    draggableMarker.addTo(this.map);

    // trigger event on drag end and console log latlong
    draggableMarker.on('dragend', (event) => {
      const position = draggableMarker.getLatLng();
      console.log(position);
    });
  }

  async createDraggableSnapToNearestCentroidMarker() {
    // create draggable marker
    const draggableMarker = L.marker([54.958455, -1.6178], {icon: this.markerIcon, draggable: true});
    draggableMarker.addTo(this.map);

    // get centroids as list of leaflet latlngs
    const possibleLocations = await this.createCentroidsAsLatLngs();

    // trigger event on drag end and snap to nearest centroid
    draggableMarker.on('dragend', (event) => {
      const position = draggableMarker.getLatLng();

      // nearest centroid
      const closestCentroid = L.GeometryUtil.closest(this.map, possibleLocations, position, true);
      draggableMarker.setLatLng([closestCentroid.lat, closestCentroid.lng]);
    });
  }

  async snapToNearestCentroid() {
    // get centroids as list of leaflet latlngs
    const possibleLocations = await this.createCentroidsAsLatLngs();

    // when user clicks on map, create a marker at the nearest centroid (eventually prevent duplicate clicks and respond to user)
    this.map.on('click', (e) => {
      console.log('Click: ' + (e as LeafletMouseEvent).latlng);
      const closestCentroid = L.GeometryUtil.closest(this.map, possibleLocations, (e as LeafletMouseEvent).latlng, true);
      console.log(closestCentroid);

      // create marker at nearest centroid
      const marker = L.marker([closestCentroid.lat, closestCentroid.lng], {icon: this.markerIcon});
      marker.addTo(this.map);
    });

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
    let ageDataSummary = await this.geoserver.getFeatureInfo('tyne_and_wear_ageranges_summary');
    ageDataSummary = ageDataSummary.features;
    console.log('Age data to eventually display, perhaps in pie chart:');
    console.log(ageDataSummary);
  }


  async createCentroidLayer() {
    // Getting centroids as layer (i.e. image)
    // this.centroids = L.tileLayer.wms(environment.GEOSERVERWMS, {
    //   layers: 'centroids',
    //   transparent: true,
    //   format: 'image/png'
    // });

    // getting centroids as JSON so can plot as markers
    // let centroidsFullResponse = await this.geoserver.getFeatureInfo('centroids');
    // centroidsFullResponse = centroidsFullResponse.features;
    // const centroids = [];
    // centroidsFullResponse.forEach((entry) => {
    //   centroids.push(entry.geometry.coordinates);
    // });
    // centroids.forEach((cent) => {
    //   const latlng = this.convertFromBNGProjection(cent[0], cent[1]);
    //   const centroidMarker = L.marker(latlng, {icon: this.markerIcon});
    //   centroidMarker.addTo(this.map);
    // });
  }

  async createCentroidsAsLatLngs() {
    // getting centroids as JSON so can plot as markers
    let centroidsFullResponse = await this.geoserver.getFeatureInfo('centroids');
    centroidsFullResponse = centroidsFullResponse.features;
    const centroids = [];
    centroidsFullResponse.forEach((entry) => {
      centroids.push(entry.geometry.coordinates);
    });
    centroids.forEach((cent) => {
      const latlng = this.convertFromBNGProjection(cent[0], cent[1]);
      const centroid = L.latLng([latlng[0], latlng[1]]);
      centroids.push(centroid);
    });
    return centroids;
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

  // ----- Optimisation query
  submitQuery() {
    // set workplace weight using population weight
    this.workplaceWeight = parseFloat((1 - this.populationWeight).toFixed(1));

    const query = {
      n_sensors: this.nSensors,
      theta: this.theta,
      min_age: this.minAge,
      max_age: this.maxAge,
      population_weight: this.populationWeight,
      workplace_weight: this.workplaceWeight
    };
    console.log('Query to submit: ');
    console.log(query);

    this.jobInProgress = true;
    this.jobProgressPercent = 0;

    // todo check all are present
    // todo error handling to mark incomplete entries

    // todo handle if can't connect to websocket or loose connection mid run

    this.webSocket.setupSocketConnection(query)
      .subscribe(
        (data: any = {} ) => {

          if (data.type) {
            // Job in progress
            if (data.type === 'jobProgress') {

              const jobId = data.payload.job_id;
              this.jobInProgress = true;
              this.jobProgressPercent = data.payload.progress;
              console.log('Job: ' + jobId + ', Progress: ' + this.jobProgressPercent);
            }
            else if (data.type === 'jobFinished') {
              console.log('Job: ' + data.payload.job_id + ' finished');
              this.jobInProgress = false;
              this.jobProgressPercent = 0;
              const pay = data.payload;
              const progress = pay.progress;
              if (progress === 100 ) {
                const jobId = pay.job_id;
                const result = pay.result;
                const coverageHistory = result.coverage_history;
                const oaCoverage = result.oa_coverage;
                const placementHistory = result.placement_history;
                const popAgeGroups = result.pop_age_groups;
                const popChildren = popAgeGroups.pop_children;
                const popElderly = popAgeGroups.pop_elderly;
                const popTotal = popAgeGroups.pop_total;
                const popWeight = result.population_weight;
                const workplaceWeight = result.workplace_weight;
                const theta = result.theta;
                const nSensors = result.n_sensors;
                const totalCoverage = result.total_coverage;
                const sensors = result.sensors;
                const oaSatisfaction = result.oa_satisfaction;

                console.log(result);

                this.plotOptimisationSensors(sensors);

                // pop_children: {min: 0, max: 16, weight: 0}
                // pop_elderly: {min: 70, max: 90, weight: 0}
                // pop_total: {min: 0, max: 90, weight: 1}

                // sensors: Array(13)
                // 0:
                // oa11cd: "E00042646"
                // x: 425597.7300000005
                // y: 565059.9069999997
              } else {
                // todo job has failed?
              }
            }
          }

        }
      );


  }

  plotOptimisationSensors(sensors) {
    const sensorPositions = [];
    sensors.forEach((sensor) => {
      const x = sensor.x;
      const y = sensor.y;
      const latlng = this.convertFromBNGProjection(x, y);
      const position = L.latLng([latlng[0], latlng[1]]);
      sensorPositions.push(position);

      // plot markers
      const draggableMarker = L.marker(position, {icon: this.markerIcon, draggable: true});
      draggableMarker.addTo(this.map);
    });
  }


  // ----- Other functions

  convertFromBNGProjection(x, y) {
    // proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

    const conv = proj4('EPSG:27700', 'EPSG:4326').forward( [x, y] ).reverse();
    return [conv[0], conv[1]];
  }



}
