import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {MapComponent} from './map.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';;
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {HttpClientModule} from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SpinnerOverlayComponent} from '../spinner-overlay/spinner-overlay.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';



describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  // spy on child component genetic results
  const geneticResults = jasmine.createSpyObj('GeneticResults', ['createGraph'])

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
       MapComponent,
        SpinnerOverlayComponent
      ],
      imports: [
        MatIconModule,
        MatMenuModule,
        LeafletModule,
        HttpClientModule,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideModule(BrowserDynamicTestingModule, {set: {entryComponents: [SpinnerOverlayComponent]}})
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly call function in child component when query is submitted', () => {
    // set child component to use
    component.geneticResults = geneticResults;

    // query
    const query = {sensorNumber: 5, objectives: [1,2], acceptableCoverage: 0.3, localAuthority: 'ncl'};
    component.submitGeneticQuery(query);

    expect(component.geneticResults.createGraph).toHaveBeenCalled();
    expect(component.geneticResults.createGraph).toHaveBeenCalledWith({sensorNumber: 5, objectives: [1,2], theta: 0.3, localAuthority: 'ncl'});

  });

  it('should be able to identify output area that matches code', () =>{
    // todo start here
  });

});



// move match sections to new functions and test
// convert from bng projection
// open tutorial step datat layers shows chip
// open tutorial step LAstep hides data layers
// open tutorial step sensorquerystep calls to open geentic config
// open tutorial step sensorresultsstep views genetic results and opens panels
// open tutorial correctly adds currentwalkthough step
// open tutorial opens idialog with right details
// clean up after tutrial removes class and does other behaviours
// direct behaviour correctly if user wants to start tutorial?

