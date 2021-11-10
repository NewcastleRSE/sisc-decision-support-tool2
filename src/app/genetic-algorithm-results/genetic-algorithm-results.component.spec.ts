import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneticAlgorithmResultsComponent } from './genetic-algorithm-results.component';
import {MatIconModule} from '@angular/material/icon';

describe('GeneticAlgorithmResultsComponent', () => {
  let component: GeneticAlgorithmResultsComponent;
  let fixture: ComponentFixture<GeneticAlgorithmResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticAlgorithmResultsComponent, MatIconModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticAlgorithmResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
