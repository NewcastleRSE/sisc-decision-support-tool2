import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({

  selector: 'app-walkthrough-dialog',
  templateUrl: './walkthrough-dialog.component.html'
  // styleUrls: ['./walkthrough-dialog.component.scss']
})

export class WalkthroughDialogComponent implements OnInit{
  positionRelativeToElement;
  stepNumber;
  instructions;

  constructor(public dialogRef: MatDialogRef<WalkthroughDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public options: { positionRelativeToElement, stepNumber, instructions }) {

    this.positionRelativeToElement = options.positionRelativeToElement;
    this.stepNumber = options.stepNumber;
    this.instructions = options.instructions;
  }


  // https://stackoverflow.com/questions/58757670/angular-material-how-to-position-matdialog-relative-to-element

  ngOnInit() {
    const matDialogConfig = new MatDialogConfig();

    // const rect: DOMRect = this.positionRelativeToElement.nativeElement.getBoundingClientRect();

    matDialogConfig.position = { right: `10px`, top: `${this.positionRelativeToElement.bottom + 2}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  endTutorial() {
    // close dialog and pass message to map component to leave tutorial
   this.dialogRef.close('end');
  }

  nextStep(nextStep) {
    // close dialog and pass message to map component to open next step
   this.dialogRef.close(nextStep);
  }

}
