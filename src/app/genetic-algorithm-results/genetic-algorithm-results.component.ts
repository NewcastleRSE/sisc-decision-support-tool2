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
  queryChoices = {sensorNumber: 30, objectives: ['Workers', 'Total Residents'], acceptableCoverage: 0.4};

  colors = Highcharts.getOptions().colors;

  chartOptions: Highcharts.Options;

  showGraph;

  // keep track of the selected point so don't need to iterate over all of them to reset colour
  selectedPointId = 0;
  selectedGroupPointsIds = [];

  highlightIndividualPointColour = 'red';

  message;

  Highcharts: typeof Highcharts = Highcharts;
  // @ts-ignore


  objectivesWithIndexes = [];

  constructor() { }

  ngOnInit(): void {
    // only include for testing
    this.createGraph();
  }

  // function triggered my parent map component when user submits query
  createGraph() {
    this.getData();
  }

  getData() {
    // read in data and create categories needed for chart

    // assign each chosen objective an index as per the returned network json
  const objectivesFromAlgorithm = networks.objectives;
  this.queryChoices.objectives.forEach((chosenObj) => {
    const indexFromJSON = this.caseInsensitiveFindIndex(objectivesFromAlgorithm, chosenObj);
    this.objectivesWithIndexes.push({'text': chosenObj, 'index': indexFromJSON});
  });
console.log(this.objectivesWithIndexes);
  }

  caseInsensitiveFindIndex(arr, q) {
    return arr.findIndex(item => q.toLowerCase() === item.toLowerCase());
  }


  createChartOptions() {
    this.chartOptions = {
      chart: {
        type: 'scatter',
        animation: false
      },

      tooltip: {
        enabled: false
      },

      // colors: this.colors,

      // title: {
      //   text: 'Scatter chart with jitter'
      // },
      // subtitle: {
      //   text: ''
      // },
      xAxis: {
        categories: [this.queryChoices.objectives]
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
              this.message = 'Show placement  ' + e.point;

              // @ts-ignore
              // todo
             // this.highlightPointsInOtherSeries(e.point.id);
            }
          }
        }
      },
      series: [{
        type: 'scatter',
        name: 'Workplace',
        data: this.getTestData(0)
      }, {
        type: 'scatter',
        name: 'Traffic',
        data: this.getTestData(1)
      }]
    };
    this.showGraph = true;
  }

  getTestData(x) {
    var data = [],
      off = 0.2 + 0.2 * Math.random(),
      i;
    for (i = 0; i < 50; i++) {
      data.push({x, y: off + (Math.random() - 0.5) * (Math.random() - 0.5), id: i});
    }

    return data;
  }
}
