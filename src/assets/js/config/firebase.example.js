// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// INSTRUÇÕES:
// 1. Renomeie este arquivo para "firebase.js"
// 2. Substitua os valores abaixo com suas credenciais do Firebase Console
// 3. Nunca faça commit do arquivo "firebase.js" no Git

const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const providerGoogle = new GoogleAuthProvider();

// Initialize global namespace
if (!window.TreeApp) {
    window.TreeApp = {};
}

// Export Firebase instances to namespace
window.TreeApp.firebase = {
    app,
    auth,
    db,
    providerGoogle
};

export { auth, db, providerGoogle };
