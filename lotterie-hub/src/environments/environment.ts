// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  contractAddress: '0xAB6967bA23b49F19B5ED694b2aCaEA9283C81A98',
  authorDapp: '0x8d52c034ac92c8ea552a68044ce73c7a8058c8ad',
  nbParamsShow: 10,
  nbThrowsShow: 10,
  nbParticipationsShow: 5,
  defaultOwnerMargin: 0,
  defaultAuthorContractMargin: 0,
  defaultAuthorDappMargin: 0,
  defaultThrowerMargin: 0,
  delayBlockDate: 30, // second delay to check date (calcPhase mainly) to ensure a block was emitted
  dbName: 'lotterie-hub',
  unsafe: false,
};
  // 
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
