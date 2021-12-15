import {ErrorHandler, Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import * as Sentry from "@sentry/browser";
import {environment} from '../environments/environment';



function getEnvironment() {

}


@Injectable({
  providedIn: 'root'
})

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler{

  constructor() { }

  handleError(error: any) {
    if (environment.production) {

      Sentry.init({
        dsn: "https://b2a81dbd8e814f5fa75ec88dfebc9182@o1080315.ingest.sentry.io/6102346",
        // @ts-ignore
        environment: getEnvironment()
      });
    }

    console.log(error.status);
    // todo notify user and collect feedback?
   // const eventId = Sentry.captureException(error.originalError || error);
    //Sentry.showReportDialog({ eventId });
  }
}
