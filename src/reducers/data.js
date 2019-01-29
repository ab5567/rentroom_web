import { handleActions } from 'redux-actions';
import immutable from 'immutability-helper';

import { ActionTypes } from 'constants/index';

export const dataState = {
  residents: {},
  status: STATUS.IDLE,
};

export default {
  data: handleActions(
    {
      [ActionTypes.FETCH_RESIDENTS]: state =>
        immutable(state, {
          status: { $set: STATUS.RUNNING },
        }),
      [ActionTypes.FETCH_RESIDENTS_SUCCESS]: (state, action) => 
          immutable(state, {
            status: { $set: STATUS.IDLE },
            residents: { $set: action.payload.residents },
          }),
    },
    dataState,
  ),
};
