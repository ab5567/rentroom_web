/**
 * @module Sagas/User
 * @desc User
 */

import { delay } from 'redux-saga';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import { ActionTypes } from 'constants/index';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'config/firebase';
import Config from 'config/app';
/**
 * Fetch User
 */

export function* fetchUser() {
  try {
    console.log('Fetching user...');
    const user = yield call(onAuthStateChanged);
    console.log('Firebase User', user);

    if (user) {
      const payload = {
        email: user.email,
        uid: user.uid
      }
      if (Config.adminConfig.allowedUsers && Config.adminConfig.allowedUsers.indexOf(user.email) == -1) {
        //Error, this user is not allowed anyway
        alert("The user " + user.email + " doens't have access to this admin panel!");
        // TODO: Fireabse logout
        yield put({ type: ActionTypes.USER_LOGOUT });
      } else {
        //Do we have our pushSettings remoutly configurable
        if (Config.pushSettings.remoteSetup) {
          yield put({ 
            type: ActionTypes.USER_LOGIN_SUCCESS,
            payload
          });
        // console.log("does this work 3");
        // var fetcherPushConfigFirebaseApp = FirebaseSDK.initializeApp(Config.firebaseConfig, "pushFetcher");
        // fetcherPushConfigFirebaseApp.database().ref(Config.pushSettings.remotePath).once('value').then(function(snapshot) {
        //     Config.pushSettings=snapshot.val();
        //     yield put({ type: ActionTypes.USER_LOGIN_SUCCESS });
        // });
        } else {
          yield put({ 
            type: ActionTypes.USER_LOGIN_SUCCESS,
            payload
          });
        }
      }
    } else {
      yield put({ type: ActionTypes.USER_LOGOUT_SUCCESS });
    }
  } catch (err) {
    yield put({
      type: ActionTypes.USER_LOGIN_FAILURE,
      payload: err.message,
    });
  }
}

/**
 * Login
 */
export function* login(loginAction) {
  try {
    console.log('Logging in....', loginAction);
    const { email, password } = loginAction.payload;
    // const res = yield call(signInWithEmailAndPassword, 'austin@austin.com', 'austin');
    const res = yield call(signInWithEmailAndPassword, email, password);

    console.log('Login Result', res);

    const payload = {
      email: res.user.email,
      uid: res.user.uid
    }
    yield put({
      type: ActionTypes.USER_LOGIN_SUCCESS,
      payload
    });
  } catch (err) {
    /* istanbul ignore next */
    console.log(err);
    yield put({
      type: ActionTypes.USER_LOGIN_FAILURE,
      payload: err.message,
    });
  }
}

/**
 * Logout
 */
export function* logout() {
  try {
    yield call(signOut);
    yield put({
      type: ActionTypes.USER_LOGOUT_SUCCESS,
    });
  } catch (err) {
    /* istanbul ignore next */
    yield put({
      type: ActionTypes.USER_LOGOUT_FAILURE,
      payload: err,
    });
  }
}

/**
 * User Sagas
 */
export default function* root() {
  yield all([
    takeLatest(ActionTypes.FETCH_USER, fetchUser),
    takeLatest(ActionTypes.USER_LOGIN, login),
    takeLatest(ActionTypes.USER_LOGOUT, logout),
  ]);
}
