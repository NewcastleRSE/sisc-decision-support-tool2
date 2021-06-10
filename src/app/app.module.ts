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
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatSliderModule} from '@angular/material/slider';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatGridListModule} from '@angular/material/grid-list';
import {NgxSliderModule} from '@angular-slider/ngx-slider';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ChooseLADialogComponent
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
    NgxSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ChooseLADialogComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
