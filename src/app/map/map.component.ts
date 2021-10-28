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
import {HelpTextInfoDialogComponent} from '../help-text-info-dialog/help-text-info-dialog.component';

import {Observable} from 'rxjs';
import {SpinnerOverlayComponent} from '../spinner-overlay/spinner-overlay.component';
import {DataLayersComponent} from '../data-layers/data-layers.component';
import {GeneticAlgorithmResultsComponent} from '../genetic-algorithm-results/genetic-algorithm-results.component';
import {GeneticAlgorithmConfigurationComponent} from '../genetic-algorithm-configuration/genetic-algorithm-configuration.component';


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

  tempNetwork = ['E00042398', 'E00042500', 'E00042845', 'E00042054', 'E00042774', 'E00042921', 'E00042548', 'E00042530', 'E00042904', 'E00042739', 'E00042313', 'E00042520', 'E00042305', 'E00042373', 'E00042081', 'E00042249', 'E00042395', 'E00042883', 'E00042811', 'E00042147', 'E00042832', 'E00042357', 'E00042642', 'E00042270', 'E00042770', 'E00042116', 'E00042349', 'E00042621', 'E00042207', 'E00042295', 'E00042747', 'E00042795', 'E00042867', 'E00042882', 'E00042640', 'E00042371', 'E00042433', 'E00042829', 'E00042583', 'E00042129', 'E00042194', 'E00042580', 'E00175551', 'E00042573', 'E00042582', 'E00042616', 'E00042170', 'E00042225', 'E00042708', 'E00042141', 'E00042230', 'E00042455', 'E00042638', 'E00042858', 'E00175588']

  oaNcl;
  oaGates;
  centroidsNcl;
  centroidsGates;

  currentCoverageMap;
  currentNetwork;



  // use view child to be able to call function in child components
  @ViewChild(DataLayersComponent) dataLayers: DataLayersComponent;
  @ViewChild(GeneticAlgorithmResultsComponent) geneticResults: GeneticAlgorithmResultsComponent;
  @ViewChild(GeneticAlgorithmConfigurationComponent) geneticConfig: GeneticAlgorithmConfigurationComponent;

  // Onboarding tour
  @ViewChild('tour1') tour1;
  duringTour = false;

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
    html: '<i class="fa fa-bullseye fa-1x" style="color: #6200eeff; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);"></i>',
    iconSize: [10, 10],
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
  dataLayersChipsVisible = false;
  viewingGeneticResults = false;


  geneticQueryChoices: any = {};

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
    this.oaNcl = d.ncl.geojson;
    this.oaGates = d.gates.geojson;
    this.centroidsNcl = d.ncl.centroids;
    this.centroidsGates = d.gates.centroids;

    // test plotting a sample network
   //this.plotNetwork(this.tempNetwork);
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
   this.geneticQueryChoices.sensorNumber = d.sensorNumber;
   this.geneticQueryChoices.objectives = d.objectives;
   this.geneticQueryChoices.theta = d.acceptableCoverage;
   this.geneticQueryChoices.localAuthority = this.localAuthority;
   this.geneticQueryChoices = Object.assign({}, this.geneticQueryChoices);

   // call child component's function to display placements
   this.geneticResults.createGraph(this.geneticQueryChoices);
 }

  errorGeneratingGeneticAlgorithmResults(error) {
    // todo error popup
    console.log('error received from genetic algorithm results component');
  }


 geneticResultsReady() {
    this.viewingGeneticResults = true;
    this.geneticConfig.closeExpansionPanel();
}

 async plotNetwork(data) {
    this.createNetworkCoverageMap(data.coverage, data.localAuthority);

   this.geneticConfig.closeExpansionPanel();

    // if there is a network already plotted, remove it
   if (this.map.hasLayer(this.currentNetwork)) {
     this.map.removeLayer(this.currentNetwork);
   }

   // receives list of the output areas we should put a marker in at the centroid
   let markers = L.layerGroup();
   // for each output area, get coordinates of centroid
   data.outputAreas.forEach((oa) => {
     let match;
     // check Newcastle and Gateshead
     // todo update to use provided local authority
     const ncl = this.centroidsNcl.find(o => o.oa11cd === oa.oa11cd);
     if (ncl !== undefined) {
      match = ncl;
     } else {
       const gates = this.centroidsGates.find(o => o.oa11cd === oa.oa11cd);

       if (gates !== undefined) {
        match = gates;
       } else {
         console.log('Cannot find centroid for output area ' + oa.oa11cd);
       }
     }
     if (match !== undefined) {
       // convert coordinates to latlng
       const latlng = this.coordsToLatLng([match.x, match.y]);

       // @ts-ignore
       markers.addLayer(L.marker(latlng, {
         icon: this.sensorMarker
       }));
     }

   });

   const cluster = this.createMarkerCluster(markers, 'sensorCluster');
   cluster.addLayer(markers);
   this.currentNetwork = cluster;
   this.map.addLayer(this.currentNetwork);
 }

 viewingNetwork() {
    if (this.map.hasLayer(this.currentCoverageMap)) {
      return true;
    } else {
      return false;
    }
 }

 createNetworkCoverageMap(coverageList, localAuthority) {
    // takes list of OA codes and coverage for the selected network

   // use correct output area map for selected local authority
 let coverageMap;
  //  _layers > feature > properties > code
   if (localAuthority === 'ncl') {
     coverageMap = this.oaNcl;
   } else {
     coverageMap = this.oaGates;
   }

   // set colour of OA according to coverage
 coverageMap.eachLayer((layer) => {
    const coverage = coverageList.find(o => o.code === layer.feature.properties.code).coverage;
    const colour = this.getOACoverageColour(coverage);
       layer.setStyle({
      fillColor: colour,
      fill: true,
      stroke: false,
      fillOpacity: 0.8
    });
   });

   this.currentCoverageMap = coverageMap;
   console.log(this.currentCoverageMap);
   this.map.addLayer(this.currentCoverageMap);

 }

 toggleNetwork(instruction) {
    if (instruction === 'show') {
      this.showGeneticSensors();
      this.showGeneticCoverage();
    } else {
      this.hideGeneticSensors();
      this.hideGeneticCoverage();
    }
 }

 showGeneticSensors() {
     this.map.addLayer(this.currentNetwork);
 }

  showGeneticCoverage() {
      this.map.addLayer(this.currentCoverageMap);
  }

 hideGeneticSensors() {
    if (this.map.hasLayer(this.currentNetwork)) {
      this.map.removeLayer(this.currentNetwork);
    }
 }

 hideGeneticCoverage() {
   if (this.map.hasLayer(this.currentCoverageMap)) {
     this.map.removeLayer(this.currentCoverageMap);
   }
 }

 getOACoverageColour(coverage) {
    if (coverage < 0.2) {
      return '#FFFFEB';
    } else if (coverage < 0.4) {
     return '#c2d2b0';
   } else if (coverage < 0.6) {
     return '#D8F0B6';
   } else if ( coverage < 0.8) {
     return '#8AC48A';
   } else {
     return '#43765E';
   }
 }

 createMarkerCluster(markers, clusterClassname) {
   return L.markerClusterGroup({
     showCoverageOnHover: false,
     spiderfyOnMaxZoom: false,
     iconCreateFunction(cluster) {
       return L.divIcon({
         className: clusterClassname,
         html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
       });
     },
     maxClusterRadius: 20
   });


 }

 coordsToLatLng(coordinates) {
   return this.convertFromBNGProjection(coordinates[0], coordinates[1]);
 }



  // ----- Other functions

  convertFromBNGProjection(x, y) {
    // proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

    const conv = proj4('EPSG:27700', 'EPSG:4326').forward([x, y]).reverse();
    return [conv[0], conv[1]];
  }

  selectLA(la) {
    this.localAuthority = la;
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
    // listen for whether user wants to start tutorial
    // todo at present errors if user closes dialog by clicking on page background
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result.event === 'Tutorial') {
    //     this.startTutorial();
    //   }
    // })
  }

  startTutorial() {
    this.tour1.show();
  }



}
