import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GeneticAlgorithmResultsComponent} from './genetic-algorithm-results.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HighchartsChartModule} from 'highcharts-angular';
import {FormsModule} from '@angular/forms';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';


describe('GeneticAlgorithmResultsComponent', () => {
  let component: GeneticAlgorithmResultsComponent;
  let fixture: ComponentFixture<GeneticAlgorithmResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticAlgorithmResultsComponent ],
      imports: [
        MatExpansionModule,
        MatGridListModule,
        MatFormFieldModule,
        MatIconModule,
        HighchartsChartModule,
        FormsModule,
        MatDialogModule,
        BrowserAnimationsModule,
        MatInputModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [MatDialog]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticAlgorithmResultsComponent);
    component = fixture.componentInstance;

    // mock the query supplied by the parent
    // simulate the parent setting the input property with that query
    component.queryChoices = {
      sensorNumber: 30,
      objectives: ['Workers', 'Total Residents', 'Residents under 16', 'Residents over 65'],
      theta: 100
    };


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
