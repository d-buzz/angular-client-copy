// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ENV } from './config/env';

export const environment = {
  production: false,
  APP_DEMO: ENV.STEEM_DEMO_ENABLE,
  APP_HOST: ENV.APP_HOST,
  API_HOST: ENV.STEEMSAYS_API_HOST,
  CHAR_LIMIT: ENV.CHAR_LIMIT,
  PRIMARY_TAG: ENV.PRIMARY_TAG,
  STEEMIT_IMAGE_URL: ENV.STEEMIT_IMAGES_URL,
  TREND_TAGS_LIMIT: ENV.TREND_TAGS_LIMIT,
  TO_FOLLOW_LIMIT: ENV.TO_FOLLOW_LIMIT,
  POPOVER_FOLLOWER_LIMIT: ENV.POPOVER_FOLLOWER_LIMIT,
  STEEM_DEMO_PASS: ENV.STEEM_DEMO_PASS,
  SOCKET_URL: ENV.SOCKET_URL,
  TWITTER_VERIFICATON_ENABLE: ENV.TWITTER_VERIFICATON_ENABLE,
  HIVE_KEYCHAIN_ENABLE: ENV.HIVE_KEYCHAIN_ENABLE,
  IMAGE_UPLOAD_LIMIT: ENV.IMAGE_UPLOAD_LIMIT,
  SHOW_NOTICE: ENV.SHOW_NOTICE
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
