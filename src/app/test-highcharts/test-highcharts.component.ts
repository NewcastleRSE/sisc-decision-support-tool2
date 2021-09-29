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


  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'scatter'
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
        },
        tooltip: {
          pointFormat: 'Measurement: {point.y:.3f}'
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
            e.preventDefault();
            console.log(e.point.id);
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
    for (i = 0; i < 100; i++) {
      data.push({x, y: off + (Math.random() - 0.5) * (Math.random() - 0.5), id: i});
    }
console.log(data)
    return data;
  }


  highlightPointsInOtherSeries(id) {
    // for all points with this id, change colour

    for (let i = 0; i < 3; i++) {
      this.Highcharts.charts[0].series[i].data[id].setState('select');
      this.Highcharts.charts[0].series[i].data[id].update({
        marker: {
          fillColor: 'red',
          lineColor: 'red'
        }
      });
    }

  }

}
