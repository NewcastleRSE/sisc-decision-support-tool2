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
  queryChoices = {sensorNumber: 30, objectives: ['Workers', 'Total Residents', 'Residents under 16'], acceptableCoverage: 0.4};

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
    this.updateChartOptions();
  }

  getData() {
    // read in data and create categories needed for chart

    // assign each chosen objective an index as per the returned network json
  const objectivesFromAlgorithm = networks.objectives;
  this.queryChoices.objectives.forEach((chosenObj) => {
    const indexFromJSON = this.caseInsensitiveFindIndex(objectivesFromAlgorithm, chosenObj);
    this.objectivesWithIndexes.push({text: chosenObj, index: indexFromJSON});
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
             console.log('Show placement  ' + e.point);

              // @ts-ignore
              // todo
             // this.highlightPointsInOtherSeries(e.point.id);
            }
          }
        }
      },
      series: seriesList
    };
    this.showGraph = true;
  }



createSeriesForChartOptions() {
    const seriesList = [];

    // there is a series per objective. Each series uses the x coordinate as the objective index (this is what the jitter acts upon)
    for (let i = 0; i < this.objectivesWithIndexes.length; i++) {
      // get data list of y coordinates (i.e. coverage of each network)
      // for each entry (row) in network.coverage, get the nth element (column) to get coverage where n is the objective index.

      const yList = [];

      networks.coverage.forEach((row) => {
        yList.push(row[this.objectivesWithIndexes[i].index]);
      });

      const data = [];
      // keep track of the coverage index (i.e. network) so know which points match up between series
      for (let j = 0; j < yList.length; j++) {

        data.push({x: i, y: yList[j], network: j});

      };

      seriesList.push({
        type: 'scatter',
        name: this.objectivesWithIndexes[i].text,
        data
      });

    }
    console.log(seriesList);
    return seriesList;
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
}
