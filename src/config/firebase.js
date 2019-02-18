import * as FirebaseSDK from "firebase";
import Config from "./app";


//Remove data fethced

if (Config.remoteSetup) {
  //Do a remote setuo of the admin
  var connectionPath = Config.remotePath;
  if (Config.allowSubDomainControl){
    //Control by subdomain
    connectionPath = Config.subDomainControlHolder + window.THE_DOMAIN;
  }
  console.log("does this work 1");
  const fetcherFirebaseApp = FirebaseSDK.initializeApp(Config.firebaseConfig, "fetcher");
  fetcherFirebaseApp.database().ref(connectionPath).once('value').then(function(snapshot) {
    console.log(snapshot.val())
    Config.firebaseConfig = snapshot.val().firebaseConfig;
    Config.adminConfig = snapshot.val().adminConfig;
    Config.navigation = snapshot.val().navigation;
    Config.pushSettings = snapshot.val().pushSettings;
    console.log("does this work 4");
    FirebaseSDK.initializeApp(Config.firebaseConfig);
  });
} else {
  // Legacy, local setup
  console.log("InitializeApp");
  FirebaseSDK.initializeApp(Config.firebaseConfig);
}

export const firebaseDatabase = FirebaseSDK.database();
export const authRef = FirebaseSDK.auth();
export const firebaseStorage = FirebaseSDK.storage();

// Promise for Redux-saga
export function onAuthStateChanged() {
  return new Promise((resolve, reject) => {
    FirebaseSDK.auth().onAuthStateChanged((user) => {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
}

export function signInWithEmailAndPassword(email, password) {
  return new Promise((resolve, reject) => {
    FirebaseSDK.auth().signInWithEmailAndPassword(email, password)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function signOut() {
  return new Promise((resolve, reject) => {
    FirebaseSDK.auth().signOut()
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
}

