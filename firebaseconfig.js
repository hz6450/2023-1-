import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB38xiZeGztv8VY748sanORRp6sSFZBCYM",
  authDomain: "mobileproject-65860.firebaseapp.com",
  projectId: "mobileproject-65860",
  storageBucket: "mobileproject-65860.appspot.com",
  messagingSenderId: "890013926621",
  appId: "1:890013926621:web:605d7d0786cd42d4024734",
  measurementId: "G-C2Q2ZLCP7Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };