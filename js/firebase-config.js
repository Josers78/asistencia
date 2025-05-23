
// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdo5xEjC21rxomaQcvm_zLW4OJ8K_DV90",
    authDomain: "confirmacionboda-76eeb.firebaseapp.com",
    projectId: "confirmacionboda-76eeb",
    storageBucket: "confirmacionboda-76eeb.appspot.com",
    messagingSenderId: "723564430690",
    appId: "1:723564430690:web:794ee68f57b467ce7dd83b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
