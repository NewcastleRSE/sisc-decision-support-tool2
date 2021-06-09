import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-choose-ladialog',
  templateUrl: './choose-ladialog.component.html',
  styleUrls: ['./choose-ladialog.component.scss']
})
export class ChooseLADialogComponent implements OnInit {
localAuthority;

  constructor(
    public dialogRef: MatDialogRef<ChooseLADialogComponent> ,
    @Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  ngOnInit(): void {
    this.localAuthority = this.dialogData;
    console.log(this.localAuthority);
  }

  close() {
    if (this.localAuthority) {
      console.log(this.localAuthority)
      this.dialogRef.close(this.localAuthority);
    }
  }
}
