import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestHighchartsComponent } from './test-highcharts.component';

describe('TestHighchartsComponent', () => {
  let component: TestHighchartsComponent;
  let fixture: ComponentFixture<TestHighchartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestHighchartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHighchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
