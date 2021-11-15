import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { GeneticAlgorithmConfigurationComponent } from './genetic-algorithm-configuration.component';

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatIconModule} from '@angular/material/icon';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';

let loader: HarnessLoader;

describe('GeneticAlgorithmConfigurationComponent', () => {
  let component: GeneticAlgorithmConfigurationComponent;
  let fixture: ComponentFixture<GeneticAlgorithmConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticAlgorithmConfigurationComponent ],
      imports: [MatIconModule,
      MatDialogModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(GeneticAlgorithmConfigurationComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticAlgorithmConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not proceed and display error and not emit message if there are no objectives selected', () => {
    // spy on component emitting
    spyOn(component.queryDataToSubmit, 'emit');

    component.selectedObjectives = [];
    component.submitGeneticQuery();


    expect(component.queryDataToSubmit.emit).not.toHaveBeenCalled();
    expect(fixture.debugElement.query(By.css('#objectiveError'))).toBeDefined();
  });

  it('should not display error and emit message if objectives are selected', () => {
    // spy on component emitting
    spyOn(component.queryDataToSubmit, 'emit');

    component.selectedObjectives = ['Total Residents'];
    component.submitGeneticQuery();

    expect(component.queryDataToSubmit.emit).toHaveBeenCalled();
    expect(fixture.debugElement.query(By.css('#objectiveError'))).toBeNull();
  });

  it('should emit message with correct contents', () => {
    // spy on component emitting
    spyOn(component.queryDataToSubmit, 'emit');

    component.selectedObjectives = ['Total Residents'];
    component.sensorNumber = 60;
    component.theta = 500;
    component.submitGeneticQuery();

    expect(component.queryDataToSubmit.emit).toHaveBeenCalledWith({sensorNumber: 60, objectives: ['Total Residents'], acceptableCoverage: 500});
  });

  it('should add objective to list and turn on background when clicking on unselected objective', fakeAsync(()  => {

    const objective = fixture.debugElement.nativeElement.querySelector('#Workers');
    objective.click();
    tick();

    // add id to list
    expect(component.selectedObjectives).toEqual(['Workers']);
    // change background of objective card by checking class has been added
     expect(fixture.debugElement.nativeElement.querySelector('#Workers')).toHaveClass('objectiveCardSelected');
  }));

  it('should remove objective from list and turn off background when clicking on selected objective', fakeAsync(()  => {
    // setup as ig workers has already been selected
    component.selectedObjectives = ['Workers'];
    fixture.debugElement.nativeElement.querySelector('#Workers').classList.add('objectiveCardSelected');

    const objective = fixture.debugElement.nativeElement.querySelector('#Workers');
    objective.click();
    tick();

    expect(component.selectedObjectives).toEqual([]);
    // change background of objective card by checking class has been removed
    expect(fixture.debugElement.nativeElement.querySelector('#Workers')).not.toHaveClass('objectiveCardSelected');
  }));




  // when click on sensor turns on and turns others off
  // when click on theta turns on and turns others off


});
