import {AfterViewInit, Component, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
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
  LeafletMouseEvent, LatLng
} from 'leaflet';

import * as L from 'leaflet';
import proj4 from 'proj4';

import 'leaflet-geometryutil';
import {WebSocketService} from '../web-socket.service';
import 'leaflet.awesome-markers';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ChooseLADialogComponent} from '../choose-ladialog/choose-ladialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';

//
// https://medium.com/runic-software/the-simple-guide-to-angular-leaflet-maps-41de83db45f1

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy, OnInit {
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Input() options: MapOptions = {
    layers: [tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
      opacity: 1,
      maxZoom: 19,
      detectRetina: true,
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })],
    zoom: 12,
    center: latLng(54.958455, -1.635291),
    zoomControl: false
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

  // Local Authorities currently included:
  // Newcastle upon Tyne = 'ncl'
  // Gateshead = 'gates'

  // data

  // disability
  disabilityDataNcl;
  disabilityDataGates;
  disabilityDataLegend;
  disabilityDataVisible = false;

  //IMD
  IMDDataVisible = false;
  IMDDataNcl;
  IMDDataGates;

  ageData;
  centroids;
  oaLayer;

  // optimisation form
  nSensors = 10;
  theta = 500;
  minAge = 0;
  maxAge = 90;
  populationWeight = 1;
  workplaceWeight = 0;
  budget = 10000;
  jobInProgress = false;
  jobProgressPercent = 0;
  sensorCost = 1000;
  // todo decide on minimums allowed
  minSensorsAllowed = 1;
  thetaMinAllowed  = 500;
  jobID = null;
  viewingSensorPlacement = false;

  // configure leaflet marker
  markerIcon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
  });
  // default is Newcastle
  localAuthority = 'ncl';

  // viewing option toggles
  optimisationQueryCardOpen = false;
  viewOutputAreCoverageOnMap = false;
  dataLayersChipsVisible = false;

  // optimisation query options and values
// sliders
  ageLow = 20;
  ageHigh = 70;
  placeLow = 20;

  outputAreaCoverageLegend = [
    {title: '16.9-20.0', colour: '#fff9cf'},
    {title: '20.0-22.9', colour: '#c2d2b0'},
    {title: '22.9-25.9', colour: '#8daa95'},
    {title: '25.9-46.6', colour: '#61827a'}
  ];
  outputAreaCoverageLayer;
  totalCoverage;



  constructor(
    private geoserver: GeoserverService,
    private webSocket: WebSocketService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private zone: NgZone
  ) {
  }

  ngOnInit() {
    // this.openChooseLADialog();

    // set form styling


  }

  ngOnDestroy() {
    this.map.clearAllEventListeners;
    this.map.remove();
    // todo stop subscribing to websocket
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

  openChooseLADialog() {
    const dialogConfig = new MatDialogConfig();

    // pass current LA to dialog and prevent closing by clicking outside dialog
    dialogConfig.data = this.localAuthority;
    dialogConfig.disableClose = true;

    const dialogRef = this.matDialog.open(ChooseLADialogComponent, dialogConfig);
    // subscribe to closing dialog and get local authority chosen
    dialogRef.afterClosed().subscribe(value => {
      this.localAuthority = value;
      // change centre of map to suit LA chosen
      this.map.panTo(this.getLACentre(value));
    });
  }

  // get latlng for map centre for each LA on offer
  getLACentre(LA) {
    if (LA === 'ncl') {
      return new LatLng(54.980540, -1.6635291);
    } else if (LA === 'gates') {
      return new LatLng(54.952029, -1.596755);
    }
  }


  // ----- Create data layers
  createDataLayers() {
    this.createDisabilityLayer();
    this.createIMDLayers();
    // this.createAgeLayer();
    // this.createCentroidLayer();
    // this.createDraggableSnapToNearestCentroidMarker();
    // this.snapToNearestCentroid();
    // this.createOALayer();

    // this.centroids.addTo(this.map);
  }

  createDraggableMarker() {
    // create draggable marker
    const draggableMarker = L.marker([54.958455, -1.6178], {icon: this.markerIcon, draggable: true});
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
    const rules = legend.rules;
    const colourMapping = [];
    rules.forEach((rule) => {
      const colour = rule.symbolizers[0].Polygon.fill;
      const title = rule.name;
      colourMapping.push({colour, title});
    });
    return colourMapping;
  }

  async createDisabilityLayer() {
    this.disabilityDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2015_by_lsoa_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.7
    });

    this.disabilityDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2015_by_lsoa_gates',
      transparent: true,
      format: 'image/png',
      opacity: 0.7
    });

    // create legend
    this.disabilityDataLegend = await this.getLegend('disability_2015_by_lsoa_ncl');

  }

  async createIMDLayers() {
    this.disabilityDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2015_by_lsoa_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.7
    });

    this.disabilityDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2015_by_lsoa_gates',
      transparent: true,
      format: 'image/png',
      opacity: 0.7
    });

    // create legend
    this.disabilityDataLegend = this.legendTo2DecimalPlaces(await this.getLegend('disability_2015_by_lsoa_ncl'));
  }

  async createOALayer() {
    this.geoserver.getGeoJSON('tyne_and_wear_oa').then((oaGeoJSON) => {
      console.log(oaGeoJSON);

      const myStyle = {
        'color': '#ff7800',
        'weight': 3,
        'opacity': 0.2
      };

      L.geoJSON(oaGeoJSON, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: myStyle
      }).addTo(this.map);
    });

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
  toggleDataLayersChips() {
    this.dataLayersChipsVisible = !this.dataLayersChipsVisible;
  }

  toggleDisability() {
    // if on, turn off
     if (this.disabilityDataVisible) {
       this.disabilityDataVisible = false;
       this.clearDisabilityLayers();
     }

     // if off, turn on
    else {
      this.disabilityDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.disabilityDataNcl.addTo(this.map);
      } else {
        this.disabilityDataGates.addTo(this.map);
      }

    }
  }

  toggleAge() {
    if (this.map.hasLayer(this.ageData)) {
      this.map.removeLayer(this.ageData);
    } else {
      this.ageData.addTo(this.map);
    }
  }

  // clearing data layers
  clearDataLayers() {
  this.clearDisabilityLayers();
  }

  clearDisabilityLayers() {
    this.disabilityDataVisible = false;
    if (this.map.hasLayer(this.disabilityDataNcl)) {
      this.map.removeLayer(this.disabilityDataNcl);
    }
    if (this.map.hasLayer(this.disabilityDataGates)) {
      this.map.removeLayer(this.disabilityDataGates);
    }
  }

  // Other toggles

  toggleOptimisationCard() {
    this.optimisationQueryCardOpen = !this.optimisationQueryCardOpen;
  }

  // ----- Optimisation query
  submitQuery() {
    // todo check all values are viable

    // workplace and resident weighting need to be translated from /100 to being /1
    this.populationWeight = this.placeLow / 10;

    // set workplace weight using population weight
    this.workplaceWeight = parseFloat((1 - this.populationWeight).toFixed(1));

    // set min and max age, allowing that user might have reversed order of sliders
    if (this.ageLow > this.ageHigh) {
      this.minAge = this.ageHigh;
      this.maxAge = this.ageLow;
    } else {
      this.minAge = this.ageLow;
      this.maxAge = this.ageHigh;
    }

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
    console.log('before submitting the job ID is ' +this.jobID);

    this.jobInProgress = true;
    this.jobProgressPercent = 0;

    // todo check all are present
    // todo error handling to mark incomplete entries

    // todo handle if can't connect to websocket or loose connection mid run

    this.webSocket.setupSocketConnection(query)
      .subscribe(
        (data: any = {}) => {
          // todo listen for observer error and act accordingly

          if (data.type) {
            // if job ID has not been set yet, listen for job message, otherwise listen for progress and finish
            if (this.jobID === null) {
              if (data.type === 'job') {
                // check for errors
                if (data.payload.code === 400) {
                  // todo cancel run and show error
                  console.log(data.payload.message);
                } else {
                  console.log('get ID from message ' + data.payload)
                  // todo might need to update server so that the client gets an ID upon connection to verify this is the job that belongs to it
                  this.jobID = data.payload.job_id;
                  console.log('job ID has been set as ' + data.payload.job_id);
                }


              }
            } else {


              // Job in progress
              if (data.type === 'jobProgress') {

                  // check if the job is ours otherwise ignore
                  if (data.payload.job_id === this.jobID) {
                   //  console.log('picked up update for ' + data.payload.job_id);
                    this.jobInProgress = true;
                    this.jobProgressPercent = data.payload.progress.toFixed(2);
                  } else {
                    // console.log('picked up update for another client ' + data.payload.job_id);
                  }
                }
              // Job finished
              else if (data.type === 'jobFinished') {
                // check if job ID is ours else ignore
                if (data.payload.job_id === this.jobID) {

                  // console.log('Job: ' + data.payload.job_id + ' finished');
                  this.jobInProgress = false;
                  this.jobProgressPercent = 0;
                  const pay = data.payload;
                  const progress = pay.progress;
                  if (progress === 100) {
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
                    this.totalCoverage = result.total_coverage;
                    const sensors = result.sensors;

                    // todo create geojsn from oaCoverage

                    console.log(result);
                    this.jobID = null;
                    this.plotOptimisationSensors(sensors);
                  }
                  // pop_children: {min: 0, max: 16, weight: 0}
                  // pop_elderly: {min: 70, max: 90, weight: 0}
                  // pop_total: {min: 0, max: 90, weight: 1}

                  // sensors: Array(13)
                  // 0:
                  // oa11cd: "E00042646"
                  // x: 425597.7300000005
                  // y: 565059.9069999997

                  // oa_coverage: Array(952)
                  //   [0 … 99]
                  // 0:
                  // coverage: 0.0000034260432153301947
                  // oa11cd: "E00139797"
                } else {
                  // todo job has failed?
                }
              }
            }
          }

        }, error => {
          console.log('component picked up error from observer: ' + error);
          // todo currently snackbar won't close so come up with better solution
          // this.zone.run(() => {
          //   this.snackBar.open("Oh no! We've encountered an error from the server. Please try again.", 'x', {
          //     duration: 500,
          //     horizontalPosition: 'center',
          //     verticalPosition: 'top'
          //   });
          // });
          this.resetJob();
        }
      );


  }

  resetJob() {
    this.jobInProgress = false;
    this.jobProgressPercent = 0;
    this.jobID = null;
  }

  // budget and number of sensors are dependent on each other
  changeInBudget() {
    // minimum budget
    // todo notify user
    if (this.budget < (this.sensorCost * this.minSensorsAllowed)) {
      this.budget = this.sensorCost * this.minSensorsAllowed;
    }
    this.nSensors = Math.floor(this.budget / this.sensorCost);
  }

  changeInSensorNumber() {
    // minimum number of sensors
    // todo notify user
    if (this.nSensors < this.minSensorsAllowed) {
      this.nSensors = this.minSensorsAllowed;
    }

    this.nSensors = Math.floor(this.nSensors);
    this.budget = this.sensorCost * this.nSensors;
  }

  changeInTheta() {
    // todo notify user
    if (this.theta < this.thetaMinAllowed) {
      this.theta = this.thetaMinAllowed;
    }
  }

  cancelOptimisationQuery() {

  }

  legendTo2DecimalPlaces(legend) {
    legend.forEach((item) => {
      try {
        const numbers = item.title.split(' - ');
        const firstNumStr = numbers[0];
        const secondNumStr = numbers[1];
        const firstNum = parseFloat(firstNumStr);
        const secondNum = parseFloat(secondNumStr);
        item.title  = firstNum.toFixed(2) + '-' + secondNum.toFixed(2);
      } catch {
        console.log('problem converting legend entry to 2 decimal places ' + item.title);
      }
    });
    return legend;
  }
  clearSensorPlacementResults() {
    // todo clear markers

    this.viewingSensorPlacement = false;
  }

  plotOptimisationSensors(sensors) {
    this.viewingSensorPlacement = true;
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

    const conv = proj4('EPSG:27700', 'EPSG:4326').forward([x, y]).reverse();
    return [conv[0], conv[1]];
  }

  selectLA(la) {
    // if changing to gates, bring over any selected newcastle layers
    if (la === 'gates') {
      // todo keep adding layers here
      if (this.map.hasLayer(this.disabilityDataNcl)) {
        this.map.removeLayer(this.disabilityDataNcl);
        this.map.addLayer(this.disabilityDataGates);
      }
    }

    // if changing to newcastle, bring over any selected gateshead layers
    else if (la === 'ncl') {
      // todo keep adding layers here
      if (this.map.hasLayer(this.disabilityDataGates)) {
        this.map.removeLayer(this.disabilityDataGates);
        this.map.addLayer(this.disabilityDataNcl);
      }
    }
    this.localAuthority = la;
  }

  addPercentageToLabel(value) {
    return value + '%';
  }

  openSnackBar(message, action) {
    this.snackBar.open(message, action, {
      duration: 500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
