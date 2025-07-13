
import firebase from 'firebase/app';
import 'firebase/firestore';

// This file assumes firebase is loaded from the CDN in index.html
declare global {
    interface Window {
        firebase: typeof firebase;
    }
}

const firebaseConfig = {
      apiKey: "AIzaSyD7fUsuAkJS7vuFtJT3CRBSrv0nyfqH2Z8",
      authDomain: "invioce-675b3.firebaseapp.com",
      projectId: "invioce-675b3",
      storageBucket: "invioce-675b3.firebasestorage.app",
      messagingSenderId: "876939540074",
      appId: "1:876939540074:web:83117ecb36b335b58ffc13",
      measurementId: "G-BFLQTCNK1C"
};

if (!window.firebase.apps.length) {
  window.firebase.initializeApp(firebaseConfig);
}

export const db = window.firebase.firestore();
