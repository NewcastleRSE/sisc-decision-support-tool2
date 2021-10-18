import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GeoserverService} from '../geoserver.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {HelpTextInfoDialogComponent} from '../help-text-info-dialog/help-text-info-dialog.component';
import {LatLng} from 'leaflet';

@Component({
  selector: 'app-data-layers',
  templateUrl: './data-layers.component.html',
  styleUrls: ['./data-layers.component.scss']
})
export class DataLayersComponent implements OnInit {

  @Input() map;

  @Output() loadedData = new EventEmitter();

  @Output() oaDataLoaded = new EventEmitter();

  // data


  // disability
  disabilityDataNcl;
  disabilityDataGates;
  disabilityDataLegend;
  disabilityDataVisible = false;
  disabilityDataReady = false;

  // IMD
  IMDDataVisible = false;
  IMDDataNcl;
  IMDDataGates;
  IMDLegend;
  IMDDataReady = false;

  //  to space syntax
  toSSDataVisible = false;
  toSSDataNcl;
  toSSDataGates;
  toSSLegend;
  toSSDataReady = false;

  //  through space syntax
  throughSSDataVisible = false;
  throughSSDataNcl;
  throughSSDataGates;
  throughSSLegend;
  throughSSDataReady = false;

  // Urban Observatory sensors
  uoDataVisible = false;
  uoLegend = [
    {title: 'NO2', colour: '#215a8f'},
    {title: 'PM2.5', colour: '#5886a5'},
    {title: 'PM10', colour: '#9dc6e0'}
  ];
  uoDataNcl;
  uoDataGates;
  uoDataReady = false;

  // Output areas
  oaNcl;
  oaGates;
  oaDataVisible;
  oaDataReady = false;

  // OA code with centroids x and y coordinates
  centroidsNcl;
  centroidsGates;

  // schools
  schoolsDataNcl;
  schoolsDataReady = false;
  schoolsDataVisible = false;
  schoolsDataGates;

// age and people layers
  ageDataVisible;
  ageDataReady = false;
  ageData1Ncl; // under 18
  ageData2Ncl; // 18-64
  ageData3Ncl; // 64+
  ageData1Gates; // under 18
  ageData2Gates; // 18-64
  ageData3Gates; // 64+
  ageData1Visible;
  ageData2Visible;
  ageData3Visible;
  showAgeChoices = false;
  ageDataLegend;
  populationDataNcl;
  workersDataNcl;
  populationDataGates;
  workersDataGates;
  populationDataVisible;
  workersDataVisible;

  // ethnicity
  whiteDataNcl;
  whiteDataGates;
  mixedEthnicityDataNcl;
  mixedEthnicityDataGates;
  asianDataNcl;
  asianDataGates;
  blackDataNcl;
  blackDataGates;
  otherEthnicityDataNcl;
  otherEthnicityDataGates;
  ethnicityDataReady = false;
  ethnicityLegend;
  whiteDataVisible = false;
  mixedEthnicityDataVisible = false;
  asianDataVisible = false;
  blackDataVisible = false;
  otherEthnicityDataVisible = false;

  @Input() localAuthority;

  constructor(private geoserver: GeoserverService,  private matDialog: MatDialog) {
  }

  ngOnInit(): void {
    console.log('child loading')
    this.createDataLayers();
  }


  // ----- Create data layers
  createDataLayers() {
    const startDataCreation = performance.now();
    const t1 = performance.now();
    this.geoserver.getDisabilityLayers().then((results) => {
      this.disabilityDataNcl = results.ncl;
      this.disabilityDataGates = results.gates;
      this.disabilityDataLegend = results.legend;
      this.disabilityDataReady = true;

      const t2 = performance.now();
      this.geoserver.createToSSDataLayer().then((toSS) => {
        this.toSSDataNcl = toSS.ncl;
        this.toSSDataGates = toSS.gates;
        this.toSSLegend = toSS.legend;
        this.toSSDataReady = true;

        const t3 = performance.now();
        this.geoserver.createIMDLayers().then((imd) => {
          this.IMDDataNcl = imd.ncl;
          this.IMDDataGates = imd.gates;
          this.IMDLegend = imd.legend;
          this.IMDDataReady = true;

          const t4 = performance.now();
          this.geoserver.createThroughSSDataLayer().then((throughSS) => {
            this.throughSSDataNcl = throughSS.ncl;
            this.throughSSDataGates = throughSS.gates;
            this.throughSSLegend = throughSS.legend;
            this.throughSSDataReady = true;

            const t5 = performance.now();
            this.geoserver.createAgeAndPeopleLayers().then((age) => {
              this.ageData1Ncl = age.age1Ncl;
              this.ageData2Ncl = age.age2Ncl;
              this.ageData3Ncl = age.age2Ncl;

              this.ageData1Gates = age.age1Gates;
              this.ageData2Gates = age.age1Gates;
              this.ageData3Gates = age.age1Gates;

              this.ageDataLegend = age.ageLegend;

              this.populationDataNcl = age.popNcl;
              this.populationDataGates = age.popGates;

              this.workersDataGates = age.workGates;
              this.workersDataNcl = age.workNcl;

              this.ageDataReady = true;

              const t6 = performance.now();
              this.geoserver.createUOLayer().then((uo) => {
                this.uoDataNcl = uo.ncl;
                this.uoDataGates = uo.gates;
                this.uoDataReady = true;

                const t7 = performance.now();
                this.geoserver.createOALayer().then((oa) => {
                  this.oaNcl = oa.ncl.geojson;
                  this.oaGates = oa.gates.geojson;
                  this.centroidsNcl = oa.ncl.centroids;
                  this.centroidsGates = oa.gates.centroids;
                  this.oaDataReady = true;

                  // send to parent component to use when loading coverage maps
                  this.oaDataLoaded.emit({ncl: oa.ncl, gates: oa.gates});

                  const t8 = performance.now();
                  this.geoserver.createSchoolsLayers().then((sc) => {
                    this.schoolsDataNcl = sc.ncl;
                    this.schoolsDataGates = sc.gates;
                    this.schoolsDataReady = true;

                    this.geoserver.createEthnicityLayers().then((eth) => {
                      this.whiteDataNcl = eth.whiteNcl;
                      this.whiteDataGates = eth.whiteGates;
                      this.mixedEthnicityDataNcl = eth.mixedNcl;
                      this.mixedEthnicityDataGates = eth.mixedGates;
                      this.asianDataNcl = eth.asianNcl;
                      this.asianDataGates = eth.asianGates;
                      this.blackDataNcl = eth.blackNcl;
                      this.blackDataGates = eth.blackGates;
                      this.otherEthnicityDataNcl = eth.otherNcl;
                      this.otherEthnicityDataGates = eth.otherGates;
                      this.ethnicityLegend = eth.legend;
                      this.ethnicityDataReady = true;

                      console.log('all data layers done');
                      // close spinner overlay
                      // this.spinnerOverlay.close();
                      // todo pass to parent to say everything has loaded so close spinner and open info
                      // open info dialog
                     // this.openInfo();
                      console.log('child emit ready event')
                      this.loadedData.emit('loaded');
                    });


                  });
                });
              });
            });
          });
        });
      });
    });
  }

  // ----- Data layer information

  dataInfo(topic) {


    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '450px';
    dialogConfig.data = {
      topic
    };

    const dialogRef = this.matDialog.open(HelpTextInfoDialogComponent, dialogConfig);
  }

  // ------ Data layer toggles


  // toggleDataLayersChips() {
  //   this.dataLayersChipsVisible = !this.dataLayersChipsVisible;
  // }

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

  toggleWhiteEthnicity() {

    // if on, turn off
    if (this.whiteDataVisible) {
      this.whiteDataVisible = false;
      this.clearWhiteEthnicity();
    }

    // if off, turn on
    else {
      this.clearEthnicityLayers();
      this.whiteDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.whiteDataNcl.addTo(this.map);
      } else {
        this.whiteDataGates.addTo(this.map);
      }

    }
  }

  toggleMixedEthnicity() {

    // if on, turn off
    if (this.mixedEthnicityDataVisible) {
      this.mixedEthnicityDataVisible = false;
      this.clearMixedEthnicity();
    }

    // if off, turn on
    else {
      this.clearEthnicityLayers();
      this.mixedEthnicityDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.mixedEthnicityDataNcl.addTo(this.map);
      } else {
        this.mixedEthnicityDataGates.addTo(this.map);
      }

    }
  }

  toggleAsianEthnicity() {

    // if on, turn off
    if (this.asianDataVisible) {
      this.asianDataVisible = false;
      this.clearAsianEthnicity();
    }

    // if off, turn on
    else {
      this.clearEthnicityLayers();
      this.asianDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.asianDataNcl.addTo(this.map);
      } else {
        this.mixedEthnicityDataGates.addTo(this.map);
      }

    }
  }
  toggleBlackEthnicity() {

    // if on, turn off
    if (this.blackDataVisible) {
      this.blackDataVisible = false;
      this.clearBlackEthnicity();
    }

    // if off, turn on
    else {
      this.clearEthnicityLayers();
      this.blackDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.blackDataNcl.addTo(this.map);
      } else {
        this.blackDataGates.addTo(this.map);
      }

    }
  }

  toggleOtherEthnicity() {

    // if on, turn off
    if (this.otherEthnicityDataVisible) {
      this.otherEthnicityDataVisible = false;
      this.clearOtherEthnicity();
    }

    // if off, turn on
    else {
      this.clearEthnicityLayers();
      this.otherEthnicityDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.otherEthnicityDataNcl.addTo(this.map);
      } else {
        this.otherEthnicityDataGates.addTo(this.map);
      }

    }
  }

  toggleAge1() {
    // if on, turn off
    if (this.ageData1Visible) {
      this.ageData1Visible = false;
      this.clearAge1();
    }

    // if off, turn on and turn off either of the other 2 age layers
    else {
      this.clearAllAgesAndPeople();
      this.ageData1Visible = true;
      if (this.localAuthority === 'ncl') {
        this.ageData1Ncl.addTo(this.map);
      } else {
        this.ageData1Gates.addTo(this.map);
      }

    }
  }

  togglePopulation() {
    // if on, turn off
    if (this.populationDataVisible) {
      this.populationDataVisible = false;
      this.clearPopulation();
    }

    // if off, turn on and turn off either of the other 2 age and people layers
    else {
      this.clearAllAgesAndPeople();
      this.populationDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.populationDataNcl.addTo(this.map);
      } else {
        this.populationDataGates.addTo(this.map);
      }

    }
  }

  toggleWorkers() {
    // if on, turn off
    if (this.workersDataVisible) {
      this.workersDataVisible = false;
      this.clearWorkers();
    }

    // if off, turn on and turn off either of the other 2 age and people layers
    else {
      this.clearAllAgesAndPeople();
      this.workersDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.workersDataNcl.addTo(this.map);
      } else {
        this.workersDataGates.addTo(this.map);
      }

    }
  }

  toggleAge2() {
    // if on, turn off
    if (this.ageData2Visible) {
      this.ageData2Visible = false;
      this.clearAge2();
    }

    // if off, turn on
    else {
      this.clearAllAgesAndPeople();
      this.ageData2Visible = true;
      if (this.localAuthority === 'ncl') {
        this.ageData2Ncl.addTo(this.map);
      } else {

        this.ageData2Gates.addTo(this.map);
      }

    }
  }

  toggleAge3() {
    // if on, turn off
    if (this.ageData3Visible) {
      this.ageData3Visible = false;
      this.clearAge3();
    }

    // if off, turn on
    else {
      this.clearAllAgesAndPeople();
      this.ageData3Visible = true;
      if (this.localAuthority === 'ncl') {
        this.ageData3Ncl.addTo(this.map);
      } else {
        this.ageData3Gates.addTo(this.map);
      }

    }
  }

  toggleSchools() {
    // if on, turn off
    if (this.schoolsDataVisible) {
      this.schoolsDataVisible = false;
      this.clearSchoolsLayers();
    }

    // if off, turn on
    else {
      this.schoolsDataVisible = true;
      if (this.localAuthority === 'ncl') {

        this.schoolsDataNcl.addTo(this.map);
        console.log(this.map.hasLayer(this.schoolsDataGates));
      } else {
        this.schoolsDataGates.addTo(this.map);
      }

    }
  }

  toggleOA() {
    // if on, turn off
    if (this.oaDataVisible) {
      this.oaDataVisible = false;
      this.clearOaLayers();
    }

    // if off, turn on
    else {
      this.oaDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.oaNcl.addTo(this.map);
      } else {
        this.oaGates.addTo(this.map);
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

      this.toSSDataVisible = false;
      this.cleartoSSLayers();
    }

    // if off, turn on
    else {

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
      this.throughSSDataVisible = false;
      this.clearThroughSSLayers();
    }

    // if off, turn on
    else {
      this.throughSSDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.throughSSDataNcl.addTo(this.map);
      } else {
        this.throughSSDataGates.addTo(this.map);
      }

    }
  }



  // toggleAge() {
  //   if (this.map.hasLayer(this.ageData)) {
  //     this.map.removeLayer(this.ageData);
  //   } else {
  //     this.ageData.addTo(this.map);
  //   }
  // }

  // clearing data layers
  clearDataLayers() {
    this.clearDisabilityLayers();
    this.clearIMDLayers();
    this.clearUOLayers();
    this.clearOaLayers();
  }

  clearOaLayers() {
    this.oaDataVisible = false;
    if (this.map.hasLayer(this.oaNcl)) {
      this.map.removeLayer(this.oaNcl);
    }
    if (this.map.hasLayer(this.oaGates)) {
      this.map.removeLayer(this.oaGates);
    }
  }

  clearAllAgesAndPeople() {
    this.clearAge1();
    this.clearAge2();
    this.clearAge3();
    this.clearPopulation();
    this.clearWorkers();
  }

  clearEthnicityLayers() {
    this.clearWhiteEthnicity();
    this.clearMixedEthnicity();
    this.clearAsianEthnicity();
    this.clearBlackEthnicity();
    this.clearOtherEthnicity();

  }

  clearWhiteEthnicity() {
    this.whiteDataVisible = false;
    if (this.map.hasLayer(this.whiteDataNcl)) {
      this.map.removeLayer(this.whiteDataNcl);
    }
    if (this.map.hasLayer(this.whiteDataGates)) {
      this.map.removeLayer(this.whiteDataGates);
    }
  }

  clearMixedEthnicity() {
    this.mixedEthnicityDataVisible = false;
    if (this.map.hasLayer(this.mixedEthnicityDataNcl)) {
      this.map.removeLayer(this.mixedEthnicityDataNcl);
    }
    if (this.map.hasLayer(this.mixedEthnicityDataGates)) {
      this.map.removeLayer(this.mixedEthnicityDataGates);
    }
  }

  clearAsianEthnicity() {
    this.asianDataVisible = false;
    if (this.map.hasLayer(this.asianDataNcl)) {
      this.map.removeLayer(this.asianDataNcl);
    }
    if (this.map.hasLayer(this.asianDataGates)) {
      this.map.removeLayer(this.asianDataGates);
    }
  }

  clearBlackEthnicity() {
    this.blackDataVisible = false;
    if (this.map.hasLayer(this.blackDataNcl)) {
      this.map.removeLayer(this.blackDataNcl);
    }
    if (this.map.hasLayer(this.blackDataGates)) {
      this.map.removeLayer(this.blackDataGates);
    }
  }

  clearOtherEthnicity() {
    this.otherEthnicityDataVisible = false;
    if (this.map.hasLayer(this.otherEthnicityDataNcl)) {
      this.map.removeLayer(this.otherEthnicityDataNcl);
    }
    if (this.map.hasLayer(this.otherEthnicityDataGates)) {
      this.map.removeLayer(this.otherEthnicityDataGates);
    }
  }

  clearAge1() {
    this.ageData1Visible = false;
    if (this.map.hasLayer(this.ageData1Ncl)) {
      this.map.removeLayer(this.ageData1Ncl);
    }
    if (this.map.hasLayer(this.ageData1Gates)) {
      this.map.removeLayer(this.ageData1Gates);
    }
  }

  clearAge2() {
    this.ageData2Visible = false;
    if (this.map.hasLayer(this.ageData2Ncl)) {
      this.map.removeLayer(this.ageData2Ncl);
    }
    if (this.map.hasLayer(this.ageData2Gates)) {
      this.map.removeLayer(this.ageData2Gates);
    }
  }

  clearAge3() {
    this.ageData3Visible = false;
    if (this.map.hasLayer(this.ageData3Ncl)) {
      this.map.removeLayer(this.ageData3Ncl);
    }
    if (this.map.hasLayer(this.ageData3Gates)) {
      this.map.removeLayer(this.ageData3Gates);
    }
  }

  clearPopulation() {
    this.populationDataVisible = false;
    if (this.map.hasLayer(this.populationDataNcl)) {
      this.map.removeLayer(this.populationDataNcl);
    }
    if (this.map.hasLayer(this.populationDataGates)) {
      this.map.removeLayer(this.populationDataGates);
    }
  }

  clearWorkers() {
    this.workersDataVisible = false;
    if (this.map.hasLayer(this.workersDataNcl)) {
      this.map.removeLayer(this.workersDataNcl);
    }
    if (this.map.hasLayer(this.workersDataGates)) {
      this.map.removeLayer(this.workersDataGates);
    }
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

  clearSchoolsLayers() {
    this.schoolsDataVisible = false;
    if (this.map.hasLayer(this.schoolsDataNcl)) {
      this.map.removeLayer(this.schoolsDataNcl);
    }
    if (this.map.hasLayer(this.schoolsDataGates)) {
      this.map.removeLayer(this.schoolsDataGates);
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

  selectLA(la) {
    // if changing to gates, bring over any selected newcastle layers
    if (la === 'gates') {
      // todo keep adding layers here
      // IMD
      if (this.map.hasLayer(this.IMDDataNcl)) {
        this.map.removeLayer(this.IMDDataNcl);
        this.map.addLayer(this.IMDDataGates);
      }
      if (this.map.hasLayer(this.IMDDataNcl)) {
        this.map.removeLayer(this.IMDDataNcl);
        this.map.addLayer(this.IMDDataGates);
      }

      // Disability
      if (this.map.hasLayer(this.disabilityDataNcl)) {
        this.map.removeLayer(this.disabilityDataNcl);
        this.map.addLayer(this.disabilityDataGates);
      }
      if (this.map.hasLayer(this.disabilityDataNcl)) {
        this.map.removeLayer(this.disabilityDataNcl);
        this.map.addLayer(this.disabilityDataGates);
      }

      // to movement
      if (this.map.hasLayer(this.toSSDataNcl)) {
        this.map.removeLayer(this.toSSDataNcl);
        this.map.addLayer(this.toSSDataGates);
      }
      if (this.map.hasLayer(this.toSSDataNcl)) {
        this.map.removeLayer(this.toSSDataNcl);
        this.map.addLayer(this.toSSDataGates);
      }

      // through movement
      if (this.map.hasLayer(this.throughSSDataNcl)) {
        this.map.removeLayer(this.throughSSDataNcl);
        this.map.addLayer(this.throughSSDataGates);
      }
      if (this.map.hasLayer(this.throughSSDataNcl)) {
        this.map.removeLayer(this.throughSSDataNcl);
        this.map.addLayer(this.throughSSDataGates);
      }

      // UO sensors
      if (this.map.hasLayer(this.uoDataNcl)) {
        this.map.removeLayer(this.uoDataNcl);
        this.map.addLayer(this.uoDataGates);
      }
      if (this.map.hasLayer(this.uoDataNcl)) {
        this.map.removeLayer(this.uoDataNcl);
        this.map.addLayer(this.uoDataGates);
      }

      // output areas
      if (this.map.hasLayer(this.oaNcl)) {
        this.map.removeLayer(this.oaNcl);
        this.map.addLayer(this.oaGates);
      }
      if (this.map.hasLayer(this.oaNcl)) {
        this.map.removeLayer(this.oaNcl);
        this.map.addLayer(this.oaGates);
      }
      // Age group 1
      if (this.map.hasLayer(this.ageData1Ncl)) {
        this.map.removeLayer(this.ageData1Ncl);
        this.map.addLayer(this.ageData1Gates);
      }
      if (this.map.hasLayer(this.ageData1Ncl)) {
        this.map.removeLayer(this.ageData1Ncl);
        this.map.addLayer(this.ageData1Gates);
      }

      // Age group 2
      if (this.map.hasLayer(this.ageData2Ncl)) {
        this.map.removeLayer(this.ageData2Ncl);
        this.map.addLayer(this.ageData2Gates);
      }
      if (this.map.hasLayer(this.ageData2Ncl)) {
        this.map.removeLayer(this.ageData2Ncl);
        this.map.addLayer(this.ageData2Gates);
      }
      // Age group 3
      if (this.map.hasLayer(this.ageData3Ncl)) {
        this.map.removeLayer(this.ageData3Ncl);
        this.map.addLayer(this.ageData3Gates);
      }
      if (this.map.hasLayer(this.ageData3Ncl)) {
        this.map.removeLayer(this.ageData3Ncl);
        this.map.addLayer(this.ageData3Gates);
      }

      // population
      if (this.map.hasLayer(this.populationDataNcl)) {
        this.map.removeLayer(this.populationDataNcl);
        this.map.addLayer(this.populationDataGates);
      }
      if (this.map.hasLayer(this.populationDataNcl)) {
        this.map.removeLayer(this.populationDataNcl);
        this.map.addLayer(this.populationDataGates);
      }

      // workers
      if (this.map.hasLayer(this.workersDataNcl)) {
        this.map.removeLayer(this.workersDataNcl);
        this.map.addLayer(this.workersDataGates);
      }
      if (this.map.hasLayer(this.workersDataNcl)) {
        this.map.removeLayer(this.workersDataNcl);
        this.map.addLayer(this.workersDataGates);
      }

      // Schools
      if (this.map.hasLayer(this.schoolsDataNcl)) {
        this.map.removeLayer(this.schoolsDataNcl);
        this.map.addLayer(this.schoolsDataGates);
      }
      if (this.map.hasLayer(this.schoolsDataNcl)) {
        this.map.removeLayer(this.schoolsDataNcl);
        this.map.addLayer(this.schoolsDataGates);
      }



      // Ethnicity
      if (this.map.hasLayer(this.whiteDataNcl)) {
        this.map.removeLayer(this.whiteDataNcl);
        this.map.addLayer(this.whiteDataGates);
      }
      if (this.map.hasLayer(this.whiteDataNcl)) {
        this.map.removeLayer(this.whiteDataNcl);
        this.map.addLayer(this.whiteDataGates);
      }

      if (this.map.hasLayer(this.mixedEthnicityDataNcl)) {
        this.map.removeLayer(this.mixedEthnicityDataNcl);
        this.map.addLayer(this.mixedEthnicityDataGates);
      }
      if (this.map.hasLayer(this.mixedEthnicityDataNcl)) {
        this.map.removeLayer(this.mixedEthnicityDataNcl);
        this.map.addLayer(this.mixedEthnicityDataGates);
      }

      if (this.map.hasLayer(this.asianDataNcl)) {
        this.map.removeLayer(this.asianDataNcl);
        this.map.addLayer(this.asianDataGates);
      }
      if (this.map.hasLayer(this.asianDataNcl)) {
        this.map.removeLayer(this.asianDataNcl);
        this.map.addLayer(this.asianDataGates);
      }

      if (this.map.hasLayer(this.blackDataNcl)) {
        this.map.removeLayer(this.blackDataNcl);
        this.map.addLayer(this.blackDataGates);
      }
      if (this.map.hasLayer(this.blackDataNcl)) {
        this.map.removeLayer(this.blackDataNcl);
        this.map.addLayer(this.blackDataGates);
      }

      if (this.map.hasLayer(this.otherEthnicityDataNcl)) {
        this.map.removeLayer(this.otherEthnicityDataNcl);
        this.map.addLayer(this.otherEthnicityDataGates);
      }
      if (this.map.hasLayer(this.otherEthnicityDataNcl)) {
        this.map.removeLayer(this.otherEthnicityDataNcl);
        this.map.addLayer(this.otherEthnicityDataGates);
      }


    }
    // if changing to newcastle, bring over any selected gateshead layers
    else if (la === 'ncl') {
      // todo keep adding layers here

      // IMD
      if (this.map.hasLayer(this.IMDDataGates)) {
        this.map.removeLayer(this.IMDDataGates);
        this.map.addLayer(this.IMDDataNcl);
      }
      if (this.map.hasLayer(this.IMDDataGates)) {
        this.map.removeLayer(this.IMDDataGates);
        this.map.addLayer(this.IMDDataNcl);
      }

      // Disability
      if (this.map.hasLayer(this.disabilityDataGates)) {
        this.map.removeLayer(this.disabilityDataGates);
        this.map.addLayer(this.disabilityDataNcl);
      }
      if (this.map.hasLayer(this.disabilityDataGates)) {
        this.map.removeLayer(this.disabilityDataGates);
        this.map.addLayer(this.disabilityDataNcl);
      }

      // to movement
      if (this.map.hasLayer(this.toSSDataGates)) {
        this.map.removeLayer(this.toSSDataGates);
        this.map.addLayer(this.toSSDataNcl);
      }
      if (this.map.hasLayer(this.toSSDataGates)) {
        this.map.removeLayer(this.toSSDataGates);
        this.map.addLayer(this.toSSDataNcl);
      }

      // through movement
      if (this.map.hasLayer(this.throughSSDataGates)) {
        this.map.removeLayer(this.throughSSDataGates);
        this.map.addLayer(this.throughSSDataNcl);
      }
      if (this.map.hasLayer(this.throughSSDataGates)) {
        this.map.removeLayer(this.throughSSDataGates);
        this.map.addLayer(this.throughSSDataNcl);
      }

      // UO sensors
      if (this.map.hasLayer(this.uoDataGates)) {
        this.map.removeLayer(this.uoDataGates);
        this.map.addLayer(this.uoDataNcl);
      }
      if (this.map.hasLayer(this.uoDataGates)) {
        this.map.removeLayer(this.uoDataGates);
        this.map.addLayer(this.uoDataNcl);
      }

      // Age group 1
      if (this.map.hasLayer(this.ageData1Gates)) {
        this.map.removeLayer(this.ageData1Gates);
        this.map.addLayer(this.ageData1Ncl);
      }
      if (this.map.hasLayer(this.ageData1Gates)) {
        this.map.removeLayer(this.ageData1Gates);
        this.map.addLayer(this.ageData1Ncl);
      }

      // Age group 2
      if (this.map.hasLayer(this.ageData2Gates)) {
        this.map.removeLayer(this.ageData2Gates);
        this.map.addLayer(this.ageData2Ncl);
      }
      if (this.map.hasLayer(this.ageData2Gates)) {
        this.map.removeLayer(this.ageData2Gates);
        this.map.addLayer(this.ageData2Ncl);
      }
      // Age group 3
      if (this.map.hasLayer(this.ageData3Gates)) {
        this.map.removeLayer(this.ageData3Gates);
        this.map.addLayer(this.ageData3Ncl);
      }
      if (this.map.hasLayer(this.ageData3Gates)) {
        this.map.removeLayer(this.ageData3Gates);
        this.map.addLayer(this.ageData3Ncl);
      }

      // population
      if (this.map.hasLayer(this.populationDataGates)) {
        this.map.removeLayer(this.populationDataGates);
        this.map.addLayer(this.populationDataNcl);
      }
      if (this.map.hasLayer(this.populationDataGates)) {
        this.map.removeLayer(this.populationDataGates);
        this.map.addLayer(this.populationDataNcl);
      }

      // workers
      if (this.map.hasLayer(this.workersDataGates)) {
        this.map.removeLayer(this.workersDataGates);
        this.map.addLayer(this.workersDataNcl);
      }
      if (this.map.hasLayer(this.workersDataGates)) {
        this.map.removeLayer(this.workersDataGates);
        this.map.addLayer(this.workersDataNcl);
      }


      // output areas
      if (this.map.hasLayer(this.oaGates)) {
        this.map.removeLayer(this.oaGates);
        this.map.addLayer(this.oaNcl);
      }
      if (this.map.hasLayer(this.oaGates)) {
        this.map.removeLayer(this.oaGates);
        this.map.addLayer(this.oaNcl);
      }

      // schools
      if (this.map.hasLayer(this.schoolsDataGates)) {
        this.map.removeLayer(this.schoolsDataGates);
        this.map.addLayer(this.schoolsDataNcl);
      }
      if (this.map.hasLayer(this.schoolsDataGates)) {
        this.map.removeLayer(this.schoolsDataGates);
        this.map.addLayer(this.schoolsDataNcl);
      }

      // Ethnicity
      if (this.map.hasLayer(this.whiteDataGates)) {
        this.map.removeLayer(this.whiteDataGates);
        this.map.addLayer(this.whiteDataNcl);
      }
      if (this.map.hasLayer(this.whiteDataGates)) {
        this.map.removeLayer(this.whiteDataGates);
        this.map.addLayer(this.whiteDataNcl);
      }

      if (this.map.hasLayer(this.mixedEthnicityDataGates)) {
        this.map.removeLayer(this.mixedEthnicityDataGates);
        this.map.addLayer(this.mixedEthnicityDataNcl);
      }
      if (this.map.hasLayer(this.mixedEthnicityDataGates)) {
        this.map.removeLayer(this.mixedEthnicityDataGates);
        this.map.addLayer(this.mixedEthnicityDataNcl);
      }

      if (this.map.hasLayer(this.asianDataGates)) {
        this.map.removeLayer(this.asianDataGates);
        this.map.addLayer(this.asianDataNcl);
      }
      if (this.map.hasLayer(this.asianDataGates)) {
        this.map.removeLayer(this.asianDataGates);
        this.map.addLayer(this.asianDataNcl);
      }


      if (this.map.hasLayer(this.blackDataGates)) {
        this.map.removeLayer(this.blackDataGates);
        this.map.addLayer(this.blackDataNcl);
      }
      if (this.map.hasLayer(this.blackDataGates)) {
        this.map.removeLayer(this.blackDataGates);
        this.map.addLayer(this.blackDataNcl);
      }

      if (this.map.hasLayer(this.otherEthnicityDataGates)) {
        this.map.removeLayer(this.otherEthnicityDataGates);
        this.map.addLayer(this.otherEthnicityDataNcl);
      }
      if (this.map.hasLayer(this.otherEthnicityDataGates)) {
        this.map.removeLayer(this.otherEthnicityDataGates);
        this.map.addLayer(this.otherEthnicityDataNcl);
      }

    }
    this.localAuthority = la;

    // move to centre
    this.map.panTo(this.getLACentre(this.localAuthority));
  }


  // get latlng for map centre for each LA on offer
  getLACentre(LA) {
    if (LA === 'ncl') {
      return new LatLng(55.004518, -1.6635291);
    } else if (LA === 'gates') {
      return new LatLng(54.9527, -1.6635291);
    }
  }
}
