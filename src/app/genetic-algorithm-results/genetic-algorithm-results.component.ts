import {Component, Input, OnInit} from '@angular/core';
import * as Highcharts from 'highcharts';
import networks from '../../assets/geneticNetworks.json';

@Component({
  selector: 'app-genetic-algorithm-results',
  templateUrl: './genetic-algorithm-results.component.html',
  styleUrls: ['./genetic-algorithm-results.component.scss']
})
export class GeneticAlgorithmResultsComponent implements OnInit {
  // @Input() queryChoices;
  // for testing replace line above with:
  queryChoices = {sensorNumber: 30, objectives: ['Workers', 'Total Residents', 'Residents under 16', 'Residents over 65'], theta: 100};

  defaultColour = 'rgb(47,126,216, 0.5)';
  highlightIndividualPointColour = 'red';
  selectedGroupColour = 'rgb(98,0,234, 0.8)';
  colors = Highcharts.getOptions().colors;

  chartOptions: Highcharts.Options;

  showGraph;

  // keep track of the selected point so don't need to iterate over all of them to reset colour
  selectedPointId = 0;
  selectedGroupPointsIds = [];


  // filter networks by a lower threshold for an objective
  filterObjective;
  filterThreshold;

  lowestCoverage;

  message;

  Highcharts: typeof Highcharts = Highcharts;
  // @ts-ignore


  objectivesWithIndexes = [];

  constructor() { }

  ngOnInit(): void {
    // only include for testing
    this.createGraph();

    // set defaults for filtering
    this.filterObjective = 'No';
    this.filterThreshold = 0.3;
  }

  // function triggered my parent map component when user submits query
  createGraph() {
    this.getData();
    this.updateChartOptions();
  }

  // todo only get networks with coverage over user's lower threshold
  getData() {
    // read in data and create categories needed for chart

    // assign each chosen objective an index as per the returned network json
  const objectivesFromAlgorithm = networks.objectives;
  this.queryChoices.objectives.forEach((chosenObj) => {
    const indexFromJSON = this.caseInsensitiveFindIndex(objectivesFromAlgorithm, chosenObj);
    this.objectivesWithIndexes.push({text: chosenObj, objectiveIndex: indexFromJSON});
  });

  }

  caseInsensitiveFindIndex(arr, q) {
    return arr.findIndex(item => q.toLowerCase() === item.toLowerCase());
  }


  updateChartOptions() {
    const objectiveList = [];
    this.objectivesWithIndexes.forEach((obj) => {
     objectiveList.push(obj.text);
    });

    const seriesList = this.createSeriesForChartOptions();

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
              console.log( e.point.category + e.point.network);
              // @ts-ignore
              console.log(this.getNetwork(e.point.network));
              // @ts-ignore
              // todo
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
    this.showGraph = true;
  }

  // todo add error handling throughout these methods

  // todo only get number of sensors user has asked for??
  // get list of OA codes for a particular network
  getNetwork(networkIndex) {
    return this.convertOAIndicesListToOACodeList(this.getOAIndicesForNetwork(networkIndex));
  }

  // each row in sensors table represents a list of the OA indices for each network. Currently has decimal place (.0) so
  // remove that before returning so can use as index
  getOAIndicesForNetwork(networkIndex) {
    const floatingPointList = networks.sensors[networkIndex];
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
      oaCodes.push(networks.oa11cd[i]);
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

      networks.coverage.forEach((row) => {
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
    console.log(lowestCoverage)

    return seriesList;
}

  highlightPointsInOtherSeries(networkId) {
    // for all points with this id, change colour
    for (let i = 0; i <  this.Highcharts.charts[0].series.length; i++) {
      // clear currently selected point
      // todo also test for if it is part of selected group and if this is the case change the colour to purple
      this.Highcharts.charts[0].series[i].data[this.selectedPointId].update({
        marker: {
          fillColor: this.defaultColour,
          lineColor: this.defaultColour,
          radius: 2
        }
      });

      // highlight new selection
      this.Highcharts.charts[0].series[i].data[networkId].setState('select');
      this.Highcharts.charts[0].series[i].data[networkId].update({
        marker: {
          fillColor: this.highlightIndividualPointColour,
          lineColor: this.highlightIndividualPointColour,
          radius: 4
        }
      });
    }
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
// todo if coverage is the coverage selected originally either highlight all or highlight none?


    if (this.filterObjective !== 'No') {

      // get x axis position of the series belonging to the selected objective
      const seriesSelected = this.getSeriesIndexOfSeries(this.filterObjective);

      // todo reset previous group selection

      // get IDS of all placements above the lower point in selected scenario
      const selectedSeriesIDS = [];
      this.Highcharts.charts[0].series[seriesSelected].data.forEach((point) => {
        if (point.y >= this.filterThreshold) {
          // @ts-ignore
          selectedSeriesIDS.push(point.network);
        }

      });

      // highlight points matching these IDS across all series
      selectedSeriesIDS.forEach((id) => {
        // for each of the series
        for (let i = 0; i < this.Highcharts.charts[0].series.length; i++) {
          this.Highcharts.charts[0].series[i].data[id].update({
            marker: {
              fillColor: this.selectedGroupColour,
              lineColor: this.selectedGroupColour
            }
          });
        }
      });

      this.selectedGroupPointsIds = selectedSeriesIDS;
    } else {
      // no filtering so reset all points
      this.clearGroup();
    }

  }

  clearGroup() {
    // reste all points, leaving any selected point red
    this.selectedGroupPointsIds.forEach((id) => {
      // leave selected point
      if (id !== this.selectedPointId) {
        // for each of the  series
        for (let i = 0; i < this.Highcharts.charts[0].series.length; i++) {
          this.Highcharts.charts[0].series[i].data[id].update({
            marker: {
              fillColor: this.defaultColour,
              lineColor: this.defaultColour
            }
          });
        }
      }

    });

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


}
