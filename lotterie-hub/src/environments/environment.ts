// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  contractAddress: '0x24d86a7821cfd0654e6c9df131ffe8ab532a114e',
  nbParamsShow: 10,
  nbThrowsShow: 10,
  nbParticipationsShow: 10,
  defaultOwnerMargin: 0,
  defaultAuthorContractMargin: 0,
  defaultAuthorDappMargin: 0,
  defaultThrowerMargin: 0,
  dbName: 'lotterie-hub',
};
  // 
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.