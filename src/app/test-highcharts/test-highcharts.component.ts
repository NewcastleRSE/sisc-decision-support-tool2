import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import {type} from 'os';
@Component({
  selector: 'app-test-highcharts',
  templateUrl: './test-highcharts.component.html',
  styleUrls: ['./test-highcharts.component.scss']
})
export class TestHighchartsComponent implements OnInit {
  // Make all the colors semi-transparent so we can see overlapping dots
 colors = Highcharts.getOptions().colors.map(function (color) {
    return Highcharts.color(color).setOpacity(0.5).get();
  });

 //keep track of the selected point so don't need to iterate over all of them to reset colour
  selectedPointId = 0;
  selectedGroupPointsIds = [];

  highlightIndividualPointColour = 'red';

  message;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'scatter',
      animation: false
    },

    tooltip: {
      enabled: false
    },

    colors: this.colors,

    title: {
      text: 'Scatter chart with jitter'
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      categories: ['Workplace', 'Residence', 'Over 65 years old']
    },
    yAxis: {
      title: {
        text: 'Measurements'
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
           this.message = 'Show placement with ID ' + e.point.id;

            this.highlightPointsInOtherSeries(e.point.id);
          }
        }
      }
    },
    series: [{
      name: 'Workplace',
      data: this.getTestData(0)
    }, {
      name: 'Residence',
      data: this.getTestData(1)
    }, {
      name: 'over 65 years',
      data: this.getTestData(2)
    }]
  };

  constructor() { }

  ngOnInit(): void {
    //console.log(this.Highcharts)


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


  highlightPointsInOtherSeries(id) {
    // for all points with this id, change colour
    for (let i = 0; i < 3; i++) {
      // clear currently selected point
      // todo also test for if it is part of selected group and if this is the case change the colour to purple
      this.Highcharts.charts[0].series[i].data[this.selectedPointId].update({
        marker: {
          fillColor: this.colors[i],
          lineColor: this.colors[i]
        }
      });

        // highlight new selection
      this.Highcharts.charts[0].series[i].data[id].setState('select');
      this.Highcharts.charts[0].series[i].data[id].update({
        marker: {
          fillColor: this.highlightIndividualPointColour,
          lineColor: this.highlightIndividualPointColour
        }
      });
    }
    // update current selected point
    this.selectedPointId = id;

  }



  resetAllPoints() {
    // for each of the three series
    for (let i = 0; i < 3; i++) {
      this.Highcharts.charts[0].series[0].data.forEach((point) => {
          // if colour isn't what we'd expect it to be, reset it
        if (point.color !== this.colors[i]) {
          point.update({ color: this.colors[i] });
        }
      });
    }
  }

  // select a lower number ofr a particular series and highlight all above this number across all series
 selectGroupPoints(seriesSelected, lowerPoint) {
    // todo reset previous group selection

    // get IDS of all placements above the lower point in selected scenario
    const selectedSeriesIDS = [];
    this.Highcharts.charts[0].series[seriesSelected].data.forEach((point) => {
      if (point.y >= lowerPoint) {
        selectedSeriesIDS.push(point.id);
      }
    });

    // highlight points matching these IDS across all series
    selectedSeriesIDS.forEach((id) => {
      // for each of the three series
      for (let i = 0; i < 3; i++) {
        this.Highcharts.charts[0].series[i].data[id].update({
          marker: {
            fillColor: '#6200ea',
            lineColor: '#6200ea'
          }
        });
      }
    });

    this.selectedGroupPointsIds = selectedSeriesIDS;
    }

clearGroup() {
  this.selectedGroupPointsIds.forEach((id) => {
    // leave selected point
    if (id !== this.selectedPointId) {
      // for each of the three series
      for (let i = 0; i < 3; i++) {
        this.Highcharts.charts[0].series[i].data[id].update({
          marker: {
            fillColor: this.colors[i],
            lineColor: this.colors[i]
          }
        });
      }
    }

  });

  this.selectedGroupPointsIds = [];
}



}
