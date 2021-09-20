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
      // case constant_expression2: {
      //   //statements;
      //   break;
      // }
      default: {
        // statements;
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
