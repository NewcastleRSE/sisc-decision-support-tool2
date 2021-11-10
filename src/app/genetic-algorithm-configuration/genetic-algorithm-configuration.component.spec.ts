import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneticAlgorithmConfigurationComponent } from './genetic-algorithm-configuration.component';

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatIconModule} from '@angular/material/icon';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';

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
});
