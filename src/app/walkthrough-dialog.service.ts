import {Injectable} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {WalkthroughDialogComponent} from "./walkthrough-dialog/walkthrough-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class WalkthroughDialogService {


  constructor(public dialog: MatDialog) {

  }

  public openDialog({ positionRelativeToElement,
                      hasBackdrop = false, stepNumber = 1, instructions = 'test', anchorSide, final}:
                      {
                        positionRelativeToElement, hasBackdrop: boolean, stepNumber, instructions, anchorSide, final
                      }): MatDialogRef<WalkthroughDialogComponent> {
    console.log(positionRelativeToElement)
    const dialog = this.dialog.open(WalkthroughDialogComponent, {
      hasBackdrop,
      // height,
      width: '290px',
      data: {positionRelativeToElement, stepNumber, instructions, anchorSide, final},
      panelClass: 'tutorialDialog'
    });

    return dialog;

  }


}
