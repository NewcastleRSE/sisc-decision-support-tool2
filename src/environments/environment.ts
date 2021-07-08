// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  GEOSERVERWMS: 'https://sisc-geoserver.azurewebsites.net/geoserver/siss/wms?',
  GEOSERVERWFS: 'https://sisc-geoserver.azurewebsites.net/geoserver/siss/wfs?',
  websocket_url: 'https://optimisation-backend.azurewebsites.net',
  serverless_function_url: 'https://siscfunctionapp.azurewebsites.net/api/oaData?code=2UMNS3JZwdcsR3ALCPa3x3xm6duHLFuKyK2Owarq1M0Cc/LLljNyQg=='
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
