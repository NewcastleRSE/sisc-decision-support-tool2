import {AfterViewInit, Component, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {environment} from '../../environments/environment';
import {GeoserverService} from '../geoserver.service';
import {
  Map,
  Control,
  DomUtil,
  ZoomAnimEvent,
  Layer,
  MapOptions,
  tileLayer,
  latLng,
  LeafletEvent,
  circle,
  polygon,
  icon,
  LeafletMouseEvent, LatLng
} from 'leaflet';

import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

import * as _ from 'lodash';

import proj4 from 'proj4';

import 'leaflet-geometryutil';
import {WebSocketService} from '../web-socket.service';
import 'leaflet.awesome-markers';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ChooseLADialogComponent} from '../choose-ladialog/choose-ladialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {UrbanObservatoryService} from '../urban-observatory.service';
import {typeCheckFilePath} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {DatabaseService} from '../database.service';

//
// https://medium.com/runic-software/the-simple-guide-to-angular-leaflet-maps-41de83db45f1

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy, OnInit {
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Input() options: MapOptions = {
    layers: [tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
      opacity: 1,
      maxZoom: 19,
      detectRetina: true,
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })],
    zoom: 12,
    center: latLng(54.958455, -1.635291),
    zoomControl: false
  };

  testScenario =    {
      result: {
      coverage_history: [
        0.042697903005677725,
        0.07972781466543684,
        0.10363391579438772,
        0.12654333460108996,
        0.1484366570535272,
        0.168961317428737,
        0.18944426470815984,
        0.20898299013332094,
        0.226998976912119,
        0.2418388293063128
      ],
      lad20cd: 'E08000021',
      n_sensors: 10,
      oa_coverage: [
        {
          coverage: 0.7345058839832672,
          oa11cd: 'E00042665'
        },
        {
          coverage: 0.8132079294014901,
          oa11cd: 'E00042671'
        },
        {
          coverage: 0.3836075763684105,
          oa11cd: 'E00042592'
        },
        {
          coverage: 0.09404517294018643,
          oa11cd: 'E00042812'
        },
        {
          coverage: 0.792511636086851,
          oa11cd: 'E00042661'
        },
        {
          coverage: 0.20570183205093656,
          oa11cd: 'E00175561'
        },
        {
          coverage: 0.25084543236129225,
          oa11cd: 'E00175595'
        },
        {
          coverage: 0.13653579588977513,
          oa11cd: 'E00042803'
        },
        {
          coverage: 0.4676511865379929,
          oa11cd: 'E00042411'
        },
        {
          coverage: 0.29197350066160194,
          oa11cd: 'E00042490'
        },
        {
          coverage: 0.4130804270094702,
          oa11cd: 'E00042882'
        },
        {
          coverage: 2.265188289500966e-05,
          oa11cd: 'E00042160'
        },
        {
          coverage: 0.09676168608809453,
          oa11cd: 'E00042800'
        },
        {
          coverage: 0.7787097293103872,
          oa11cd: 'E00042881'
        },
        {
          coverage: 2.981383970584132e-05,
          oa11cd: 'E00042161'
        },
        {
          coverage: 0.3016426467496627,
          oa11cd: 'E00042801'
        },
        {
          coverage: 0.22552081251630723,
          oa11cd: 'E00042880'
        },
        {
          coverage: 0.3008206188879812,
          oa11cd: 'E00042418'
        },
        {
          coverage: 0.14402628973611042,
          oa11cd: 'E00042499'
        },
        {
          coverage: 0.42630477305736314,
          oa11cd: 'E00042419'
        },
        {
          coverage: 0.1106821195415709,
          oa11cd: 'E00042498'
        },
        {
          coverage: 0.004489685641799691,
          oa11cd: 'E00042168'
        },
        {
          coverage: 0.15778647185784656,
          oa11cd: 'E00042808'
        },
        {
          coverage: 0.006611846823527285,
          oa11cd: 'E00042169'
        },
        {
          coverage: 0.6526231240953771,
          oa11cd: 'E00042888'
        },
        {
          coverage: 1.8770072279063748e-05,
          oa11cd: 'E00042157'
        },
        {
          coverage: 0.0001014454801667405,
          oa11cd: 'E00042154'
        },
        {
          coverage: 0.00012971610675716107,
          oa11cd: 'E00042155'
        },
        {
          coverage: 0.05231887053238897,
          oa11cd: 'E00042152'
        },
        {
          coverage: 7.69611502027385e-05,
          oa11cd: 'E00042153'
        },
        {
          coverage: 0.020461714281368535,
          oa11cd: 'E00042150'
        },
        {
          coverage: 0.03896800890630291,
          oa11cd: 'E00042151'
        },
        {
          coverage: 1.2064835761688678e-05,
          oa11cd: 'E00042158'
        },
        {
          coverage: 1.6416015806925034e-05,
          oa11cd: 'E00042159'
        },
        {
          coverage: 0.18671873321134191,
          oa11cd: 'E00042666'
        },
        {
          coverage: 0.2959242403897115,
          oa11cd: 'E00042106'
        },
        {
          coverage: 0.0841428990278262,
          oa11cd: 'E00042187'
        },
        {
          coverage: 0.29230819412296505,
          oa11cd: 'E00042667'
        },
        {
          coverage: 0.10686421934461195,
          oa11cd: 'E00042107'
        },
        {
          coverage: 0.04711434487603247,
          oa11cd: 'E00042186'
        },
        {
          coverage: 0.17026298173823995,
          oa11cd: 'E00042664'
        },
        {
          coverage: 0.25593225587443075,
          oa11cd: 'E00042104'
        },
        {
          coverage: 0.12820306269627518,
          oa11cd: 'E00042185'
        },
        {
          coverage: 0.12178949537033901,
          oa11cd: 'E00042184'
        },
        {
          coverage: 0.19962824979843108,
          oa11cd: 'E00042662'
        },
        {
          coverage: 0.12932824585624386,
          oa11cd: 'E00042102'
        },
        {
          coverage: 0.07117988105984996,
          oa11cd: 'E00042183'
        },
        {
          coverage: 0.3007821490774308,
          oa11cd: 'E00042663'
        },
        {
          coverage: 0.2070424807060509,
          oa11cd: 'E00042103'
        },
        {
          coverage: 0.09291918636481789,
          oa11cd: 'E00042182'
        },
        {
          coverage: 0.3371213585907513,
          oa11cd: 'E00042100'
        },
        {
          coverage: 0.12996111072258518,
          oa11cd: 'E00042101'
        },
        {
          coverage: 0.1830050329612888,
          oa11cd: 'E00042668'
        },
        {
          coverage: 0.10037195107812519,
          oa11cd: 'E00042108'
        },
        {
          coverage: 0.02911909184889798,
          oa11cd: 'E00042189'
        },
        {
          coverage: 0.6902940057346616,
          oa11cd: 'E00042669'
        },
        {
          coverage: 0.3660029671074894,
          oa11cd: 'E00042109'
        },
        {
          coverage: 0.21188621653314513,
          oa11cd: 'E00042188'
        },
        {
          coverage: 0.3152796244258039,
          oa11cd: 'E00042656'
        },
        {
          coverage: 0.2154235912103481,
          oa11cd: 'E00042657'
        },
        {
          coverage: 0.22967224428783503,
          oa11cd: 'E00042654'
        },
        {
          coverage: 0.3018502399646319,
          oa11cd: 'E00042655'
        },
        {
          coverage: 0.40128447209198637,
          oa11cd: 'E00042652'
        },
        {
          coverage: 0.2935663458800668,
          oa11cd: 'E00042653'
        },
        {
          coverage: 0.35312506961129264,
          oa11cd: 'E00042650'
        },
        {
          coverage: 0.20272143476041565,
          oa11cd: 'E00042651'
        },
        {
          coverage: 0.27859186247464673,
          oa11cd: 'E00042658'
        },
        {
          coverage: 0.21737259081017254,
          oa11cd: 'E00042659'
        },
        {
          coverage: 0.6183002801022501,
          oa11cd: 'E00042606'
        },
        {
          coverage: 0.07837646240797128,
          oa11cd: 'E00042687'
        },
        {
          coverage: 0.5985752016140709,
          oa11cd: 'E00042607'
        },
        {
          coverage: 0.08274249835982941,
          oa11cd: 'E00042686'
        },
        {
          coverage: 0.21938846240783683,
          oa11cd: 'E00042604'
        },
        {
          coverage: 0.03233229936156536,
          oa11cd: 'E00042685'
        },
        {
          coverage: 0.15191220346649276,
          oa11cd: 'E00042683'
        },
        {
          coverage: 0.18671768446289388,
          oa11cd: 'E00042600'
        },
        {
          coverage: 0.17096608613480657,
          oa11cd: 'E00042601'
        },
        {
          coverage: 0.8477789326937833,
          oa11cd: 'E00042608'
        },
        {
          coverage: 0.05473146602781223,
          oa11cd: 'E00042689'
        },
        {
          coverage: 0.43119584443503484,
          oa11cd: 'E00042609'
        },
        {
          coverage: 0.06530160980948324,
          oa11cd: 'E00042688'
        },
        {
          coverage: 0.09381431677286811,
          oa11cd: 'E00042347'
        },
        {
          coverage: 0.22596225507442771,
          oa11cd: 'E00042344'
        },
        {
          coverage: 0.2200058679604327,
          oa11cd: 'E00042342'
        },
        {
          coverage: 0.149990049385193,
          oa11cd: 'E00042343'
        },
        {
          coverage: 0.3658967682688951,
          oa11cd: 'E00042340'
        },
        {
          coverage: 0.2806188911420273,
          oa11cd: 'E00042341'
        },
        {
          coverage: 0.25590570368899707,
          oa11cd: 'E00042348'
        },
        {
          coverage: 0.19671352818032242,
          oa11cd: 'E00042349'
        },
        {
          coverage: 0.32805028232106026,
          oa11cd: 'E00042336'
        },
        {
          coverage: 0.1577675328387734,
          oa11cd: 'E00042337'
        },
        {
          coverage: 0.22453540040527378,
          oa11cd: 'E00042334'
        },
        {
          coverage: 0.28716568550615745,
          oa11cd: 'E00042335'
        },
        {
          coverage: 0.27291917075604627,
          oa11cd: 'E00042332'
        },
        {
          coverage: 0.21242922078153198,
          oa11cd: 'E00042333'
        },
        {
          coverage: 0.4393246092016876,
          oa11cd: 'E00042330'
        },
        {
          coverage: 0.15175250189718836,
          oa11cd: 'E00042331'
        },
        {
          coverage: 0.1387373259984456,
          oa11cd: 'E00042338'
        },
        {
          coverage: 0.3733496352153265,
          oa11cd: 'E00042339'
        },
        {
          coverage: 0.43627137354015794,
          oa11cd: 'E00042576'
        },
        {
          coverage: 0.6309385933984609,
          oa11cd: 'E00042577'
        },
        {
          coverage: 0.31451270855798785,
          oa11cd: 'E00042574'
        },
        {
          coverage: 0.31206484636751286,
          oa11cd: 'E00042575'
        },
        {
          coverage: 0.6124831939074824,
          oa11cd: 'E00042572'
        },
        {
          coverage: 0.34909858190423343,
          oa11cd: 'E00042573'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042570'
        },
        {
          coverage: 0.5502849474261525,
          oa11cd: 'E00042571'
        },
        {
          coverage: 0.4947974951000191,
          oa11cd: 'E00042578'
        },
        {
          coverage: 0.2802679677320515,
          oa11cd: 'E00042579'
        },
        {
          coverage: 0.011003658016770059,
          oa11cd: 'E00042526'
        },
        {
          coverage: 0.008541662003408864,
          oa11cd: 'E00042527'
        },
        {
          coverage: 0.023751060623426745,
          oa11cd: 'E00042524'
        },
        {
          coverage: 0.04059889235261072,
          oa11cd: 'E00042525'
        },
        {
          coverage: 0.011083596298641396,
          oa11cd: 'E00042522'
        },
        {
          coverage: 0.014738039937503633,
          oa11cd: 'E00042523'
        },
        {
          coverage: 0.03226796202681687,
          oa11cd: 'E00042521'
        },
        {
          coverage: 0.017629728335955337,
          oa11cd: 'E00042528'
        },
        {
          coverage: 0.04559824954646884,
          oa11cd: 'E00042529'
        },
        {
          coverage: 0.02361874139072212,
          oa11cd: 'E00042516'
        },
        {
          coverage: 0.14753284040027378,
          oa11cd: 'E00042597'
        },
        {
          coverage: 0.026874099267145762,
          oa11cd: 'E00042517'
        },
        {
          coverage: 0.12320685604982434,
          oa11cd: 'E00042596'
        },
        {
          coverage: 0.0679537597192637,
          oa11cd: 'E00042514'
        },
        {
          coverage: 0.10573398562409747,
          oa11cd: 'E00042595'
        },
        {
          coverage: 0.10136362708700679,
          oa11cd: 'E00042906'
        },
        {
          coverage: 0.03507485653538825,
          oa11cd: 'E00042515'
        },
        {
          coverage: 0.1563385463017799,
          oa11cd: 'E00042594'
        },
        {
          coverage: 0.13114585818466645,
          oa11cd: 'E00042907'
        },
        {
          coverage: 0.5152887329584337,
          oa11cd: 'E00042512'
        },
        {
          coverage: 0.4429884079388509,
          oa11cd: 'E00042593'
        },
        {
          coverage: 0.08249340549057638,
          oa11cd: 'E00042904'
        },
        {
          coverage: 0.12209641509934774,
          oa11cd: 'E00042513'
        },
        {
          coverage: 0.09026429342764755,
          oa11cd: 'E00042905'
        },
        {
          coverage: 0.2374144689634648,
          oa11cd: 'E00042510'
        },
        {
          coverage: 0.44146324039113743,
          oa11cd: 'E00042591'
        },
        {
          coverage: 0.6956264295447815,
          oa11cd: 'E00042511'
        },
        {
          coverage: 0.48061666708570777,
          oa11cd: 'E00042590'
        },
        {
          coverage: 0.46099235236732705,
          oa11cd: 'E00042903'
        },
        {
          coverage: 0.5834151682212617,
          oa11cd: 'E00042900'
        },
        {
          coverage: 0.6295666073484255,
          oa11cd: 'E00042901'
        },
        {
          coverage: 0.4692408082303766,
          oa11cd: 'E00175578'
        },
        {
          coverage: 0.12612516241466715,
          oa11cd: 'E00042599'
        },
        {
          coverage: 0.06855678832816917,
          oa11cd: 'E00175554'
        },
        {
          coverage: 0.058628533838675716,
          oa11cd: 'E00042519'
        },
        {
          coverage: 0.1509900856023743,
          oa11cd: 'E00042598'
        },
        {
          coverage: 0.014055772505450079,
          oa11cd: 'E00175569'
        },
        {
          coverage: 0.11553117299522042,
          oa11cd: 'E00042908'
        },
        {
          coverage: 0.011089912977236164,
          oa11cd: 'E00175566'
        },
        {
          coverage: 0.13916455004650607,
          oa11cd: 'E00042909'
        },
        {
          coverage: 0.009204927966262488,
          oa11cd: 'E00175567'
        },
        {
          coverage: 0.10347331048345719,
          oa11cd: 'E00175559'
        },
        {
          coverage: 0.17687087117231032,
          oa11cd: 'E00175563'
        },
        {
          coverage: 0.2120587279183151,
          oa11cd: 'E00175580'
        },
        {
          coverage: 0.3418022978246075,
          oa11cd: 'E00175583'
        },
        {
          coverage: 0.02850941221811828,
          oa11cd: 'E00175590'
        },
        {
          coverage: 0.024192485172193457,
          oa11cd: 'E00175589'
        },
        {
          coverage: 0.09146335674733622,
          oa11cd: 'E00175603'
        },
        {
          coverage: 0.10824286701856033,
          oa11cd: 'E00175592'
        },
        {
          coverage: 0.000529013451728522,
          oa11cd: 'E00175605'
        },
        {
          coverage: 0.006430778949671322,
          oa11cd: 'E00175591'
        },
        {
          coverage: 0.2841666954952901,
          oa11cd: 'E00175596'
        },
        {
          coverage: 0.3318609340246284,
          oa11cd: 'E00175584'
        },
        {
          coverage: 0.12850123436993924,
          oa11cd: 'E00042766'
        },
        {
          coverage: 0.08675474571593142,
          oa11cd: 'E00042767'
        },
        {
          coverage: 0.414441035551118,
          oa11cd: 'E00042764'
        },
        {
          coverage: 0.3526072949773175,
          oa11cd: 'E00175588'
        },
        {
          coverage: 0.15219525822736218,
          oa11cd: 'E00042765'
        },
        {
          coverage: 0.05176694357783251,
          oa11cd: 'E00175565'
        },
        {
          coverage: 0.29990555646396155,
          oa11cd: 'E00042762'
        },
        {
          coverage: 0.694535937175503,
          oa11cd: 'E00042763'
        },
        {
          coverage: 0.12301581281096667,
          oa11cd: 'E00042760'
        },
        {
          coverage: 0.5022202647864982,
          oa11cd: 'E00042761'
        },
        {
          coverage: 0.12088981333026776,
          oa11cd: 'E00042768'
        },
        {
          coverage: 0.08921682158650816,
          oa11cd: 'E00042769'
        },
        {
          coverage: 0.08683853967437666,
          oa11cd: 'E00042756'
        },
        {
          coverage: 0.13546235900059397,
          oa11cd: 'E00042757'
        },
        {
          coverage: 0.10519692734047477,
          oa11cd: 'E00042754'
        },
        {
          coverage: 0.012809982111976967,
          oa11cd: 'E00175581'
        },
        {
          coverage: 0.08730184918860102,
          oa11cd: 'E00042755'
        },
        {
          coverage: 0.15066548223613205,
          oa11cd: 'E00042752'
        },
        {
          coverage: 0.09604348156931714,
          oa11cd: 'E00042753'
        },
        {
          coverage: 0.11354053068203807,
          oa11cd: 'E00042750'
        },
        {
          coverage: 0.09299650788562266,
          oa11cd: 'E00042751'
        },
        {
          coverage: 0.09770089194505273,
          oa11cd: 'E00042758'
        },
        {
          coverage: 0.22688998705465988,
          oa11cd: 'E00042759'
        },
        {
          coverage: 0.05671388972733577,
          oa11cd: 'E00042706'
        },
        {
          coverage: 0.025083628553727682,
          oa11cd: 'E00042787'
        },
        {
          coverage: 0.05679359364237042,
          oa11cd: 'E00042707'
        },
        {
          coverage: 0.0278389402056719,
          oa11cd: 'E00042786'
        },
        {
          coverage: 0.10819491659153344,
          oa11cd: 'E00042704'
        },
        {
          coverage: 0.019273886032855105,
          oa11cd: 'E00042785'
        },
        {
          coverage: 0.11747411172966743,
          oa11cd: 'E00042705'
        },
        {
          coverage: 0.0725208866280519,
          oa11cd: 'E00042784'
        },
        {
          coverage: 0.1577028663881825,
          oa11cd: 'E00042702'
        },
        {
          coverage: 0.013928561101684668,
          oa11cd: 'E00042783'
        },
        {
          coverage: 0.021194868265695273,
          oa11cd: 'E00042782'
        },
        {
          coverage: 0.04188184874888967,
          oa11cd: 'E00042781'
        },
        {
          coverage: 0.017618719996729943,
          oa11cd: 'E00042780'
        },
        {
          coverage: 0.21554860048714214,
          oa11cd: 'E00042708'
        },
        {
          coverage: 0.06706318543277776,
          oa11cd: 'E00042789'
        },
        {
          coverage: 0.24987137248300512,
          oa11cd: 'E00042709'
        },
        {
          coverage: 0.018103249511085585,
          oa11cd: 'E00042788'
        },
        {
          coverage: 0.2112529962315,
          oa11cd: 'E00042046'
        },
        {
          coverage: 0.18698256749806028,
          oa11cd: 'E00042047'
        },
        {
          coverage: 0.03946252599061115,
          oa11cd: 'E00042044'
        },
        {
          coverage: 0.26967683217292193,
          oa11cd: 'E00042045'
        },
        {
          coverage: 0.1719002694335198,
          oa11cd: 'E00042042'
        },
        {
          coverage: 0.0347555131947484,
          oa11cd: 'E00042043'
        },
        {
          coverage: 0.05551542077879333,
          oa11cd: 'E00042048'
        },
        {
          coverage: 0.0536191062214268,
          oa11cd: 'E00042049'
        },
        {
          coverage: 0.3980463195537333,
          oa11cd: 'E00042276'
        },
        {
          coverage: 0.34564284559229597,
          oa11cd: 'E00042277'
        },
        {
          coverage: 0.5862926738116537,
          oa11cd: 'E00042274'
        },
        {
          coverage: 0.4300428463575733,
          oa11cd: 'E00042275'
        },
        {
          coverage: 0.33569812978203145,
          oa11cd: 'E00042272'
        },
        {
          coverage: 0.6264581180222357,
          oa11cd: 'E00042273'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042270'
        },
        {
          coverage: 0.4476973060680888,
          oa11cd: 'E00042271'
        },
        {
          coverage: 0.5227502003165263,
          oa11cd: 'E00042278'
        },
        {
          coverage: 0.26680440067140576,
          oa11cd: 'E00042279'
        },
        {
          coverage: 0.08861864592093983,
          oa11cd: 'E00042226'
        },
        {
          coverage: 0.11024000950128589,
          oa11cd: 'E00042227'
        },
        {
          coverage: 0.04051176492897315,
          oa11cd: 'E00042224'
        },
        {
          coverage: 0.057139860200310706,
          oa11cd: 'E00042225'
        },
        {
          coverage: 0.06342797361557544,
          oa11cd: 'E00042222'
        },
        {
          coverage: 0.08379726120317407,
          oa11cd: 'E00042223'
        },
        {
          coverage: 0.03579369505227208,
          oa11cd: 'E00042220'
        },
        {
          coverage: 0.05583433212743676,
          oa11cd: 'E00042221'
        },
        {
          coverage: 0.39486291355417447,
          oa11cd: 'E00042228'
        },
        {
          coverage: 0.0904950878671176,
          oa11cd: 'E00042229'
        },
        {
          coverage: 0.04997550483990513,
          oa11cd: 'E00042216'
        },
        {
          coverage: 0.4075137246366314,
          oa11cd: 'E00042297'
        },
        {
          coverage: 0.11324328415212236,
          oa11cd: 'E00042217'
        },
        {
          coverage: 0.4745930629129544,
          oa11cd: 'E00042296'
        },
        {
          coverage: 0.03916795218470316,
          oa11cd: 'E00042214'
        },
        {
          coverage: 0.1947284715378156,
          oa11cd: 'E00042295'
        },
        {
          coverage: 0.03578785589688485,
          oa11cd: 'E00042215'
        },
        {
          coverage: 0.3166035312339895,
          oa11cd: 'E00042294'
        },
        {
          coverage: 0.040129372137892014,
          oa11cd: 'E00042212'
        },
        {
          coverage: 0.2364979388747123,
          oa11cd: 'E00042293'
        },
        {
          coverage: 0.0205241191018418,
          oa11cd: 'E00042213'
        },
        {
          coverage: 0.03973066070589859,
          oa11cd: 'E00042292'
        },
        {
          coverage: 0.06211792388042613,
          oa11cd: 'E00042210'
        },
        {
          coverage: 0.565549258564172,
          oa11cd: 'E00042291'
        },
        {
          coverage: 0.1217951101218492,
          oa11cd: 'E00042211'
        },
        {
          coverage: 0.23290233854901587,
          oa11cd: 'E00042290'
        },
        {
          coverage: 0.16031846890804374,
          oa11cd: 'E00042299'
        },
        {
          coverage: 0.044480830556468016,
          oa11cd: 'E00042219'
        },
        {
          coverage: 0.4774543194787911,
          oa11cd: 'E00042298'
        },
        {
          coverage: 0.17892061394202483,
          oa11cd: 'E00042466'
        },
        {
          coverage: 0.186432666358142,
          oa11cd: 'E00042467'
        },
        {
          coverage: 0.2011217209223697,
          oa11cd: 'E00042464'
        },
        {
          coverage: 0.11437358995530515,
          oa11cd: 'E00042465'
        },
        {
          coverage: 0.22542347544621857,
          oa11cd: 'E00042462'
        },
        {
          coverage: 0.29452379885336816,
          oa11cd: 'E00042463'
        },
        {
          coverage: 0.21597678017864108,
          oa11cd: 'E00042460'
        },
        {
          coverage: 0.2893473436239414,
          oa11cd: 'E00042461'
        },
        {
          coverage: 0.187730267760421,
          oa11cd: 'E00042468'
        },
        {
          coverage: 0.15330766745781554,
          oa11cd: 'E00042469'
        },
        {
          coverage: 0.28080506140097605,
          oa11cd: 'E00042456'
        },
        {
          coverage: 0.3036304413206044,
          oa11cd: 'E00042457'
        },
        {
          coverage: 0.0224464001738825,
          oa11cd: 'E00042846'
        },
        {
          coverage: 0.2099510567156628,
          oa11cd: 'E00042454'
        },
        {
          coverage: 0.05654450249013579,
          oa11cd: 'E00042847'
        },
        {
          coverage: 0.3495617188300856,
          oa11cd: 'E00042455'
        },
        {
          coverage: 0.04918244181142978,
          oa11cd: 'E00042844'
        },
        {
          coverage: 0.4965507883097131,
          oa11cd: 'E00042452'
        },
        {
          coverage: 0.01304915342562083,
          oa11cd: 'E00042845'
        },
        {
          coverage: 0.5578983199306679,
          oa11cd: 'E00042453'
        },
        {
          coverage: 0.016872890064614662,
          oa11cd: 'E00042842'
        },
        {
          coverage: 0.6063904126691283,
          oa11cd: 'E00042450'
        },
        {
          coverage: 0.17878579783022838,
          oa11cd: 'E00042843'
        },
        {
          coverage: 0.6258009588430006,
          oa11cd: 'E00042451'
        },
        {
          coverage: 0.07259067532628544,
          oa11cd: 'E00042840'
        },
        {
          coverage: 0.10688503323319902,
          oa11cd: 'E00042841'
        },
        {
          coverage: 0.49070889906984616,
          oa11cd: 'E00042458'
        },
        {
          coverage: 0.2333002073114868,
          oa11cd: 'E00042459'
        },
        {
          coverage: 0.11202612008058002,
          oa11cd: 'E00042848'
        },
        {
          coverage: 0.09900149088522557,
          oa11cd: 'E00042849'
        },
        {
          coverage: 0.5309444934057675,
          oa11cd: 'E00042406'
        },
        {
          coverage: 0.35138681080713696,
          oa11cd: 'E00042487'
        },
        {
          coverage: 0.4023686327611918,
          oa11cd: 'E00042407'
        },
        {
          coverage: 0.14628436580068319,
          oa11cd: 'E00042486'
        },
        {
          coverage: 0.21125713972802412,
          oa11cd: 'E00042836'
        },
        {
          coverage: 0.37076722935226053,
          oa11cd: 'E00042404'
        },
        {
          coverage: 0.250382687194401,
          oa11cd: 'E00042485'
        },
        {
          coverage: 0.00733148135029914,
          oa11cd: 'E00042837'
        },
        {
          coverage: 0.327703086158118,
          oa11cd: 'E00042405'
        },
        {
          coverage: 0.36302589929645357,
          oa11cd: 'E00042484'
        },
        {
          coverage: 0.008670983034523672,
          oa11cd: 'E00042834'
        },
        {
          coverage: 0.10672218458039036,
          oa11cd: 'E00042402'
        },
        {
          coverage: 0.5248198166478009,
          oa11cd: 'E00042483'
        },
        {
          coverage: 0.04265300846859432,
          oa11cd: 'E00042835'
        },
        {
          coverage: 0.45288778562542187,
          oa11cd: 'E00042482'
        },
        {
          coverage: 0.18530697478636998,
          oa11cd: 'E00042832'
        },
        {
          coverage: 0.021540207097631787,
          oa11cd: 'E00042400'
        },
        {
          coverage: 0.08302472101341633,
          oa11cd: 'E00042481'
        },
        {
          coverage: 0.2474948700459175,
          oa11cd: 'E00042833'
        },
        {
          coverage: 0.014623764091741603,
          oa11cd: 'E00042401'
        },
        {
          coverage: 0.36450172559831945,
          oa11cd: 'E00042480'
        },
        {
          coverage: 0.22658741858093473,
          oa11cd: 'E00042830'
        },
        {
          coverage: 0.22927758510377222,
          oa11cd: 'E00042831'
        },
        {
          coverage: 0.5807551445799864,
          oa11cd: 'E00042408'
        },
        {
          coverage: 0.23307688670579893,
          oa11cd: 'E00042489'
        },
        {
          coverage: 0.3900172877176244,
          oa11cd: 'E00042409'
        },
        {
          coverage: 0.2215308990760945,
          oa11cd: 'E00042488'
        },
        {
          coverage: 0.05935548600045521,
          oa11cd: 'E00042838'
        },
        {
          coverage: 0.01884726198091707,
          oa11cd: 'E00042146'
        },
        {
          coverage: 0.03058561634870508,
          oa11cd: 'E00042147'
        },
        {
          coverage: 0.01946541466415998,
          oa11cd: 'E00042144'
        },
        {
          coverage: 0.02376013353593803,
          oa11cd: 'E00042145'
        },
        {
          coverage: 0.06546150326155645,
          oa11cd: 'E00042142'
        },
        {
          coverage: 0.01729680091531581,
          oa11cd: 'E00042143'
        },
        {
          coverage: 0.03998977645963862,
          oa11cd: 'E00042140'
        },
        {
          coverage: 0.028688079588856576,
          oa11cd: 'E00042141'
        },
        {
          coverage: 0.05128627094824661,
          oa11cd: 'E00042148'
        },
        {
          coverage: 0.025415127625688264,
          oa11cd: 'E00042149'
        },
        {
          coverage: 0.09179740809490637,
          oa11cd: 'E00042136'
        },
        {
          coverage: 0.3086637798067859,
          oa11cd: 'E00042137'
        },
        {
          coverage: 0.15902367354283609,
          oa11cd: 'E00042134'
        },
        {
          coverage: 0.1374373055425524,
          oa11cd: 'E00042135'
        },
        {
          coverage: 0.08859738604491355,
          oa11cd: 'E00042132'
        },
        {
          coverage: 0.10884363209488487,
          oa11cd: 'E00042133'
        },
        {
          coverage: 0.2563626246220638,
          oa11cd: 'E00042130'
        },
        {
          coverage: 0.14570668772466647,
          oa11cd: 'E00042131'
        },
        {
          coverage: 0.22054212308601176,
          oa11cd: 'E00042138'
        },
        {
          coverage: 0.2608632463914004,
          oa11cd: 'E00042139'
        },
        {
          coverage: 0.5746494226250077,
          oa11cd: 'E00042646'
        },
        {
          coverage: 0.25077571236118196,
          oa11cd: 'E00042647'
        },
        {
          coverage: 0.31400908046487974,
          oa11cd: 'E00042644'
        },
        {
          coverage: 0.4415211504957205,
          oa11cd: 'E00042645'
        },
        {
          coverage: 0.2856319658418764,
          oa11cd: 'E00042642'
        },
        {
          coverage: 0.2013962505011981,
          oa11cd: 'E00042643'
        },
        {
          coverage: 0.006768726051098174,
          oa11cd: 'E00042640'
        },
        {
          coverage: 0.18813862849802362,
          oa11cd: 'E00042641'
        },
        {
          coverage: 0.22018863291923033,
          oa11cd: 'E00042648'
        },
        {
          coverage: 0.1920479600519513,
          oa11cd: 'E00042649'
        },
        {
          coverage: 0.0011462748629930267,
          oa11cd: 'E00042636'
        },
        {
          coverage: 0.001938682165749695,
          oa11cd: 'E00042637'
        },
        {
          coverage: 0.000695175384789502,
          oa11cd: 'E00042634'
        },
        {
          coverage: 0.0001289955753327371,
          oa11cd: 'E00042635'
        },
        {
          coverage: 0.00023826035669784453,
          oa11cd: 'E00042632'
        },
        {
          coverage: 0.012647324845851831,
          oa11cd: 'E00042633'
        },
        {
          coverage: 0.00012138663051952475,
          oa11cd: 'E00042630'
        },
        {
          coverage: 0.00015397447850897336,
          oa11cd: 'E00042631'
        },
        {
          coverage: 0.0012453786960918882,
          oa11cd: 'E00042638'
        },
        {
          coverage: 0.005239591314784941,
          oa11cd: 'E00042639'
        },
        {
          coverage: 0.40792724952557924,
          oa11cd: 'E00042376'
        },
        {
          coverage: 0.28233758098760664,
          oa11cd: 'E00042377'
        },
        {
          coverage: 0.03564425510486928,
          oa11cd: 'E00042374'
        },
        {
          coverage: 0.06910875087612588,
          oa11cd: 'E00042375'
        },
        {
          coverage: 0.03205909487235977,
          oa11cd: 'E00042372'
        },
        {
          coverage: 0.03495688627867321,
          oa11cd: 'E00042373'
        },
        {
          coverage: 0.04060958969462994,
          oa11cd: 'E00042370'
        },
        {
          coverage: 0.08053171943486437,
          oa11cd: 'E00042371'
        },
        {
          coverage: 0.03448698237886427,
          oa11cd: 'E00042378'
        },
        {
          coverage: 0.0574504980765715,
          oa11cd: 'E00042379'
        },
        {
          coverage: 0.1378482753701252,
          oa11cd: 'E00042326'
        },
        {
          coverage: 0.18675582211703234,
          oa11cd: 'E00042327'
        },
        {
          coverage: 0.22424029677548293,
          oa11cd: 'E00042324'
        },
        {
          coverage: 0.33004805254227504,
          oa11cd: 'E00042325'
        },
        {
          coverage: 0.20896801306182933,
          oa11cd: 'E00042322'
        },
        {
          coverage: 0.40528728103010697,
          oa11cd: 'E00042323'
        },
        {
          coverage: 0.10330843836975308,
          oa11cd: 'E00042320'
        },
        {
          coverage: 0.17629655162392222,
          oa11cd: 'E00042321'
        },
        {
          coverage: 0.27401730410348213,
          oa11cd: 'E00042328'
        },
        {
          coverage: 0.3858100157433259,
          oa11cd: 'E00042329'
        },
        {
          coverage: 0.13798206577574654,
          oa11cd: 'E00042316'
        },
        {
          coverage: 0.052612954176541715,
          oa11cd: 'E00042397'
        },
        {
          coverage: 0.14226188485935426,
          oa11cd: 'E00042317'
        },
        {
          coverage: 0.028664528990131815,
          oa11cd: 'E00042396'
        },
        {
          coverage: 0.0735273021312998,
          oa11cd: 'E00042314'
        },
        {
          coverage: 0.03358097457155645,
          oa11cd: 'E00042395'
        },
        {
          coverage: 0.11051611506262532,
          oa11cd: 'E00042315'
        },
        {
          coverage: 0.06593800923551153,
          oa11cd: 'E00042394'
        },
        {
          coverage: 0.08130116722477365,
          oa11cd: 'E00042312'
        },
        {
          coverage: 0.08932269329484399,
          oa11cd: 'E00042393'
        },
        {
          coverage: 0.0959478971455291,
          oa11cd: 'E00042313'
        },
        {
          coverage: 0.020625691349932893,
          oa11cd: 'E00042392'
        },
        {
          coverage: 0.04001846960451204,
          oa11cd: 'E00042310'
        },
        {
          coverage: 0.051015393206527634,
          oa11cd: 'E00042391'
        },
        {
          coverage: 0.02451443621191411,
          oa11cd: 'E00042390'
        },
        {
          coverage: 0.12791442476787698,
          oa11cd: 'E00042318'
        },
        {
          coverage: 0.012335533474608392,
          oa11cd: 'E00042399'
        },
        {
          coverage: 0.1368008105990072,
          oa11cd: 'E00042319'
        },
        {
          coverage: 0.14640458573141274,
          oa11cd: 'E00042398'
        },
        {
          coverage: 0.6621969755281535,
          oa11cd: 'E00042566'
        },
        {
          coverage: 0.5345476606020999,
          oa11cd: 'E00042567'
        },
        {
          coverage: 0.274440210331029,
          oa11cd: 'E00042564'
        },
        {
          coverage: 0.3724896960808812,
          oa11cd: 'E00042565'
        },
        {
          coverage: 0.297653785706702,
          oa11cd: 'E00042562'
        },
        {
          coverage: 0.37423016662732783,
          oa11cd: 'E00042563'
        },
        {
          coverage: 0.2564011185847468,
          oa11cd: 'E00042560'
        },
        {
          coverage: 0.4555278885551473,
          oa11cd: 'E00042561'
        },
        {
          coverage: 0.3894872177533921,
          oa11cd: 'E00042568'
        },
        {
          coverage: 0.7504969579274838,
          oa11cd: 'E00042569'
        },
        {
          coverage: 0.23485268714148064,
          oa11cd: 'E00042556'
        },
        {
          coverage: 0.11045964139488426,
          oa11cd: 'E00042557'
        },
        {
          coverage: 0.18063728788812233,
          oa11cd: 'E00042554'
        },
        {
          coverage: 0.11500439802688449,
          oa11cd: 'E00042555'
        },
        {
          coverage: 0.24078263822733142,
          oa11cd: 'E00042552'
        },
        {
          coverage: 0.16683189270316243,
          oa11cd: 'E00042553'
        },
        {
          coverage: 0.1560364569588811,
          oa11cd: 'E00042550'
        },
        {
          coverage: 0.2223730394603513,
          oa11cd: 'E00042551'
        },
        {
          coverage: 0.10115280286181205,
          oa11cd: 'E00042558'
        },
        {
          coverage: 0.17961494073687959,
          oa11cd: 'E00042559'
        },
        {
          coverage: 0.10544993491509254,
          oa11cd: 'E00042506'
        },
        {
          coverage: 0.6200216599708495,
          oa11cd: 'E00042587'
        },
        {
          coverage: 0.1628712745017823,
          oa11cd: 'E00042507'
        },
        {
          coverage: 0.5896474833022698,
          oa11cd: 'E00042586'
        },
        {
          coverage: 0.12385897841572308,
          oa11cd: 'E00042504'
        },
        {
          coverage: 0.44245151925316867,
          oa11cd: 'E00042585'
        },
        {
          coverage: 0.1518420298243692,
          oa11cd: 'E00042505'
        },
        {
          coverage: 0.796353557834429,
          oa11cd: 'E00042584'
        },
        {
          coverage: 0.07894679690366295,
          oa11cd: 'E00042502'
        },
        {
          coverage: 0.28651851198873,
          oa11cd: 'E00042583'
        },
        {
          coverage: 0.11872879438498106,
          oa11cd: 'E00042503'
        },
        {
          coverage: 0.7248353359262075,
          oa11cd: 'E00042582'
        },
        {
          coverage: 0.11813768884236842,
          oa11cd: 'E00042500'
        },
        {
          coverage: 0.5192601332963047,
          oa11cd: 'E00042581'
        },
        {
          coverage: 0.06986599533500941,
          oa11cd: 'E00042501'
        },
        {
          coverage: 0.3134470993714599,
          oa11cd: 'E00042580'
        },
        {
          coverage: 0.05533467826031032,
          oa11cd: 'E00042930'
        },
        {
          coverage: 0.25210563968017985,
          oa11cd: 'E00042508'
        },
        {
          coverage: 0.4277577685217761,
          oa11cd: 'E00042589'
        },
        {
          coverage: 0.2848428439083255,
          oa11cd: 'E00042509'
        },
        {
          coverage: 0.6799479210155918,
          oa11cd: 'E00042588'
        },
        {
          coverage: 0.0644605477569243,
          oa11cd: 'E00175604'
        },
        {
          coverage: 0.06455358276339186,
          oa11cd: 'E00175601'
        },
        {
          coverage: 0.10500287742621389,
          oa11cd: 'E00175562'
        },
        {
          coverage: 0.32442174990469874,
          oa11cd: 'E00175594'
        },
        {
          coverage: 0.15379873629033322,
          oa11cd: 'E00175582'
        },
        {
          coverage: 0.23741179205504864,
          oa11cd: 'E00175557'
        },
        {
          coverage: 0.005212660621598986,
          oa11cd: 'E00175572'
        },
        {
          coverage: 0.06741287088090704,
          oa11cd: 'E00175602'
        },
        {
          coverage: 0.07339011416787047,
          oa11cd: 'E00175550'
        },
        {
          coverage: 0.34595978049356807,
          oa11cd: 'E00175600'
        },
        {
          coverage: 0.16894515068011073,
          oa11cd: 'E00042746'
        },
        {
          coverage: 0.14783100850805067,
          oa11cd: 'E00042747'
        },
        {
          coverage: 0.2705346826312741,
          oa11cd: 'E00042745'
        },
        {
          coverage: 0.08528201562181925,
          oa11cd: 'E00042742'
        },
        {
          coverage: 0.07204278702227297,
          oa11cd: 'E00042743'
        },
        {
          coverage: 0.48361108979446266,
          oa11cd: 'E00042740'
        },
        {
          coverage: 0.33845636302131454,
          oa11cd: 'E00042741'
        },
        {
          coverage: 0.14922315915411133,
          oa11cd: 'E00042748'
        },
        {
          coverage: 0.06925473270353742,
          oa11cd: 'E00042736'
        },
        {
          coverage: 0.07579681397443207,
          oa11cd: 'E00042737'
        },
        {
          coverage: 0.04426885283292911,
          oa11cd: 'E00042734'
        },
        {
          coverage: 0.057534089714916435,
          oa11cd: 'E00042735'
        },
        {
          coverage: 0.03224494147562909,
          oa11cd: 'E00042732'
        },
        {
          coverage: 0.03709672927410342,
          oa11cd: 'E00042733'
        },
        {
          coverage: 0.11491379170975642,
          oa11cd: 'E00042730'
        },
        {
          coverage: 0.07593750172865744,
          oa11cd: 'E00042731'
        },
        {
          coverage: 0.07600229138625261,
          oa11cd: 'E00042738'
        },
        {
          coverage: 0.07576492961593645,
          oa11cd: 'E00042739'
        },
        {
          coverage: 0.05359421998504171,
          oa11cd: 'E00042076'
        },
        {
          coverage: 0.033439134373942185,
          oa11cd: 'E00042077'
        },
        {
          coverage: 0.08440320707451336,
          oa11cd: 'E00042074'
        },
        {
          coverage: 0.06676670636190452,
          oa11cd: 'E00042075'
        },
        {
          coverage: 0.12457984874615956,
          oa11cd: 'E00042072'
        },
        {
          coverage: 0.10507067555138708,
          oa11cd: 'E00042073'
        },
        {
          coverage: 0.034221670658207796,
          oa11cd: 'E00042070'
        },
        {
          coverage: 0.026638736774746107,
          oa11cd: 'E00042071'
        },
        {
          coverage: 0.04594304095844988,
          oa11cd: 'E00042078'
        },
        {
          coverage: 0.05718279895163222,
          oa11cd: 'E00042079'
        },
        {
          coverage: 0.09638409755108218,
          oa11cd: 'E00042097'
        },
        {
          coverage: 0.05402885052875135,
          oa11cd: 'E00042096'
        },
        {
          coverage: 0.07174795020341951,
          oa11cd: 'E00042095'
        },
        {
          coverage: 0.04303290766225359,
          oa11cd: 'E00042094'
        },
        {
          coverage: 0.04651292881179905,
          oa11cd: 'E00042093'
        },
        {
          coverage: 0.03552903194309929,
          oa11cd: 'E00042092'
        },
        {
          coverage: 0.2562875251197668,
          oa11cd: 'E00042091'
        },
        {
          coverage: 0.4307775044006975,
          oa11cd: 'E00042090'
        },
        {
          coverage: 0.12844840079067482,
          oa11cd: 'E00042099'
        },
        {
          coverage: 0.7433666144205431,
          oa11cd: 'E00042266'
        },
        {
          coverage: 0.6518208589306725,
          oa11cd: 'E00042267'
        },
        {
          coverage: 0.5068190017293824,
          oa11cd: 'E00042264'
        },
        {
          coverage: 0.6633044572427678,
          oa11cd: 'E00042265'
        },
        {
          coverage: 0.6608397162760605,
          oa11cd: 'E00042262'
        },
        {
          coverage: 0.38543012101674784,
          oa11cd: 'E00042263'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042260'
        },
        {
          coverage: 0.3408367798064086,
          oa11cd: 'E00042261'
        },
        {
          coverage: 0.30687075102657746,
          oa11cd: 'E00042268'
        },
        {
          coverage: 0.744634639953702,
          oa11cd: 'E00042269'
        },
        {
          coverage: 0.6104310243764658,
          oa11cd: 'E00042256'
        },
        {
          coverage: 0.06746466024091541,
          oa11cd: 'E00042257'
        },
        {
          coverage: 0.15006320838017692,
          oa11cd: 'E00042254'
        },
        {
          coverage: 0.7022473939503574,
          oa11cd: 'E00042255'
        },
        {
          coverage: 0.49744669549586995,
          oa11cd: 'E00042252'
        },
        {
          coverage: 0.03215968439749815,
          oa11cd: 'E00042253'
        },
        {
          coverage: 0.047218130291887664,
          oa11cd: 'E00042250'
        },
        {
          coverage: 0.6023910884283131,
          oa11cd: 'E00042251'
        },
        {
          coverage: 0.04828034057186218,
          oa11cd: 'E00042259'
        },
        {
          coverage: 0.02022727262791542,
          oa11cd: 'E00042206'
        },
        {
          coverage: 0.22651355944508147,
          oa11cd: 'E00042287'
        },
        {
          coverage: 0.030660930341136247,
          oa11cd: 'E00042207'
        },
        {
          coverage: 0.39462421428520944,
          oa11cd: 'E00042286'
        },
        {
          coverage: 0.19338108493877496,
          oa11cd: 'E00042285'
        },
        {
          coverage: 0.25686542613503477,
          oa11cd: 'E00042284'
        },
        {
          coverage: 0.06409181401626678,
          oa11cd: 'E00042202'
        },
        {
          coverage: 0.5041762188815645,
          oa11cd: 'E00042283'
        },
        {
          coverage: 0.013735680968092308,
          oa11cd: 'E00042203'
        },
        {
          coverage: 0.41611360269607733,
          oa11cd: 'E00042282'
        },
        {
          coverage: 0.010779867911758008,
          oa11cd: 'E00042200'
        },
        {
          coverage: 0.4047603636253682,
          oa11cd: 'E00042281'
        },
        {
          coverage: 0.05097824071806158,
          oa11cd: 'E00042201'
        },
        {
          coverage: 0.6729257953782211,
          oa11cd: 'E00042280'
        },
        {
          coverage: 0.018699788817817323,
          oa11cd: 'E00042208'
        },
        {
          coverage: 0.15690904881882678,
          oa11cd: 'E00042289'
        },
        {
          coverage: 0.0451522549631041,
          oa11cd: 'E00042209'
        },
        {
          coverage: 0.13645994307986584,
          oa11cd: 'E00042288'
        },
        {
          coverage: 0.6531978345823543,
          oa11cd: 'E00042446'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042447'
        },
        {
          coverage: 0.8264493134596845,
          oa11cd: 'E00042444'
        },
        {
          coverage: 0.29292602267392964,
          oa11cd: 'E00042876'
        },
        {
          coverage: 0.32058700983800664,
          oa11cd: 'E00042445'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042877'
        },
        {
          coverage: 0.16672462255569936,
          oa11cd: 'E00042442'
        },
        {
          coverage: 0.8058267263343191,
          oa11cd: 'E00042874'
        },
        {
          coverage: 0.14374506805821766,
          oa11cd: 'E00042443'
        },
        {
          coverage: 0.37875064098134437,
          oa11cd: 'E00042875'
        },
        {
          coverage: 0.12726463072917185,
          oa11cd: 'E00042440'
        },
        {
          coverage: 0.009834986912479356,
          oa11cd: 'E00042872'
        },
        {
          coverage: 0.18853229000370175,
          oa11cd: 'E00042441'
        },
        {
          coverage: 0.4068459618350634,
          oa11cd: 'E00042873'
        },
        {
          coverage: 0.009104070952103166,
          oa11cd: 'E00042870'
        },
        {
          coverage: 0.02151542342095823,
          oa11cd: 'E00042871'
        },
        {
          coverage: 0.8473406281765283,
          oa11cd: 'E00042448'
        },
        {
          coverage: 0.5191138388755442,
          oa11cd: 'E00042449'
        },
        {
          coverage: 0.3130131085521118,
          oa11cd: 'E00042878'
        },
        {
          coverage: 0.4232385676084215,
          oa11cd: 'E00042879'
        },
        {
          coverage: 0.47863805942055615,
          oa11cd: 'E00042436'
        },
        {
          coverage: 0.4466945656155603,
          oa11cd: 'E00042437'
        },
        {
          coverage: 0.2823364416260912,
          oa11cd: 'E00042826'
        },
        {
          coverage: 0.5568752064762865,
          oa11cd: 'E00042434'
        },
        {
          coverage: 0.1849948297257723,
          oa11cd: 'E00042827'
        },
        {
          coverage: 0.4151363099830845,
          oa11cd: 'E00042435'
        },
        {
          coverage: 0.27038581543427903,
          oa11cd: 'E00042824'
        },
        {
          coverage: 0.6403160720125436,
          oa11cd: 'E00042432'
        },
        {
          coverage: 0.37055878033550704,
          oa11cd: 'E00042825'
        },
        {
          coverage: 0.6891869062423917,
          oa11cd: 'E00042433'
        },
        {
          coverage: 0.3834988280483151,
          oa11cd: 'E00042822'
        },
        {
          coverage: 0.43726917550592936,
          oa11cd: 'E00042430'
        },
        {
          coverage: 0.3190047614454962,
          oa11cd: 'E00042823'
        },
        {
          coverage: 0.572986104485175,
          oa11cd: 'E00042431'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042820'
        },
        {
          coverage: 0.3569973821938979,
          oa11cd: 'E00042438'
        },
        {
          coverage: 0.4030661896215057,
          oa11cd: 'E00042439'
        },
        {
          coverage: 0.3408018583390126,
          oa11cd: 'E00042828'
        },
        {
          coverage: 0.24609728749125517,
          oa11cd: 'E00042829'
        },
        {
          coverage: 0.011488234931410084,
          oa11cd: 'E00042176'
        },
        {
          coverage: 0.22267066672863642,
          oa11cd: 'E00042897'
        },
        {
          coverage: 0.018824446309319648,
          oa11cd: 'E00042177'
        },
        {
          coverage: 0.24526359678185583,
          oa11cd: 'E00042896'
        },
        {
          coverage: 0.10975663843629371,
          oa11cd: 'E00042814'
        },
        {
          coverage: 0.01048996618513896,
          oa11cd: 'E00042174'
        },
        {
          coverage: 0.18290853756705702,
          oa11cd: 'E00042895'
        },
        {
          coverage: 0.006109476787935633,
          oa11cd: 'E00042175'
        },
        {
          coverage: 0.2639386597539815,
          oa11cd: 'E00042894'
        },
        {
          coverage: 0.004545871287796281,
          oa11cd: 'E00042172'
        },
        {
          coverage: 0.18362856685766818,
          oa11cd: 'E00042893'
        },
        {
          coverage: 0.006310722591874499,
          oa11cd: 'E00042173'
        },
        {
          coverage: 0.5220730722403204,
          oa11cd: 'E00042892'
        },
        {
          coverage: 0.11161904258297393,
          oa11cd: 'E00042810'
        },
        {
          coverage: 0.006404347514547687,
          oa11cd: 'E00042170'
        },
        {
          coverage: 0.22842936663623606,
          oa11cd: 'E00042891'
        },
        {
          coverage: 0.13242729720877272,
          oa11cd: 'E00042811'
        },
        {
          coverage: 0.0039011771037454346,
          oa11cd: 'E00042171'
        },
        {
          coverage: 0.40340125625388407,
          oa11cd: 'E00042890'
        },
        {
          coverage: 0.06891785529658792,
          oa11cd: 'E00042818'
        },
        {
          coverage: 0.01052713200354722,
          oa11cd: 'E00042178'
        },
        {
          coverage: 0.6487243302635805,
          oa11cd: 'E00042899'
        },
        {
          coverage: 0.06963942555126025,
          oa11cd: 'E00042819'
        },
        {
          coverage: 0.04197191997801535,
          oa11cd: 'E00042179'
        },
        {
          coverage: 0.32472109731215837,
          oa11cd: 'E00042898'
        },
        {
          coverage: 0.09621438242892913,
          oa11cd: 'E00042126'
        },
        {
          coverage: 0.19292137821520955,
          oa11cd: 'E00042127'
        },
        {
          coverage: 0.10583935084656348,
          oa11cd: 'E00042124'
        },
        {
          coverage: 0.15415575148204,
          oa11cd: 'E00042125'
        },
        {
          coverage: 0.2528731041576655,
          oa11cd: 'E00042122'
        },
        {
          coverage: 0.1345067727310965,
          oa11cd: 'E00042123'
        },
        {
          coverage: 0.3559993734580887,
          oa11cd: 'E00042120'
        },
        {
          coverage: 0.16420663608885766,
          oa11cd: 'E00042121'
        },
        {
          coverage: 0.14753207387250308,
          oa11cd: 'E00042128'
        },
        {
          coverage: 0.1492222306561986,
          oa11cd: 'E00042129'
        },
        {
          coverage: 0.15309668426371378,
          oa11cd: 'E00042116'
        },
        {
          coverage: 0.00858490107389935,
          oa11cd: 'E00042197'
        },
        {
          coverage: 0.07879755735078342,
          oa11cd: 'E00042117'
        },
        {
          coverage: 0.1803715989420602,
          oa11cd: 'E00042196'
        },
        {
          coverage: 0.40728254236852457,
          oa11cd: 'E00042677'
        },
        {
          coverage: 0.1059224123342369,
          oa11cd: 'E00042114'
        },
        {
          coverage: 0.33236351047700274,
          oa11cd: 'E00042674'
        },
        {
          coverage: 0.07151047373527922,
          oa11cd: 'E00042115'
        },
        {
          coverage: 0.12141375976747515,
          oa11cd: 'E00042194'
        },
        {
          coverage: 0.23399806282775462,
          oa11cd: 'E00042112'
        },
        {
          coverage: 0.16578435009519518,
          oa11cd: 'E00042193'
        },
        {
          coverage: 0.5963900497964367,
          oa11cd: 'E00042672'
        },
        {
          coverage: 0.1529493604579556,
          oa11cd: 'E00042113'
        },
        {
          coverage: 0.10529871863878935,
          oa11cd: 'E00042192'
        },
        {
          coverage: 0.7899151556296209,
          oa11cd: 'E00042673'
        },
        {
          coverage: 0.215644676635634,
          oa11cd: 'E00042110'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042670'
        },
        {
          coverage: 0.2964835098229605,
          oa11cd: 'E00042111'
        },
        {
          coverage: 0.012305815594585217,
          oa11cd: 'E00042190'
        },
        {
          coverage: 0.16003064997912306,
          oa11cd: 'E00042118'
        },
        {
          coverage: 0.014465347787175991,
          oa11cd: 'E00042199'
        },
        {
          coverage: 0.02245472521751961,
          oa11cd: 'E00042198'
        },
        {
          coverage: 0.30804690084992914,
          oa11cd: 'E00042679'
        },
        {
          coverage: 0.0034250427331957143,
          oa11cd: 'E00042626'
        },
        {
          coverage: 0.00043033423736399374,
          oa11cd: 'E00042627'
        },
        {
          coverage: 8.223370057480705e-05,
          oa11cd: 'E00042624'
        },
        {
          coverage: 0.002195204758249025,
          oa11cd: 'E00042625'
        },
        {
          coverage: 4.6813768929620064e-05,
          oa11cd: 'E00042622'
        },
        {
          coverage: 0.00044246401977152556,
          oa11cd: 'E00042623'
        },
        {
          coverage: 0.000227828910105725,
          oa11cd: 'E00042620'
        },
        {
          coverage: 0.0003127358403459068,
          oa11cd: 'E00042621'
        },
        {
          coverage: 0.0004677577711779298,
          oa11cd: 'E00042628'
        },
        {
          coverage: 0.00022187457573257077,
          oa11cd: 'E00042629'
        },
        {
          coverage: 0.00032318901286968274,
          oa11cd: 'E00042616'
        },
        {
          coverage: 0.04164548605627995,
          oa11cd: 'E00042697'
        },
        {
          coverage: 0.00019958030405131582,
          oa11cd: 'E00042617'
        },
        {
          coverage: 0.0003480776559887415,
          oa11cd: 'E00042614'
        },
        {
          coverage: 0.08454980973432318,
          oa11cd: 'E00042695'
        },
        {
          coverage: 0.031000950126858037,
          oa11cd: 'E00042366'
        },
        {
          coverage: 8.163172939896406e-05,
          oa11cd: 'E00042615'
        },
        {
          coverage: 0.01676301476880615,
          oa11cd: 'E00042694'
        },
        {
          coverage: 0.24400800492270985,
          oa11cd: 'E00042367'
        },
        {
          coverage: 0.0007786991023235318,
          oa11cd: 'E00042612'
        },
        {
          coverage: 0.0268699862986373,
          oa11cd: 'E00042693'
        },
        {
          coverage: 0.0004630307995039876,
          oa11cd: 'E00042613'
        },
        {
          coverage: 0.01917590198266854,
          oa11cd: 'E00042365'
        },
        {
          coverage: 0.002520092864691746,
          oa11cd: 'E00042610'
        },
        {
          coverage: 0.02409219343430022,
          oa11cd: 'E00042691'
        },
        {
          coverage: 0.5548309907429616,
          oa11cd: 'E00042362'
        },
        {
          coverage: 0.0007654748696620167,
          oa11cd: 'E00042611'
        },
        {
          coverage: 0.045472366098754456,
          oa11cd: 'E00042690'
        },
        {
          coverage: 0.016783862514503683,
          oa11cd: 'E00042363'
        },
        {
          coverage: 0.11138748212443124,
          oa11cd: 'E00042360'
        },
        {
          coverage: 0.021464340947520408,
          oa11cd: 'E00042361'
        },
        {
          coverage: 0.00021812427977237032,
          oa11cd: 'E00042618'
        },
        {
          coverage: 0.0001267357547691663,
          oa11cd: 'E00042619'
        },
        {
          coverage: 0.18442036733980796,
          oa11cd: 'E00042368'
        },
        {
          coverage: 0.29317534180034205,
          oa11cd: 'E00042369'
        },
        {
          coverage: 0.44343151056233515,
          oa11cd: 'E00042356'
        },
        {
          coverage: 0.46369715684154655,
          oa11cd: 'E00042357'
        },
        {
          coverage: 0.2516590373648078,
          oa11cd: 'E00042354'
        },
        {
          coverage: 0.3199785202805066,
          oa11cd: 'E00042355'
        },
        {
          coverage: 0.21812287485663603,
          oa11cd: 'E00042352'
        },
        {
          coverage: 0.15609842963682935,
          oa11cd: 'E00042350'
        },
        {
          coverage: 0.203144085408866,
          oa11cd: 'E00042351'
        },
        {
          coverage: 0.20805798907925555,
          oa11cd: 'E00042358'
        },
        {
          coverage: 0.27530857833609573,
          oa11cd: 'E00042359'
        },
        {
          coverage: 0.015637464452357367,
          oa11cd: 'E00042387'
        },
        {
          coverage: 0.5811607300655249,
          oa11cd: 'E00042307'
        },
        {
          coverage: 0.009309033588922662,
          oa11cd: 'E00042386'
        },
        {
          coverage: 0.6407853926012239,
          oa11cd: 'E00042304'
        },
        {
          coverage: 0.006706078685938202,
          oa11cd: 'E00042385'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042305'
        },
        {
          coverage: 0.30784243548720597,
          oa11cd: 'E00042384'
        },
        {
          coverage: 0.7248065847114157,
          oa11cd: 'E00042302'
        },
        {
          coverage: 0.1695007853469309,
          oa11cd: 'E00042383'
        },
        {
          coverage: 0.24329079453388733,
          oa11cd: 'E00042303'
        },
        {
          coverage: 0.052997824223242514,
          oa11cd: 'E00042382'
        },
        {
          coverage: 0.24991216558914137,
          oa11cd: 'E00042300'
        },
        {
          coverage: 0.04151261370333717,
          oa11cd: 'E00042381'
        },
        {
          coverage: 0.3943588797493391,
          oa11cd: 'E00042301'
        },
        {
          coverage: 0.48550143190534567,
          oa11cd: 'E00042380'
        },
        {
          coverage: 0.46713227125494056,
          oa11cd: 'E00042308'
        },
        {
          coverage: 0.03827644536286485,
          oa11cd: 'E00042389'
        },
        {
          coverage: 0.0454249839960842,
          oa11cd: 'E00042309'
        },
        {
          coverage: 0.03182589105433119,
          oa11cd: 'E00042388'
        },
        {
          coverage: 0.016501846962537824,
          oa11cd: 'E00042546'
        },
        {
          coverage: 0.5110877179574352,
          oa11cd: 'E00042547'
        },
        {
          coverage: 0.06960637787479569,
          oa11cd: 'E00042544'
        },
        {
          coverage: 0.04338955337760419,
          oa11cd: 'E00042545'
        },
        {
          coverage: 0.024874893359525307,
          oa11cd: 'E00042542'
        },
        {
          coverage: 0.039488030620641136,
          oa11cd: 'E00042543'
        },
        {
          coverage: 0.0813691725084267,
          oa11cd: 'E00042541'
        },
        {
          coverage: 0.5719761300633529,
          oa11cd: 'E00042548'
        },
        {
          coverage: 0.4289993130438638,
          oa11cd: 'E00042549'
        },
        {
          coverage: 0.015146472651369055,
          oa11cd: 'E00042536'
        },
        {
          coverage: 0.009078500228496137,
          oa11cd: 'E00042537'
        },
        {
          coverage: 0.01263246693447055,
          oa11cd: 'E00042534'
        },
        {
          coverage: 0.036477518171843686,
          oa11cd: 'E00042926'
        },
        {
          coverage: 0.020119111721336715,
          oa11cd: 'E00042535'
        },
        {
          coverage: 0.04210785139418746,
          oa11cd: 'E00042927'
        },
        {
          coverage: 0.03749861686880804,
          oa11cd: 'E00042532'
        },
        {
          coverage: 0.02196392569402936,
          oa11cd: 'E00042924'
        },
        {
          coverage: 0.01191832487698222,
          oa11cd: 'E00042533'
        },
        {
          coverage: 0.053925900383428725,
          oa11cd: 'E00042925'
        },
        {
          coverage: 0.015892157300488676,
          oa11cd: 'E00042530'
        },
        {
          coverage: 0.039163997130949035,
          oa11cd: 'E00042922'
        },
        {
          coverage: 0.018663779760452484,
          oa11cd: 'E00042531'
        },
        {
          coverage: 0.09392178427664376,
          oa11cd: 'E00042923'
        },
        {
          coverage: 0.025839844536270376,
          oa11cd: 'E00042920'
        },
        {
          coverage: 0.028357406862972705,
          oa11cd: 'E00042921'
        },
        {
          coverage: 0.015563863516417227,
          oa11cd: 'E00042538'
        },
        {
          coverage: 0.12509242232653975,
          oa11cd: 'E00042539'
        },
        {
          coverage: 0.07124811011763538,
          oa11cd: 'E00042928'
        },
        {
          coverage: 0.05205078449428158,
          oa11cd: 'E00042929'
        },
        {
          coverage: 0.01817408759658385,
          oa11cd: 'E00042916'
        },
        {
          coverage: 0.01976364069729985,
          oa11cd: 'E00042917'
        },
        {
          coverage: 0.014288145734357351,
          oa11cd: 'E00042914'
        },
        {
          coverage: 0.015474124079060863,
          oa11cd: 'E00042915'
        },
        {
          coverage: 0.007554043833407622,
          oa11cd: 'E00042912'
        },
        {
          coverage: 0.01088650017997565,
          oa11cd: 'E00042913'
        },
        {
          coverage: 0.0011160381292803336,
          oa11cd: 'E00042910'
        },
        {
          coverage: 0.0013411781343275865,
          oa11cd: 'E00042911'
        },
        {
          coverage: 0.21455590226829344,
          oa11cd: 'E00175576'
        },
        {
          coverage: 0.02193564691203548,
          oa11cd: 'E00042918'
        },
        {
          coverage: 0.16797124765069874,
          oa11cd: 'E00175558'
        },
        {
          coverage: 0.02373197153941046,
          oa11cd: 'E00042919'
        },
        {
          coverage: 0.3964619018412591,
          oa11cd: 'E00175574'
        },
        {
          coverage: 0.23240854843005979,
          oa11cd: 'E00175560'
        },
        {
          coverage: 0.01489924898389836,
          oa11cd: 'E00175568'
        },
        {
          coverage: 0.003920336763668328,
          oa11cd: 'E00175571'
        },
        {
          coverage: 0.45920664519328747,
          oa11cd: 'E00175555'
        },
        {
          coverage: 0.17577679565764975,
          oa11cd: 'E00175564'
        },
        {
          coverage: 0.12581358661094866,
          oa11cd: 'E00175577'
        },
        {
          coverage: 0.6613400972091783,
          oa11cd: 'E00175599'
        },
        {
          coverage: 0.17621638368827197,
          oa11cd: 'E00175597'
        },
        {
          coverage: 0.27702312833830395,
          oa11cd: 'E00175598'
        },
        {
          coverage: 0.42806547299051206,
          oa11cd: 'E00175556'
        },
        {
          coverage: 0.14344528833316217,
          oa11cd: 'E00042776'
        },
        {
          coverage: 0.20261228961136896,
          oa11cd: 'E00042777'
        },
        {
          coverage: 0.034717439510805595,
          oa11cd: 'E00042774'
        },
        {
          coverage: 0.05268431559460886,
          oa11cd: 'E00042775'
        },
        {
          coverage: 0.07128230726524123,
          oa11cd: 'E00042772'
        },
        {
          coverage: 0.04076257290449227,
          oa11cd: 'E00042773'
        },
        {
          coverage: 0.12232583385333734,
          oa11cd: 'E00042770'
        },
        {
          coverage: 0.2837632150055628,
          oa11cd: 'E00042771'
        },
        {
          coverage: 0.00992267324565735,
          oa11cd: 'E00175570'
        },
        {
          coverage: 0.024002372510382657,
          oa11cd: 'E00175586'
        },
        {
          coverage: 0.30148188733253256,
          oa11cd: 'E00175593'
        },
        {
          coverage: 0.15053415225468786,
          oa11cd: 'E00042778'
        },
        {
          coverage: 0.14544595169854993,
          oa11cd: 'E00175575'
        },
        {
          coverage: 0.4866327281534853,
          oa11cd: 'E00042779'
        },
        {
          coverage: 0.1979363186237547,
          oa11cd: 'E00175579'
        },
        {
          coverage: 0.2069160409358069,
          oa11cd: 'E00175585'
        },
        {
          coverage: 0.2964590382696928,
          oa11cd: 'E00175587'
        },
        {
          coverage: 0.1391128159008051,
          oa11cd: 'E00175551'
        },
        {
          coverage: 0.2123478093388589,
          oa11cd: 'E00042726'
        },
        {
          coverage: 0.2548528181435606,
          oa11cd: 'E00042727'
        },
        {
          coverage: 0.1924545694746897,
          oa11cd: 'E00042724'
        },
        {
          coverage: 0.004217213223707556,
          oa11cd: 'E00175573'
        },
        {
          coverage: 0.07472601411129991,
          oa11cd: 'E00042725'
        },
        {
          coverage: 0.07667457806165776,
          oa11cd: 'E00175552'
        },
        {
          coverage: 0.0977289128219769,
          oa11cd: 'E00042723'
        },
        {
          coverage: 0.13408950511151108,
          oa11cd: 'E00042720'
        },
        {
          coverage: 0.09935808043068049,
          oa11cd: 'E00042728'
        },
        {
          coverage: 0.13625799816851664,
          oa11cd: 'E00042729'
        },
        {
          coverage: 0.05771843540173318,
          oa11cd: 'E00042716'
        },
        {
          coverage: 0.14763919638937084,
          oa11cd: 'E00042797'
        },
        {
          coverage: 0.08811552359225168,
          oa11cd: 'E00042717'
        },
        {
          coverage: 0.08360233381692367,
          oa11cd: 'E00042796'
        },
        {
          coverage: 0.13056686786734856,
          oa11cd: 'E00042714'
        },
        {
          coverage: 0.10037990510602073,
          oa11cd: 'E00042795'
        },
        {
          coverage: 0.2673444924561581,
          oa11cd: 'E00042066'
        },
        {
          coverage: 0.12163149585273993,
          oa11cd: 'E00042715'
        },
        {
          coverage: 0.07347664248955306,
          oa11cd: 'E00042794'
        },
        {
          coverage: 0.01532193804556654,
          oa11cd: 'E00042067'
        },
        {
          coverage: 0.08174839575292953,
          oa11cd: 'E00042712'
        },
        {
          coverage: 0.0461614881461436,
          oa11cd: 'E00042793'
        },
        {
          coverage: 0.3093892598362668,
          oa11cd: 'E00042064'
        },
        {
          coverage: 0.09835596181449438,
          oa11cd: 'E00042713'
        },
        {
          coverage: 0.04556781915748443,
          oa11cd: 'E00042792'
        },
        {
          coverage: 0.1851083548841562,
          oa11cd: 'E00042065'
        },
        {
          coverage: 0.13016441801301348,
          oa11cd: 'E00042710'
        },
        {
          coverage: 0.04021689820864454,
          oa11cd: 'E00042791'
        },
        {
          coverage: 0.3449781263129814,
          oa11cd: 'E00042062'
        },
        {
          coverage: 0.10142039755758593,
          oa11cd: 'E00042711'
        },
        {
          coverage: 0.030224691678722576,
          oa11cd: 'E00042790'
        },
        {
          coverage: 0.3271757064230476,
          oa11cd: 'E00042061'
        },
        {
          coverage: 0.1308957305381086,
          oa11cd: 'E00042718'
        },
        {
          coverage: 0.15149434538253392,
          oa11cd: 'E00042799'
        },
        {
          coverage: 0.17236250189108712,
          oa11cd: 'E00042719'
        },
        {
          coverage: 0.0638666981977658,
          oa11cd: 'E00042798'
        },
        {
          coverage: 0.034059122541518695,
          oa11cd: 'E00042068'
        },
        {
          coverage: 0.025407306123546223,
          oa11cd: 'E00042069'
        },
        {
          coverage: 0.24146680036836526,
          oa11cd: 'E00042056'
        },
        {
          coverage: 0.2367358002873651,
          oa11cd: 'E00042057'
        },
        {
          coverage: 0.03181440485806,
          oa11cd: 'E00042054'
        },
        {
          coverage: 0.0570146399544925,
          oa11cd: 'E00042055'
        },
        {
          coverage: 0.10601409322755954,
          oa11cd: 'E00042052'
        },
        {
          coverage: 0.20021215410609638,
          oa11cd: 'E00042053'
        },
        {
          coverage: 0.1117574415882867,
          oa11cd: 'E00042050'
        },
        {
          coverage: 0.050724809062747477,
          oa11cd: 'E00042051'
        },
        {
          coverage: 0.17090906323108063,
          oa11cd: 'E00042058'
        },
        {
          coverage: 0.2873661775306793,
          oa11cd: 'E00042059'
        },
        {
          coverage: 0.6084111961960927,
          oa11cd: 'E00042087'
        },
        {
          coverage: 0.1973336263764691,
          oa11cd: 'E00042086'
        },
        {
          coverage: 0.1447919034983486,
          oa11cd: 'E00042085'
        },
        {
          coverage: 0.021450948969600946,
          oa11cd: 'E00042084'
        },
        {
          coverage: 0.013707095663684799,
          oa11cd: 'E00042083'
        },
        {
          coverage: 0.025654879768063146,
          oa11cd: 'E00042082'
        },
        {
          coverage: 0.08152609145384464,
          oa11cd: 'E00042081'
        },
        {
          coverage: 0.06867844434518985,
          oa11cd: 'E00042080'
        },
        {
          coverage: 0.531150126691847,
          oa11cd: 'E00042089'
        },
        {
          coverage: 0.3544268088615734,
          oa11cd: 'E00042088'
        },
        {
          coverage: 0.4721502693925997,
          oa11cd: 'E00042246'
        },
        {
          coverage: 0.23184837213093423,
          oa11cd: 'E00042247'
        },
        {
          coverage: 0.1512548844302841,
          oa11cd: 'E00042244'
        },
        {
          coverage: 0.2700129734207477,
          oa11cd: 'E00042245'
        },
        {
          coverage: 0.22274668053629318,
          oa11cd: 'E00042242'
        },
        {
          coverage: 0.15143685527152922,
          oa11cd: 'E00042243'
        },
        {
          coverage: 0.27332001932550437,
          oa11cd: 'E00042241'
        },
        {
          coverage: 0.02087611031006641,
          oa11cd: 'E00042248'
        },
        {
          coverage: 0.030674901007088907,
          oa11cd: 'E00042236'
        },
        {
          coverage: 0.3777550763924383,
          oa11cd: 'E00042237'
        },
        {
          coverage: 0.091624784113234,
          oa11cd: 'E00042234'
        },
        {
          coverage: 0.0898781928535866,
          oa11cd: 'E00042235'
        },
        {
          coverage: 0.050223948443982716,
          oa11cd: 'E00042232'
        },
        {
          coverage: 0.16437141176028805,
          oa11cd: 'E00042233'
        },
        {
          coverage: 0.731345139478844,
          oa11cd: 'E00042230'
        },
        {
          coverage: 0.4950521917689536,
          oa11cd: 'E00042238'
        },
        {
          coverage: 0.6869647295590565,
          oa11cd: 'E00042476'
        },
        {
          coverage: 0.739323904006856,
          oa11cd: 'E00042477'
        },
        {
          coverage: 0.2722999254371549,
          oa11cd: 'E00042474'
        },
        {
          coverage: 0.02886438769387604,
          oa11cd: 'E00042866'
        },
        {
          coverage: 0.6243697406644784,
          oa11cd: 'E00042475'
        },
        {
          coverage: 0.01827423913545701,
          oa11cd: 'E00042867'
        },
        {
          coverage: 0.30735559002333207,
          oa11cd: 'E00042472'
        },
        {
          coverage: 0.01247690475512931,
          oa11cd: 'E00042864'
        },
        {
          coverage: 0.5290565172288595,
          oa11cd: 'E00042473'
        },
        {
          coverage: 0.009501255181994258,
          oa11cd: 'E00042865'
        },
        {
          coverage: 0.43203642855850205,
          oa11cd: 'E00042470'
        },
        {
          coverage: 0.018114416170583007,
          oa11cd: 'E00042862'
        },
        {
          coverage: 0.6975782586461433,
          oa11cd: 'E00042471'
        },
        {
          coverage: 0.32895238448805664,
          oa11cd: 'E00042863'
        },
        {
          coverage: 0.10383268585353568,
          oa11cd: 'E00042860'
        },
        {
          coverage: 0.1543499398289774,
          oa11cd: 'E00042861'
        },
        {
          coverage: 0.22334660934883496,
          oa11cd: 'E00042478'
        },
        {
          coverage: 0.3041756072286058,
          oa11cd: 'E00042479'
        },
        {
          coverage: 0.005870874046262291,
          oa11cd: 'E00042868'
        },
        {
          coverage: 0.029757771742961868,
          oa11cd: 'E00042869'
        },
        {
          coverage: 0.5492938478100022,
          oa11cd: 'E00042426'
        },
        {
          coverage: 0.6405216621821835,
          oa11cd: 'E00042427'
        },
        {
          coverage: 0.47978495278686123,
          oa11cd: 'E00042424'
        },
        {
          coverage: 0.014101013965779785,
          oa11cd: 'E00042856'
        },
        {
          coverage: 0.7015673802761793,
          oa11cd: 'E00042425'
        },
        {
          coverage: 0.31014715117217667,
          oa11cd: 'E00042857'
        },
        {
          coverage: 0.31617329877984596,
          oa11cd: 'E00042422'
        },
        {
          coverage: 0.03178875113710416,
          oa11cd: 'E00042854'
        },
        {
          coverage: 0.3122221437291656,
          oa11cd: 'E00042423'
        },
        {
          coverage: 0.016880095915934843,
          oa11cd: 'E00042855'
        },
        {
          coverage: 0.2305332079750555,
          oa11cd: 'E00042420'
        },
        {
          coverage: 0.0078768787295406,
          oa11cd: 'E00042852'
        },
        {
          coverage: 0.3174792217601781,
          oa11cd: 'E00042421'
        },
        {
          coverage: 0.21165345690346538,
          oa11cd: 'E00042853'
        },
        {
          coverage: 0.1511477592263646,
          oa11cd: 'E00042850'
        },
        {
          coverage: 0.21160937054304413,
          oa11cd: 'E00042851'
        },
        {
          coverage: 0.6831557631992772,
          oa11cd: 'E00042428'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042429'
        },
        {
          coverage: 0.04371344653001956,
          oa11cd: 'E00042858'
        },
        {
          coverage: 0.06483363285426488,
          oa11cd: 'E00042859'
        },
        {
          coverage: 0.20847522235059973,
          oa11cd: 'E00042416'
        },
        {
          coverage: 0.17962271586448475,
          oa11cd: 'E00042417'
        },
        {
          coverage: 0.17007512720537982,
          oa11cd: 'E00042496'
        },
        {
          coverage: 0.0005315571011264221,
          oa11cd: 'E00042166'
        },
        {
          coverage: 0.24589265963836537,
          oa11cd: 'E00042806'
        },
        {
          coverage: 0.6115715415583313,
          oa11cd: 'E00042414'
        },
        {
          coverage: 0.11970404317849123,
          oa11cd: 'E00042495'
        },
        {
          coverage: 0.6489705902601904,
          oa11cd: 'E00042887'
        },
        {
          coverage: 0.13732109500300543,
          oa11cd: 'E00042807'
        },
        {
          coverage: 0.5720511211881315,
          oa11cd: 'E00042415'
        },
        {
          coverage: 0.18402066826314775,
          oa11cd: 'E00042494'
        },
        {
          coverage: 0.7771037679144791,
          oa11cd: 'E00042886'
        },
        {
          coverage: 0.00045999701796057527,
          oa11cd: 'E00042164'
        },
        {
          coverage: 0.7382446377199148,
          oa11cd: 'E00042412'
        },
        {
          coverage: 0.13715252540443781,
          oa11cd: 'E00042493'
        },
        {
          coverage: 0.3898588935777645,
          oa11cd: 'E00042885'
        },
        {
          coverage: 0.13187957582257673,
          oa11cd: 'E00042805'
        },
        {
          coverage: 0.7783651622307353,
          oa11cd: 'E00042413'
        },
        {
          coverage: 0.19531621669213592,
          oa11cd: 'E00042492'
        },
        {
          coverage: 1.0,
          oa11cd: 'E00042884'
        },
        {
          coverage: 8.957714819522083e-06,
          oa11cd: 'E00042162'
        },
        {
          coverage: 0.16944138985645013,
          oa11cd: 'E00042802'
        },
        {
          coverage: 0.4027605259790382,
          oa11cd: 'E00042410'
        },
        {
          coverage: 0.06907819977322718,
          oa11cd: 'E00042491'
        },
        {
          coverage: 0.5740846391144627,
          oa11cd: 'E00042883'
        },
        {
          coverage: 0.1900772527609491,
          oa11cd: 'E00042889'
        },
        {
          coverage: 8.222999798312492e-05,
          oa11cd: 'E00042156'
        },
        {
          coverage: 0.025476359759770383,
          oa11cd: 'E00042180'
        },
        {
          coverage: 0.1875335755556181,
          oa11cd: 'E00042605'
        },
        {
          coverage: 0.19615759851240183,
          oa11cd: 'E00042682'
        },
        {
          coverage: 0.1688129976817545,
          oa11cd: 'E00042681'
        },
        {
          coverage: 0.243927972367675,
          oa11cd: 'E00042345'
        },
        {
          coverage: 0.08049717373116441,
          oa11cd: 'E00042520'
        },
        {
          coverage: 0.3417333964951871,
          oa11cd: 'E00042902'
        },
        {
          coverage: 0.1488266094260007,
          oa11cd: 'E00042518'
        },
        {
          coverage: 0.25615036484676934,
          oa11cd: 'E00175553'
        },
        {
          coverage: 0.12038559780851915,
          oa11cd: 'E00042703'
        },
        {
          coverage: 0.06897102090761383,
          oa11cd: 'E00042218'
        },
        {
          coverage: 0.13683740397540564,
          oa11cd: 'E00042403'
        },
        {
          coverage: 0.02076246148461365,
          oa11cd: 'E00042839'
        },
        {
          coverage: 0.059648453960891114,
          oa11cd: 'E00042311'
        },
        {
          coverage: 0.22389200984639548,
          oa11cd: 'E00042258'
        },
        {
          coverage: 0.036291520108422404,
          oa11cd: 'E00042205'
        },
        {
          coverage: 0.08424667718883701,
          oa11cd: 'E00042816'
        },
        {
          coverage: 0.08769228783679073,
          oa11cd: 'E00042195'
        },
        {
          coverage: 0.1327726703492453,
          oa11cd: 'E00042191'
        },
        {
          coverage: 0.12833491929941265,
          oa11cd: 'E00042364'
        },
        {
          coverage: 0.1036770005880556,
          oa11cd: 'E00042353'
        },
        {
          coverage: 0.18533789475984236,
          oa11cd: 'E00042306'
        },
        {
          coverage: 0.1548985364370355,
          oa11cd: 'E00042540'
        },
        {
          coverage: 0.22842743986663927,
          oa11cd: 'E00042722'
        },
        {
          coverage: 0.2072930190393965,
          oa11cd: 'E00042721'
        },
        {
          coverage: 0.26887041744889345,
          oa11cd: 'E00042240'
        },
        {
          coverage: 0.03146950089115311,
          oa11cd: 'E00042249'
        },
        {
          coverage: 0.0005926716096982058,
          oa11cd: 'E00042165'
        }
      ],
      oa_weight: [
        {
          oa11cd: 'E00042665',
          weight: 0.0009378508685027409
        },
        {
          oa11cd: 'E00042671',
          weight: 0.0007331087774915791
        },
        {
          oa11cd: 'E00042592',
          weight: 0.0009576646192457566
        },
        {
          oa11cd: 'E00042812',
          weight: 0.0010237104550558087
        },
        {
          oa11cd: 'E00042661',
          weight: 0.0006142262730334852
        },
        {
          oa11cd: 'E00175561',
          weight: 0.002641833432402087
        },
        {
          oa11cd: 'E00175595',
          weight: 0.0007066904431675583
        },
        {
          oa11cd: 'E00042803',
          weight: 0.0024965325936199723
        },
        {
          oa11cd: 'E00042411',
          weight: 0.002007793408625586
        },
        {
          oa11cd: 'E00042490',
          weight: 0.001882306320586487
        },
        {
          oa11cd: 'E00042882',
          weight: 0.00349382471435176
        },
        {
          oa11cd: 'E00042160',
          weight: 0.0019219338220725184
        },
        {
          oa11cd: 'E00042800',
          weight: 0.0015454725579552209
        },
        {
          oa11cd: 'E00042881',
          weight: 0.0022719767518657947
        },
        {
          oa11cd: 'E00042161',
          weight: 0.0019285384056535236
        },
        {
          oa11cd: 'E00042801',
          weight: 0.002304999669770821
        },
        {
          oa11cd: 'E00042880',
          weight: 0.002575787596592035
        },
        {
          oa11cd: 'E00042418',
          weight: 0.001994584241463576
        },
        {
          oa11cd: 'E00042499',
          weight: 0.002245558417541774
        },
        {
          oa11cd: 'E00042419',
          weight: 0.0024833234264579618
        },
        {
          oa11cd: 'E00042498',
          weight: 0.0021332804966646855
        },
        {
          oa11cd: 'E00042168',
          weight: 0.001994584241463576
        },
        {
          oa11cd: 'E00042808',
          weight: 0.003242850538273562
        },
        {
          oa11cd: 'E00042169',
          weight: 0.0017766329832904035
        },
        {
          oa11cd: 'E00042888',
          weight: 0.002820157189089228
        },
        {
          oa11cd: 'E00042157',
          weight: 0.0018690971534244766
        },
        {
          oa11cd: 'E00042154',
          weight: 0.0014662175549831583
        },
        {
          oa11cd: 'E00042155',
          weight: 0.0018492834026814608
        },
        {
          oa11cd: 'E00042152',
          weight: 0.001855887986262466
        },
        {
          oa11cd: 'E00042153',
          weight: 0.001697377980318341
        },
        {
          oa11cd: 'E00042150',
          weight: 0.0018426788191004558
        },
        {
          oa11cd: 'E00042151',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042158',
          weight: 0.002192721748893732
        },
        {
          oa11cd: 'E00042159',
          weight: 0.0019879796578825704
        },
        {
          oa11cd: 'E00042666',
          weight: 0.0022323492503797636
        },
        {
          oa11cd: 'E00042106',
          weight: 0.0023776500891618782
        },
        {
          oa11cd: 'E00042187',
          weight: 0.0035994980516478436
        },
        {
          oa11cd: 'E00042667',
          weight: 0.0011954296281619444
        },
        {
          oa11cd: 'E00042107',
          weight: 0.0019813750743015654
        },
        {
          oa11cd: 'E00042186',
          weight: 0.0011359883759328973
        },
        {
          oa11cd: 'E00042664',
          weight: 0.0019153292384915131
        },
        {
          oa11cd: 'E00042104',
          weight: 0.004259956409748365
        },
        {
          oa11cd: 'E00042185',
          weight: 0.0022389538339607686
        },
        {
          oa11cd: 'E00042184',
          weight: 0.002371045505580873
        },
        {
          oa11cd: 'E00042662',
          weight: 0.0022917905026088106
        },
        {
          oa11cd: 'E00042102',
          weight: 0.0027144838517931444
        },
        {
          oa11cd: 'E00042183',
          weight: 0.00212667591308368
        },
        {
          oa11cd: 'E00042663',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042103',
          weight: 0.0024106730070669042
        },
        {
          oa11cd: 'E00042182',
          weight: 0.002371045505580873
        },
        {
          oa11cd: 'E00042100',
          weight: 0.0018426788191004558
        },
        {
          oa11cd: 'E00042101',
          weight: 0.002549369262268014
        },
        {
          oa11cd: 'E00042668',
          weight: 0.0020143979922065914
        },
        {
          oa11cd: 'E00042108',
          weight: 0.002760715936860181
        },
        {
          oa11cd: 'E00042189',
          weight: 0.0017832375668714088
        },
        {
          oa11cd: 'E00042669',
          weight: 0.010270127468463114
        },
        {
          oa11cd: 'E00042109',
          weight: 0.00167095964599432
        },
        {
          oa11cd: 'E00042188',
          weight: 0.002186117165312727
        },
        {
          oa11cd: 'E00042656',
          weight: 0.0022323492503797636
        },
        {
          oa11cd: 'E00042657',
          weight: 0.0029390396935473216
        },
        {
          oa11cd: 'E00042654',
          weight: 0.0010171058714748035
        },
        {
          oa11cd: 'E00042655',
          weight: 0.0015388679743742156
        },
        {
          oa11cd: 'E00042652',
          weight: 0.001393567135592101
        },
        {
          oa11cd: 'E00042653',
          weight: 0.0034145697113796974
        },
        {
          oa11cd: 'E00042650',
          weight: 0.002252163001122779
        },
        {
          oa11cd: 'E00042651',
          weight: 0.0020143979922065914
        },
        {
          oa11cd: 'E00042658',
          weight: 0.002793738854765207
        },
        {
          oa11cd: 'E00042659',
          weight: 0.0029390396935473216
        },
        {
          oa11cd: 'E00042606',
          weight: 0.00273429760253616
        },
        {
          oa11cd: 'E00042687',
          weight: 0.001882306320586487
        },
        {
          oa11cd: 'E00042607',
          weight: 0.00256918301301103
        },
        {
          oa11cd: 'E00042686',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042604',
          weight: 0.004246747242586355
        },
        {
          oa11cd: 'E00042685',
          weight: 0.0008519912819496731
        },
        {
          oa11cd: 'E00042683',
          weight: 0.0016907733967373357
        },
        {
          oa11cd: 'E00042600',
          weight: 0.00988706162076481
        },
        {
          oa11cd: 'E00042601',
          weight: 0.0010699425401228453
        },
        {
          oa11cd: 'E00042608',
          weight: 0.002754111353279176
        },
        {
          oa11cd: 'E00042689',
          weight: 0.0021729079981507166
        },
        {
          oa11cd: 'E00042609',
          weight: 0.006498910243709134
        },
        {
          oa11cd: 'E00042688',
          weight: 0.001492635889307179
        },
        {
          oa11cd: 'E00042347',
          weight: 0.0018955154877484974
        },
        {
          oa11cd: 'E00042344',
          weight: 0.0010435242057988245
        },
        {
          oa11cd: 'E00042342',
          weight: 0.002153094247407701
        },
        {
          oa11cd: 'E00042343',
          weight: 0.0021729079981507166
        },
        {
          oa11cd: 'E00042340',
          weight: 0.0022653721682847896
        },
        {
          oa11cd: 'E00042341',
          weight: 0.00167095964599432
        },
        {
          oa11cd: 'E00042348',
          weight: 0.0019153292384915131
        },
        {
          oa11cd: 'E00042349',
          weight: 0.00288620302489928
        },
        {
          oa11cd: 'E00042336',
          weight: 0.0013539396341060697
        },
        {
          oa11cd: 'E00042337',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042334',
          weight: 0.0021134667459216695
        },
        {
          oa11cd: 'E00042335',
          weight: 0.0018030513176144243
        },
        {
          oa11cd: 'E00042332',
          weight: 0.0033749422098936664
        },
        {
          oa11cd: 'E00042333',
          weight: 0.0021134667459216695
        },
        {
          oa11cd: 'E00042330',
          weight: 0.0013077075490390332
        },
        {
          oa11cd: 'E00042331',
          weight: 0.0010369196222178192
        },
        {
          oa11cd: 'E00042338',
          weight: 0.002179512581731722
        },
        {
          oa11cd: 'E00042339',
          weight: 0.001994584241463576
        },
        {
          oa11cd: 'E00042576',
          weight: 0.0021729079981507166
        },
        {
          oa11cd: 'E00042577',
          weight: 0.001604913810184268
        },
        {
          oa11cd: 'E00042574',
          weight: 0.002192721748893732
        },
        {
          oa11cd: 'E00042575',
          weight: 0.0019021200713295026
        },
        {
          oa11cd: 'E00042572',
          weight: 0.002027607159368602
        },
        {
          oa11cd: 'E00042573',
          weight: 0.0015718908922792419
        },
        {
          oa11cd: 'E00042570',
          weight: 0.002674856350307113
        },
        {
          oa11cd: 'E00042571',
          weight: 0.001486031305726174
        },
        {
          oa11cd: 'E00042578',
          weight: 0.002344627171256852
        },
        {
          oa11cd: 'E00042579',
          weight: 0.0017237963146423617
        },
        {
          oa11cd: 'E00042526',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042527',
          weight: 0.0016181229773462784
        },
        {
          oa11cd: 'E00042524',
          weight: 0.0016907733967373357
        },
        {
          oa11cd: 'E00042525',
          weight: 0.002252163001122779
        },
        {
          oa11cd: 'E00042522',
          weight: 0.0019813750743015654
        },
        {
          oa11cd: 'E00042523',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00042521',
          weight: 0.00197477049072056
        },
        {
          oa11cd: 'E00042528',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00042529',
          weight: 0.0015652863086982366
        },
        {
          oa11cd: 'E00042516',
          weight: 0.00243048675780992
        },
        {
          oa11cd: 'E00042597',
          weight: 0.0008123637804636417
        },
        {
          oa11cd: 'E00042517',
          weight: 0.001393567135592101
        },
        {
          oa11cd: 'E00042596',
          weight: 0.0008585958655306782
        },
        {
          oa11cd: 'E00042514',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042595',
          weight: 0.0008718050326926887
        },
        {
          oa11cd: 'E00042906',
          weight: 0.0016181229773462784
        },
        {
          oa11cd: 'E00042515',
          weight: 0.001637936728089294
        },
        {
          oa11cd: 'E00042594',
          weight: 0.001122779208770887
        },
        {
          oa11cd: 'E00042907',
          weight: 0.00197477049072056
        },
        {
          oa11cd: 'E00042512',
          weight: 0.0021332804966646855
        },
        {
          oa11cd: 'E00042593',
          weight: 0.0018096559011954296
        },
        {
          oa11cd: 'E00042904',
          weight: 0.0021068621623406645
        },
        {
          oa11cd: 'E00042513',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042905',
          weight: 0.0014133808863351165
        },
        {
          oa11cd: 'E00042510',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00042591',
          weight: 0.0016907733967373357
        },
        {
          oa11cd: 'E00042511',
          weight: 0.0019483521563965391
        },
        {
          oa11cd: 'E00042590',
          weight: 0.0015851000594412521
        },
        {
          oa11cd: 'E00042903',
          weight: 0.0025956013473350504
        },
        {
          oa11cd: 'E00042900',
          weight: 0.0049072056006868765
        },
        {
          oa11cd: 'E00042901',
          weight: 0.003916518063536094
        },
        {
          oa11cd: 'E00175578',
          weight: 0.010639984148999405
        },
        {
          oa11cd: 'E00042599',
          weight: 0.001030315038636814
        },
        {
          oa11cd: 'E00175554',
          weight: 0.005257248530480153
        },
        {
          oa11cd: 'E00042519',
          weight: 0.00212667591308368
        },
        {
          oa11cd: 'E00042598',
          weight: 0.0021729079981507166
        },
        {
          oa11cd: 'E00175569',
          weight: 0.0024238821742289147
        },
        {
          oa11cd: 'E00042908',
          weight: 0.0020408163265306124
        },
        {
          oa11cd: 'E00175566',
          weight: 0.001664355062413315
        },
        {
          oa11cd: 'E00042909',
          weight: 0.0016181229773462784
        },
        {
          oa11cd: 'E00175567',
          weight: 0.0024238821742289147
        },
        {
          oa11cd: 'E00175559',
          weight: 0.005415758536424279
        },
        {
          oa11cd: 'E00175563',
          weight: 0.0012218479624859654
        },
        {
          oa11cd: 'E00175580',
          weight: 0.0018690971534244766
        },
        {
          oa11cd: 'E00175583',
          weight: 0.004022191400832178
        },
        {
          oa11cd: 'E00175590',
          weight: 0.0013803579684300905
        },
        {
          oa11cd: 'E00175589',
          weight: 0.0021729079981507166
        },
        {
          oa11cd: 'E00175603',
          weight: 0.001882306320586487
        },
        {
          oa11cd: 'E00175592',
          weight: 0.0023248134205138367
        },
        {
          oa11cd: 'E00175605',
          weight: 0.0018294696519384453
        },
        {
          oa11cd: 'E00175591',
          weight: 0.011842018360742355
        },
        {
          oa11cd: 'E00175596',
          weight: 0.002371045505580873
        },
        {
          oa11cd: 'E00175584',
          weight: 0.004616603923122647
        },
        {
          oa11cd: 'E00042766',
          weight: 0.001763423816128393
        },
        {
          oa11cd: 'E00042767',
          weight: 0.002661647183145103
        },
        {
          oa11cd: 'E00042764',
          weight: 0.002668251766726108
        },
        {
          oa11cd: 'E00175588',
          weight: 0.0011491975430949078
        },
        {
          oa11cd: 'E00042765',
          weight: 0.00032362459546925567
        },
        {
          oa11cd: 'E00175565',
          weight: 0.0016247275609272834
        },
        {
          oa11cd: 'E00042762',
          weight: 0.001637936728089294
        },
        {
          oa11cd: 'E00042763',
          weight: 0.0015124496400501948
        },
        {
          oa11cd: 'E00042760',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042761',
          weight: 0.0019087246549105079
        },
        {
          oa11cd: 'E00042768',
          weight: 0.0015520771415362261
        },
        {
          oa11cd: 'E00042769',
          weight: 0.001855887986262466
        },
        {
          oa11cd: 'E00042756',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042757',
          weight: 0.0016907733967373357
        },
        {
          oa11cd: 'E00042754',
          weight: 0.0018426788191004558
        },
        {
          oa11cd: 'E00175581',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042755',
          weight: 0.0002906016775642296
        },
        {
          oa11cd: 'E00042752',
          weight: 0.0015388679743742156
        },
        {
          oa11cd: 'E00042753',
          weight: 0.0006010171058714748
        },
        {
          oa11cd: 'E00042750',
          weight: 0.0014199854699161218
        },
        {
          oa11cd: 'E00042751',
          weight: 0.0006538537745195166
        },
        {
          oa11cd: 'E00042758',
          weight: 0.002219140083217753
        },
        {
          oa11cd: 'E00042759',
          weight: 0.002225744666798758
        },
        {
          oa11cd: 'E00042706',
          weight: 0.0024767188428769567
        },
        {
          oa11cd: 'E00042787',
          weight: 0.001763423816128393
        },
        {
          oa11cd: 'E00042707',
          weight: 0.0026484380159830924
        },
        {
          oa11cd: 'E00042786',
          weight: 0.002120071329502675
        },
        {
          oa11cd: 'E00042704',
          weight: 0.0018096559011954296
        },
        {
          oa11cd: 'E00042785',
          weight: 0.0016445413116702992
        },
        {
          oa11cd: 'E00042705',
          weight: 0.0018757017370054818
        },
        {
          oa11cd: 'E00042784',
          weight: 0.0013803579684300905
        },
        {
          oa11cd: 'E00042702',
          weight: 0.0014133808863351165
        },
        {
          oa11cd: 'E00042783',
          weight: 0.0019615613235585494
        },
        {
          oa11cd: 'E00042782',
          weight: 0.0017964467340334193
        },
        {
          oa11cd: 'E00042781',
          weight: 0.001426590053497127
        },
        {
          oa11cd: 'E00042780',
          weight: 0.0018757017370054818
        },
        {
          oa11cd: 'E00042708',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042789',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042709',
          weight: 0.0021993263324747376
        },
        {
          oa11cd: 'E00042788',
          weight: 0.0018360742355194506
        },
        {
          oa11cd: 'E00042046',
          weight: 0.0029324351099663166
        },
        {
          oa11cd: 'E00042047',
          weight: 0.0023644409219998677
        },
        {
          oa11cd: 'E00042044',
          weight: 0.0016313321445082887
        },
        {
          oa11cd: 'E00042045',
          weight: 0.0013275212997820487
        },
        {
          oa11cd: 'E00042042',
          weight: 0.002120071329502675
        },
        {
          oa11cd: 'E00042043',
          weight: 0.001941747572815534
        },
        {
          oa11cd: 'E00042048',
          weight: 0.0022719767518657947
        },
        {
          oa11cd: 'E00042049',
          weight: 0.002219140083217753
        },
        {
          oa11cd: 'E00042276',
          weight: 0.002179512581731722
        },
        {
          oa11cd: 'E00042277',
          weight: 0.0024965325936199723
        },
        {
          oa11cd: 'E00042274',
          weight: 0.0018426788191004558
        },
        {
          oa11cd: 'E00042275',
          weight: 0.002787134271184202
        },
        {
          oa11cd: 'E00042272',
          weight: 0.004259956409748365
        },
        {
          oa11cd: 'E00042273',
          weight: 0.003526847632256786
        },
        {
          oa11cd: 'E00042270',
          weight: 0.0035004292979327655
        },
        {
          oa11cd: 'E00042271',
          weight: 0.002727693018955155
        },
        {
          oa11cd: 'E00042278',
          weight: 0.0019615613235585494
        },
        {
          oa11cd: 'E00042279',
          weight: 0.0024503005085529357
        },
        {
          oa11cd: 'E00042226',
          weight: 0.0009378508685027409
        },
        {
          oa11cd: 'E00042227',
          weight: 0.0015851000594412521
        },
        {
          oa11cd: 'E00042224',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042225',
          weight: 0.0019615613235585494
        },
        {
          oa11cd: 'E00042222',
          weight: 0.00182286506835744
        },
        {
          oa11cd: 'E00042223',
          weight: 0.0021993263324747376
        },
        {
          oa11cd: 'E00042220',
          weight: 0.0021993263324747376
        },
        {
          oa11cd: 'E00042221',
          weight: 0.0013209167162010435
        },
        {
          oa11cd: 'E00042228',
          weight: 0.00530348061554719
        },
        {
          oa11cd: 'E00042229',
          weight: 0.0017171917310613565
        },
        {
          oa11cd: 'E00042216',
          weight: 0.001882306320586487
        },
        {
          oa11cd: 'E00042297',
          weight: 0.001604913810184268
        },
        {
          oa11cd: 'E00042217',
          weight: 0.0022983950861898157
        },
        {
          oa11cd: 'E00042296',
          weight: 0.0017832375668714088
        },
        {
          oa11cd: 'E00042214',
          weight: 0.001855887986262466
        },
        {
          oa11cd: 'E00042295',
          weight: 0.002754111353279176
        },
        {
          oa11cd: 'E00042215',
          weight: 0.0018492834026814608
        },
        {
          oa11cd: 'E00042294',
          weight: 0.0018426788191004558
        },
        {
          oa11cd: 'E00042212',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042293',
          weight: 0.0017105871474803515
        },
        {
          oa11cd: 'E00042213',
          weight: 0.0027210884353741495
        },
        {
          oa11cd: 'E00042292',
          weight: 0.0013539396341060697
        },
        {
          oa11cd: 'E00042210',
          weight: 0.002212535499636748
        },
        {
          oa11cd: 'E00042291',
          weight: 0.0017766329832904035
        },
        {
          oa11cd: 'E00042211',
          weight: 0.0016313321445082887
        },
        {
          oa11cd: 'E00042290',
          weight: 0.001756819232547388
        },
        {
          oa11cd: 'E00042299',
          weight: 0.003526847632256786
        },
        {
          oa11cd: 'E00042219',
          weight: 0.0021332804966646855
        },
        {
          oa11cd: 'E00042298',
          weight: 0.0015388679743742156
        },
        {
          oa11cd: 'E00042466',
          weight: 0.0021729079981507166
        },
        {
          oa11cd: 'E00042467',
          weight: 0.0023314180040948417
        },
        {
          oa11cd: 'E00042464',
          weight: 0.0021993263324747376
        },
        {
          oa11cd: 'E00042465',
          weight: 0.0032824780397595933
        },
        {
          oa11cd: 'E00042462',
          weight: 0.002701274684631134
        },
        {
          oa11cd: 'E00042463',
          weight: 0.0023776500891618782
        },
        {
          oa11cd: 'E00042460',
          weight: 0.002120071329502675
        },
        {
          oa11cd: 'E00042461',
          weight: 0.002919225942804306
        },
        {
          oa11cd: 'E00042468',
          weight: 0.003308896374083614
        },
        {
          oa11cd: 'E00042469',
          weight: 0.0012350571296479756
        },
        {
          oa11cd: 'E00042456',
          weight: 0.0015851000594412521
        },
        {
          oa11cd: 'E00042457',
          weight: 0.0037844263919159897
        },
        {
          oa11cd: 'E00042846',
          weight: 0.00167095964599432
        },
        {
          oa11cd: 'E00042454',
          weight: 0.0024503005085529357
        },
        {
          oa11cd: 'E00042847',
          weight: 0.0018294696519384453
        },
        {
          oa11cd: 'E00042455',
          weight: 0.002225744666798758
        },
        {
          oa11cd: 'E00042844',
          weight: 0.0017832375668714088
        },
        {
          oa11cd: 'E00042452',
          weight: 0.003183409286044515
        },
        {
          oa11cd: 'E00042845',
          weight: 0.0015851000594412521
        },
        {
          oa11cd: 'E00042453',
          weight: 0.0015190542236312
        },
        {
          oa11cd: 'E00042842',
          weight: 0.00167095964599432
        },
        {
          oa11cd: 'E00042450',
          weight: 0.0034145697113796974
        },
        {
          oa11cd: 'E00042843',
          weight: 0.0018030513176144243
        },
        {
          oa11cd: 'E00042451',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042840',
          weight: 0.0013869625520110957
        },
        {
          oa11cd: 'E00042841',
          weight: 0.0014794267221451688
        },
        {
          oa11cd: 'E00042458',
          weight: 0.0026286242652400764
        },
        {
          oa11cd: 'E00042459',
          weight: 0.003520243048675781
        },
        {
          oa11cd: 'E00042848',
          weight: 0.002219140083217753
        },
        {
          oa11cd: 'E00042849',
          weight: 0.0019483521563965391
        },
        {
          oa11cd: 'E00042406',
          weight: 0.003586288884485833
        },
        {
          oa11cd: 'E00042487',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00042407',
          weight: 0.0017039825638993462
        },
        {
          oa11cd: 'E00042486',
          weight: 0.0015652863086982366
        },
        {
          oa11cd: 'E00042836',
          weight: 0.002007793408625586
        },
        {
          oa11cd: 'E00042404',
          weight: 0.0019285384056535236
        },
        {
          oa11cd: 'E00042485',
          weight: 0.002067234660854633
        },
        {
          oa11cd: 'E00042837',
          weight: 0.001637936728089294
        },
        {
          oa11cd: 'E00042405',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042484',
          weight: 0.0016907733967373357
        },
        {
          oa11cd: 'E00042834',
          weight: 0.001697377980318341
        },
        {
          oa11cd: 'E00042402',
          weight: 0.0013803579684300905
        },
        {
          oa11cd: 'E00042483',
          weight: 0.0019879796578825704
        },
        {
          oa11cd: 'E00042835',
          weight: 0.0015190542236312
        },
        {
          oa11cd: 'E00042482',
          weight: 0.0019219338220725184
        },
        {
          oa11cd: 'E00042832',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042400',
          weight: 0.002060630077273628
        },
        {
          oa11cd: 'E00042481',
          weight: 0.0024701142592959513
        },
        {
          oa11cd: 'E00042833',
          weight: 0.0028135526055082225
        },
        {
          oa11cd: 'E00042401',
          weight: 0.0018492834026814608
        },
        {
          oa11cd: 'E00042480',
          weight: 0.001941747572815534
        },
        {
          oa11cd: 'E00042830',
          weight: 0.0013209167162010435
        },
        {
          oa11cd: 'E00042831',
          weight: 0.003236245954692557
        },
        {
          oa11cd: 'E00042408',
          weight: 0.002397463839904894
        },
        {
          oa11cd: 'E00042489',
          weight: 0.001763423816128393
        },
        {
          oa11cd: 'E00042409',
          weight: 0.001789842150452414
        },
        {
          oa11cd: 'E00042488',
          weight: 0.001664355062413315
        },
        {
          oa11cd: 'E00042838',
          weight: 0.002093652995178654
        },
        {
          oa11cd: 'E00042146',
          weight: 0.0019153292384915131
        },
        {
          oa11cd: 'E00042147',
          weight: 0.007053695264513572
        },
        {
          oa11cd: 'E00042144',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042145',
          weight: 0.0016445413116702992
        },
        {
          oa11cd: 'E00042142',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042143',
          weight: 0.0019879796578825704
        },
        {
          oa11cd: 'E00042140',
          weight: 0.0019879796578825704
        },
        {
          oa11cd: 'E00042141',
          weight: 0.0022983950861898157
        },
        {
          oa11cd: 'E00042148',
          weight: 0.0019087246549105079
        },
        {
          oa11cd: 'E00042149',
          weight: 0.002159698830988706
        },
        {
          oa11cd: 'E00042136',
          weight: 0.0021663034145697115
        },
        {
          oa11cd: 'E00042137',
          weight: 0.0012878937982960174
        },
        {
          oa11cd: 'E00042134',
          weight: 0.00256918301301103
        },
        {
          oa11cd: 'E00042135',
          weight: 0.0020540254936926225
        },
        {
          oa11cd: 'E00042132',
          weight: 0.0016181229773462784
        },
        {
          oa11cd: 'E00042133',
          weight: 0.002219140083217753
        },
        {
          oa11cd: 'E00042130',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042131',
          weight: 0.0015322633907932106
        },
        {
          oa11cd: 'E00042138',
          weight: 0.002067234660854633
        },
        {
          oa11cd: 'E00042139',
          weight: 0.0015520771415362261
        },
        {
          oa11cd: 'E00042646',
          weight: 0.003639125553133875
        },
        {
          oa11cd: 'E00042647',
          weight: 0.0015851000594412521
        },
        {
          oa11cd: 'E00042644',
          weight: 0.00861898157321181
        },
        {
          oa11cd: 'E00042645',
          weight: 0.003427778878541708
        },
        {
          oa11cd: 'E00042642',
          weight: 0.002661647183145103
        },
        {
          oa11cd: 'E00042643',
          weight: 0.0031635955353014993
        },
        {
          oa11cd: 'E00042640',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042641',
          weight: 0.002093652995178654
        },
        {
          oa11cd: 'E00042648',
          weight: 0.002060630077273628
        },
        {
          oa11cd: 'E00042649',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042636',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042637',
          weight: 0.0033881513770556764
        },
        {
          oa11cd: 'E00042634',
          weight: 0.002153094247407701
        },
        {
          oa11cd: 'E00042635',
          weight: 0.0021464896638266956
        },
        {
          oa11cd: 'E00042632',
          weight: 0.0016445413116702992
        },
        {
          oa11cd: 'E00042633',
          weight: 0.00197477049072056
        },
        {
          oa11cd: 'E00042630',
          weight: 0.0022719767518657947
        },
        {
          oa11cd: 'E00042631',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042638',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042639',
          weight: 0.0013407304669440592
        },
        {
          oa11cd: 'E00042376',
          weight: 0.0014199854699161218
        },
        {
          oa11cd: 'E00042377',
          weight: 0.0017766329832904035
        },
        {
          oa11cd: 'E00042374',
          weight: 0.0018690971534244766
        },
        {
          oa11cd: 'E00042375',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042372',
          weight: 0.0015256588072122053
        },
        {
          oa11cd: 'E00042373',
          weight: 0.0020210025757875965
        },
        {
          oa11cd: 'E00042370',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042371',
          weight: 0.002186117165312727
        },
        {
          oa11cd: 'E00042378',
          weight: 0.0024503005085529357
        },
        {
          oa11cd: 'E00042379',
          weight: 0.002252163001122779
        },
        {
          oa11cd: 'E00042326',
          weight: 0.0023776500891618782
        },
        {
          oa11cd: 'E00042327',
          weight: 0.0015388679743742156
        },
        {
          oa11cd: 'E00042324',
          weight: 0.002060630077273628
        },
        {
          oa11cd: 'E00042325',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00042322',
          weight: 0.0017039825638993462
        },
        {
          oa11cd: 'E00042323',
          weight: 0.001994584241463576
        },
        {
          oa11cd: 'E00042320',
          weight: 0.001604913810184268
        },
        {
          oa11cd: 'E00042321',
          weight: 0.0007000858595865531
        },
        {
          oa11cd: 'E00042328',
          weight: 0.0023248134205138367
        },
        {
          oa11cd: 'E00042329',
          weight: 0.0013209167162010435
        },
        {
          oa11cd: 'E00042316',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00042397',
          weight: 0.0036061026352288486
        },
        {
          oa11cd: 'E00042317',
          weight: 0.0024436959249719307
        },
        {
          oa11cd: 'E00042396',
          weight: 0.001492635889307179
        },
        {
          oa11cd: 'E00042314',
          weight: 0.001789842150452414
        },
        {
          oa11cd: 'E00042395',
          weight: 0.0012812892147150122
        },
        {
          oa11cd: 'E00042315',
          weight: 0.0015652863086982366
        },
        {
          oa11cd: 'E00042394',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00042312',
          weight: 0.0015718908922792419
        },
        {
          oa11cd: 'E00042393',
          weight: 0.0017832375668714088
        },
        {
          oa11cd: 'E00042313',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042392',
          weight: 0.0013803579684300905
        },
        {
          oa11cd: 'E00042310',
          weight: 0.0009180371177597253
        },
        {
          oa11cd: 'E00042391',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042390',
          weight: 0.0011954296281619444
        },
        {
          oa11cd: 'E00042318',
          weight: 0.0026286242652400764
        },
        {
          oa11cd: 'E00042399',
          weight: 0.001941747572815534
        },
        {
          oa11cd: 'E00042319',
          weight: 0.0018757017370054818
        },
        {
          oa11cd: 'E00042398',
          weight: 0.0017237963146423617
        },
        {
          oa11cd: 'E00042566',
          weight: 0.0024965325936199723
        },
        {
          oa11cd: 'E00042567',
          weight: 0.0016445413116702992
        },
        {
          oa11cd: 'E00042564',
          weight: 0.002034211742949607
        },
        {
          oa11cd: 'E00042565',
          weight: 0.0012680800475530019
        },
        {
          oa11cd: 'E00042562',
          weight: 0.002192721748893732
        },
        {
          oa11cd: 'E00042563',
          weight: 0.0017766329832904035
        },
        {
          oa11cd: 'E00042560',
          weight: 0.002219140083217753
        },
        {
          oa11cd: 'E00042561',
          weight: 0.0015586817251172314
        },
        {
          oa11cd: 'E00042568',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042569',
          weight: 0.001301102965458028
        },
        {
          oa11cd: 'E00042556',
          weight: 0.0022323492503797636
        },
        {
          oa11cd: 'E00042557',
          weight: 0.001789842150452414
        },
        {
          oa11cd: 'E00042554',
          weight: 0.0025361600951060038
        },
        {
          oa11cd: 'E00042555',
          weight: 0.002846575523413249
        },
        {
          oa11cd: 'E00042552',
          weight: 0.0013143121326200382
        },
        {
          oa11cd: 'E00042553',
          weight: 0.0021729079981507166
        },
        {
          oa11cd: 'E00042550',
          weight: 0.002212535499636748
        },
        {
          oa11cd: 'E00042551',
          weight: 0.0018426788191004558
        },
        {
          oa11cd: 'E00042558',
          weight: 0.0010831517072848558
        },
        {
          oa11cd: 'E00042559',
          weight: 0.002608810514497061
        },
        {
          oa11cd: 'E00042506',
          weight: 0.0007793408625586157
        },
        {
          oa11cd: 'E00042587',
          weight: 0.0020804438280166435
        },
        {
          oa11cd: 'E00042507',
          weight: 0.0028003434383462125
        },
        {
          oa11cd: 'E00042586',
          weight: 0.003368337626312661
        },
        {
          oa11cd: 'E00042504',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042585',
          weight: 0.001882306320586487
        },
        {
          oa11cd: 'E00042505',
          weight: 0.0019483521563965391
        },
        {
          oa11cd: 'E00042584',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042502',
          weight: 0.002285185919027805
        },
        {
          oa11cd: 'E00042583',
          weight: 0.0014397992206591375
        },
        {
          oa11cd: 'E00042503',
          weight: 0.0024833234264579618
        },
        {
          oa11cd: 'E00042582',
          weight: 0.0017237963146423617
        },
        {
          oa11cd: 'E00042500',
          weight: 0.0025361600951060038
        },
        {
          oa11cd: 'E00042581',
          weight: 0.0015322633907932106
        },
        {
          oa11cd: 'E00042501',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042580',
          weight: 0.011340070008585959
        },
        {
          oa11cd: 'E00042930',
          weight: 0.001334125883363054
        },
        {
          oa11cd: 'E00042508',
          weight: 0.0013737533848490852
        },
        {
          oa11cd: 'E00042589',
          weight: 0.001855887986262466
        },
        {
          oa11cd: 'E00042509',
          weight: 0.0027475067696981705
        },
        {
          oa11cd: 'E00042588',
          weight: 0.0031437817845584837
        },
        {
          oa11cd: 'E00175604',
          weight: 0.0015917046430222574
        },
        {
          oa11cd: 'E00175601',
          weight: 0.0009378508685027409
        },
        {
          oa11cd: 'E00175562',
          weight: 0.002912621359223301
        },
        {
          oa11cd: 'E00175594',
          weight: 0.002311604253351826
        },
        {
          oa11cd: 'E00175582',
          weight: 0.0024569050921339408
        },
        {
          oa11cd: 'E00175557',
          weight: 0.0007991546133016313
        },
        {
          oa11cd: 'E00175572',
          weight: 0.010296545802787134
        },
        {
          oa11cd: 'E00175602',
          weight: 0.0014397992206591375
        },
        {
          oa11cd: 'E00175550',
          weight: 0.0015058450564691896
        },
        {
          oa11cd: 'E00175600',
          weight: 0.0005679941879664487
        },
        {
          oa11cd: 'E00042746',
          weight: 0.001763423816128393
        },
        {
          oa11cd: 'E00042747',
          weight: 0.0015190542236312
        },
        {
          oa11cd: 'E00042745',
          weight: 0.0027739251040221915
        },
        {
          oa11cd: 'E00042742',
          weight: 0.002159698830988706
        },
        {
          oa11cd: 'E00042743',
          weight: 0.0019813750743015654
        },
        {
          oa11cd: 'E00042740',
          weight: 0.0026880655174691234
        },
        {
          oa11cd: 'E00042741',
          weight: 0.0022389538339607686
        },
        {
          oa11cd: 'E00042748',
          weight: 0.0014530083878211478
        },
        {
          oa11cd: 'E00042736',
          weight: 0.002285185919027805
        },
        {
          oa11cd: 'E00042737',
          weight: 0.0012812892147150122
        },
        {
          oa11cd: 'E00042734',
          weight: 0.0012944983818770227
        },
        {
          oa11cd: 'E00042735',
          weight: 0.0014728221385641635
        },
        {
          oa11cd: 'E00042732',
          weight: 0.0015520771415362261
        },
        {
          oa11cd: 'E00042733',
          weight: 0.0034806155471897495
        },
        {
          oa11cd: 'E00042730',
          weight: 0.0018294696519384453
        },
        {
          oa11cd: 'E00042731',
          weight: 0.0022389538339607686
        },
        {
          oa11cd: 'E00042738',
          weight: 0.001426590053497127
        },
        {
          oa11cd: 'E00042739',
          weight: 0.0020210025757875965
        },
        {
          oa11cd: 'E00042076',
          weight: 0.002225744666798758
        },
        {
          oa11cd: 'E00042077',
          weight: 0.0013473350505250645
        },
        {
          oa11cd: 'E00042074',
          weight: 0.0016115183937652731
        },
        {
          oa11cd: 'E00042075',
          weight: 0.0025229509279439933
        },
        {
          oa11cd: 'E00042072',
          weight: 0.001968165907139555
        },
        {
          oa11cd: 'E00042073',
          weight: 0.0023776500891618782
        },
        {
          oa11cd: 'E00042070',
          weight: 0.0016775642295753252
        },
        {
          oa11cd: 'E00042071',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042078',
          weight: 0.0015586817251172314
        },
        {
          oa11cd: 'E00042079',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042097',
          weight: 0.00212667591308368
        },
        {
          oa11cd: 'E00042096',
          weight: 0.001459612971402153
        },
        {
          oa11cd: 'E00042095',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042094',
          weight: 0.0012218479624859654
        },
        {
          oa11cd: 'E00042093',
          weight: 0.0014133808863351165
        },
        {
          oa11cd: 'E00042092',
          weight: 0.0019021200713295026
        },
        {
          oa11cd: 'E00042091',
          weight: 0.002252163001122779
        },
        {
          oa11cd: 'E00042090',
          weight: 0.0019549567399775444
        },
        {
          oa11cd: 'E00042099',
          weight: 0.0019549567399775444
        },
        {
          oa11cd: 'E00042266',
          weight: 0.003995773066508157
        },
        {
          oa11cd: 'E00042267',
          weight: 0.0037183805561059376
        },
        {
          oa11cd: 'E00042264',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042265',
          weight: 0.0038702859784690577
        },
        {
          oa11cd: 'E00042262',
          weight: 0.004629813090284657
        },
        {
          oa11cd: 'E00042263',
          weight: 0.00182286506835744
        },
        {
          oa11cd: 'E00042260',
          weight: 0.002641833432402087
        },
        {
          oa11cd: 'E00042261',
          weight: 0.0017766329832904035
        },
        {
          oa11cd: 'E00042268',
          weight: 0.0014067763027541113
        },
        {
          oa11cd: 'E00042269',
          weight: 0.003487220130770755
        },
        {
          oa11cd: 'E00042256',
          weight: 0.0021663034145697115
        },
        {
          oa11cd: 'E00042257',
          weight: 0.001664355062413315
        },
        {
          oa11cd: 'E00042254',
          weight: 0.00167095964599432
        },
        {
          oa11cd: 'E00042255',
          weight: 0.002285185919027805
        },
        {
          oa11cd: 'E00042252',
          weight: 0.0012680800475530019
        },
        {
          oa11cd: 'E00042253',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042250',
          weight: 0.0014464038042401428
        },
        {
          oa11cd: 'E00042251',
          weight: 0.002661647183145103
        },
        {
          oa11cd: 'E00042259',
          weight: 0.0019153292384915131
        },
        {
          oa11cd: 'E00042206',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042287',
          weight: 0.0025559738458490193
        },
        {
          oa11cd: 'E00042207',
          weight: 0.002120071329502675
        },
        {
          oa11cd: 'E00042286',
          weight: 0.0029324351099663166
        },
        {
          oa11cd: 'E00042285',
          weight: 0.0031371772009774783
        },
        {
          oa11cd: 'E00042284',
          weight: 0.002985271778614358
        },
        {
          oa11cd: 'E00042202',
          weight: 0.002212535499636748
        },
        {
          oa11cd: 'E00042283',
          weight: 0.001030315038636814
        },
        {
          oa11cd: 'E00042203',
          weight: 0.0018096559011954296
        },
        {
          oa11cd: 'E00042282',
          weight: 0.0023776500891618782
        },
        {
          oa11cd: 'E00042200',
          weight: 0.0019483521563965391
        },
        {
          oa11cd: 'E00042281',
          weight: 0.002338022587675847
        },
        {
          oa11cd: 'E00042201',
          weight: 0.0019153292384915131
        },
        {
          oa11cd: 'E00042280',
          weight: 0.004735486427580741
        },
        {
          oa11cd: 'E00042208',
          weight: 0.0014067763027541113
        },
        {
          oa11cd: 'E00042289',
          weight: 0.001604913810184268
        },
        {
          oa11cd: 'E00042209',
          weight: 0.0010831517072848558
        },
        {
          oa11cd: 'E00042288',
          weight: 0.001994584241463576
        },
        {
          oa11cd: 'E00042446',
          weight: 0.0020540254936926225
        },
        {
          oa11cd: 'E00042447',
          weight: 0.0024767188428769567
        },
        {
          oa11cd: 'E00042444',
          weight: 0.0027475067696981705
        },
        {
          oa11cd: 'E00042876',
          weight: 0.0026550425995640974
        },
        {
          oa11cd: 'E00042445',
          weight: 0.0014331946370781323
        },
        {
          oa11cd: 'E00042877',
          weight: 0.005310085199128195
        },
        {
          oa11cd: 'E00042442',
          weight: 0.003183409286044515
        },
        {
          oa11cd: 'E00042874',
          weight: 0.0036853576382009116
        },
        {
          oa11cd: 'E00042443',
          weight: 0.003236245954692557
        },
        {
          oa11cd: 'E00042875',
          weight: 0.0032824780397595933
        },
        {
          oa11cd: 'E00042440',
          weight: 0.0019483521563965391
        },
        {
          oa11cd: 'E00042872',
          weight: 0.0015454725579552209
        },
        {
          oa11cd: 'E00042441',
          weight: 0.0023512317548378577
        },
        {
          oa11cd: 'E00042873',
          weight: 0.0026286242652400764
        },
        {
          oa11cd: 'E00042870',
          weight: 0.0018030513176144243
        },
        {
          oa11cd: 'E00042871',
          weight: 0.0017105871474803515
        },
        {
          oa11cd: 'E00042448',
          weight: 0.003513638465094776
        },
        {
          oa11cd: 'E00042449',
          weight: 0.0021663034145697115
        },
        {
          oa11cd: 'E00042878',
          weight: 0.0032626642890165774
        },
        {
          oa11cd: 'E00042879',
          weight: 0.0028729938577372696
        },
        {
          oa11cd: 'E00042436',
          weight: 0.0015190542236312
        },
        {
          oa11cd: 'E00042437',
          weight: 0.002304999669770821
        },
        {
          oa11cd: 'E00042826',
          weight: 0.004306188494815402
        },
        {
          oa11cd: 'E00042434',
          weight: 0.001697377980318341
        },
        {
          oa11cd: 'E00042827',
          weight: 0.0026880655174691234
        },
        {
          oa11cd: 'E00042435',
          weight: 0.002060630077273628
        },
        {
          oa11cd: 'E00042824',
          weight: 0.002120071329502675
        },
        {
          oa11cd: 'E00042432',
          weight: 0.0028135526055082225
        },
        {
          oa11cd: 'E00042825',
          weight: 0.0048213460141338085
        },
        {
          oa11cd: 'E00042433',
          weight: 0.0016247275609272834
        },
        {
          oa11cd: 'E00042822',
          weight: 0.0025295555115249983
        },
        {
          oa11cd: 'E00042430',
          weight: 0.0015784954758602471
        },
        {
          oa11cd: 'E00042823',
          weight: 0.0017700283997093983
        },
        {
          oa11cd: 'E00042431',
          weight: 0.0016247275609272834
        },
        {
          oa11cd: 'E00042820',
          weight: 0.02275939502014398
        },
        {
          oa11cd: 'E00042438',
          weight: 0.002879598441318275
        },
        {
          oa11cd: 'E00042439',
          weight: 0.004061818902318209
        },
        {
          oa11cd: 'E00042828',
          weight: 0.001789842150452414
        },
        {
          oa11cd: 'E00042829',
          weight: 0.00243048675780992
        },
        {
          oa11cd: 'E00042176',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042897',
          weight: 0.0026880655174691234
        },
        {
          oa11cd: 'E00042177',
          weight: 0.0017700283997093983
        },
        {
          oa11cd: 'E00042896',
          weight: 0.002192721748893732
        },
        {
          oa11cd: 'E00042814',
          weight: 0.0018360742355194506
        },
        {
          oa11cd: 'E00042174',
          weight: 0.0019483521563965391
        },
        {
          oa11cd: 'E00042895',
          weight: 0.0019879796578825704
        },
        {
          oa11cd: 'E00042175',
          weight: 0.0021464896638266956
        },
        {
          oa11cd: 'E00042894',
          weight: 0.002820157189089228
        },
        {
          oa11cd: 'E00042172',
          weight: 0.0015520771415362261
        },
        {
          oa11cd: 'E00042893',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042173',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042892',
          weight: 0.0022917905026088106
        },
        {
          oa11cd: 'E00042810',
          weight: 0.0021398850802456905
        },
        {
          oa11cd: 'E00042170',
          weight: 0.0018955154877484974
        },
        {
          oa11cd: 'E00042891',
          weight: 0.0016247275609272834
        },
        {
          oa11cd: 'E00042811',
          weight: 0.0033155009576646194
        },
        {
          oa11cd: 'E00042171',
          weight: 0.0022323492503797636
        },
        {
          oa11cd: 'E00042890',
          weight: 0.0025889967637540453
        },
        {
          oa11cd: 'E00042818',
          weight: 0.0012416617132289809
        },
        {
          oa11cd: 'E00042178',
          weight: 0.002100257578759659
        },
        {
          oa11cd: 'E00042899',
          weight: 0.004015586817251172
        },
        {
          oa11cd: 'E00042819',
          weight: 0.0012482662968099861
        },
        {
          oa11cd: 'E00042179',
          weight: 0.0015917046430222574
        },
        {
          oa11cd: 'E00042898',
          weight: 0.0031107588666534577
        },
        {
          oa11cd: 'E00042126',
          weight: 0.002067234660854633
        },
        {
          oa11cd: 'E00042127',
          weight: 0.0022653721682847896
        },
        {
          oa11cd: 'E00042124',
          weight: 0.0011359883759328973
        },
        {
          oa11cd: 'E00042125',
          weight: 0.0012812892147150122
        },
        {
          oa11cd: 'E00042122',
          weight: 0.0018360742355194506
        },
        {
          oa11cd: 'E00042123',
          weight: 0.0013407304669440592
        },
        {
          oa11cd: 'E00042120',
          weight: 0.002120071329502675
        },
        {
          oa11cd: 'E00042121',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042128',
          weight: 0.001096360874446866
        },
        {
          oa11cd: 'E00042129',
          weight: 0.002304999669770821
        },
        {
          oa11cd: 'E00042116',
          weight: 0.001855887986262466
        },
        {
          oa11cd: 'E00042197',
          weight: 0.0015851000594412521
        },
        {
          oa11cd: 'E00042117',
          weight: 0.001459612971402153
        },
        {
          oa11cd: 'E00042196',
          weight: 0.002159698830988706
        },
        {
          oa11cd: 'E00042677',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042114',
          weight: 0.0022059309160557426
        },
        {
          oa11cd: 'E00042674',
          weight: 0.0028135526055082225
        },
        {
          oa11cd: 'E00042115',
          weight: 0.0022983950861898157
        },
        {
          oa11cd: 'E00042194',
          weight: 0.00212667591308368
        },
        {
          oa11cd: 'E00042112',
          weight: 0.0016181229773462784
        },
        {
          oa11cd: 'E00042193',
          weight: 0.002027607159368602
        },
        {
          oa11cd: 'E00042672',
          weight: 0.014741430552803646
        },
        {
          oa11cd: 'E00042113',
          weight: 0.0019813750743015654
        },
        {
          oa11cd: 'E00042192',
          weight: 0.0015586817251172314
        },
        {
          oa11cd: 'E00042673',
          weight: 0.0053166897827092
        },
        {
          oa11cd: 'E00042110',
          weight: 0.0015124496400501948
        },
        {
          oa11cd: 'E00042670',
          weight: 0.005646918961759461
        },
        {
          oa11cd: 'E00042111',
          weight: 0.0012944983818770227
        },
        {
          oa11cd: 'E00042190',
          weight: 0.0022389538339607686
        },
        {
          oa11cd: 'E00042118',
          weight: 0.0035928934680668385
        },
        {
          oa11cd: 'E00042199',
          weight: 0.002344627171256852
        },
        {
          oa11cd: 'E00042198',
          weight: 0.0017832375668714088
        },
        {
          oa11cd: 'E00042679',
          weight: 0.005805428967703586
        },
        {
          oa11cd: 'E00042626',
          weight: 0.0022389538339607686
        },
        {
          oa11cd: 'E00042627',
          weight: 0.0017039825638993462
        },
        {
          oa11cd: 'E00042624',
          weight: 0.0021068621623406645
        },
        {
          oa11cd: 'E00042625',
          weight: 0.0018294696519384453
        },
        {
          oa11cd: 'E00042622',
          weight: 0.0018955154877484974
        },
        {
          oa11cd: 'E00042623',
          weight: 0.0018294696519384453
        },
        {
          oa11cd: 'E00042620',
          weight: 0.0021464896638266956
        },
        {
          oa11cd: 'E00042621',
          weight: 0.0017237963146423617
        },
        {
          oa11cd: 'E00042628',
          weight: 0.0023908592563238887
        },
        {
          oa11cd: 'E00042629',
          weight: 0.0017964467340334193
        },
        {
          oa11cd: 'E00042616',
          weight: 0.0018096559011954296
        },
        {
          oa11cd: 'E00042697',
          weight: 0.0018492834026814608
        },
        {
          oa11cd: 'E00042617',
          weight: 0.002027607159368602
        },
        {
          oa11cd: 'E00042614',
          weight: 0.0020408163265306124
        },
        {
          oa11cd: 'E00042695',
          weight: 0.0009444554520837462
        },
        {
          oa11cd: 'E00042366',
          weight: 0.0015718908922792419
        },
        {
          oa11cd: 'E00042615',
          weight: 0.0019219338220725184
        },
        {
          oa11cd: 'E00042694',
          weight: 0.0017105871474803515
        },
        {
          oa11cd: 'E00042367',
          weight: 0.0014133808863351165
        },
        {
          oa11cd: 'E00042612',
          weight: 0.0011624067102569183
        },
        {
          oa11cd: 'E00042693',
          weight: 0.002641833432402087
        },
        {
          oa11cd: 'E00042613',
          weight: 0.0021663034145697115
        },
        {
          oa11cd: 'E00042365',
          weight: 0.0017039825638993462
        },
        {
          oa11cd: 'E00042610',
          weight: 0.0018955154877484974
        },
        {
          oa11cd: 'E00042691',
          weight: 0.001301102965458028
        },
        {
          oa11cd: 'E00042362',
          weight: 0.0016445413116702992
        },
        {
          oa11cd: 'E00042611',
          weight: 0.002179512581731722
        },
        {
          oa11cd: 'E00042690',
          weight: 0.002371045505580873
        },
        {
          oa11cd: 'E00042363',
          weight: 0.0018360742355194506
        },
        {
          oa11cd: 'E00042360',
          weight: 0.0020408163265306124
        },
        {
          oa11cd: 'E00042361',
          weight: 0.0014331946370781323
        },
        {
          oa11cd: 'E00042618',
          weight: 0.00136714880126808
        },
        {
          oa11cd: 'E00042619',
          weight: 0.0018030513176144243
        },
        {
          oa11cd: 'E00042368',
          weight: 0.001941747572815534
        },
        {
          oa11cd: 'E00042369',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042356',
          weight: 0.003308896374083614
        },
        {
          oa11cd: 'E00042357',
          weight: 0.003434383462122713
        },
        {
          oa11cd: 'E00042354',
          weight: 0.0021332804966646855
        },
        {
          oa11cd: 'E00042355',
          weight: 0.0028663892741562645
        },
        {
          oa11cd: 'E00042352',
          weight: 0.0019087246549105079
        },
        {
          oa11cd: 'E00042350',
          weight: 0.003071131365167426
        },
        {
          oa11cd: 'E00042351',
          weight: 0.0018096559011954296
        },
        {
          oa11cd: 'E00042358',
          weight: 0.001756819232547388
        },
        {
          oa11cd: 'E00042359',
          weight: 0.0019219338220725184
        },
        {
          oa11cd: 'E00042387',
          weight: 0.0014067763027541113
        },
        {
          oa11cd: 'E00042307',
          weight: 0.0021663034145697115
        },
        {
          oa11cd: 'E00042386',
          weight: 0.001994584241463576
        },
        {
          oa11cd: 'E00042304',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042385',
          weight: 0.002225744666798758
        },
        {
          oa11cd: 'E00042305',
          weight: 0.0019351429892345289
        },
        {
          oa11cd: 'E00042384',
          weight: 0.0028003434383462125
        },
        {
          oa11cd: 'E00042302',
          weight: 0.0017171917310613565
        },
        {
          oa11cd: 'E00042383',
          weight: 0.0026484380159830924
        },
        {
          oa11cd: 'E00042303',
          weight: 0.001274684631134007
        },
        {
          oa11cd: 'E00042382',
          weight: 0.001756819232547388
        },
        {
          oa11cd: 'E00042300',
          weight: 0.001730400898223367
        },
        {
          oa11cd: 'E00042381',
          weight: 0.0017766329832904035
        },
        {
          oa11cd: 'E00042301',
          weight: 0.002179512581731722
        },
        {
          oa11cd: 'E00042380',
          weight: 0.002602205930916056
        },
        {
          oa11cd: 'E00042308',
          weight: 0.0022983950861898157
        },
        {
          oa11cd: 'E00042389',
          weight: 0.0017237963146423617
        },
        {
          oa11cd: 'E00042309',
          weight: 0.0015058450564691896
        },
        {
          oa11cd: 'E00042388',
          weight: 0.002635228848821082
        },
        {
          oa11cd: 'E00042546',
          weight: 0.001756819232547388
        },
        {
          oa11cd: 'E00042547',
          weight: 0.0024106730070669042
        },
        {
          oa11cd: 'E00042544',
          weight: 0.0019219338220725184
        },
        {
          oa11cd: 'E00042545',
          weight: 0.0017237963146423617
        },
        {
          oa11cd: 'E00042542',
          weight: 0.0017964467340334193
        },
        {
          oa11cd: 'E00042543',
          weight: 0.0025559738458490193
        },
        {
          oa11cd: 'E00042541',
          weight: 0.0017964467340334193
        },
        {
          oa11cd: 'E00042548',
          weight: 0.0018690971534244766
        },
        {
          oa11cd: 'E00042549',
          weight: 0.002245558417541774
        },
        {
          oa11cd: 'E00042536',
          weight: 0.0017832375668714088
        },
        {
          oa11cd: 'E00042537',
          weight: 0.0017105871474803515
        },
        {
          oa11cd: 'E00042534',
          weight: 0.0014001717191731062
        },
        {
          oa11cd: 'E00042926',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042535',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042927',
          weight: 0.001697377980318341
        },
        {
          oa11cd: 'E00042532',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042924',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042533',
          weight: 0.0015322633907932106
        },
        {
          oa11cd: 'E00042925',
          weight: 0.002067234660854633
        },
        {
          oa11cd: 'E00042530',
          weight: 0.002060630077273628
        },
        {
          oa11cd: 'E00042922',
          weight: 0.0017700283997093983
        },
        {
          oa11cd: 'E00042531',
          weight: 0.0016907733967373357
        },
        {
          oa11cd: 'E00042923',
          weight: 0.0017105871474803515
        },
        {
          oa11cd: 'E00042920',
          weight: 0.0023314180040948417
        },
        {
          oa11cd: 'E00042921',
          weight: 0.002212535499636748
        },
        {
          oa11cd: 'E00042538',
          weight: 0.001882306320586487
        },
        {
          oa11cd: 'E00042539',
          weight: 0.0015256588072122053
        },
        {
          oa11cd: 'E00042928',
          weight: 0.002192721748893732
        },
        {
          oa11cd: 'E00042929',
          weight: 0.0014794267221451688
        },
        {
          oa11cd: 'E00042916',
          weight: 0.00243048675780992
        },
        {
          oa11cd: 'E00042917',
          weight: 0.0017766329832904035
        },
        {
          oa11cd: 'E00042914',
          weight: 0.0015784954758602471
        },
        {
          oa11cd: 'E00042915',
          weight: 0.0019549567399775444
        },
        {
          oa11cd: 'E00042912',
          weight: 0.003216432203949541
        },
        {
          oa11cd: 'E00042913',
          weight: 0.0025361600951060038
        },
        {
          oa11cd: 'E00042910',
          weight: 0.002034211742949607
        },
        {
          oa11cd: 'E00042911',
          weight: 0.0021068621623406645
        },
        {
          oa11cd: 'E00175576',
          weight: 0.0021068621623406645
        },
        {
          oa11cd: 'E00042918',
          weight: 0.0020474209101116175
        },
        {
          oa11cd: 'E00175558',
          weight: 0.0027144838517931444
        },
        {
          oa11cd: 'E00042919',
          weight: 0.002100257578759659
        },
        {
          oa11cd: 'E00175574',
          weight: 0.006122448979591836
        },
        {
          oa11cd: 'E00175560',
          weight: 0.0013539396341060697
        },
        {
          oa11cd: 'E00175568',
          weight: 0.0023644409219998677
        },
        {
          oa11cd: 'E00175571',
          weight: 0.00167095964599432
        },
        {
          oa11cd: 'E00175555',
          weight: 0.002285185919027805
        },
        {
          oa11cd: 'E00175564',
          weight: 0.006175285648239878
        },
        {
          oa11cd: 'E00175577',
          weight: 0.002542764678687009
        },
        {
          oa11cd: 'E00175599',
          weight: 0.0020143979922065914
        },
        {
          oa11cd: 'E00175597',
          weight: 0.004458093917178522
        },
        {
          oa11cd: 'E00175598',
          weight: 0.003275873456178588
        },
        {
          oa11cd: 'E00175556',
          weight: 0.0033485238755696454
        },
        {
          oa11cd: 'E00042776',
          weight: 0.0021663034145697115
        },
        {
          oa11cd: 'E00042777',
          weight: 0.002549369262268014
        },
        {
          oa11cd: 'E00042774',
          weight: 0.0018889109041674923
        },
        {
          oa11cd: 'E00042775',
          weight: 0.003394755960636682
        },
        {
          oa11cd: 'E00042772',
          weight: 0.0021068621623406645
        },
        {
          oa11cd: 'E00042773',
          weight: 0.001486031305726174
        },
        {
          oa11cd: 'E00042770',
          weight: 0.0014199854699161218
        },
        {
          oa11cd: 'E00042771',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00175570',
          weight: 0.0024965325936199723
        },
        {
          oa11cd: 'E00175586',
          weight: 0.0021464896638266956
        },
        {
          oa11cd: 'E00175593',
          weight: 0.008169869889703455
        },
        {
          oa11cd: 'E00042778',
          weight: 0.0014067763027541113
        },
        {
          oa11cd: 'E00175575',
          weight: 0.00334191929198864
        },
        {
          oa11cd: 'E00042779',
          weight: 0.0018360742355194506
        },
        {
          oa11cd: 'E00175579',
          weight: 0.0017105871474803515
        },
        {
          oa11cd: 'E00175585',
          weight: 0.0016907733967373357
        },
        {
          oa11cd: 'E00175587',
          weight: 0.0010105012878937982
        },
        {
          oa11cd: 'E00175551',
          weight: 0.0049534376857539135
        },
        {
          oa11cd: 'E00042726',
          weight: 0.001994584241463576
        },
        {
          oa11cd: 'E00042727',
          weight: 0.0022785813354468
        },
        {
          oa11cd: 'E00042724',
          weight: 0.0023644409219998677
        },
        {
          oa11cd: 'E00175573',
          weight: 0.002219140083217753
        },
        {
          oa11cd: 'E00042725',
          weight: 0.0025956013473350504
        },
        {
          oa11cd: 'E00175552',
          weight: 0.0014199854699161218
        },
        {
          oa11cd: 'E00042723',
          weight: 0.002087048411597649
        },
        {
          oa11cd: 'E00042720',
          weight: 0.0018757017370054818
        },
        {
          oa11cd: 'E00042728',
          weight: 0.0022917905026088106
        },
        {
          oa11cd: 'E00042729',
          weight: 0.00197477049072056
        },
        {
          oa11cd: 'E00042716',
          weight: 0.0017964467340334193
        },
        {
          oa11cd: 'E00042797',
          weight: 0.001003896704312793
        },
        {
          oa11cd: 'E00042717',
          weight: 0.0037249851396869427
        },
        {
          oa11cd: 'E00042796',
          weight: 0.001789842150452414
        },
        {
          oa11cd: 'E00042714',
          weight: 0.0018360742355194506
        },
        {
          oa11cd: 'E00042795',
          weight: 0.0023512317548378577
        },
        {
          oa11cd: 'E00042066',
          weight: 0.001334125883363054
        },
        {
          oa11cd: 'E00042715',
          weight: 0.0020408163265306124
        },
        {
          oa11cd: 'E00042794',
          weight: 0.0024106730070669042
        },
        {
          oa11cd: 'E00042067',
          weight: 0.0020804438280166435
        },
        {
          oa11cd: 'E00042712',
          weight: 0.002100257578759659
        },
        {
          oa11cd: 'E00042793',
          weight: 0.0010831517072848558
        },
        {
          oa11cd: 'E00042064',
          weight: 0.0019285384056535236
        },
        {
          oa11cd: 'E00042713',
          weight: 0.0031305726173964732
        },
        {
          oa11cd: 'E00042792',
          weight: 0.002212535499636748
        },
        {
          oa11cd: 'E00042065',
          weight: 0.002859784690575259
        },
        {
          oa11cd: 'E00042710',
          weight: 0.0019351429892345289
        },
        {
          oa11cd: 'E00042791',
          weight: 0.002060630077273628
        },
        {
          oa11cd: 'E00042062',
          weight: 0.004127864738128261
        },
        {
          oa11cd: 'E00042711',
          weight: 0.0015190542236312
        },
        {
          oa11cd: 'E00042790',
          weight: 0.0014662175549831583
        },
        {
          oa11cd: 'E00042061',
          weight: 0.00364573013671488
        },
        {
          oa11cd: 'E00042718',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042799',
          weight: 0.0011690112938379236
        },
        {
          oa11cd: 'E00042719',
          weight: 0.0021134667459216695
        },
        {
          oa11cd: 'E00042798',
          weight: 0.002093652995178654
        },
        {
          oa11cd: 'E00042068',
          weight: 0.0018955154877484974
        },
        {
          oa11cd: 'E00042069',
          weight: 0.0021332804966646855
        },
        {
          oa11cd: 'E00042056',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042057',
          weight: 0.0026220196816590714
        },
        {
          oa11cd: 'E00042054',
          weight: 0.002087048411597649
        },
        {
          oa11cd: 'E00042055',
          weight: 0.002100257578759659
        },
        {
          oa11cd: 'E00042052',
          weight: 0.002034211742949607
        },
        {
          oa11cd: 'E00042053',
          weight: 0.0023248134205138367
        },
        {
          oa11cd: 'E00042050',
          weight: 0.0024106730070669042
        },
        {
          oa11cd: 'E00042051',
          weight: 0.0023512317548378577
        },
        {
          oa11cd: 'E00042058',
          weight: 0.0009048279505977148
        },
        {
          oa11cd: 'E00042059',
          weight: 0.002516346344362988
        },
        {
          oa11cd: 'E00042087',
          weight: 0.0019879796578825704
        },
        {
          oa11cd: 'E00042086',
          weight: 0.0022323492503797636
        },
        {
          oa11cd: 'E00042085',
          weight: 0.0014331946370781323
        },
        {
          oa11cd: 'E00042084',
          weight: 0.0013209167162010435
        },
        {
          oa11cd: 'E00042083',
          weight: 0.0019285384056535236
        },
        {
          oa11cd: 'E00042082',
          weight: 0.0019021200713295026
        },
        {
          oa11cd: 'E00042081',
          weight: 0.005118552275279044
        },
        {
          oa11cd: 'E00042080',
          weight: 0.0015983092266032626
        },
        {
          oa11cd: 'E00042089',
          weight: 0.001096360874446866
        },
        {
          oa11cd: 'E00042088',
          weight: 0.0021068621623406645
        },
        {
          oa11cd: 'E00042246',
          weight: 0.0017370054818043722
        },
        {
          oa11cd: 'E00042247',
          weight: 0.0010237104550558087
        },
        {
          oa11cd: 'E00042244',
          weight: 0.0022653721682847896
        },
        {
          oa11cd: 'E00042245',
          weight: 0.0026880655174691234
        },
        {
          oa11cd: 'E00042242',
          weight: 0.001730400898223367
        },
        {
          oa11cd: 'E00042243',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042241',
          weight: 0.0014001717191731062
        },
        {
          oa11cd: 'E00042248',
          weight: 0.001664355062413315
        },
        {
          oa11cd: 'E00042236',
          weight: 0.0014001717191731062
        },
        {
          oa11cd: 'E00042237',
          weight: 0.0013869625520110957
        },
        {
          oa11cd: 'E00042234',
          weight: 0.0021993263324747376
        },
        {
          oa11cd: 'E00042235',
          weight: 0.00197477049072056
        },
        {
          oa11cd: 'E00042232',
          weight: 0.0020540254936926225
        },
        {
          oa11cd: 'E00042233',
          weight: 0.0021464896638266956
        },
        {
          oa11cd: 'E00042230',
          weight: 0.00243048675780992
        },
        {
          oa11cd: 'E00042238',
          weight: 0.002219140083217753
        },
        {
          oa11cd: 'E00042476',
          weight: 0.00364573013671488
        },
        {
          oa11cd: 'E00042477',
          weight: 0.003183409286044515
        },
        {
          oa11cd: 'E00042474',
          weight: 0.001604913810184268
        },
        {
          oa11cd: 'E00042866',
          weight: 0.0017171917310613565
        },
        {
          oa11cd: 'E00042475',
          weight: 0.002212535499636748
        },
        {
          oa11cd: 'E00042867',
          weight: 0.001941747572815534
        },
        {
          oa11cd: 'E00042472',
          weight: 0.0011822204609999339
        },
        {
          oa11cd: 'E00042864',
          weight: 0.0019021200713295026
        },
        {
          oa11cd: 'E00042473',
          weight: 0.002179512581731722
        },
        {
          oa11cd: 'E00042865',
          weight: 0.001968165907139555
        },
        {
          oa11cd: 'E00042470',
          weight: 0.0026220196816590714
        },
        {
          oa11cd: 'E00042862',
          weight: 0.0016115183937652731
        },
        {
          oa11cd: 'E00042471',
          weight: 0.0019813750743015654
        },
        {
          oa11cd: 'E00042863',
          weight: 0.002001188825044581
        },
        {
          oa11cd: 'E00042860',
          weight: 0.0017700283997093983
        },
        {
          oa11cd: 'E00042861',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042478',
          weight: 0.0024172775906479097
        },
        {
          oa11cd: 'E00042479',
          weight: 0.0021068621623406645
        },
        {
          oa11cd: 'E00042868',
          weight: 0.0015917046430222574
        },
        {
          oa11cd: 'E00042869',
          weight: 0.001855887986262466
        },
        {
          oa11cd: 'E00042426',
          weight: 0.0021663034145697115
        },
        {
          oa11cd: 'E00042427',
          weight: 0.0025361600951060038
        },
        {
          oa11cd: 'E00042424',
          weight: 0.0024370913413909252
        },
        {
          oa11cd: 'E00042856',
          weight: 0.0016577504788323097
        },
        {
          oa11cd: 'E00042425',
          weight: 0.0019021200713295026
        },
        {
          oa11cd: 'E00042857',
          weight: 0.0021332804966646855
        },
        {
          oa11cd: 'E00042422',
          weight: 0.002067234660854633
        },
        {
          oa11cd: 'E00042854',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042423',
          weight: 0.002153094247407701
        },
        {
          oa11cd: 'E00042855',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042420',
          weight: 0.001604913810184268
        },
        {
          oa11cd: 'E00042852',
          weight: 0.002159698830988706
        },
        {
          oa11cd: 'E00042421',
          weight: 0.0014662175549831583
        },
        {
          oa11cd: 'E00042853',
          weight: 0.001426590053497127
        },
        {
          oa11cd: 'E00042850',
          weight: 0.0016841688131563305
        },
        {
          oa11cd: 'E00042851',
          weight: 0.0017105871474803515
        },
        {
          oa11cd: 'E00042428',
          weight: 0.002153094247407701
        },
        {
          oa11cd: 'E00042429',
          weight: 0.0020804438280166435
        },
        {
          oa11cd: 'E00042858',
          weight: 0.001882306320586487
        },
        {
          oa11cd: 'E00042859',
          weight: 0.0020738392444356385
        },
        {
          oa11cd: 'E00042416',
          weight: 0.0015586817251172314
        },
        {
          oa11cd: 'E00042417',
          weight: 0.0015520771415362261
        },
        {
          oa11cd: 'E00042496',
          weight: 0.002245558417541774
        },
        {
          oa11cd: 'E00042166',
          weight: 0.0016511458952513044
        },
        {
          oa11cd: 'E00042806',
          weight: 0.001697377980318341
        },
        {
          oa11cd: 'E00042414',
          weight: 0.0014530083878211478
        },
        {
          oa11cd: 'E00042495',
          weight: 0.001274684631134007
        },
        {
          oa11cd: 'E00042887',
          weight: 0.0022587675847037846
        },
        {
          oa11cd: 'E00042807',
          weight: 0.0015851000594412521
        },
        {
          oa11cd: 'E00042415',
          weight: 0.001968165907139555
        },
        {
          oa11cd: 'E00042494',
          weight: 0.0019219338220725184
        },
        {
          oa11cd: 'E00042886',
          weight: 0.002034211742949607
        },
        {
          oa11cd: 'E00042164',
          weight: 0.001486031305726174
        },
        {
          oa11cd: 'E00042412',
          weight: 0.0022059309160557426
        },
        {
          oa11cd: 'E00042493',
          weight: 0.0016115183937652731
        },
        {
          oa11cd: 'E00042885',
          weight: 0.0017436100653853775
        },
        {
          oa11cd: 'E00042805',
          weight: 0.0016115183937652731
        },
        {
          oa11cd: 'E00042413',
          weight: 0.0022917905026088106
        },
        {
          oa11cd: 'E00042492',
          weight: 0.002212535499636748
        },
        {
          oa11cd: 'E00042884',
          weight: 0.0014992404728881843
        },
        {
          oa11cd: 'E00042162',
          weight: 0.0023842546727428837
        },
        {
          oa11cd: 'E00042802',
          weight: 0.0018690971534244766
        },
        {
          oa11cd: 'E00042410',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042491',
          weight: 0.0036325209695528696
        },
        {
          oa11cd: 'E00042883',
          weight: 0.0020738392444356385
        },
        {
          oa11cd: 'E00042889',
          weight: 0.0026220196816590714
        },
        {
          oa11cd: 'E00042156',
          weight: 0.0015586817251172314
        },
        {
          oa11cd: 'E00042180',
          weight: 0.003302291790502609
        },
        {
          oa11cd: 'E00042605',
          weight: 0.003883495145631068
        },
        {
          oa11cd: 'E00042682',
          weight: 0.002304999669770821
        },
        {
          oa11cd: 'E00042681',
          weight: 0.002186117165312727
        },
        {
          oa11cd: 'E00042345',
          weight: 0.0019549567399775444
        },
        {
          oa11cd: 'E00042520',
          weight: 0.001637936728089294
        },
        {
          oa11cd: 'E00042902',
          weight: 0.0023908592563238887
        },
        {
          oa11cd: 'E00042518',
          weight: 0.0014331946370781323
        },
        {
          oa11cd: 'E00175553',
          weight: 0.005277062281223169
        },
        {
          oa11cd: 'E00042703',
          weight: 0.0016247275609272834
        },
        {
          oa11cd: 'E00042218',
          weight: 0.0017700283997093983
        },
        {
          oa11cd: 'E00042403',
          weight: 0.0024965325936199723
        },
        {
          oa11cd: 'E00042839',
          weight: 0.0015917046430222574
        },
        {
          oa11cd: 'E00042311',
          weight: 0.0015124496400501948
        },
        {
          oa11cd: 'E00042258',
          weight: 0.0019153292384915131
        },
        {
          oa11cd: 'E00042205',
          weight: 0.001968165907139555
        },
        {
          oa11cd: 'E00042816',
          weight: 0.0014331946370781323
        },
        {
          oa11cd: 'E00042195',
          weight: 0.0022653721682847896
        },
        {
          oa11cd: 'E00042191',
          weight: 0.0014199854699161218
        },
        {
          oa11cd: 'E00042364',
          weight: 0.0017832375668714088
        },
        {
          oa11cd: 'E00042353',
          weight: 0.0017171917310613565
        },
        {
          oa11cd: 'E00042306',
          weight: 0.001637936728089294
        },
        {
          oa11cd: 'E00042540',
          weight: 0.0017237963146423617
        },
        {
          oa11cd: 'E00042722',
          weight: 0.0018162604847764348
        },
        {
          oa11cd: 'E00042721',
          weight: 0.0021993263324747376
        },
        {
          oa11cd: 'E00042240',
          weight: 0.0018426788191004558
        },
        {
          oa11cd: 'E00042249',
          weight: 0.001604913810184268
        },
        {
          oa11cd: 'E00042165',
          weight: 0.0019879796578825704
        }
      ],
      placement_history: [
        'E00042670',
        'E00042877',
        'E00042429',
        'E00042260',
        'E00042305',
        'E00042447',
        'E00042270',
        'E00042570',
        'E00042820',
        'E00042884'
      ],
      pop_age_groups: {
        pop_children: {
          max: 16,
          min: 0,
          weight: 0
        },
        pop_elderly: {
          max: 90,
          min: 70,
          weight: 0
        },
        pop_total: {
          max: 90,
          min: 0,
          weight: 1
        }
      },
      population_weight: 2,
      sensors: [
        {
          oa11cd: 'E00042570',
          x: 428240.232,
          y: 564344.739
        },
        {
          oa11cd: 'E00042270',
          x: 422113.439,
          y: 564425.872
        },
        {
          oa11cd: 'E00042260',
          x: 419906.846,
          y: 566409.152
        },
        {
          oa11cd: 'E00042447',
          x: 425187.717,
          y: 566668.617
        },
        {
          oa11cd: 'E00042877',
          x: 423141.78,
          y: 564703.669
        },
        {
          oa11cd: 'E00042820',
          x: 423991.422,
          y: 564565.018
        },
        {
          oa11cd: 'E00042670',
          x: 425661.382,
          y: 564790.322
        },
        {
          oa11cd: 'E00042305',
          x: 422854.54,
          y: 568143.116
        },
        {
          oa11cd: 'E00042429',
          x: 427098.128,
          y: 565789.177
        },
        {
          oa11cd: 'E00042884',
          x: 421728.16,
          y: 565962.71
        }
      ],
      theta: 500,
      total_coverage: 0.2418388293063128,
      workplace_weight: -1
    },
    status: 'finished'
  };

  // layersControl = {
  //   baseLayers: {
  //     'Open Street Map': tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
  //     'Open Cycle Map': tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
  //   },
  //   overlays: {
  //     'Big Circle': circle([ 46.95, -122 ], { radius: 5000 }),
  //     'Big Square': polygon([[ 46.8, -121.55 ], [ 46.9, -121.55 ], [ 46.9, -121.7 ], [ 46.8, -121.7 ]])
  //   }
  // };

  public map: Map;
  public zoom: number;

  // Local Authorities currently included:
  // Newcastle upon Tyne = 'ncl'
  // Gateshead = 'gates'

  // data



  // disability
  disabilityDataNcl;
  disabilityDataGates;
  disabilityDataLegend;
  disabilityDataVisible = false;
  disabilityDataReady = false;

  // IMD
  IMDDataVisible = false;
  IMDDataNcl;
  IMDDataGates;
  IMDLegend;
  IMDDataReady = false;

  //  to space syntax
  toSSDataVisible = false;
  toSSDataNcl;
  toSSDataGates;
  toSSLegend;
  toSSDataReady = false;

  //  through space syntax
  throughSSDataVisible = false;
  throughSSDataNcl;
  throughSSDataGates;
  throughSSLegend;
  throughSSDataReady = false;

  // Urban Observatory sensors
  uoDataVisible = false;
  uoLegend = [
    {title: 'NO2', colour: '#215a8f'},
    {title: 'PM2.5', colour: '#5886a5'},
    {title: 'PM10', colour: '#9dc6e0'}
  ];
  uoDataNcl;
  uoDataGates;
  uoDataReady = false;

  // Output areas
  oaNcl;
  oaGates;
  oaDataVisible;
  oaDataReady = false;

  centroids;

  // primary schools
  primarysDataNcl;
primarysDataReady = false;
primarysDataVisible = false;

// age layers
  ageDataVisible;
  ageDataReady = false;
  ageData1Ncl; // under 18
  ageData2Ncl; // 18-64
  ageData3Ncl; // 64+
  ageData1Gates; // under 18
  ageData2Gates; // 18-64
  ageData3Gates; // 64+
  ageData1Visible;
  ageData2Visible;
  ageData3Visible;
  showAgeChoices = false;


  // optimisation form
  nSensors = 10;
  theta = 500;
  minAge = 0;
  maxAge = 90;
  populationWeight = 1;
  workplaceWeight = 0;
  budget = 10000;
  jobInProgress = false;
  jobProgressPercent = 0;
  sensorCost = 1000;
  // todo decide on minimums allowed
  minSensorsAllowed = 1;
  thetaMinAllowed  = 500;
  jobID = null;
  viewingSensorPlacement = false;

  // optimisation query options and values
// sliders
  ageLow = 20;
  ageHigh = 70;
  placeLow = 20;

  optimisationOutputCoverageLayer;
  optimisationSensors;

  // configure leaflet marker
  markerIcon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png'
  });

  // Urban Observatory markers
  NO2Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/NO2.png',
    shadowUrl: ''
  });
  PM10Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/PM10.png',
    shadowUrl: ''
  });
  PM25Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/PM2.5.png',
    shadowUrl: ''
  });
  PM25PM10NO2Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/10_25_02.png',
    shadowUrl: ''
  });
  NO2PM10Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/02_10.png',
    shadowUrl: ''
  });
  NO2PM25Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/02_25.png',
    shadowUrl: ''
  });
  PM25PM10Marker = icon({
    iconSize: [25, 25],
    iconAnchor: [13, 41],
    iconUrl: 'assets/10_25.png',
    shadowUrl: ''
  });

  // sensor marker
  sensorMarker = L.divIcon({
    html: '<i class="fa fa-bullseye fa-2x" style="color: #6200eeff; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);"></i>',
    iconSize: [20, 20],
    className: 'sensorIcon'
  });

  // primary school marker
  primarySchoolMarker = L.divIcon({
    html: '<i class="fa fa-school " style="color: #DB2518;"></i>',
    iconSize: [15, 15],
    className: 'schoolIcon'
  });
// primary #DB2518
  // secondary #5C100A


  // default is Newcastle
  localAuthority = 'ncl';

  // viewing option toggles
  optimisationQueryCardOpen = false;
  viewOutputAreCoverageOnMap = false;
  dataLayersChipsVisible = false;

  ageData;

  outputAreaCoverageLegend = [
    {title: '0-0.2', colour: '#FFFFEB'},
    {title: '0.2-0.4', colour: '#c2d2b0'},
    {title: '0.4-0.6', colour: '#D8F0B6'},
    {title: '0.6-0.8', colour: '#8AC48A'},
    {title: '0.8-1', colour: '#43765E'}
  ];
  outputAreaCoverageLayer;
  totalCoverage;


  websocketSubscription;



  constructor(
    private geoserver: GeoserverService,
    private webSocket: WebSocketService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private urbanObservatoryService: UrbanObservatoryService,
    private databaseService: DatabaseService
  ) {
    this.iconRegistry.addSvgIcon(
      'sensor1', this.sanitizer.bypassSecurityTrustResourceUrl('assets/sensorIcon2.svg')
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.map.clearAllEventListeners;
    this.map.remove();
    // todo stop subscribing to websocket
  }

  onMapReady(map: Map) {
    this.map = map;
    this.map$.emit(map);
    this.zoom = map.getZoom();
    this.zoom$.emit(this.zoom);

    this.createDataLayers();

    this.setQueryDefaults();

    // disable map events on overlay content
    const optCard = document.getElementById('no-scroll');
    L.DomEvent.disableScrollPropagation(optCard);
    L.DomEvent.disableClickPropagation(optCard);

  }

  onMapZoomEnd(e: LeafletEvent) {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }



  openChooseLADialog() {
    const dialogConfig = new MatDialogConfig();

    // pass current LA to dialog and prevent closing by clicking outside dialog
    dialogConfig.data = this.localAuthority;
    dialogConfig.disableClose = true;

    const dialogRef = this.matDialog.open(ChooseLADialogComponent, dialogConfig);
    // subscribe to closing dialog and get local authority chosen
    dialogRef.afterClosed().subscribe(value => {
      this.localAuthority = value;
      // change centre of map to suit LA chosen
      this.map.panTo(this.getLACentre(value));
    });
  }

  setQueryDefaults() {
    this.nSensors = 10;
    this.theta = 500;
    this.minAge = 0;
    this.maxAge = 90;
    this.populationWeight = 1;
    this.workplaceWeight = 0;
    this.budget = 10000;
    this.ageLow = 20;
    this.ageHigh = 70;
    this.placeLow = 20;
  }

  // get latlng for map centre for each LA on offer
  getLACentre(LA) {
    if (LA === 'ncl') {
      return new LatLng(54.980540, -1.6635291);
    } else if (LA === 'gates') {
      return new LatLng(54.952029, -1.596755);
    }
  }


  // ----- Create data layers
  createDataLayers() {
    this.createDisabilityLayer();
    this.createIMDLayers();
    this.createToSSDataLayer();
    this.createThroughSSDataLayer();
    this.createUOLayer();
    // this.createAgeLayer();
    // this.createCentroidLayer();
    // this.createDraggableSnapToNearestCentroidMarker();
    // this.snapToNearestCentroid();
    this.createOALayer();
    this.createPrimarysLayers();
    this.createAgeLayers();
  }

  createDraggableMarker() {
    // create draggable marker
    const draggableMarker = L.marker([54.958455, -1.6178], {icon: this.markerIcon, draggable: true});
    draggableMarker.addTo(this.map);

    // trigger event on drag end and console log latlong
    draggableMarker.on('dragend', (event) => {
      const position = draggableMarker.getLatLng();
      console.log(position);
    });
  }

  async createDraggableSnapToNearestCentroidMarker() {
    // create draggable marker
    const draggableMarker = L.marker([54.958455, -1.6178], {icon: this.markerIcon, draggable: true});
    draggableMarker.addTo(this.map);

    // get centroids as list of leaflet latlngs
    const possibleLocations = await this.createCentroidsAsLatLngs();

    // trigger event on drag end and snap to nearest centroid
    draggableMarker.on('dragend', (event) => {
      const position = draggableMarker.getLatLng();

      // nearest centroid
      const closestCentroid = L.GeometryUtil.closest(this.map, possibleLocations, position, true);
      draggableMarker.setLatLng([closestCentroid.lat, closestCentroid.lng]);
    });
  }

  async snapToNearestCentroid() {
    // get centroids as list of leaflet latlngs
    const possibleLocations = await this.createCentroidsAsLatLngs();

    // when user clicks on map, create a marker at the nearest centroid (eventually prevent duplicate clicks and respond to user)
    this.map.on('click', (e) => {
      console.log('Click: ' + (e as LeafletMouseEvent).latlng);
      const closestCentroid = L.GeometryUtil.closest(this.map, possibleLocations, (e as LeafletMouseEvent).latlng, true);
      console.log(closestCentroid);

      // create marker at nearest centroid
      const marker = L.marker([closestCentroid.lat, closestCentroid.lng], {icon: this.markerIcon});
      marker.addTo(this.map);
    });

  }

  async getLegend(layer) {
    const legend = await this.geoserver.getLegend(layer);
    const rules = legend.rules;
    const colourMapping = [];
    rules.forEach((rule) => {
      const colour = rule.symbolizers[0].Polygon.fill;
      const title = rule.name;
      colourMapping.push({colour, title});
    });
    return colourMapping;
  }

  async getLineLegend(layer) {
    const legend = await this.geoserver.getLegend(layer);
    const rules = legend.rules;
    const colourMapping = [];
    rules.forEach((rule) => {
      const colour = rule.symbolizers[0].Line.stroke;
      const title = rule.name;
      colourMapping.push({colour, title});
    });
    return colourMapping;
  }

  async createDisabilityLayer() {
    const first = new Promise((resolve, reject) => {
      this.disabilityDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
        layers: 'disability_2015_by_lsoa_ncl',
        transparent: true,
        format: 'image/png',
        opacity: 0.5
      });
      resolve();
    });

    const second = new Promise((resolve, reject) => {
      this.disabilityDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
        layers: 'disability_2015_by_lsoa_gates',
        transparent: true,
        format: 'image/png',
        opacity: 0.5
      });
      resolve();
    });

    const third = new Promise(async (resolve, reject) => {
      // create legend
      this.disabilityDataLegend = this.legendTo2DecimalPlaces(await this.getLegend('disability_2015_by_lsoa_ncl'));
      resolve();
    });

    // once resolved, show data chip
    await Promise.all([first, second, third]);
    this.disabilityDataReady = true;
  }

  async createToSSDataLayer() {
    this.toSSDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'to_space_syntax_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.3
    });

    // this.spaceSyntaxDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
    //   layers: 'space_syntax_gates',
    //   transparent: true,
    //   format: 'image/png',
    //   opacity: 0.5
    // });

    // create legend
    this.toSSLegend = this.legendTo2DecimalPlaces(await this.getLineLegend('to_space_syntax_ncl'));

    this.toSSDataReady = true;

  }

  async createThroughSSDataLayer() {
    this.throughSSDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'through_space_syntax_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.3
    });
    // this.spaceSyntaxDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
    //   layers: 'space_syntax_gates',
    //   transparent: true,
    //   format: 'image/png',
    //   opacity: 0.5
    // });
    // create legend
    this.throughSSLegend = this.legendTo2DecimalPlaces(await this.getLineLegend('through_space_syntax_ncl'));
    this.throughSSDataReady = true;
  }

  async createAgeLayers() {
    this.geoserver.getGeoJSON('ages_oa_ncl').then((nclData) => {
console.log('newcastle data')
      console.log(nclData)
            const myStyle = {
        color: '#ff7800',
        weight: 1.5,
        opacity: 0.8
      };

            // age range 1
            this.ageData1Ncl = L.geoJSON(nclData, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: this.getStyleForAge1
              // onEachFeature: this.age1FeatureFunction
      });
            console.log('age 1 ncl')
            console.log(this.ageData1Ncl)

      // age range 2
            this.ageData2Ncl = L.geoJSON(nclData, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: this.getStyleForAge2
        // onEachFeature: this.age1FeatureFunction
      });

      // age range 3
            this.ageData3Ncl = L.geoJSON(nclData, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: this.getStyleForAge3
        // onEachFeature: this.age1FeatureFunction
      });


    });

    this.geoserver.getGeoJSON('ages_oa_gates').then((gatesData) => {

      const myStyle = {
        color: '#ff7800',
        weight: 1.5,
        opacity: 0.8
      };

      // age range 1
      this.ageData1Gates = L.geoJSON(gatesData, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: this.getStyleForAge1
        // onEachFeature: this.age1FeatureFunction
      });

      // age range 2
      this.ageData2Gates = L.geoJSON(gatesData, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: this.getStyleForAge2
        // onEachFeature: this.age1FeatureFunction
      });

      // age range 3
      this.ageData3Gates = L.geoJSON(gatesData, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: this.getStyleForAge3
        // onEachFeature: this.age1FeatureFunction
      });


    });


    this.ageDataReady;
  }



  getStyleForAge1(feature) {
    // const colour = this.getStyleForAge(feature, 'under7');

    // count number of people 17 and under
    let count = 0;
    for (let index = 0; index < 18; index ++) {
      count = count + feature.properties[index];
    }

    // for (let index = 18; index < 64; index ++) {
    //   count = count + feature.properties[index];
    // }

    // for (let index = 64; index < 91; index ++) {
    //   count = count + feature.properties[index];
    // }

    // const colour = this.getStyleForAge(count);
    let colour = '#3e1603';

    if (count < 50) {
      colour = '#ffffe5';
    } else if (count < 100) {
      colour = '#fff7bc';
    } else if (count < 150) {
      colour = '#fee391';
    } else if (count < 200) {
      colour = '#fec44f';
    } else if (count < 250) {
      colour = '#fe9929';
    } else if (count < 300) {
      colour = '#ec7014';
    } else if (count < 350) {
      colour = '#cc4c02';
    } else if (count < 400) {
      colour = '#993404';
    } else if (count < 450) {
      colour = '#662506';
    }
    return {
      color: 'grey',
      fill: true,
      fillColor: colour,
      stroke: true,
      weight: 0.8,
      fillOpacity: 0.7
    };
  }

  getStyleForAge2(feature) {
    // const colour = this.getStyleForAge(feature, 'under7');

    // count number of people 18-64
    let count = 0;
    for (let index = 18; index < 64; index ++) {
      count = count + feature.properties[index];
    }

    let colour = '#3e1603';

    if (count < 50) {
      colour = '#ffffe5';
    } else if (count < 100) {
      colour = '#fff7bc';
    } else if (count < 150) {
      colour = '#fee391';
    } else if (count < 200) {
      colour = '#fec44f';
    } else if (count < 250) {
      colour = '#fe9929';
    } else if (count < 300) {
      colour = '#ec7014';
    } else if (count < 350) {
      colour = '#cc4c02';
    } else if (count < 400) {
      colour = '#993404';
    } else if (count < 450) {
      colour = '#662506';
    }
    return {
      color: 'grey',
      fill: true,
      fillColor: colour,
      stroke: true,
      weight: 0.8,
      fillOpacity: 0.7
    };
  }

  getStyleForAge3(feature) {
    // const colour = this.getStyleForAge(feature, 'under7');

    // count number of people over 64
    let count = 0;

    for (let index = 64; index < 91; index ++) {
      count = count + feature.properties[index];
    }

    // const colour = this.getStyleForAge(count);
    let colour = '#3e1603';

    if (count < 50) {
      colour = '#ffffe5';
    } else if (count < 100) {
      colour = '#fff7bc';
    } else if (count < 150) {
      colour = '#fee391';
    } else if (count < 200) {
      colour = '#fec44f';
    } else if (count < 250) {
      colour = '#fe9929';
    } else if (count < 300) {
      colour = '#ec7014';
    } else if (count < 350) {
      colour = '#cc4c02';
    } else if (count < 400) {
      colour = '#993404';
    } else if (count < 450) {
      colour = '#662506';
    }
    return {
      color: 'grey',
      fill: true,
      fillColor: colour,
      stroke: true,
      weight: 0.8,
      fillOpacity: 0.7
    };
  }

  getStyleForAge(count) {
    let colour = '#3e1603';

    if (count < 50) {
      colour = '#ffffe5';
    } else if (count < 100) {
      colour = '#fff7bc';
    } else if (count < 150) {
      colour = '#fee391';
    } else if (count < 200) {
      colour = '#fec44f';
    } else if (count < 250) {
      colour = '#fe9929';
    } else if (count < 300) {
      colour = '#ec7014';
    } else if (count < 350) {
      colour = '#cc4c02';
    } else if (count < 400) {
      colour = '#993404';
    } else if (count < 450) {
      colour = '#662506';
    }
    return colour;
  }

  age1FeatureFunction(layer, feature) {
    // count number of people 17 and under
    let count = 0;
    for (let index = 0; index < 18; index ++) {
      count = count + feature.properties[index];
    }
    layer.bindPopup('' + count);
    layer.on('mouseover', function() { layer.openPopup(); });
    layer.on('mouseout', function() { layer.closePopup(); });
  }
  // todo add error handling if get surprises from UO API
  async createUOLayer() {

    const allSensors = [];
  // @ts-ignore
    const group = L.markerClusterGroup({
    iconCreateFunction(cluster) {
      return L.divIcon({
        className: 'uoSensorCluster',
        html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
      });
    },
    showCoverageOnHover: false,
      spiderfyOnMaxZoom: false
  });

    const no2 = await this.urbanObservatoryService.getNO2ncl();
    no2.forEach((sensor) => {
        // const position = L.latLng([sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']]);
        // const marker = L.marker(position, {icon: this.NO2Marker});
      const type = 'NO2';
      const position = [sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']];
      const marker = {type, position};
      allSensors.push(marker);
      });

    const pm25 = await this.urbanObservatoryService.getPM25ncl();
    pm25.forEach((sensor) => {
       //  const position = L.latLng([sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']]);
       //  const marker = L.marker(position, {icon: this.PM25Marker});
       // // group.addLayer(marker);
       //  markers.push(marker);
      const type = 'PM25';
      const position = [sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']];
      const marker = {type, position};
      allSensors.push(marker);
      });

    const pm10 = await this.urbanObservatoryService.getPM10ncl();
    pm10.forEach((sensor) => {
      const type = 'PM10';
      const position = [sensor['Sensor Centroid Latitude'], sensor['Sensor Centroid Longitude']];
      const marker = {type, position};
      allSensors.push(marker);
    });

 // check through markers list for duplicates locations. If duplicate then remove all and create new marker representing all
    const groupedByPosition =  _.groupBy(allSensors, (item) => {
    return item.position;
  });

    const markers = [];

    for (const key in groupedByPosition) {
      const entry = groupedByPosition[key];

      // remove duplicates
      const typesMentioned = {};
      const uniqueEntry = entry.filter(function(e) {
        if (typesMentioned[e.type]) {
          return false;
        }
        typesMentioned[e.type] = true;
        return true;
      });

      // if there is only 1 sensor at a location, go ahead and create a simple single type marker
      if (uniqueEntry.length === 1) {
        markers.push(this.createSingleUOSensorMarker(uniqueEntry[0].type, uniqueEntry[0].position));
      } else {
        let types = [];
        uniqueEntry.forEach((e) => {
          types.push(e.type);
        });
        // remove any duplicates
        types = _.uniq(types);

        markers.push(this.createMultipleUOSensorMarker(types, uniqueEntry[0].position));
      }
    }

    // add markers to group
    markers.forEach((m) => {group.addLayer(m); });

    // todo at the moment both newcastle and gateshead are covered by same uo sensor data?
    this.uoDataNcl = group;
    this.uoDataGates = group;



    this.uoDataReady = true;

  }

  createMultipleUOSensorMarker(types, position) {

    // create position and assign correct marker image depending on type
    const pos = L.latLng([position[0], position[1]]);


    let icon;

  // 3 types - create marker with all sensor types
    if (types.length === 3) {
      icon = this.PM25PM10NO2Marker;
    } else {
      // PM10 and PM2.5
      if (types.includes('PM10') && (types.includes('PM25'))) {
        icon = this.PM25PM10Marker;
      }
      // PM10 and NO2
      else if (types.includes('PM10') && (types.includes('NO2'))) {
        icon = this.NO2PM10Marker;
      }
      // PM2.5 and NO2
      else if (types.includes('PM25') && (types.includes('NO2'))) {
        icon = this.NO2PM25Marker;
      }
    }

    // create marker
    return L.marker(position, {icon});

  }


  createSingleUOSensorMarker(type, position) {
    // create position and assign correct marker image depending on type
    const pos = L.latLng([position[0], position[1]]);
    // tslint:disable-next-line:no-shadowed-variable
    let icon;

    if (type === 'NO2') {
      icon = this.NO2Marker;
    } else if (type === 'PM25') {
      icon = this.PM25Marker;
    } else if (type === 'PM10') {
      icon = this.PM10Marker;
    }

    return L.marker(pos, {icon});
  }


  async createIMDLayers() {
    this.IMDDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'imd_2015_by_lsoa_ncl',
      transparent: true,
      format: 'image/png',
      opacity: 0.5
    });

    this.IMDDataGates = L.tileLayer.wms(environment.GEOSERVERWMS, {
      layers: 'imd_2015_by_lsoa_gates',
      transparent: true,
      format: 'image/png',
      opacity: 0.5
    });

    // create legend
    this.IMDLegend = await this.getLegend('imd_2015_by_lsoa_ncl');

    this.IMDDataReady = true;
  }

  async createPrimarysLayers() {
    // this.primarysDataNcl = L.tileLayer.wms(environment.GEOSERVERWMS, {
    //   layers: 'primary_schools_with_data',
    //   transparent: true,
    //   format: 'application/json',
    //   opacity: 0.5
    // });

    // create legend
    // this.IMDLegend = await this.getLegend('imd_2015_by_lsoa_ncl');

    this.geoserver.getGeoJSON('primary_schools_with_data').then((schoolsData) => {


     // can't use 'this.' inside of nested function so get marker first.
     const marker = this.primarySchoolMarker;

     // get lat long from conversion and create layer
     this.primarysDataNcl = L.geoJSON(schoolsData, {
       coordsToLatLng: (p) => {
         const conversion = this.convertFromBNGProjection(p[0], p[1]);
         return L.latLng(conversion[0], conversion[1]);
       },
        pointToLayer(feature, latlng) {
          return L.marker(latlng, {
            icon: marker
          });
        },
       onEachFeature: this.schoolsFeatures
     });

     // testing
     // console.log(this.primarysDataNcl);
     // this.primarysDataNcl.addTo(this.map);

     this.primarysDataReady = true;
    });



  }

  async createOALayer() {
    this.geoserver.getGeoJSON('oa_ncl').then((oaGeoJSON) => {

      const myStyle = {
        fill: false,
        color: '#ff7800',
        weight: 1.5,
        opacity: 0.8
      };

      this.oaNcl = L.geoJSON(oaGeoJSON, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: myStyle,
        // onEachFeature: this.oaFeatureFunction
      });
    });
    this.geoserver.getGeoJSON('oa_gates').then((oaGeoJSON) => {
      const myStyle = {
        fill: false,
        color: '#ff7800',
        weight: 1.5,
        opacity: 0.8
      };

      this.oaGates = L.geoJSON(oaGeoJSON, {
        coordsToLatLng: (p) => {
          const conversion = this.convertFromBNGProjection(p[0], p[1]);
          return L.latLng(conversion[0], conversion[1]);
        },
        style: myStyle,
        // onEachFeature: this.oaFeatureFunction
      });
    });
    this.oaDataReady = true;
  }

  // function that controls what happens for events triggered on output area events
  oaFeatureFunction(feature, layer) {
    if (feature.properties) {
      // layer.bindPopup(feature.properties.code);
      layer.on(
        'mouseover', function(e) {
          this.setStyle({
            fill: true,
            fillColor: '#ff7800'
          });
        });
      layer.on(
        'mouseout', function(e) {
          this.setStyle({
            fill: false
          });
        });
    }
  }

  // click event on schools
  schoolsFeatures(feature, layer) {
    let content = feature.properties.SCHNAME;
    // if seats are known then include
    if (feature.properties.seats) {
      content = content + '<br>' + feature.properties.seats + ' seats';
    }
    layer.bindPopup(content);
  }


  async createAgeLayer() {
    let ageDataSummary = await this.geoserver.getFeatureInfo('tyne_and_wear_ageranges_summary');
    ageDataSummary = ageDataSummary.features;
    console.log('Age data to eventually display, perhaps in pie chart:');
    console.log(ageDataSummary);
  }


  async createCentroidLayer() {
    // Getting centroids as layer (i.e. image)
    // this.centroids = L.tileLayer.wms(environment.GEOSERVERWMS, {
    //   layers: 'centroids',
    //   transparent: true,
    //   format: 'image/png'
    // });

    // getting centroids as JSON so can plot as markers
    // let centroidsFullResponse = await this.geoserver.getFeatureInfo('centroids');
    // centroidsFullResponse = centroidsFullResponse.features;
    // const centroids = [];
    // centroidsFullResponse.forEach((entry) => {
    //   centroids.push(entry.geometry.coordinates);
    // });
    // centroids.forEach((cent) => {
    //   const latlng = this.convertFromBNGProjection(cent[0], cent[1]);
    //   const centroidMarker = L.marker(latlng, {icon: this.markerIcon});
    //   centroidMarker.addTo(this.map);
    // });
  }

  async createCentroidsAsLatLngs() {
    // getting centroids as JSON so can plot as markers
    let centroidsFullResponse = await this.geoserver.getFeatureInfo('centroids');
    centroidsFullResponse = centroidsFullResponse.features;
    const centroids = [];
    centroidsFullResponse.forEach((entry) => {
      centroids.push(entry.geometry.coordinates);
    });
    centroids.forEach((cent) => {
      const latlng = this.convertFromBNGProjection(cent[0], cent[1]);
      const centroid = L.latLng([latlng[0], latlng[1]]);
      centroids.push(centroid);
    });
    return centroids;
  }

  // ------ Data layer toggles


  toggleDataLayersChips() {
    this.dataLayersChipsVisible = !this.dataLayersChipsVisible;
  }

  toggleDisability() {
    // if on, turn off
     if (this.disabilityDataVisible) {
       this.disabilityDataVisible = false;
       this.clearDisabilityLayers();
     }

     // if off, turn on
    else {
      this.disabilityDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.disabilityDataNcl.addTo(this.map);
      } else {
        this.disabilityDataGates.addTo(this.map);
      }

    }
  }

  toggleAge1() {
    // if on, turn off
    if (this.ageData1Visible) {
      this.ageData1Visible = false;
      this.clearAge1();
    }

    // if off, turn on and turn off either of the other 2 age layers
    else {
      this.clearAllAges()
      this.ageData1Visible = true;
      if (this.localAuthority === 'ncl') {
        this.ageData1Ncl.addTo(this.map);
       } else {
        this.ageData1Gates.addTo(this.map);
      }

    }
  }

  toggleAge2() {
    // if on, turn off
    if (this.ageData2Visible) {
      this.ageData2Visible = false;
      this.clearAge2();
    }

    // if off, turn on
    else {
      this.clearAllAges()
      this.ageData2Visible = true;
      if (this.localAuthority === 'ncl') {
        this.ageData2Ncl.addTo(this.map);
      } else {

        this.ageData2Gates.addTo(this.map);
      }

    }
  }

  toggleAge3() {
    // if on, turn off
    if (this.ageData3Visible) {
      this.ageData3Visible = false;
      this.clearAge3();
    }

    // if off, turn on
    else {
      this.clearAllAges()
      this.ageData3Visible = true;
      if (this.localAuthority === 'ncl') {
        this.ageData3Ncl.addTo(this.map);
      } else {
        this.ageData3Gates.addTo(this.map);
      }

    }
  }

  togglePrimarys() {
    // if on, turn off
    if (this.primarysDataVisible) {
      this.primarysDataVisible = false;
      this.clearPrimarysLayers();
    }

    // if off, turn on
    else {
      this.primarysDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.primarysDataNcl.addTo(this.map);
      } else {
      // todo gateshead when have data
      }

    }
  }
  toggleOA() {
    // if on, turn off
    if (this.oaDataVisible) {
      this.oaDataVisible = false;
      this.clearOaLayers();
    }

    // if off, turn on
    else {
      this.oaDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.oaNcl.addTo(this.map);
      } else {
        this.oaGates.addTo(this.map);
      }

    }
  }

  toggleIMD() {
    // if on, turn off
    if (this.IMDDataVisible) {
      this.IMDDataVisible = false;
      this.clearIMDLayers();
    }

    // if off, turn on
    else {
      this.IMDDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.IMDDataNcl.addTo(this.map);
      } else {
        this.IMDDataGates.addTo(this.map);
      }

    }
  }

  toggleUOSensors() {
// if on, turn off
    if (this.uoDataVisible) {
      this.uoDataVisible = false;
      this.clearUOLayers();
    }

    // if off, turn on
    else {
      this.uoDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.uoDataNcl.addTo(this.map);
      } else {
        this.uoDataGates.addTo(this.map);
      }

    }
  }

  toggleToSSLayer() {
    // if on, turn off
    if (this.toSSDataVisible) {
      console.log('turn to off');
      this.toSSDataVisible = false;
      this.cleartoSSLayers();
    }

    // if off, turn on
    else {
      console.log('turn to on');
      this.toSSDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.toSSDataNcl.addTo(this.map);
      } else {
        this.toSSDataGates.addTo(this.map);
      }

    }
  }

  toggleThroughSSLayer() {

    // if on, turn off
    if (this.throughSSDataVisible) {
      this.throughSSDataVisible = false;
      this.clearThroughSSLayers();
    }

    // if off, turn on
    else {
      this.throughSSDataVisible = true;
      if (this.localAuthority === 'ncl') {
        this.throughSSDataNcl.addTo(this.map);
      } else {
        this.throughSSDataGates.addTo(this.map);
      }

    }
  }

  toggleOptimisationOACoverage() {

    // if on, turn off
    if (this.map.hasLayer(this.optimisationOutputCoverageLayer)) {
      this.map.removeLayer(this.optimisationOutputCoverageLayer);
    }

    // if off, turn on
    else {
     this.map.addLayer(this.optimisationOutputCoverageLayer);
    }
  }

  toggleAge() {
    if (this.map.hasLayer(this.ageData)) {
      this.map.removeLayer(this.ageData);
    } else {
      this.ageData.addTo(this.map);
    }
  }

  // clearing data layers
  clearDataLayers() {
  this.clearDisabilityLayers();
  this.clearIMDLayers();
  this.clearUOLayers();
  this.clearOaLayers();
  }

  clearOaLayers() {
    this.oaDataVisible = false;
    if (this.map.hasLayer(this.oaNcl)) {
      this.map.removeLayer(this.oaNcl);
    }
    if (this.map.hasLayer(this.oaGates)) {
      this.map.removeLayer(this.oaGates);
    }
  }

  clearAllAges() {
    this.clearAge1();
    this.clearAge2();
    this.clearAge3();
  }

  clearAge1() {
    this.ageData1Visible = false;
    if (this.map.hasLayer(this.ageData1Ncl)) {
      this.map.removeLayer(this.ageData1Ncl);
    }
    if (this.map.hasLayer(this.ageData1Gates)) {
      this.map.removeLayer(this.ageData1Gates);
    }
  }
  clearAge2() {
    this.ageData2Visible = false;
    if (this.map.hasLayer(this.ageData2Ncl)) {
      this.map.removeLayer(this.ageData2Ncl);
    }
    if (this.map.hasLayer(this.ageData2Gates)) {
      this.map.removeLayer(this.ageData2Gates);
    }
  }
  clearAge3() {
    this.ageData3Visible = false;
    if (this.map.hasLayer(this.ageData3Ncl)) {
      this.map.removeLayer(this.ageData3Ncl);
    }
    if (this.map.hasLayer(this.ageData3Gates)) {
      this.map.removeLayer(this.ageData3Gates);
    }
  }

  clearDisabilityLayers() {
    this.disabilityDataVisible = false;
    if (this.map.hasLayer(this.disabilityDataNcl)) {
      this.map.removeLayer(this.disabilityDataNcl);
    }
    if (this.map.hasLayer(this.disabilityDataGates)) {
      this.map.removeLayer(this.disabilityDataGates);
    }
  }


  clearUOLayers() {
    this.uoDataVisible = false;
    if (this.map.hasLayer(this.uoDataNcl)) {
      this.map.removeLayer(this.uoDataNcl);
    }
    if (this.map.hasLayer(this.uoDataGates)) {
      this.map.removeLayer(this.uoDataGates);
    }
  }

  clearIMDLayers() {
    this.IMDDataVisible = false;
    if (this.map.hasLayer(this.IMDDataNcl)) {
      this.map.removeLayer(this.IMDDataNcl);
    }
    if (this.map.hasLayer(this.IMDDataGates)) {
      this.map.removeLayer(this.IMDDataGates);
    }
  }

  clearPrimarysLayers() {
    this.primarysDataVisible = false;
    if (this.map.hasLayer(this.primarysDataNcl)) {
      this.map.removeLayer(this.primarysDataNcl);
    }

    // todod gateshead primarys
  }

  cleartoSSLayers() {
    this.toSSDataVisible = false;
    if (this.map.hasLayer(this.toSSDataNcl)) {
      this.map.removeLayer(this.toSSDataNcl);
    }
    if (this.map.hasLayer(this.toSSDataGates)) {
      this.map.removeLayer(this.toSSDataGates);
    }
  }

  clearThroughSSLayers() {
    this.throughSSDataVisible = false;
    if (this.map.hasLayer(this.throughSSDataNcl)) {
      this.map.removeLayer(this.throughSSDataNcl);
    }
    if (this.map.hasLayer(this.throughSSDataGates)) {
      this.map.removeLayer(this.throughSSDataGates);
    }
  }

  // Other toggles

  toggleOptimisationCard() {
    this.optimisationQueryCardOpen = !this.optimisationQueryCardOpen;
  }

  // ----- Optimisation query
  submitQuery() {
    // todo check all values are viable

    // workplace and resident weighting need to be translated from /100 to being /1
    this.populationWeight = this.placeLow / 10;

    // set workplace weight using population weight
    this.workplaceWeight = parseFloat((1 - this.populationWeight).toFixed(1));

    // set min and max age, allowing that user might have reversed order of sliders
    if (this.ageLow > this.ageHigh) {
      this.minAge = this.ageHigh;
      this.maxAge = this.ageLow;
    } else {
      this.minAge = this.ageLow;
      this.maxAge = this.ageHigh;
    }

    const query = {
      n_sensors: this.nSensors,
      theta: this.theta,
      min_age: this.minAge,
      max_age: this.maxAge,
      population_weight: this.populationWeight,
      workplace_weight: this.workplaceWeight
    };
    console.log('Query to submit: ');
    console.log(query);
    console.log('before submitting the job ID is ' + this.jobID);

    this.jobInProgress = true;
    this.jobProgressPercent = 0;

    // todo check all are present
    // todo error handling to mark incomplete entries

    // todo handle if can't connect to websocket or loose connection mid run

    this.websocketSubscription = this.webSocket.setupSocketConnection(query)
      .subscribe(
        (data: any = {}) => {
          // todo listen for observer error and act accordingly

          if (data.type) {
            // if job ID has not been set yet, listen for job message, otherwise listen for progress and finish
            if (this.jobID === null) {
              if (data.type === 'job') {
                // check for errors
                if (data.payload.code === 400) {
                  // todo cancel run and show error
                  console.log(data.payload.message);
                } else {
                  console.log('get ID from message ' + data.payload);
                  // todo might need to update server so that the client gets an ID upon connection to verify this is the job that belongs to it
                  this.jobID = data.payload.job_id;
                  console.log('job ID has been set as ' + data.payload.job_id);
                }


              }
            } else {


              // Job in progress
              if (data.type === 'jobProgress') {

                  // check if the job is ours otherwise ignore
                  if (data.payload.job_id === this.jobID) {
                   //  console.log('picked up update for ' + data.payload.job_id);
                    this.jobInProgress = true;
                    this.jobProgressPercent = data.payload.progress.toFixed(2);
                  } else {
                    // console.log('picked up update for another client ' + data.payload.job_id);
                  }
                }
              // Job finished
              else if (data.type === 'jobFinished') {
                // check if job ID is ours else ignore
                if (data.payload.job_id === this.jobID) {

                  // console.log('Job: ' + data.payload.job_id + ' finished');
                  const pay = data.payload;
                  const progress = pay.progress;
                  if (progress === 100) {
                    const jobId = pay.job_id;
                    const result = pay.result;
                    const coverageHistory = result.coverage_history;
                    const oaCoverage = result.oa_coverage;
                    const placementHistory = result.placement_history;
                    const popAgeGroups = result.pop_age_groups;
                    const popChildren = popAgeGroups.pop_children;
                    const popElderly = popAgeGroups.pop_elderly;
                    const popTotal = popAgeGroups.pop_total;
                    const popWeight = result.population_weight;
                    const workplaceWeight = result.workplace_weight;
                    const theta = result.theta;
                    const nSensors = result.n_sensors;
                    this.totalCoverage = result.total_coverage;
                    const sensors = result.sensors;

                    // todo create geojsn from oaCoverage

                    console.log(result);
                    this.jobID = null;
                    this.plotOptimisationSensors(sensors, oaCoverage);


                  }
                  // pop_children: {min: 0, max: 16, weight: 0}
                  // pop_elderly: {min: 70, max: 90, weight: 0}
                  // pop_total: {min: 0, max: 90, weight: 1}

                  // sensors: Array(13)
                  // 0:
                  // oa11cd: "E00042646"
                  // x: 425597.7300000005
                  // y: 565059.9069999997

                  // oa_coverage: Array(952)
                  //   [0 … 99]
                  // 0:
                  // coverage: 0.0000034260432153301947
                  // oa11cd: "E00139797"
                } else {
                  // todo job has failed?
                }
              }
            }
          }

        }, error => {
          console.log('component picked up error from observer: ' + error);
          // todo currently snackbar won't close so come up with better solution
          // this.zone.run(() => {
          //   this.snackBar.open("Oh no! We've encountered an error from the server. Please try again.", 'x', {
          //     duration: 500,
          //     horizontalPosition: 'center',
          //     verticalPosition: 'top'
          //   });
          // });
          this.resetJob();
        }
      );


  }

  resetJob() {
    this.jobInProgress = false;
    this.jobProgressPercent = 0;
    this.jobID = null;
    this.websocketSubscription.unsubscribe();
    this.map.removeLayer(this.optimisationSensors);
    this.optimisationSensors = null;
    this.viewingSensorPlacement = false;
    this.setQueryDefaults();
  }

  // budget and number of sensors are dependent on each other
  changeInBudget() {
    // minimum budget
    // todo notify user
    if (this.budget < (this.sensorCost * this.minSensorsAllowed)) {
      this.budget = this.sensorCost * this.minSensorsAllowed;
    }
    this.nSensors = Math.floor(this.budget / this.sensorCost);
  }

  changeInSensorNumber() {
    // minimum number of sensors
    // todo notify user
    if (this.nSensors < this.minSensorsAllowed) {
      this.nSensors = this.minSensorsAllowed;
    }

    this.nSensors = Math.floor(this.nSensors);
    this.budget = this.sensorCost * this.nSensors;
  }

  changeInTheta() {
    // todo notify user
    if (this.theta < this.thetaMinAllowed) {
      this.theta = this.thetaMinAllowed;
    }
  }

cancelOptimisationRun() {
    console.log('cancel job');
    this.resetJob();
    this.webSocket.deleteJob(this.jobID);


}
  legendTo2DecimalPlaces(legend) {
    legend.forEach((item) => {
      try {
        const numbers = item.title.split(' - ');
        const firstNumStr = numbers[0];
        const secondNumStr = numbers[1];
        const firstNum = parseFloat(firstNumStr);
        const secondNum = parseFloat(secondNumStr);

        if (Number.isNaN(firstNum) || Number.isNaN(secondNum)) {
          console.log('Got NaN for ' + item.title);
        }

        item.title  = firstNum.toFixed(2) + '-' + secondNum.toFixed(2);
      } catch {
        console.log('problem converting legend entry to 2 decimal places ' + item.title);
      }
    });
    return legend;
  }
  clearSensorPlacementResults() {
    // todo clear markers

    this.viewingSensorPlacement = false;
  }

  async plotOptimisationSensors(sensors, oaCoverage) {
    // get data for all output areas
    const oas = {};

    for (const sensor of sensors) {
      const oa = sensor.oa11cd;
      const data = await this.databaseService.getData('oa=' + oa);
      oas[oa] = data;
    }

    // create marker cluster group for close icons
    this.optimisationSensors = L.markerClusterGroup({
      iconCreateFunction(cluster) {
        return L.divIcon({
          className: 'sensorCluster',
          html: '<b><sub>' + cluster.getChildCount() + '</sub></b>'
        });
      },
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      maxClusterRadius: 60
    });

    this.viewingSensorPlacement = true;
    const sensorPositions = [];
    for (const sensor of sensors) {
      const x = sensor.x;
      const y = sensor.y;
      const oa = sensor.oa11cd;
      const data = oas[oa];

// todo summarise OA age data

      const disabledPerRounded = parseFloat(data.lsoaData.d_limited_).toFixed(2);

      const popupContent = 'Output Area <br> ' +
        'Population: ' + data.oaData.population +
        ', Workers: ' + data.oaData.workers + '<br><br>' +

        'LSOA<br>' +
        'Population: ' + data.lsoaData.allpersons +
        ', % Disabled: ' + disabledPerRounded +
        ', IMD decile: ' + data.lsoaData.imd_decile;
      const latlng = this.convertFromBNGProjection(x, y);
      const position = L.latLng([latlng[0], latlng[1]]);
      sensorPositions.push(position);

      // plot markers
      // const draggableMarker = L.marker(position, {icon: this.markerIcon, draggable: true});
      // draggableMarker.addTo(this.map);
      const marker = L.marker(position, {icon: this.sensorMarker});
      marker.bindPopup(popupContent);
      // marker.addTo(this.map);

      this.optimisationSensors.addLayer(marker);
    }

    this.map.addLayer(this.optimisationSensors);

    this.createOptimisationOACoverageLayer(oaCoverage);
    this.jobInProgress = false;
    this.jobProgressPercent = 0;

  }

createOptimisationOACoverageLayer(coverageList) {
    // get basic oa layer
    if (this.localAuthority === 'ncl') {
      this.optimisationOutputCoverageLayer = this.oaNcl;
    } else {
      this.optimisationOutputCoverageLayer = this.oaGates;
    }

    // set style to colour each feature depending on the coverage
    this.optimisationOutputCoverageLayer.eachLayer(async (featureInstanceLayer) => {
      const code = featureInstanceLayer.feature.properties.code;
      // get coverage
      let coverage;
      let foundCoverage = false;
      coverageList.forEach((c) => {
        if (foundCoverage === false) {
          if (c.oa11cd === code) {
            coverage = c.coverage;
            foundCoverage = true;
          }
        }
      });

      // get colour
      const colour = await this.getOACoverageColour(coverage);

      featureInstanceLayer.setStyle({
        fill: true,
        fillColor: colour,
        fillOpacity: 0.8,
        stroke: false
      });
    });

    console.log('optimisation coverage layer created: ');
    console.log(this.optimisationOutputCoverageLayer);
    this.optimisationOutputCoverageLayer.addTo(this.map);
}

getOACoverageColour(coverage) {
  if (coverage >= 0.8) {
    return '#43765E';
  } else if (coverage >= 0.6) {
    return '#8AC48A';
  } else if (coverage >= 0.4) {
    return '#D8F0B6';
  } else if (coverage >= 0.2) {
    return '#F3FAC4';
  } else {
    return '#FFFFEB';
  }

}


  // ----- Other functions

  convertFromBNGProjection(x, y) {
    // proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

    const conv = proj4('EPSG:27700', 'EPSG:4326').forward([x, y]).reverse();
    return [conv[0], conv[1]];
  }

  selectLA(la) {
    // if changing to gates, bring over any selected newcastle layers
    if (la === 'gates') {
      // todo keep adding layers here
      // IMD
      if (this.map.hasLayer(this.IMDDataNcl)) {
        this.map.removeLayer(this.IMDDataNcl);
        this.map.addLayer(this.IMDDataGates);
      }
      if (this.map.hasLayer(this.IMDDataNcl)) {
        this.map.removeLayer(this.IMDDataNcl);
        this.map.addLayer(this.IMDDataGates);
      }

      // Disability
      if (this.map.hasLayer(this.disabilityDataNcl)) {
        this.map.removeLayer(this.disabilityDataNcl);
        this.map.addLayer(this.disabilityDataGates);
      }
      if (this.map.hasLayer(this.disabilityDataNcl)) {
        this.map.removeLayer(this.disabilityDataNcl);
        this.map.addLayer(this.disabilityDataGates);
      }

      // to movement
      if (this.map.hasLayer(this.toSSDataNcl)) {
        this.map.removeLayer(this.toSSDataNcl);
        this.map.addLayer(this.toSSDataGates);
      }
      if (this.map.hasLayer(this.toSSDataNcl)) {
        this.map.removeLayer(this.toSSDataNcl);
        this.map.addLayer(this.toSSDataGates);
      }

      // through movement
      if (this.map.hasLayer(this.throughSSDataNcl)) {
        this.map.removeLayer(this.throughSSDataNcl);
        this.map.addLayer(this.throughSSDataGates);
      }
      if (this.map.hasLayer(this.throughSSDataNcl)) {
        this.map.removeLayer(this.throughSSDataNcl);
        this.map.addLayer(this.throughSSDataGates);
      }

      // UO sensors
      if (this.map.hasLayer(this.uoDataNcl)) {
        this.map.removeLayer(this.uoDataNcl);
        this.map.addLayer(this.uoDataGates);
      }
      if (this.map.hasLayer(this.uoDataNcl)) {
        this.map.removeLayer(this.uoDataNcl);
        this.map.addLayer(this.uoDataGates);
      }

      // output areas
      if (this.map.hasLayer(this.oaNcl)) {
        this.map.removeLayer(this.oaNcl);
        this.map.addLayer(this.oaGates);
      }
      if (this.map.hasLayer(this.oaNcl)) {
        this.map.removeLayer(this.oaNcl);
        this.map.addLayer(this.oaGates);
      }
      // Age group 1
      if (this.map.hasLayer(this.ageData1Ncl)) {
        this.map.removeLayer(this.ageData1Ncl);
        this.map.addLayer(this.ageData1Gates);
      }
      if (this.map.hasLayer(this.ageData1Ncl)) {
        this.map.removeLayer(this.ageData1Ncl);
        this.map.addLayer(this.ageData1Gates);
      }

      // Age group 2
      if (this.map.hasLayer(this.ageData2Ncl)) {
        this.map.removeLayer(this.ageData2Ncl);
        this.map.addLayer(this.ageData2Gates);
      }
      if (this.map.hasLayer(this.ageData2Ncl)) {
        this.map.removeLayer(this.ageData2Ncl);
        this.map.addLayer(this.ageData2Gates);
      }
      // Age group 3
      if (this.map.hasLayer(this.ageData3Ncl)) {
        this.map.removeLayer(this.ageData3Ncl);
        this.map.addLayer(this.ageData3Gates);
      }
      if (this.map.hasLayer(this.ageData3Ncl)) {
        this.map.removeLayer(this.ageData3Ncl);
        this.map.addLayer(this.ageData3Gates);
      }


      // Primarys currently Newcastle only
      // todo add Gateshead
      if (this.map.hasLayer(this.primarysDataNcl)) {
        this.clearPrimarysLayers();
      }
    }

    // if changing to newcastle, bring over any selected gateshead layers
    else if (la === 'ncl') {
      // todo keep adding layers here

      // IMD
      if (this.map.hasLayer(this.IMDDataGates)) {
        this.map.removeLayer(this.IMDDataGates);
        this.map.addLayer(this.IMDDataNcl);
      }
      if (this.map.hasLayer(this.IMDDataGates)) {
        this.map.removeLayer(this.IMDDataGates);
        this.map.addLayer(this.IMDDataNcl);
      }

      // Disability
      if (this.map.hasLayer(this.disabilityDataGates)) {
        this.map.removeLayer(this.disabilityDataGates);
        this.map.addLayer(this.disabilityDataNcl);
      }
      if (this.map.hasLayer(this.disabilityDataGates)) {
        this.map.removeLayer(this.disabilityDataGates);
        this.map.addLayer(this.disabilityDataNcl);
      }

      // to movement
      if (this.map.hasLayer(this.toSSDataGates)) {
        this.map.removeLayer(this.toSSDataGates);
        this.map.addLayer(this.toSSDataNcl);
      }
      if (this.map.hasLayer(this.toSSDataGates)) {
        this.map.removeLayer(this.toSSDataGates);
        this.map.addLayer(this.toSSDataNcl);
      }

      // through movement
      if (this.map.hasLayer(this.throughSSDataGates)) {
        this.map.removeLayer(this.throughSSDataGates);
        this.map.addLayer(this.throughSSDataNcl);
      }
      if (this.map.hasLayer(this.throughSSDataGates)) {
        this.map.removeLayer(this.throughSSDataGates);
        this.map.addLayer(this.throughSSDataNcl);
      }

      // UO sensors
      if (this.map.hasLayer(this.uoDataGates)) {
        this.map.removeLayer(this.uoDataGates);
        this.map.addLayer(this.uoDataNcl);
      }
      if (this.map.hasLayer(this.uoDataGates)) {
        this.map.removeLayer(this.uoDataGates);
        this.map.addLayer(this.uoDataNcl);
      }

      // Age group 1
      if (this.map.hasLayer(this.ageData1Gates)) {
        this.map.removeLayer(this.ageData1Gates);
        this.map.addLayer(this.ageData1Ncl);
      }
      if (this.map.hasLayer(this.ageData1Gates)) {
        this.map.removeLayer(this.ageData1Gates);
        this.map.addLayer(this.ageData1Ncl);
      }

      // Age group 2
      if (this.map.hasLayer(this.ageData2Gates)) {
        this.map.removeLayer(this.ageData2Gates);
        this.map.addLayer(this.ageData2Ncl);
      }
      if (this.map.hasLayer(this.ageData2Gates)) {
        this.map.removeLayer(this.ageData2Gates);
        this.map.addLayer(this.ageData2Ncl);
      }
      // Age group 3
      if (this.map.hasLayer(this.ageData3Gates)) {
        this.map.removeLayer(this.ageData3Gates);
        this.map.addLayer(this.ageData3Ncl);
      }
      if (this.map.hasLayer(this.ageData3Gates)) {
        this.map.removeLayer(this.ageData3Gates);
        this.map.addLayer(this.ageData3Ncl);
      }


      // output areas
      if (this.map.hasLayer(this.oaGates)) {
        this.map.removeLayer(this.oaGates);
        this.map.addLayer(this.oaNcl);
      }
      if (this.map.hasLayer(this.oaGates)) {
        this.map.removeLayer(this.oaGates);
        this.map.addLayer(this.oaNcl);
      }

      // todo add gateshead
    }
    this.localAuthority = la;

    // move to centre
    this.map.panTo(this.getLACentre(this.localAuthority));
  }

  addPercentageToLabel(value) {
    return value + '%';
  }

  openSnackBar(message, action) {
    this.snackBar.open(message, action, {
      duration: 500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
