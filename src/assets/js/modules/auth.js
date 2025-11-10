// Authentication Module
import { 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, providerGoogle, db } from '../config/firebase.js';
import { 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Initialize namespace
if (!window.TreeApp) {
    window.TreeApp = {};
}

// Current user state
let currentUser = null;

// Save user profile to Firestore
async function saveUserProfile(user, displayName) {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email.split('@')[0], 
        contacts: [], 
        createdAt: new Date(),
        isOnline: true,
        lastSeen: new Date()
    }, { merge: true });
}

// Register with email and password
async function registerWithEmail(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    await saveUserProfile(user, name);
    
    return user;
}

// Login with email and password
async function loginWithEmail(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

// Login with Google
async function loginWithGoogle() {
    const result = await signInWithPopup(auth, providerGoogle);
    await saveUserProfile(result.user, result.user.displayName);
    return result;
}

// Logout
async function logout() {
    return await signOut(auth);
}

// Password Reset
async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'Email de recuperação enviado! Verifique sua caixa de entrada.' };
    } catch (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        let errorMessage = 'Erro ao enviar email de recuperação.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Email não encontrado.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
        }
        
        return { success: false, message: errorMessage };
    }
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Auth state listener
function initAuthStateListener(callback) {
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (callback) {
            callback(user);
        }
    });
}

// Export to namespace
window.TreeApp.auth = {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    getCurrentUser,
    isAuthenticated,
    initAuthStateListener,
    saveUserProfile
};

export {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    getCurrentUser,
    isAuthenticated,
    initAuthStateListener,
    saveUserProfile,
    currentUser
};
