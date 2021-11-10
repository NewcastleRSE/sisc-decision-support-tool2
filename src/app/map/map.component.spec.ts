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
});
