import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

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

  @Output() queryDataToSubmit = new EventEmitter();

  constructor() { }

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
      console.log(id)
      console.log( document.getElementById(id));
      // card is not already selected so turn on and update styling
      this.selectedObjectives.push(id);
      document.getElementById(id).classList.add('objectiveCardSelected');
      console.log(document.getElementById(id).classList);
    }
  }

  // check is objective is selected
  objIsSelected(id) {
    return this.selectedObjectives.includes(id);
  }


  submitGeneticQuery() {
    // todo check at least one objective is selected and add error message if not
    // send selections back to parent map component
    this.queryDataToSubmit.emit({sensorNumber: this.sensorNumber, objectives: this.selectedObjectives, acceptableCoverage: this.theta})
  }


}
