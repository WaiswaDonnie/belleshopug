// Import the functions you need from the SDKs you need

import { initializeApp, getApps, getApp } from "firebase/app";
import {getFunctions} from 'firebase/functions'

import { getAnalytics } from "firebase/analytics";
import { getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import { getStorage, ref } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBUNFKSV8cYCotzy3eRXR0LP3q4vKBhBLA",

  authDomain: "belle-beauty-ug.firebaseapp.com",

  projectId: "belle-beauty-ug",

  storageBucket: "belle-beauty-ug.appspot.com",

  messagingSenderId: "940156956842",

  appId: "1:940156956842:web:8f6f6ed3b5b38a1af4e0d3",

  measurementId: "G-MJS80003GT"


};
const app = !getApps().length ? initializeApp(firebaseConfig):getApp();
const db = getFirestore(app)
const auth =  getAuth(app)
const storage = getStorage(app)
const firebaseFunctions = getFunctions(app)
export {app,db,auth,storage,firebaseFunctions}
 