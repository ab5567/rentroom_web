import { handleActions } from 'redux-actions';
import immutable from 'immutability-helper';

import { STATUS, ActionTypes } from 'constants/index';

export const userState = {
  isAuthenticated: false,
  status: STATUS.IDLE,
  uid: null,
  email: null,
  property_groups: null,
  role: null,
  loginErrorMsg: null,
  admins: []
};

export default {
  user: handleActions(
    {
      [ActionTypes.USER_LOGIN]: state =>
        immutable(state, {
          status: { $set: STATUS.RUNNING },
        }),
      [ActionTypes.USER_LOGIN_SUCCESS]: (state, action) => {
        return (
          {
            ...state,
            status: STATUS.READY,
            loginErrorMsg: null,
            isAuthenticated: true,
            ...action.payload,
          }
        )
      },
      [ActionTypes.USER_LOGIN_FAILURE]: (state, action) => 
          immutable(state, {
            loginErrorMsg: { $set: action.payload }
          }),
      [ActionTypes.USER_LOGOUT]: state =>
        immutable(state, {
          status: { $set: STATUS.RUNNING },
        }),
      [ActionTypes.USER_LOGOUT_SUCCESS]: state =>
        immutable(state, {
          isAuthenticated: { $set: false },
          status: { $set: STATUS.IDLE },
          uid: { $set: null },
          email: { $set: null }
        }),
      [ActionTypes.FETCH_USER]: state =>
        immutable(state, {
          status: { $set: STATUS.RUNNING },
        }),
    },
    userState,
  ),
};
