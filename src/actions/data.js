// @flow
/**
 * @module Actions/Data
 * @desc Data Actions
 */
import { createActions } from 'redux-actions';

import { ActionTypes } from 'constants/index';

export const { fetchResidents } = createActions({
  [ActionTypes.FETCH_RESIDENTS]: () => ({}),
});
