import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import {HttpClientModule} from '@angular/common/http';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {FormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import { ChooseLADialogComponent } from './choose-ladialog/choose-ladialog.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatSliderModule} from '@angular/material/slider';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatGridListModule} from '@angular/material/grid-list';
import {NgxSliderModule} from '@angular-slider/ngx-slider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatInputModule} from '@angular/material/input';
import { OptimisationInProgressDialogComponent } from './optimisation-in-progress-dialog/optimisation-in-progress-dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatChipsModule} from '@angular/material/chips';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {LeafletMarkerClusterModule} from '@asymmetrik/ngx-leaflet-markercluster';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { DataLayerInfoDialogComponent } from './data-layer-info-dialog/data-layer-info-dialog.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { SpinnerOverlayComponent } from './spinner-overlay/spinner-overlay.component';
import { TestHighchartsComponent } from './test-highcharts/test-highcharts.component';
import {HighchartsChartModule} from 'highcharts-angular';
import {MatRadioModule} from '@angular/material/radio';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ChooseLADialogComponent,
    OptimisationInProgressDialogComponent,
    InfoDialogComponent,
    DataLayerInfoDialogComponent,
    SpinnerOverlayComponent,
    TestHighchartsComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        LeafletModule,
        FormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatSliderModule,
        FlexLayoutModule,
        MatGridListModule,
        NgxSliderModule,
        MatFormFieldModule,
        MatSelectModule,
        FontAwesomeModule,
        MatInputModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatChipsModule,
        MatMenuModule,
        MatListModule,
        MatSlideToggleModule,
        LeafletMarkerClusterModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
        MatTooltipModule,
        HighchartsChartModule,
        MatRadioModule
    ],

  providers: [MatIconRegistry],
  bootstrap: [AppComponent],
  entryComponents: [ChooseLADialogComponent, InfoDialogComponent, DataLayerInfoDialogComponent, SpinnerOverlayComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {
  constructor(
    public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
