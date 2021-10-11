import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-genetic-algorithm-configuration',
  templateUrl: './genetic-algorithm-configuration.component.html',
  styleUrls: ['./genetic-algorithm-configuration.component.scss']
})
export class GeneticAlgorithmConfigurationComponent implements OnInit {

  geneticObjectives = [
    {text: 'Residents', id: 'residents'},
    {text: 'Workplace', id: 'workplace'},
    {text: 'Residents 16 years old and under', id: 'under16'},
    {text: 'Residents 65 years old and over', id: 'over65'},
    {text: 'Traffic', id: 'traffic'}
  ];
  selectedObjectives;
  sensorNumbersAvailable = [10,20,30,40,50];
  sensorNumber;
  acceptableCoverage;

  @Output() queryDataToSubmit = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.sensorNumber = 30;
    this.acceptableCoverage = 0.3;
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
    // todo check at least one objective is selected
    // send selections back to parent map component
    this.queryDataToSubmit.emit({sensorNumber: this.sensorNumber, objective: this.selectedObjectives, acceptableCoverage: this.acceptableCoverage})
  }


}
