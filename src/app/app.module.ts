import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import {HttpClientModule} from '@angular/common/http';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {FormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
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
import { HelpTextInfoDialogComponent } from './help-text-info-dialog/help-text-info-dialog.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { SpinnerOverlayComponent } from './spinner-overlay/spinner-overlay.component';
import {HighchartsChartModule} from 'highcharts-angular';
import {MatRadioModule} from '@angular/material/radio';
import { DataLayersComponent } from './data-layers/data-layers.component';
import { GeneticAlgorithmConfigurationComponent } from './genetic-algorithm-configuration/genetic-algorithm-configuration.component';
import { GeneticAlgorithmResultsComponent } from './genetic-algorithm-results/genetic-algorithm-results.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {WalkthroughDialogComponent} from './walkthrough-dialog/walkthrough-dialog.component';
import {FooterComponent} from "./footer/footer.component";
import {ErrorService} from './error.service';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    InfoDialogComponent,
    HelpTextInfoDialogComponent,
    SpinnerOverlayComponent,
    DataLayersComponent,
    GeneticAlgorithmConfigurationComponent,
    GeneticAlgorithmResultsComponent,
    WalkthroughDialogComponent,
    FooterComponent
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
    MatRadioModule,
    MatExpansionModule,
    BrowserAnimationsModule
  ],

  providers: [MatIconRegistry,
    {provide: ErrorHandler, useClass: ErrorService}
  ],
  bootstrap: [AppComponent],
  entryComponents: [InfoDialogComponent, HelpTextInfoDialogComponent, SpinnerOverlayComponent, WalkthroughDialogComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {
  constructor(
    public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
