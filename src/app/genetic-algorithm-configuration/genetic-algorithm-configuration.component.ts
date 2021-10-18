import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {HelpTextInfoDialogComponent} from '../help-text-info-dialog/help-text-info-dialog.component';

@Component({
  selector: 'app-genetic-algorithm-configuration',
  templateUrl: './genetic-algorithm-configuration.component.html',
  styleUrls: ['./genetic-algorithm-configuration.component.scss']
})
export class GeneticAlgorithmConfigurationComponent implements OnInit {

  geneticObjectives = [
    {text: 'Total Residents', id:'Total Residents'},
    {text: 'Workers', id: 'Workers'},
    {text: 'Residents under 16', id: 'Residents under 16'},
    {text: 'Residents over 65', id: 'Residents over 65'}
    // {text: 'Traffic', id: 'traffic'}
  ];
  selectedObjectives;
  sensorNumbersAvailable = [10,20,40,50, 60, 80, 100];
  sensorNumber;
  thetaNumbersAvailable = [100, 250, 500];
  theta;

  // error message flag for objectives
  objectiveNotChosen ;

  @Output() queryDataToSubmit = new EventEmitter();

  constructor(private matDialog: MatDialog) { }

  ngOnInit(): void {
    this.sensorNumber = 50;
    this.theta = 100;
    this.selectedObjectives = [];
  }

  // mark objective card as selected/unselected and add/remove id to list ready to submit
  toggleGeneticObjective(id) {
    if (this.selectedObjectives.includes(id)) {
      // card is already selected so turn off and update styling
      this.selectedObjectives = this.selectedObjectives.filter(item => item !== id);
      document.getElementById(id).classList.remove('objectiveCardSelected');
    } else {
      // card is not already selected so turn on and update styling
      this.selectedObjectives.push(id);
      document.getElementById(id).classList.add('objectiveCardSelected');
      console.log(document.getElementById(id).classList);

      // turn off error message if showing
      this.objectiveNotChosen = false;
    }
  }

  // check is objective is selected
  objIsSelected(id) {
    return this.selectedObjectives.includes(id);
  }


  submitGeneticQuery() {
    if (this.selectedObjectives.length === 0) {
      this.objectiveNotChosen  = true;
    }
    // send selections back to parent map component
    this.queryDataToSubmit.emit({sensorNumber: this.sensorNumber, objectives: this.selectedObjectives, acceptableCoverage: this.theta})
  }

  // help dialog
 openInfo(topic) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '450px';
    dialogConfig.data = {
      topic
    };

    const dialogRef = this.matDialog.open(HelpTextInfoDialogComponent, dialogConfig);
  }

}
