import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-greedy-algorithm-configuration',
  templateUrl: './greedy-algorithm-configuration.component.html',
  styleUrls: ['./greedy-algorithm-configuration.component.scss']
})
export class GreedyAlgorithmConfigurationComponent implements OnInit {
  testScenarioLoading = false;

  sampleScenarioShowing = false;

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
  thetaMinAllowed = 500;
  jobID = null;
  viewingSensorPlacement = false;

  // optimisation query options and values
// sliders
  ageLow = 20;
  ageHigh = 70;
  placeLow = 20;

  optimisationOutputCoverageLayer;
  optimisationSensors;

  outputAreaCoverageLegend = [
    {title: '0-0.2', colour: '#FFFFEB'},
    {title: '0.2-0.4', colour: '#c2d2b0'},
    {title: '0.4-0.6', colour: '#D8F0B6'},
    {title: '0.6-0.8', colour: '#8AC48A'},
    {title: '0.8-1', colour: '#43765E'}
  ];
  outputAreaCoverageLayer;
  totalCoverage;


  websocketSubscription;


  constructor() { }

  ngOnInit(): void {
  }

  // ----- Optimisation query
  submitQuery() {
    // // todo check all values are viable
    //
    // // workplace and resident weighting need to be translated from /100 to being /1
    // this.populationWeight = this.placeLow / 10;
    //
    // // set workplace weight using population weight
    // this.workplaceWeight = parseFloat((1 - this.populationWeight).toFixed(1));
    //
    // // set min and max age, allowing that user might have reversed order of sliders
    // if (this.ageLow > this.ageHigh) {
    //   this.minAge = this.ageHigh;
    //   this.maxAge = this.ageLow;
    // } else {
    //   this.minAge = this.ageLow;
    //   this.maxAge = this.ageHigh;
    // }
    //
    // const query = {
    //   n_sensors: this.nSensors,
    //   theta: this.theta,
    //   min_age: this.minAge,
    //   max_age: this.maxAge,
    //   population_weight: this.populationWeight,
    //   workplace_weight: this.workplaceWeight
    // };
    // console.log('Query to submit: ');
    // console.log(query);
    // console.log('before submitting the job ID is ' + this.jobID);
    //
    // this.jobInProgress = true;
    // this.jobProgressPercent = 0;
    //
    // // todo check all are present
    // // todo error handling to mark incomplete entries
    //
    // // todo handle if can't connect to websocket or loose connection mid run
    //
    // this.websocketSubscription = this.webSocket.setupSocketConnection(query)
    //   .subscribe(
    //     (data: any = {}) => {
    //       // todo listen for observer error and act accordingly
    //
    //       if (data.type) {
    //         // if job ID has not been set yet, listen for job message, otherwise listen for progress and finish
    //         if (this.jobID === null) {
    //           if (data.type === 'job') {
    //             // check for errors
    //             if (data.payload.code === 400) {
    //               // todo cancel run and show error
    //               console.log(data.payload.message);
    //             } else {
    //               console.log('get ID from message ' + data.payload);
    //               // todo might need to update server so that the client gets an ID upon connection to verify this is the job that belongs to it
    //               this.jobID = data.payload.job_id;
    //               console.log('job ID has been set as ' + data.payload.job_id);
    //             }
    //
    //
    //           }
    //         } else {
    //
    //
    //           // Job in progress
    //           if (data.type === 'jobProgress') {
    //
    //             // check if the job is ours otherwise ignore
    //             if (data.payload.job_id === this.jobID) {
    //               //  console.log('picked up update for ' + data.payload.job_id);
    //               this.jobInProgress = true;
    //               this.jobProgressPercent = data.payload.progress.toFixed(2);
    //             } else {
    //               // console.log('picked up update for another client ' + data.payload.job_id);
    //             }
    //           }
    //           // Job finished
    //           else if (data.type === 'jobFinished') {
    //             // check if job ID is ours else ignore
    //             if (data.payload.job_id === this.jobID) {
    //
    //               // console.log('Job: ' + data.payload.job_id + ' finished');
    //               const pay = data.payload;
    //               const progress = pay.progress;
    //               if (progress === 100) {
    //                 const jobId = pay.job_id;
    //                 const result = pay.result;
    //                 const coverageHistory = result.coverage_history;
    //                 const oaCoverage = result.oa_coverage;
    //                 const placementHistory = result.placement_history;
    //                 const popAgeGroups = result.pop_age_groups;
    //                 const popChildren = popAgeGroups.pop_children;
    //                 const popElderly = popAgeGroups.pop_elderly;
    //                 const popTotal = popAgeGroups.pop_total;
    //                 const popWeight = result.population_weight;
    //                 const workplaceWeight = result.workplace_weight;
    //                 const theta = result.theta;
    //                 const nSensors = result.n_sensors;
    //                 this.totalCoverage = result.total_coverage;
    //                 const sensors = result.sensors;
    //
    //                 // todo create geojsn from oaCoverage
    //
    //                 console.log(result);
    //                 this.jobID = null;
    //                 this.plotOptimisationSensors(sensors, oaCoverage, 'real');
    //
    //
    //               }
    //               // pop_children: {min: 0, max: 16, weight: 0}
    //               // pop_elderly: {min: 70, max: 90, weight: 0}
    //               // pop_total: {min: 0, max: 90, weight: 1}
    //
    //               // sensors: Array(13)
    //               // 0:
    //               // oa11cd: "E00042646"
    //               // x: 425597.7300000005
    //               // y: 565059.9069999997
    //
    //               // oa_coverage: Array(952)
    //               //   [0 … 99]
    //               // 0:
    //               // coverage: 0.0000034260432153301947
    //               // oa11cd: "E00139797"
    //             } else {
    //               // todo job has failed?
    //             }
    //           }
    //         }
    //       }
    //
    //     }, error => {
    //       console.log('component picked up error from observer: ' + error);
    //       // todo currently snackbar won't close so come up with better solution
    //       // this.zone.run(() => {
    //       //   this.snackBar.open("Oh no! We've encountered an error from the server. Please try again.", 'x', {
    //       //     duration: 500,
    //       //     horizontalPosition: 'center',
    //       //     verticalPosition: 'top'
    //       //   });
    //       // });
    //       this.resetJob();
    //     }
    //   );

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

  }
// todo update map references now in speerate component
  resetJob() {
  //   this.jobInProgress = false;
  //   this.jobProgressPercent = 0;
  //   this.jobID = null;
  //   this.websocketSubscription.unsubscribe();
  //   this.map.removeLayer(this.optimisationSensors);
  //   this.optimisationSensors = null;
  //   this.viewingSensorPlacement = false;
  //   // sample placement
  //   this.sampleScenarioShowing = false;
  //   this.setQueryDefaults();
  //   this.clearOptimisation();
  // }
  //
  // toggleOptimisationOACoverage() {
  //
  //   // if on, turn off
  //   if (this.map.hasLayer(this.optimisationOutputCoverageLayer)) {
  //     this.map.removeLayer(this.optimisationOutputCoverageLayer);
  //   }
  //
  //   // if off, turn on
  //   else {
  //     this.map.addLayer(this.optimisationOutputCoverageLayer);
  //   }
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

  // cancelOptimisationRun() {
  //   console.log('cancel job');
  //   this.resetJob();
  //   this.webSocket.deleteJob(this.jobID);
  //
  //
  // }

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

        item.title = firstNum.toFixed(2) + '-' + secondNum.toFixed(2);
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
// todo update since moving to seperate component
  async plotOptimisationSensors(sensors, oaCoverage, scenario) {
//     // clear any previous optimisation
//     this.clearOptimisation();
//
//     // is this a sample scenario?
//     if (scenario === 'sample') {
//       this.sampleScenarioShowing = true;
//     }
//
//
//     // get data for all output areas
//     const oas = {};
//
//     for (const sensor of sensors) {
//       const oa = sensor.oa11cd;
//       const data = await this.databaseService.getData('oa=' + oa);
//       oas[oa] = data;
//     }
//
//     // create marker cluster group for close icons
//     this.optimisationSensors = L.markerClusterGroup({
//       iconCreateFunction(cluster) {
//         return L.divIcon({
//           className: 'sensorCluster',
//           html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
//         });
//       },
//       showCoverageOnHover: false,
//       spiderfyOnMaxZoom: false,
//       maxClusterRadius: 60
//     });
//
//     this.viewingSensorPlacement = true;
//     const sensorPositions = [];
//     for (const sensor of sensors) {
//       const x = sensor.x;
//       const y = sensor.y;
//       const oa = sensor.oa11cd;
//       const data = oas[oa];
//
// // todo summarise OA age data
//
//       const disabledPerRounded = parseFloat(data.lsoaData.d_limited_).toFixed(2);
//
//       const popupContent = 'Output Area <br> ' +
//         'Population: ' + data.oaData.population +
//         ', Workers: ' + data.oaData.workers + '<br><br>' +
//
//         'LSOA<br>' +
//         'Population: ' + data.lsoaData.allpersons +
//         ', % Disabled: ' + disabledPerRounded +
//         ', IMD decile: ' + data.lsoaData.imd_decile;
//       const latlng = this.convertFromBNGProjection(x, y);
//       const position = L.latLng([latlng[0], latlng[1]]);
//       sensorPositions.push(position);
//
//       // plot markers
//       // const draggableMarker = L.marker(position, {icon: this.markerIcon, draggable: true});
//       // draggableMarker.addTo(this.map);
//       const marker = L.marker(position, {icon: this.sensorMarker});
//       marker.bindPopup(popupContent);
//       // marker.addTo(this.map);
//
//       this.optimisationSensors.addLayer(marker);
//     }
//
//     this.map.addLayer(this.optimisationSensors);
//
//     this.createOptimisationOACoverageLayer(oaCoverage);
//     this.jobInProgress = false;
//     this.jobProgressPercent = 0;

  }
// todo update now in separate component
  // clear sensors placement and OA coverage
  clearOptimisation() {
  //   this.viewingSensorPlacement = false;
  //   this.sampleScenarioShowing = false;
  //
  //   if (this.map.hasLayer(this.optimisationOutputCoverageLayer)) {
  //     this.map.removeLayer(this.optimisationOutputCoverageLayer);
  //   }
  //
  //   if (this.map.hasLayer(this.optimisationSensors)) {
  //     this.map.removeLayer(this.optimisationSensors);
  //   }
   }

  createOptimisationOACoverageLayer(coverageList) {
    // get basic oa layer

    // if (this.localAuthority === 'ncl') {
    //   this.optimisationOutputCoverageLayer = this.oaNcl;
    // } else {
    //   this.optimisationOutputCoverageLayer = this.oaGates;
    // }
    //
    // // set style to colour each feature depending on the coverage
    // this.optimisationOutputCoverageLayer.eachLayer(async (featureInstanceLayer) => {
    //   const code = featureInstanceLayer.feature.properties.code;
    //   // get coverage
    //   let coverage;
    //   let foundCoverage = false;
    //   coverageList.forEach((c) => {
    //     if (foundCoverage === false) {
    //       if (c.oa11cd === code) {
    //         coverage = c.coverage;
    //         foundCoverage = true;
    //       }
    //     }
    //   });
    //
    //   // get colour
    //   const colour = await this.getOACoverageColour(coverage);
    //
    //   featureInstanceLayer.setStyle({
    //     fill: true,
    //     fillColor: colour,
    //     fillOpacity: 0.8,
    //     stroke: false
    //   });
    // });
    //
    // console.log('optimisation coverage layer created: ');
    // console.log(this.optimisationOutputCoverageLayer);
    //
    // // if test scenario, mark as loaded
    // this.testScenarioLoading = false;
    //
    // this.optimisationOutputCoverageLayer.addTo(this.map);
  }

  getOACoverageColour(coverage) {
    if (coverage >= 0.8) {
      return '#43765E';
    } else if (coverage >= 0.6) {
      return '#8AC48A';
    } else if (coverage >= 0.4) {
      return '#D8F0B6';
    } else if (coverage >= 0.2) {
      return '#F3FAC4';
    } else {
      return '#FFFFEB';
    }

  }

}
