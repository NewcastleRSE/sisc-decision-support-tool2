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
import 'leaflet.markercluster';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

import * as _ from 'lodash';

import proj4 from 'proj4';

import 'leaflet-geometryutil';
import {WebSocketService} from '../web-socket.service';
import 'leaflet.awesome-markers';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ChooseLADialogComponent} from '../choose-ladialog/choose-ladialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {UrbanObservatoryService} from '../urban-observatory.service';
import {typeCheckFilePath} from '@angular/compiler-cli/src/ngtsc/typecheck';

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

  // IMD
  IMDDataVisible = false;
  IMDDataNcl;
  IMDDataGates;
  IMDLegend;

  //  to space syntax
  toSSDataVisible = false;
  toSSDataNcl;
  toSSDataGates;
  toSSLegend;

  //  through space syntax
  throughSSDataVisible = false;
  throughSSDataNcl;
  throughSSDataGates;
  throughSSLegend;

  // Urban Observatory sensors
  uoDataVisible = false;
  uoLegend;
  uoDataNcl;
  uoDataGates;

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

  // optimisation query options and values
// sliders
  ageLow = 20;
  ageHigh = 70;
  placeLow = 20;

  // configure leaflet marker
  markerIcon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
  });

  // Urban Observatory markers
  NO2Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
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
    iconAnchor: [13, 41],
    iconUrl: 'assets/02_10.png',
    shadowUrl: ''
  });
  NO2PM25Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/02_25.png',
    shadowUrl: ''
  });
  PM25PM10Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/10_25.png',
    shadowUrl: ''
  });

  // sensor marker
  sensorMarker = L.divIcon({
    html: '<i class="fa fa-bullseye fa-2x" style="color: #6200eeff; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);"></i>',
    iconSize: [20, 20],
    className: 'sensorIcon'
  });

  // default is Newcastle
  localAuthority = 'ncl';

  // viewing option toggles
  optimisationQueryCardOpen = false;
  viewOutputAreCoverageOnMap = false;
  dataLayersChipsVisible = false;



  optimisationSensors;

  outputAreaCoverageLegend = [
    {title: '16.9-20.0', colour: '#fff9cf'},
    {title: '20.0-22.9', colour: '#c2d2b0'},
    {title: '22.9-25.9', colour: '#8daa95'},
    {title: '25.9-46.6', colour: '#61827a'}
  ];
  outputAreaCoverageLayer;
  totalCoverage;


  websocketSubscription;

  constructor(
    private geoserver: GeoserverService,
    private webSocket: WebSocketService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private urbanObservatoryService: UrbanObservatoryService
  ) {
    this.iconRegistry.addSvgIcon(
      'sensor1', this.sanitizer.bypassSecurityTrustResourceUrl('assets/sensorIcon2.svg')
    );
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

    this.setQueryDefaults();

    // disable map events on overlay content
    const optCard = document.getElementById('no-scroll');
    L.DomEvent.disableScrollPropagation(optCard);
    L.DomEvent.disableClickPropagation(optCard);

    this.geoserver.getGeoJSON('oa_ncl').then((oaGeoJSON) => {

      const myStyle = {
        color: '#ff7800',
        weight: 3,
        opacity: 0.2
      };

      const oas = L.geoJSON(oaGeoJSON, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: myStyle,
        onEachFeature: this.oaFeatureFunction
      });
      console.log(oas)
      this.map.addLayer(oas);
    });



  }

  onMapZoomEnd(e: LeafletEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  oaFeatureFunction(feature, layer) {
    if (feature.properties) {
      layer.bindPopup(feature.properties.code);
    }
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

  setQueryDefaults() {
    this.nSensors = 10;
    this.theta = 500;
    this.minAge = 0;
    this.maxAge = 90;
    this.populationWeight = 1;
    this.workplaceWeight = 0;
    this.budget = 10000;
    this.ageLow = 20;
    this.ageHigh = 70;
    this.placeLow = 20;
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
    this.createToSSDataLayer();
    this.createThroughSSDataLayer();
    this.createUOLayer();
    // this.createAgeLayer();
    // this.createCentroidLayer();
    // this.createDraggableSnapToNearestCentroidMarker();
    // this.snapToNearestCentroid();
    this.createOALayer();


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

  async getLineLegend(layer) {
    const legend = await this.geoserver.getLegend(layer);
    const rules = legend.rules;
    const colourMapping = [];
    rules.forEach((rule) => {
      const colour = rule.symbolizers[0].Line.stroke;
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
      opacity: 0.5
    });

    this.disabilityDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'disability_2015_by_lsoa_gates',
      transparent: true,
      format: 'image/png',
      opacity: 0.5
    });

    // create legend
    this.disabilityDataLegend = this.legendTo2DecimalPlaces(await this.getLegend('disability_2015_by_lsoa_ncl'));

  }

  async createToSSDataLayer() {
    this.toSSDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'to_space_syntax_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.3
    });

    // this.spaceSyntaxDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
    //   layers: 'space_syntax_gates',
    //   transparent: true,
    //   format: 'image/png',
    //   opacity: 0.5
    // });

    // create legend
    this.toSSLegend = this.legendTo2DecimalPlaces(await this.getLineLegend('to_space_syntax_ncl'));

  }

  async createThroughSSDataLayer() {
    this.throughSSDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'through_space_syntax_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.3
    });
    console.log(this.throughSSDataNcl);
    // this.spaceSyntaxDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
    //   layers: 'space_syntax_gates',
    //   transparent: true,
    //   format: 'image/png',
    //   opacity: 0.5
    // });
    // create legend
    this.throughSSLegend = this.legendTo2DecimalPlaces(await this.getLineLegend('through_space_syntax_ncl'));

  }

  // todo add error handling if get surprises from UO API
  async createUOLayer() {

    const allSensors = [];
  // @ts-ignore
    const group = L.markerClusterGroup({
    iconCreateFunction(cluster) {
      return L.divIcon({
        className: 'uoSensorCluster',
        html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
      });
    },
    showCoverageOnHover: false,
      spiderfyOnMaxZoom: false
  });

    const no2 = await this.urbanObservatoryService.getNO2ncl();
    no2.forEach((sensor) => {
        // const position = L.latLng([sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']]);
        // const marker = L.marker(position, {icon: this.NO2Marker});
      const type = 'NO2';
      const position = [sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']];
      const marker = {type, position};
      allSensors.push(marker);
      });

    const pm25 = await this.urbanObservatoryService.getPM25ncl();
    pm25.forEach((sensor) => {
       //  const position = L.latLng([sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']]);
       //  const marker = L.marker(position, {icon: this.PM25Marker});
       // // group.addLayer(marker);
       //  markers.push(marker);
      const type = 'PM25';
      const position = [sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']];
      const marker = {type, position};
      allSensors.push(marker);
      });

    const pm10 = await this.urbanObservatoryService.getPM10ncl();
    pm10.forEach((sensor) => {
      const type = 'PM10';
      const position = [sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']];
      const marker = {type, position};
      allSensors.push(marker);
    });

 // check through markers list for duplicates locations. If duplicate then remove all and create new marker representing all
    const groupedByPosition =  _.groupBy(allSensors, (item) => {
    return item.position;
  });

    const markers = [];

    for (const key in groupedByPosition) {
      const entry = groupedByPosition[key];

      // remove duplicates
      const typesMentioned = {};
      const uniqueEntry = entry.filter(function(e) {
        if (typesMentioned[e.type]) {
          return false;
        }
        typesMentioned[e.type] = true;
        return true;
      });

      // if there is only 1 sensor at a location, go ahead and create a simple single type marker
      if (uniqueEntry.length === 1) {
        markers.push(this.createSingleUOSensorMarker(uniqueEntry[0].type, uniqueEntry[0].position));
      } else {
        let types = [];
        uniqueEntry.forEach((e) => {
          types.push(e.type);
        });
        // remove any duplicates
        types = _.uniq(types);

        markers.push(this.createMultipleUOSensorMarker(types, uniqueEntry[0].position));
      }
    }

    // add markers to group
    markers.forEach((m) => {group.addLayer(m); });

    // todo at the moment both newcastle and gateshead are covered by same uo sensor data?
    this.uoDataNcl = group;
    this.uoDataGates = group;

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


  createSingleUOSensorMarker(type, position) {
    // create position and assign correct marker image depending on type
    const pos = L.latLng([position[0], position[1]]);
    // tslint:disable-next-line:no-shadowed-variable
    let icon;

    if (type === 'NO2') {
      icon = this.NO2Marker;
    } else if (type === 'PM25') {
      icon = this.PM25Marker;
    } else if (type === 'PM10') {
      icon = this.PM10Marker;
    }

    return L.marker(pos, {icon});
  }


  async createIMDLayers() {
    this.IMDDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'imd_2015_by_lsoa_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.5
    });

    this.IMDDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'imd_2015_by_lsoa_gates',
      transparent: true,
      format: 'image/png',
      opacity: 0.5
    });

    // create legend
    this.IMDLegend = await this.getLegend('imd_2015_by_lsoa_ncl');
  }

  async createOALayer() {
    this.geoserver.getGeoJSON('tyne_and_wear_oa').then((oaGeoJSON) => {
      console.log(oaGeoJSON);

      const myStyle = {
        color: '#ff7800',
        weight: 3,
        opacity: 0.2
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

  toggleIMD() {
    // if on, turn off
    if (this.IMDDataVisible) {
      this.IMDDataVisible = false;
      this.clearIMDLayers();
    }

    // if off, turn on
    else {
      this.IMDDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.IMDDataNcl.addTo(this.map);
      } else {
        this.IMDDataGates.addTo(this.map);
      }

    }
  }

  toggleUOSensors() {
// if on, turn off
    if (this.uoDataVisible) {
      this.uoDataVisible = false;
      this.clearUOLayers();
    }

    // if off, turn on
    else {
      this.uoDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.uoDataNcl.addTo(this.map);
      } else {
        this.uoDataGates.addTo(this.map);
      }

    }
  }

  toggleToSSLayer() {
    // if on, turn off
    if (this.toSSDataVisible) {
      console.log('turn to off');
      this.toSSDataVisible = false;
      this.cleartoSSLayers();
    }

    // if off, turn on
    else {
      console.log('turn to on');
      this.toSSDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.toSSDataNcl.addTo(this.map);
      } else {
        this.toSSDataGates.addTo(this.map);
      }

    }
  }

  toggleThroughSSLayer() {

    // if on, turn off
    if (this.throughSSDataVisible) {
      console.log('turn through off');
      this.throughSSDataVisible = false;
      this.clearThroughSSLayers();
    }

    // if off, turn on
    else {
      console.log('turn through on');
      this.throughSSDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.throughSSDataNcl.addTo(this.map);
      } else {
        this.throughSSDataGates.addTo(this.map);
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
  this.clearIMDLayers();
  this.clearUOLayers();
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


  clearUOLayers() {
    this.uoDataVisible = false;
    if (this.map.hasLayer(this.uoDataNcl)) {
      this.map.removeLayer(this.uoDataNcl);
    }
    if (this.map.hasLayer(this.uoDataGates)) {
      this.map.removeLayer(this.uoDataGates);
    }
  }

  clearIMDLayers() {
    this.IMDDataVisible = false;
    if (this.map.hasLayer(this.IMDDataNcl)) {
      this.map.removeLayer(this.IMDDataNcl);
    }
    if (this.map.hasLayer(this.IMDDataGates)) {
      this.map.removeLayer(this.IMDDataGates);
    }
  }

  cleartoSSLayers() {
    this.toSSDataVisible = false;
    if (this.map.hasLayer(this.toSSDataNcl)) {
      this.map.removeLayer(this.toSSDataNcl);
    }
    if (this.map.hasLayer(this.toSSDataGates)) {
      this.map.removeLayer(this.toSSDataGates);
    }
  }

  clearThroughSSLayers() {
    this.throughSSDataVisible = false;
    if (this.map.hasLayer(this.throughSSDataNcl)) {
      this.map.removeLayer(this.throughSSDataNcl);
    }
    if (this.map.hasLayer(this.throughSSDataGates)) {
      this.map.removeLayer(this.throughSSDataGates);
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
    console.log('before submitting the job ID is ' + this.jobID);

    this.jobInProgress = true;
    this.jobProgressPercent = 0;

    // todo check all are present
    // todo error handling to mark incomplete entries

    // todo handle if can't connect to websocket or loose connection mid run

    this.websocketSubscription = this.webSocket.setupSocketConnection(query)
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
                  console.log('get ID from message ' + data.payload);
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
    this.websocketSubscription.unsubscribe();
    this.map.removeLayer(this.optimisationSensors);
    this.optimisationSensors = null;
    this.viewingSensorPlacement = false;
    this.setQueryDefaults();
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

cancelOptimisationRun() {
    console.log('cancel job');
    this.resetJob();
    this.webSocket.deleteJob(this.jobID);


}
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
  clearSensorPlacementResults() {
    // todo clear markers

    this.viewingSensorPlacement = false;
  }

  plotOptimisationSensors(sensors) {

    // create marker cluster group for close icons
    this.optimisationSensors = L.markerClusterGroup({
      iconCreateFunction(cluster) {
        return L.divIcon({
          className: 'sensorCluster',
          html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
        });
      },
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      maxClusterRadius: 60
    });

    this.viewingSensorPlacement = true;
    const sensorPositions = [];
    sensors.forEach((sensor) => {
      const x = sensor.x;
      const y = sensor.y;
      const latlng = this.convertFromBNGProjection(x, y);
      const position = L.latLng([latlng[0], latlng[1]]);
      sensorPositions.push(position);

      // plot markers
      // const draggableMarker = L.marker(position, {icon: this.markerIcon, draggable: true});
      // draggableMarker.addTo(this.map);
      const marker = L.marker(position, {icon: this.sensorMarker });
      // marker.addTo(this.map);

      this.optimisationSensors.addLayer(marker);
    });

    this.map.addLayer(this.optimisationSensors);
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
      if (this.map.hasLayer(this.IMDDataNcl)) {
        this.map.removeLayer(this.IMDDataNcl);
        this.map.addLayer(this.IMDDataGates);
      }
      if (this.map.hasLayer(this.IMDDataNcl)) {
        this.map.removeLayer(this.IMDDataNcl);
        this.map.addLayer(this.IMDDataGates);
      }
    }

    // if changing to newcastle, bring over any selected gateshead layers
    else if (la === 'ncl') {
      // todo keep adding layers here
      if (this.map.hasLayer(this.IMDDataGates)) {
        this.map.removeLayer(this.IMDDataGates);
        this.map.addLayer(this.IMDDataNcl);
      }
      if (this.map.hasLayer(this.IMDDataGates)) {
        this.map.removeLayer(this.IMDDataGates);
        this.map.addLayer(this.IMDDataNcl);
      }
    }
    this.localAuthority = la;

    // move to centre
    this.map.panTo(this.getLACentre(this.localAuthority));
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
