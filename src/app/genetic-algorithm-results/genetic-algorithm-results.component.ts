import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import * as Highcharts from 'highcharts';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
  selector: 'app-genetic-algorithm-results',
  templateUrl: './genetic-algorithm-results.component.html',
  styleUrls: ['./genetic-algorithm-results.component.scss']
})
export class GeneticAlgorithmResultsComponent implements OnInit {
  @Input() queryChoices;

  // for testing replace line above with:
  // queryChoices = {sensorNumber: 30, objectives: ['Workers', 'Total Residents', 'Residents under 16', 'Residents over 65'], theta: 100};

  @Output() outputAreasToPlot = new EventEmitter();
  @Output() geneticResultsReady = new EventEmitter();
  @Output() errorHandler = new EventEmitter();

  savedNetworks;

  defaultColour = 'rgb(47,126,216, 0.5)';
  highlightIndividualPointColour = 'red';
  selectedGroupColour = 'rgb(98,0,234, 0.8)';
  colors = Highcharts.getOptions().colors;

  chartOptions: Highcharts.Options;

  showGraph;

  updateChart = false;

  dataLoaded = false;

  // keep track of the selected point so don't need to iterate over all of them to reset colour
  selectedPointId;
  selectedGroupPointsIds = [];


  // filter networks by a lower threshold for an objective
  filterObjective;
  filterThreshold;

  lowestCoverage;

  message;

  Highcharts: typeof Highcharts = Highcharts;
  // @ts-ignore


  successfullyLoadedJson = true;

  objectivesWithIndexes = [];

  // use view child to access expansion panel open and close methods
  @ViewChild('expansionPanel') expansionPanel: MatExpansionPanel;

  constructor() { }

  ngOnInit(): void {
    // only include for testing
    // this.createGraph();

    // set defaults for filtering
    this.filterObjective = 'No';
    this.filterThreshold = 0.3;



  }

  reset() {
    this.filterObjective = 'No';
    this.filterThreshold = 0.3;
    this.objectivesWithIndexes = [];
    this.selectedGroupPointsIds = [];

    // if (Highcharts.charts[0]) {
    //   while (Highcharts.charts[0].series.length) {
    //     Highcharts.charts[0].series[0].remove(false);
    //   }
    // }

  }


  // function triggered my parent map component when user submits query
  createGraph(choices) {
    this.successfullyLoadedJson = true;
    this.queryChoices = choices;
    console.log(this.queryChoices);
    this.reset();

    // try to load json, any problems, do not proceed
    this.getData().then((successful) => {
      if (successful) {
        this.updateChartOptions();
        this.openExpansionPanel();
        // let parent know to display
        this.geneticResultsReady.emit(true);
      }

    });




  }

  sendError(error) {
    this.errorHandler.emit('Cannot plot networks due to error: ' + error);
  }

  async getData() {
    // generate filename from query choices
    try {
      // convert LA shorthand to longhand
      let la;
      if (this.queryChoices.localAuthority === 'ncl') {
        la = 'Newcastle';
      } else {
        la = 'Gateshead';
      }

      const filename = la + '/theta_' + this.queryChoices.theta + '_nsensors_' +
        this.queryChoices.sensorNumber + '.json';

      await import('../../assets/networks/' + filename).then(data => {
        // read in data and create categories needed for chart
this.savedNetworks = data;
        // assign each chosen objective an index as per the returned network json
        const objectivesFromAlgorithm = data.objectives;
        this.queryChoices.objectives.forEach((chosenObj) => {
          const indexFromJSON = this.caseInsensitiveFindIndex(objectivesFromAlgorithm, chosenObj);
          this.objectivesWithIndexes.push({text: chosenObj, objectiveIndex: indexFromJSON});
        });
      });
      return true;
    }
    catch (error) {
      this.successfullyLoadedJson = false;
      console.log('Cannot plot networks due to error: ' + error);
      this.sendError(error);
      return false;
    }





  }

  caseInsensitiveFindIndex(arr, q) {
    // convert to format used in json to allow comparison
    if (q === 'Total Residents') {
      q = 'pop_total';
    } else if (q === 'Residents under 16') {
      q = 'pop_children';
    } else if (q === 'Residents over 65') {
      q = 'pop_elderly';
    } else {
      q = 'workplace';
    }
    return arr.findIndex(item =>  q === item );
  }


  updateChartOptions() {
    const objectiveList = [];
    this.objectivesWithIndexes.forEach((obj) => {
      objectiveList.push(obj.text);
    });

    const seriesList = this.createSeriesForChartOptions();
    if (seriesList.length > 0) {
      this.chartOptions = {
        chart: {
          type: 'scatter',
          animation: false
        },

        tooltip: {
          enabled: false
        },

        // colors: this.colors,

        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          categories: objectiveList
        },
        yAxis: {
          title: {
            text: 'Coverage'
          }
        },
        plotOptions: {
          scatter: {
            showInLegend: false,
            jitter: {
              x: 0.24,
              y: 0
            },
            marker: {
              radius: 2,
              symbol: 'circle'
            }
          },
          series: {
            cursor: 'pointer',
            states: {
              inactive: {
                opacity: 1
              }
            },
            allowPointSelect: true,
            events: {
              click: e => {
                // prevent default highlighting on click
                e.preventDefault();
                // @ts-ignore
                this.highlightPointsInOtherSeries(e.point.network);
              },
              mouseOver: e => {
                // default behaviour is to highlight current point but we want to also hghlight points from
                // other series
                // e.preventDefault();
                // this.highlightPointsInOtherSeries(e.point.network);

              }
            }
          }
        },
        series: seriesList
      };

      this.updateChart = true;

      this.showGraph = true;
    }
  }

  // todo add error handling throughout these methods

  // get list of OA codes for a particular network
  getNetwork(networkIndex) {
    return this.convertOAIndicesListToOACodeList(this.getOAIndicesForNetwork(networkIndex));
  }

  // each row in sensors table represents a list of the OA indices for each network. Currently has decimal place (.0) so
  // remove that before returning so can use as index
  getOAIndicesForNetwork(networkIndex) {
    const floatingPointList = this.savedNetworks.sensors[networkIndex];
    const integerList = [];
    floatingPointList.forEach((num) => {
      integerList.push(Math.floor(num));
    });
    return integerList;
  }

  // for each OA indices look up full OA code from oa11cd list
  convertOAIndicesListToOACodeList(oaIndices) {
    const oaCodes = [];
    oaIndices.forEach((i) => {
      oaCodes.push(this.savedNetworks.oa11cd[i]);
    });
    return oaCodes;
  }


createSeriesForChartOptions() {
    const seriesList = [];
  // keep track of lowest coverage and use this to be minimum for filtering
  let lowestCoverage = 1;


  // there is a series per objective. Each series uses the x coordinate as the objective index (this is what the jitter acts upon)
  for (let i = 0; i < this.objectivesWithIndexes.length; i++) {
    // get data list of y coordinates (i.e. coverage of each network)
    // for each entry (row) in network.coverage, get the nth element (column) to get coverage where n is the objective index.

    const yList = [];
console.log(this.savedNetworks)
    this.savedNetworks.obj_coverage.forEach((row) => {
      yList.push(row[this.objectivesWithIndexes[i].objectiveIndex]);
      if (row[this.objectivesWithIndexes[i].objectiveIndex] < lowestCoverage) {
        lowestCoverage = row[this.objectivesWithIndexes[i].objectiveIndex];
      }
    });

    const data = [];

    // keep track of the coverage index (i.e. network) so know which points match up between series
    for (let j = 0; j < yList.length; j++) {

      data.push({x: i, y: yList[j], network: j});

    }

    // // remove any entries where y is below the user's chosen lower acceptable coverage
    // // iterate backwards so can remove item from array as iterating over it
    // for (let index = data.length - 1; index >= 0; index--) {
    //   if (data[index].y < this.queryChoices.acceptableCoverage) {
    //     // coverage is too low
    //     console.log(data[index].y);
    //     data.splice(data.indexOf(data[index]), 1);
    //
    //   }
    // }

    seriesList.push({
      type: 'scatter',
      name: this.objectivesWithIndexes[i].text,
      data,
      color: this.defaultColour
    });

    // keep track of which objective is displayed in what order
    this.objectivesWithIndexes[i].xAxisPosition = i;
  }

  // set filtering to start at lowest coverage
  this.filterThreshold = Math.floor(lowestCoverage);
  this.lowestCoverage = lowestCoverage;

  return seriesList;
}


  highlightPointsInOtherSeries(networkId) {
    let resetColour = this.defaultColour;
    if (this.selectedGroupPointsIds.indexOf(networkId) !== -1) {
      // point is in group so should be purple
      resetColour = this.selectedGroupColour;
    }

// for each series
    for (let i = 0; i <  this.Highcharts.charts[0].series.length; i++) {
      // clear currently selected points or change to purple if in highlighted group
      if (this.selectedPointId  !== undefined) {
        this.Highcharts.charts[0].series[i].data[this.selectedPointId].update({
          marker: {
            fillColor: resetColour,
            radius: 2
          }
        }, false);
      }

      // highlight new selection
      this.Highcharts.charts[0].series[i].data[networkId].setState('select');
      this.Highcharts.charts[0].series[i].data[networkId].update({
        marker: {
          fillColor: this.highlightIndividualPointColour,
          lineColor: this.highlightIndividualPointColour,
          radius: 4
        }
      }, false);
    }
    this.Highcharts.charts[0].redraw();
    // update current selected point
    this.selectedPointId = networkId;

  }

  getSeriesIndexOfSeries(objective) {
    let position = 0;
    for (let i = 0; i < this.objectivesWithIndexes.length; i++) {
      if (this.objectivesWithIndexes[i].text === objective) {
       position = this.objectivesWithIndexes[i].xAxisPosition;
       break;
      }
    }
    return position;
  }



  // select a lower number for a particular series and highlight all above this number across all series
  selectGroupPoints() {
 const start = performance.now()
    // reset all points
    this.clearGroup();

// todo if coverage is the coverage lowest either highlight all or highlight none?
    if (this.filterObjective !== 'No') {


      // get x axis position of the series belonging to the selected objective
      const seriesSelected = this.getSeriesIndexOfSeries(this.filterObjective);

      // get IDS of all placements above the lower point in selected scenario and change colour of points
      // across all series. Leave highlight on selected point as it is.
      const selectedSeriesIDS = [];
      this.Highcharts.charts[0].series[seriesSelected].data.forEach((point) => {
        // @ts-ignore
        if (point.network !== this.selectedPointId && point.y >= this.filterThreshold) {
          // @ts-ignore
          selectedSeriesIDS.push(point.network);
          for (let i = 0; i < this.Highcharts.charts[0].series.length; i++) {
            // @ts-ignore
            this.Highcharts.charts[0].series[i].data[point.network].update({
              marker: {
                fillColor: this.selectedGroupColour
              }
            }, false );

          }

        }
      });

      this.Highcharts.charts[0].redraw();
      this.selectedGroupPointsIds = selectedSeriesIDS;
    }

  }

  clearGroup() {
    // reset all points, leaving any selected point red
    this.selectedGroupPointsIds.forEach((id) => {

      // leave selected point
      if (id !== this.selectedPointId) {
        // for each of the  series
        for (let i = 0; i < this.Highcharts.charts[0].series.length; i++) {
          this.Highcharts.charts[0].series[i].data[id].update({
            marker: {
              fillColor: this.defaultColour
            }
          }, false);
        }
      }

    });
  this.Highcharts.charts[0].redraw();
    this.selectedGroupPointsIds = [];
  }

  getTestData(x) {
    let data = [],
      off = 0.2 + 0.2 * Math.random(),
      i;
    for (i = 0; i < 50; i++) {
      data.push({x, y: off + (Math.random() - 0.5) * (Math.random() - 0.5), id: i});
    }

    return data;
  }

  roundDown(num) {
    return Math.floor(num);
  }

  viewNetworkOnMap() {
    // @ts-ignore
    const outputAreas = this.getNetwork(this.selectedPointId);
  // send output areas to map component to plot
    this.outputAreasToPlot.emit(outputAreas);
  }

  closeExpansionPanel() {
    this.expansionPanel.close();
  }
  openExpansionPanel() {
    this.expansionPanel.open();
  }


}
