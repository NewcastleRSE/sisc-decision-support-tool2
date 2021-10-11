import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneticAlgorithmConfigurationComponent } from './genetic-algorithm-configuration.component';

describe('GeneticAlgorithmConfigurationComponent', () => {
  let component: GeneticAlgorithmConfigurationComponent;
  let fixture: ComponentFixture<GeneticAlgorithmConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticAlgorithmConfigurationComponent ]
    })
    .compileComponents();
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
