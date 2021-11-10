import {WalkthroughDialogComponent} from './walkthrough-dialog.component';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

describe('WalkthroughDialogComponent', () => {
  let component: WalkthroughDialogComponent;
  let fixture: ComponentFixture<WalkthroughDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
    updatePosition: jasmine.createSpy('updatePosition')
  };

  const mockDataLeft = {
    positionRelativeToElement: { top: 1, height: 100, left: 2, width: 200, right: 202 },
    stepNumber: 1,
    instructions: 'Test instructions',
    anchorSide: 'left',
    final: false,
    elementId: 'dataLayersStep'
  };

  const mockDataRight = {
    positionRelativeToElement: { top: 1, height: 100, left: 2, width: 200, right: 202 },
    stepNumber: 1,
    instructions: 'Test instructions',
    anchorSide: 'right',
    final: false,
    elementId: 'dataLayersStep'
  };




  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalkthroughDialogComponent ],
      imports: [
        MatDialogModule,
      MatIconModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDataLeft
        }
      ]
    })
      .compileComponents();
  }));

  preparation(() => {
    fixture = TestBed.createComponent(WalkthroughDialogComponent);
    component = fixture.componentInstance;

  // mock getting current focus element
    const el = document.createElement('button');
    el.classList.add('currentWalkthroughButton');
    document.getElementById = jasmine.createSpy('getElementById').and.returnValue(el);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog on selecting exit', () => {
    component.endTutorial();
    expect(mockDialogRef.close).toHaveBeenCalledWith('end');
  });

  it('should close the dialog on selecting next step', () => {
    component.nextStep(2);
    expect(mockDialogRef.close).toHaveBeenCalledWith(2);
  });

  it('should position dialog correctly with anchorSide left', () => {
    const matDialogConfig = new MatDialogConfig();
    matDialogConfig.position = { left: '205px', top: '1px' };
    expect(mockDialogRef.updatePosition).toHaveBeenCalledWith(matDialogConfig.position);
  });

  it('should position dialog correctly with anchorSide right', () => {
    // override provider to use alternative mock data
    TestBed.overrideProvider(MAT_DIALOG_DATA, {useValue: mockDataRight});
    TestBed.compileComponents();
    const matDialogConfig = new MatDialogConfig();
    matDialogConfig.position = { left: '500px', top: '1px' };
    expect(mockDialogRef.updatePosition).toHaveBeenCalledWith(matDialogConfig.position);
  });

});
