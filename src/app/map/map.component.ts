import {AfterViewInit, Component, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
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
import 'leaflet.markercluster';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

import * as _ from 'lodash';

import proj4 from 'proj4';

import 'leaflet-geometryutil';
import {WebSocketService} from '../web-socket.service';
import 'leaflet.awesome-markers';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ChooseLADialogComponent} from '../choose-ladialog/choose-ladialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {UrbanObservatoryService} from '../urban-observatory.service';
import {typeCheckFilePath} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {DatabaseService} from '../database.service';
import {InfoDialogComponent} from '../info-dialog/info-dialog.component';
import {DataLayerInfoDialogComponent} from '../data-layer-info-dialog/data-layer-info-dialog.component';

import {Observable} from 'rxjs';
import {SpinnerOverlayComponent} from '../spinner-overlay/spinner-overlay.component';
import {DataLayersComponent} from '../data-layers/data-layers.component';
import {GeneticAlgorithmResultsComponent} from '../genetic-algorithm-results/genetic-algorithm-results.component';


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
    center: latLng(55.004518, -1.6635291),
    zoomControl: false
  };

  public map: Map;
  public zoom: number;

  // Local Authorities currently included:
  // Newcastle upon Tyne = 'ncl'
  // Gateshead = 'gates'

  mapReady;

  oaNcl;
  oaGates;

  // use view child to be able to call function in child components
  @ViewChild(DataLayersComponent) dataLayers: DataLayersComponent;
  @ViewChild(GeneticAlgorithmResultsComponent) geneticResults: GeneticAlgorithmResultsComponent;



  // configure leaflet marker
  markerIcon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
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

  // sensor marker
  sensorMarker = L.divIcon({
    html: '<i class="fa fa-bullseye fa-2x" style="color: #6200eeff; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);"></i>',
    iconSize: [20, 20],
    className: 'sensorIcon'
  });


  // post 16 2c100aff
  p16SchoolMarker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/p16Icon.svg',
    shadowUrl: ''
  });
  seondaryp16SchoolMarker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/secondaryp16Icon.svg',
    shadowUrl: ''
  });

  primaryseondarySchoolMarker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/primarysecondaryIcon.svg',
    shadowUrl: ''
  });


  // default is Newcastle
  localAuthority = 'ncl';

  // viewing option toggles
  optimisationQueryCardOpen = true;
  viewOutputAreCoverageOnMap = false;
  dataLayersChipsVisible = false;
  viewingGeneticResults = true;


  geneticQueryChoices;

  oninit;

  spinnerOverlay;

  constructor(
    private geoserver: GeoserverService,
    private webSocket: WebSocketService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private urbanObservatoryService: UrbanObservatoryService,
    private databaseService: DatabaseService
  ) {
    this.iconRegistry.addSvgIcon(
      'sensor1', this.sanitizer.bypassSecurityTrustResourceUrl('assets/sensorIcon2.svg')
    );

    this.iconRegistry.addSvgIcon(
      'infoBackground', this.sanitizer.bypassSecurityTrustResourceUrl('assets/info_background.svg')
    );

  }

  ngOnInit() {
    // open spinner overlay while data loads
    this.spinnerOverlay = this.matDialog.open(SpinnerOverlayComponent, {
      panelClass: 'transparent',
      disableClose: true
    });

    this.oninit = performance.now();
  }

  ngOnDestroy() {
    this.map.clearAllEventListeners;
    this.map.remove();
    // todo stop subscribing to websocket
  }

  onMapReady(map: Map) {
    console.log('map ready')
    const startMapReady = performance.now();

    this.map = map;

    // tell any waiting components that the map has loaded
    this.mapReady= true;
    this.map$.emit(map);
    this.zoom = map.getZoom();
    this.zoom$.emit(this.zoom);
    const dataLayersStarted = performance.now();
   // this.createDataLayers();
    const dataLayersCreated = performance.now();
    //this.setQueryDefaults();

    // disable map events on overlay content
    const optCard = document.getElementById('no-scroll');
    L.DomEvent.disableScrollPropagation(optCard);
    L.DomEvent.disableClickPropagation(optCard);
    const finishMapReady = performance.now();
    console.log('mapReadyMethod ' + (finishMapReady - startMapReady));
    console.log('dataCreationMethod ' + (dataLayersCreated - dataLayersStarted));
  }

  // event handlers from data layers child
  loadedData() {
    // close spinner overlay
    this.spinnerOverlay.close();
    // open info dialog
     this.openInfo();
  }

  // get output area data from child component and save here to use in the future once create a coverage map for a sensor placement
  outputAreaDataLoaded(d) {
    this.oaNcl = d.ncl;
    this.oaGates = d.gates;
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

  // setQueryDefaults() {
  //   this.nSensors = 10;
  //   this.theta = 500;
  //   this.minAge = 0;
  //   this.maxAge = 90;
  //   this.populationWeight = 1;
  //   this.workplaceWeight = 0;
  //   this.budget = 10000;
  //   this.ageLow = 20;
  //   this.ageHigh = 70;
  //   this.placeLow = 20;
  // }

  // get latlng for map centre for each LA on offer
  getLACentre(LA) {
    if (LA === 'ncl') {
      return new LatLng(55.004518, -1.6635291);
    } else if (LA === 'gates') {
      return new LatLng(54.9527, -1.6635291);
    }
  }

  toggleDataLayersChips() {
    this.dataLayersChipsVisible = !this.dataLayersChipsVisible;
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


  createMultipleUOSensorMarker(types, position) {

    // create position and assign correct marker image depending on type
    const pos = L.latLng([position[0], position[1]]);


    let icon;

    // 3 types - create marker with all sensor types
    if (types.length === 3) {
      icon = this.PM25PM10NO2Marker;
    } else {
      // PM10 and PM2.5
      if (types.includes('PM10') && (types.includes('PM25'))) {
        icon = this.PM25PM10Marker;
      }
      // PM10 and NO2
      else if (types.includes('PM10') && (types.includes('NO2'))) {
        icon = this.NO2PM10Marker;
      }
      // PM2.5 and NO2
      else if (types.includes('PM25') && (types.includes('NO2'))) {
        icon = this.NO2PM25Marker;
      }
    }

    // create marker
    return L.marker(position, {icon});

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



  // Other toggles

  toggleOptimisationCard() {
    this.optimisationQueryCardOpen = !this.optimisationQueryCardOpen;
  }

  // ----- Genetic algorithm
 submitGeneticQuery(d) {
    // listen for user submitting query in greedy algorithm config child component
   // update query
   this.geneticQueryChoices = d;
   // call child component's function to display placements
   this.geneticResults.createGraph();
 }

 async plotNetwork(outputAreas) {
   // receives list of the output areas we should put a marker in at the centroid
   let centroidsFullResponse = await this.geoserver.getFeatureInfo('centroids');
   console.log(centroidsFullResponse)
 }



  // ----- Other functions

  convertFromBNGProjection(x, y) {
    // proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

    const conv = proj4('EPSG:27700', 'EPSG:4326').forward([x, y]).reverse();
    return [conv[0], conv[1]];
  }

  selectLA(la) {
    this.dataLayers.selectLA(la);
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

  // testScenarioClicked() {
  //   // if showing sample scenario, clear it
  //   if (this.sampleScenarioShowing) {
  //     this.clearOptimisation();
  //   } else {
  //     // if not showing
  //     this.testScenarioLoading = true;
  //     // close query box
  //     this.optimisationQueryCardOpen = false;
  //     this.plotOptimisationSensors(this.testScenario.result.sensors, this.testScenario.result.oa_coverage, 'sample');
  //
  //   }
  // }

  openInfo() {
    const dialogRef = this.matDialog.open(InfoDialogComponent, {
      width: '450px'
    });
  }



}
