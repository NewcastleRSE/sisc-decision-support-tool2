import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-data-layer-info-dialog',
  templateUrl: './data-layer-info-dialog.component.html',
  styleUrls: ['./data-layer-info-dialog.component.scss']
})
export class DataLayerInfoDialogComponent implements OnInit {
text;

  constructor(private dialogRef: MatDialogRef<DataLayerInfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) {
    switch (data.layer) {
      case 'dis': {
        this.text = '<p>Density of people reporting a disability that limits their daily activities a little or a lot.</p>' +
          '<p>Density is calculated as the percentage of people in the output area out of all reporting from the whole Local Authority, per km<span class="sup">2</span></p>';
        break;
      }
      case 'imd': {
       this.text = '<p>Index of Multiple Deprivation is a measure of relative levels of deprivation across households grouped into Lower-layer Super Output Areas. It ' +
         'is not available at an Output Area level of granularity. Areas are grouped into bands from 1 (most deprived) to 10 (least deprived).</p>';
       break;
      }
      case 'space': {
        this.text = "<p>Space syntax is used here as a way of modelling patterns of movement through a city informed by its spatial layout. " +
          "<p>'To movement' refers to the likelihood of people <strong>moving to</strong> a location from all others.</p>" +
          "<p>'Through movement' refers to the likelihood of people <strong>passing through</strong> a location. It represents " +
          "people using the shortest routes from all locations in the area to all other locations.</p>" +
          "<p> Add reference here...</p>";
        break;
      }
      default: {
        this.text = 'No data information is currently available for this layer.';
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
