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

    this.text = data.info;
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }
}
