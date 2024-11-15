import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import  'firebase/compat/firestore';
import 'firebase/compat/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB17aZ5BjPk68sUsoNM1xXxF6nn4-Vrv_g",
  authDomain: "skool-2721d.firebaseapp.com",
  projectId: "skool-2721d",
  storageBucket: "skool-2721d.appspot.com",
  messagingSenderId: "548506970839",
  appId: "1:548506970839:web:921931c6dfd64c4e8e1e92",
  measurementId: "G-ZHKF1P8F0N"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

export { auth, firestore, storage };
