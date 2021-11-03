import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from './map/map.component';
import {TestHighchartsComponent} from './test-highcharts/test-highcharts.component';
import {GeneticAlgorithmResultsComponent} from './genetic-algorithm-results/genetic-algorithm-results.component';


const routes: Routes = [
  { path: '', component: MapComponent},
  { path: 'test', component: TestHighchartsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
