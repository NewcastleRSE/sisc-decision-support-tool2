import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import {type} from 'os';
import {InfoDialogComponent} from "../info-dialog/info-dialog.component";
import {MatDialog} from "@angular/material/dialog";
@Component({
  selector: 'app-test-highcharts',
  templateUrl: './test-highcharts.component.html',
  styleUrls: ['./test-highcharts.component.scss']
})
export class TestHighchartsComponent implements OnInit {
  // Make all the colors semi-transparent so we can see overlapping dots
 // colors = Highcharts.getOptions().colors.map(color => {
 //  Highcharts.color(color).setOpacity(0.5).get()
 // });
  colors = Highcharts.getOptions().colors;

 // keep track of the selected point so don't need to iterate over all of them to reset colour
  selectedPointId = 0;
  selectedGroupPointsIds = [];

  highlightIndividualPointColour = 'red';

  message;

  Highcharts: typeof Highcharts = Highcharts;
  // @ts-ignore
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'scatter',
      animation: false
    },

    tooltip: {
      enabled: false
    },

    // colors: this.colors,

    title: {
      text: 'Scatter chart with jitter'
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      categories: ['Workplace', 'Traffic']
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
           // @ts-ignore
            this.message = 'Show placement with ID ' + e.point.id;

            // @ts-ignore
            this.highlightPointsInOtherSeries(e.point.id);
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

  constructor(private matDialog: MatDialog) { }

  ngOnInit(): void {
    // for testing info dialog
    const dialogRef = this.matDialog.open(InfoDialogComponent, {
      width: '450px'
    });
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
    for (let i = 0; i <  this.Highcharts.charts[0].series.length; i++) {
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
    // for each of the series
    for (let i = 0; i < this.Highcharts.charts[0].series.length; i++) {
      this.Highcharts.charts[0].series[0].data.forEach((point) => {
          // if colour isn't what we'd expect it to be, reset it
        if (point.color !== this.colors[i]) {
          point.update({ color: this.colors[i] });
        }
      });
    }
  }

  // select a lower number for a particular series and highlight all above this number across all series
 selectGroupPoints(seriesSelected, lowerPoint) {
    // todo reset previous group selection

    // get IDS of all placements above the lower point in selected scenario
    const selectedSeriesIDS = [];
    this.Highcharts.charts[0].series[seriesSelected].data.forEach((point) => {
      if (point.y >= lowerPoint) {
         // @ts-ignore
        selectedSeriesIDS.push(point.id);
      }

    });

    // highlight points matching these IDS across all series
    selectedSeriesIDS.forEach((id) => {
      // for each of the  series
      for (let i = 0; i < this.Highcharts.charts[0].series.length; i++) {
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
      // for each of the  series
      for (let i = 0; i < this.Highcharts.charts[0].series.length; i++) {
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
