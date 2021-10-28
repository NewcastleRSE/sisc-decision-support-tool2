import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-data-layer-info-dialog',
  templateUrl: './help-text-info-dialog.component.html',
  styleUrls: ['./help-text-info-dialog.component.scss']
})
export class HelpTextInfoDialogComponent implements OnInit {
text;

  constructor(private dialogRef: MatDialogRef<HelpTextInfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) {
    switch (data.topic) {
      // data layers
      case 'dis': {
        this.text = '<h3>Disability</h3><p>Density of people reporting a disability that limits their daily activities a little or a lot.</p>' +
          '<p>Density is calculated as the percentage of people in the output area out of all reporting from the whole Local Authority, per km<span class="sup">2</span></p>';
        break;
      }
      case 'imd': {
       this.text = '<h3>Index of Multiple Deprivation</h3><p>Index of Multiple Deprivation is a measure of relative levels of deprivation across households grouped into Lower-layer Super Output Areas. It ' +
         'is not available at an Output Area level of granularity. Areas are grouped into bands from 1 (most deprived) to 10 (least deprived).</p>';
       break;
      }
      case 'space': {
        this.text = "<h3>Space Syntax</h3><p>Space syntax is used here as a way of modelling patterns of movement through a city informed by its spatial layout. " +
          "<p>'To movement' refers to the likelihood of people <strong>moving to</strong> a location from all others.</p>" +
          "<p>'Through movement' refers to the likelihood of people <strong>passing through</strong> a location. It represents " +
          "people using the shortest routes from all locations in the area to all other locations.</p>" +
          "<p> Add reference here...</p>";
        break;
      }
      case 'uo': {
        this.text = "<h3>Urban Observatory sensors</h3><p><a href='https://urbanobservatory.ac.uk'/a>Newcastle Urban Observatory</a> gathers data sensors around the city including air quality and makes it available" +
          " in real time. Included on this map are their Nitrogen Dioxide and " +
          "PM10 and PM25 particle sensors.</p>";
        break;
      }
      case 'oa': {
        this.text = "<h3>Output Areas</h3><p><a href='https://www.ons.gov.uk/methodology/geography/ukgeographies/censusgeography'/a>Output Areas </a>are geopgraphical groupings of households. They have a minimum of 40 households and 100 people and a recommended size of 125 households." +
          "Output Areas were first introduced into England after the 2001 census with some modification after the 2011 census.</p><p> They were created to, as much as possible, contain similar households" +
          "in terms of rural or urban areas, property tenure and property type. They also tend to follow significant features such as motorways. " +
          "They are useful here as they are the smallest grouping data is widely available for.";
        break;
      }
      case 'age': {
        this.text = "<h3>Ages, residence and workplace</h3><p>This data is taken from the 2011 census and is available <a href='https://www.nomisweb.co.uk/census/2011'>here</a>. Population refers to locations respondents reported living and workplace refers to the address of their reported workplace. </p>" +
          "<p>Density is calculated as the percentage of people in the output area out of all reporting from the whole Local Authority, per km<span class=\"sup\">2</span></p>";
        break;
      }
      case 'schools': {
        this.text = "<h3>Schools</h3><p>Schools locations have been taken from <a href='https://www.compare-school-performance.service.gov.uk/download-data'>government published data. For clarity, primary, first and middle schools are grouped, and high, secondary and post 16 schools and colleges are also grouped. </a></p>";
        break;
      }
      case 'eth': {
        this.text = "<h3>Ethnicity</h3><p>This data is taken from the 2011 census and is available <a href='https://www.nomisweb.co.uk/census/2011'>here</a>. On this site it is possible to view subcategories within those listed here.</p>" +
          "<p>Density is calculated as the percentage of people belonging to a particular ethnic group in the output area out of all people reporting that ethnicity from the whole Local Authority, per km<span class=\"sup\">2</span></p>";
        break;
      }
      // genetic objective config info
      case 'objectiveChoice': {
        this.text = "<p>Select one or more objectives to consider in the sensor network generation.</p>";
        break;
      }
      case 'thetaChoice': {
        //todo description
        this.text = "<p>Theta represents the something... .</p>";
        break;
      }
      default: {
        this.text =  'No data information is currently available.';
        break;
      }
    }

  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }
}
