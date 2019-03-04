import { handleActions } from 'redux-actions';
import immutable from 'immutability-helper';

import { ActionTypes } from 'constants/index';

export const dataState = {
  isResidentsLoaded: false,
  residents: [],
  isAddressesLoaded: false,
  addresses: {},
  isPropertiesLoaded: false,
  properties: [],
  isMaintenanceLoaded: false,
  maintenances: [],
};

export default {
  data: handleActions(
    {
      [ActionTypes.FETCH_RESIDENTS_SUCCESS]: (state, action) => 
          immutable(state, {
            residents: { $set: action.payload },
            isResidentsLoaded: { $set: true },
          }),
      [ActionTypes.FETCH_ADDRESSES_SUCCESS]: (state, action) => 
          immutable(state, {
            addresses: { $set: action.payload },
            isAddressesLoaded: { $set: true },
          }),
      [ActionTypes.FETCH_PROPERTIES_SUCCESS]: (state, action) => 
          immutable(state, {
            properties: { $set: action.payload },
            isPropertiesLoaded: { $set: true },
          }),
      [ActionTypes.FETCH_MAINTENANCES_SUCCESS]: (state, action) => 
          immutable(state, {
            maintenances: { $set: action.payload },
            isMaintenanceLoaded: { $set: true },
          }),
    },
    dataState,
  ),
};
