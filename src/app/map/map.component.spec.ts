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
import {By} from '@angular/platform-browser';
import {WalkthroughDialogComponent} from '../walkthrough-dialog/walkthrough-dialog.component';

// todo add test for getting oa from centroid
// todo test checking if marker is already at centroid
// todo return to original position if move to occupied
// todo testing if move to new OA if OA is not occupied
// test findmtahcing OA
describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  // spy on child components
  const geneticResults = jasmine.createSpyObj('GeneticResults', [
    'createGraph',
    'closeExpansionPanel'
  ]);

  const geneticConfig = jasmine.createSpyObj('GeneticConfig', [
    'closeExpansionPanel'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
       MapComponent,
        SpinnerOverlayComponent,
        WalkthroughDialogComponent
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
      .overrideModule(BrowserDynamicTestingModule, {set: {entryComponents: [SpinnerOverlayComponent, WalkthroughDialogComponent]}})
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // set child component to use
    component.geneticResults = geneticResults;
    component.geneticConfig = geneticConfig;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly call function in child component when query is submitted', () => {
    // query
    const query = {sensorNumber: 5, objectives: [1,2], acceptableCoverage: 0.3, localAuthority: 'ncl'};
    component.submitGeneticQuery(query);

    expect(component.geneticResults.createGraph).toHaveBeenCalled();
    expect(component.geneticResults.createGraph).toHaveBeenCalledWith({sensorNumber: 5, objectives: [1,2], theta: 0.3, localAuthority: 'ncl'});

  });

  it('should be able to identify output area that matches code', () =>{
    // create parameters
    const data = {localAuthority: 'ncl'};
    component.centroidsNcl = [
      {oa11cd : 'a'},
      {oa11cd : 'b'},
      {oa11cd : 'c'},
    ];

    const result = component.findMatchingOA(data, {oa11cd: 'b'});

    expect(result).toEqual({oa11cd : 'b'});
  });

  it('should correctly transform British National Grid to World Map projections', () => {
    const expected = [49.767304732605055, -7.55695976676328];

    expect(component.convertFromBNGProjection(18.5, 54.2)).toEqual(expected);
  });

  // it ('should remove walkthough highlight class when cleaning up after tutorial', () => {
  //   // add highlight class to walkthrough elements to test it is removed
  //   // component.walkthrough.forEach((step) => {
  //   //   // exclude final step as currently not visible
  //   //   if (step.elementId !== 'sensorResultsStep') {
  //   //     component.highlightWalkthroughElement(step.elementId);
  //   //   }
  //   //
  //   // });
  //
  //   component.cleanUpAfterTutorial();
  //
  //   // child components notified
  //   expect(component.geneticResults.closeExpansionPanel).toHaveBeenCalled();
  //   expect(component.geneticConfig.closeExpansionPanel).toHaveBeenCalled();
  //   // walkthrough components do not have highlight
  //   component.walkthrough.forEach((step) => {
  //     //const el = fixture.debugElement.query(By.css('#' + step.elementId)).nativeElement;
  //     const el = fixture.debugElement.nativeElement.querySelector('#' + step.elementId)
  //     expect(el.hasClass('currentWalkthroughElement')).toBeFalse();
  //   });
  // });


});





// open tutorial step datat layers shows chip
// open tutorial step LAstep hides data layers
// open tutorial step sensorquerystep calls to open geentic config
// open tutorial step sensorresultsstep views genetic results and opens panels
// open tutorial correctly adds currentwalkthough step
// open tutorial opens idialog with right details
// clean up after tutrial removes class and does other behaviours


