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
                      hasBackdrop = false, height = '135px', width = '290px', stepNumber = 1, instructions = 'test' }:
                      {
                        positionRelativeToElement, hasBackdrop: boolean,
                        height: string, width?: string, stepNumber, instructions
                      }): MatDialogRef<WalkthroughDialogComponent> {
    const dialog = this.dialog.open(WalkthroughDialogComponent, {
      hasBackdrop,
      height,
      width,
      data: {positionRelativeToElement, stepNumber, instructions}
    });

    return dialog;

  }


}
