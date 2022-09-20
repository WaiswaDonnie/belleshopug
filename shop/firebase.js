// Import the functions you need from the SDKs you need

import { initializeApp, getApps, getApp } from "firebase/app";
import {getFunctions} from 'firebase/functions'

import { getAnalytics } from "firebase/analytics";
import { getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import { getStorage, ref } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyBvtFL3UVCqr40Fu4IsqxUBdHycLYX3auc",

  authDomain: "testbellebeauty.firebaseapp.com",

  projectId: "testbellebeauty",

  storageBucket: "testbellebeauty.appspot.com",

  messagingSenderId: "265082980376",
  appId: "1:265082980376:web:eeec08cd543a5269119b6d",
  measurementId: "G-KP9Y4XB5CE"

};


// Initialize Firebase

const app = !getApps().length ? initializeApp(firebaseConfig):getApp();
const db = getFirestore(app)
const auth =  getAuth(app)
const firebaseFunctions = getFunctions(app)


export {app,db,auth,firebaseFunctions}
 