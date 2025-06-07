// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpO5zlg6MAlMOUDGxclxaNwHnv7uO7pLM",
  authDomain: "ptjobchatapp.firebaseapp.com",
  projectId: "ptjobchatapp",
  storageBucket: "ptjobchatapp.appspot.com",
  messagingSenderId: "258542483502",
  appId: "1:258542483502:web:721c3e86b20d3690ce47bf",
  measurementId: "G-HVHNBWYSE1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



export { db };
