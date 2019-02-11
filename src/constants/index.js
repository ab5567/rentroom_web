import keyMirror from 'fbjs/lib/keyMirror';

/**
 * @namespace Constants
 * @desc App constants
 */

/**
 * @constant {Object} ActionTypes
 * @memberof Constants
 */

const BaseURL = 'property_groups/amicus_properties';

export const ActionTypes = keyMirror({
  SWITCH_MENU: undefined,
  EXCEPTION: undefined,
  USER_LOGIN: undefined,
  USER_LOGIN_SUCCESS: undefined,
  USER_LOGIN_FAILURE: undefined,
  USER_LOGOUT: undefined,
  USER_LOGOUT_SUCCESS: undefined,
  USER_LOGOUT_FAILURE: undefined,
  SHOW_ALERT: undefined,
  HIDE_ALERT: undefined,
  FETCH_USER: undefined,
  FETCH_RESIDENTS: undefined,
  FETCH_RESIDENTS_SUCCESS: undefined,
  FETCH_RESIDENTS_FAILURE: undefined,
});

/**
 * @constant {Object} STATUS
 * @memberof Constants
 */
export const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  READY: 'ready',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const FIRE_DATA_PATHS = {
  COMMUNITY: `${BaseURL}/posts`,
  RESIDENTS: `${BaseURL}/users`,
  RESIDENT_ADDRESSES: `${BaseURL}/profile`,
}
