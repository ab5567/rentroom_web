/**
 * @module Sagas/User
 * @desc User
 */

import { delay } from 'redux-saga';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import { ActionTypes } from 'constants/index';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, firebaseDatabase } from 'config/firebase';
import Config from 'config/app';
/**
 * Fetch User
 */

export function* fetchResidents() {
  try {
    const firebasePath = 'property_groups/amicus_properties/users';
    const ref = firebaseDatabase.ref(firebasePath);
    // ref.once('value').then((snapshot) => {
    //   console.log("Received compleete array with length of " + snapshot.val().length);
    //   this.processRecords(snapshot.val())
    // });

    console.log('Fetching Residents...');
    const snapshot = yield call(ref.once, 'value');
    console.log('Firebase Residents', snapshot.val());


  } catch (err) {
    yield put({
      type: ActionTypes.USER_LOGIN_FAILURE,
      payload: err,
    });
  }
}



/**
 * User Sagas
 */
export default function* root() {
  yield all([
    takeLatest(ActionTypes.FETCH_RESIDENTS, fetchResidents),
  ]);
}
