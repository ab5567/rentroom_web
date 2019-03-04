// @flow
/**
 * @module Actions/Data
 * @desc Data Actions
 */
import { createActions } from 'redux-actions';

import { ActionTypes } from 'constants/index';

export const {   
  fetchResidentsSuccess,  
  fetchAddressesSuccess,  
  fetchPropertiesSuccess,  
  fetchMaintenancesSuccess,   
} = createActions({
  [ActionTypes.FETCH_RESIDENTS_SUCCESS]: (residents) => (residents),
  [ActionTypes.FETCH_ADDRESSES_SUCCESS]: (addresses) => (addresses),
  [ActionTypes.FETCH_PROPERTIES_SUCCESS]: (properties) => (properties),
  [ActionTypes.FETCH_MAINTENANCES_SUCCESS]: (maintenances) => (maintenances)
});
