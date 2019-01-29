// @flow
/**
 * @module Actions/User
 * @desc User Actions
 */
import { createActions } from 'redux-actions';

import { ActionTypes } from 'constants/index';

export const { userLogin: login, userLogout: logOut, fetchUser } = createActions({
  [ActionTypes.USER_LOGIN]: () => ({}),
  [ActionTypes.USER_LOGOUT]: () => ({}),
  [ActionTypes.FETCH_USER]: () => ({}),
});
