// ============================================
// BOMBASZ.HU - Firebase Authentication System
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================================
// ADMIN BEÁLLÍTÁSOK - IDE ÍRD BE AZ ADMIN EMAILEKET!
// ============================================
const ADMIN_EMAILS = [
    "bartaadikonyv@gmail.com",
    "balazs.hajdu00@gmail.com",
    "adam070702@gmail.com",

];

// ============================================
// Firebase konfiguráció (konyv-93c63 projekt)
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyAwRrAtHaNRh2DLwVkryA3wSf86h7aQCaI",
    authDomain: "konyv-93c63.firebaseapp.com",
    projectId: "konyv-93c63",
    storageBucket: "konyv-93c63.firebasestorage.app",
    messagingSenderId: "308577632498",
    appId: "1:308577632498:web:yourappid"
};

// Firebase inicializálás
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// Session persistence beállítása (megjegyzi a böngészőben)
// ============================================
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Persistence hiba:", error);
});

// ============================================
// Globális változók exportálása
// ============================================
window.firebaseAuth = auth;
window.firebaseDb = db;
window.ADMIN_EMAILS = ADMIN_EMAILS;

// ============================================
// Admin ellenőrzés
// ============================================
function isAdmin(email) {
    return ADMIN_EMAILS.includes(email?.toLowerCase());
}

window.isAdmin = isAdmin;

// ============================================
// DevTools védelem (csak nem-adminoknak)
// ============================================
function setupDevToolsProtection(userEmail) {
    // Ha admin, ne védjük
    if (isAdmin(userEmail)) {
        console.log("🔓 Admin mód - DevTools engedélyezve");
        return;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, F12 letiltása
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (Forráskód)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
    });

    // Jobb klikk letiltása
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    console.log("🔒 DevTools védelem aktív");
}

// ============================================
// Oldal elrejtése amíg auth check fut
// ============================================
function hidePageContent() {
    // Loading overlay hozzáadása
    if (!document.getElementById('auth-loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'auth-loading-overlay';
        overlay.innerHTML = `
            <style>
                #auth-loading-overlay {
                    position: fixed;
                    inset: 0;
                    background: #000;
                    z-index: 999999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    font-family: 'Orbitron', 'Poppins', sans-serif;
                    color: #fff;
                }
                #auth-loading-overlay .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.2);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: auth-spin 0.8s linear infinite;
                    margin-bottom: 16px;
                }
                @keyframes auth-spin {
                    to { transform: rotate(360deg); }
                }
            </style>
            <div class="spinner"></div>
            <div>Betöltés...</div>
        `;
        document.body.insertBefore(overlay, document.body.firstChild);
    }
}

function showPageContent() {
    const overlay = document.getElementById('auth-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ============================================
// Bejelentkezés ellenőrzés és átirányítás
// ============================================
function checkAuthAndProtect() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Ezek az oldalak NEM igényelnek bejelentkezést
    const publicPages = ['login.html', 'hamarosan.html'];
    
    // Ha publikus oldal, ne csinálj semmit
    if (publicPages.includes(currentPage)) {
        return;
    }

    // Elrejtjük az oldalt amíg nem tudjuk, be van-e jelentkezve
    hidePageContent();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Bejelentkezett felhasználó
            console.log("✅ Bejelentkezve:", user.email);
            
            // Megmutatjuk az oldalt
            showPageContent();
            
            // DevTools védelem beállítása
            setupDevToolsProtection(user.email);
            
            // Felhasználói adatok mentése/frissítése Firestore-ban
            try {
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    email: user.email,
                    lastLogin: new Date().toISOString(),
                    isAdmin: isAdmin(user.email)
                }, { merge: true });
            } catch (error) {
                console.error("Firestore hiba:", error);
            }
            
            // User UI megjelenítése (ha létezik a függvény)
            if (typeof window.showUserUI === 'function') {
                window.showUserUI(user.email, isAdmin(user.email));
            }
            
        } else {
            // Nincs bejelentkezve -> átirányítás login oldalra
            console.log("❌ Nincs bejelentkezve, átirányítás...");
            // Elmentjük hova akart menni, hogy visszairányíthassuk
            sessionStorage.setItem('returnUrl', window.location.href);
            window.location.href = 'login.html';
        }
    });
}

// ============================================
// Kijelentkezés
// ============================================
window.logoutUser = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Kijelentkezési hiba:", error);
        alert("Hiba történt a kijelentkezéskor!");
    }
};

// ============================================
// Automatikus futtatás oldal betöltésekor
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndProtect();
});

// Azonnali futtatás is (ha a DOM már kész)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    checkAuthAndProtect();
}

console.log("🔥 BOMBASZ Auth System betöltve");
