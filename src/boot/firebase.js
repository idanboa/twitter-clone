import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAwBMWh9XZgcLhmyxgdAunSDAK-kmLjNVE",
  authDomain: "tweeter-clone-d5d06.firebaseapp.com",
  projectId: "tweeter-clone-d5d06",
  storageBucket: "tweeter-clone-d5d06.appspot.com",
  messagingSenderId: "550899634835",
  appId: "1:550899634835:web:619f132fafc6f1841cf366"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default db