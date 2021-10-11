import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GreedyAlgorithmConfigurationComponent } from './greedy-algorithm-configuration.component';

describe('GreedyAlgorithmConfigurationComponent', () => {
  let component: GreedyAlgorithmConfigurationComponent;
  let fixture: ComponentFixture<GreedyAlgorithmConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GreedyAlgorithmConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GreedyAlgorithmConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
