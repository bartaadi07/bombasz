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

// ============================================
// ADMIN BEÁLLÍTÁSOK
// ============================================
const ADMIN_EMAILS = [
    "bartaadikonyv@gmail.com",
    "balazs.hajdu00@gmail.com",
    "adam070702@gmail.com",
];

// ============================================
// Firebase konfiguráció
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyAwRrAtHaNRh2DLwVkryA3wSf86h7aQCaI",
    authDomain: "konyv-93c63.firebaseapp.com",
    databaseURL: "https://konyv-93c63-default-rtdb.firebaseio.com",
    projectId: "konyv-93c63",
    storageBucket: "konyv-93c63.firebasestorage.app",
    messagingSenderId: "308577632498",
    appId: "1:308577632498:web:yourappid"
};

// Firebase inicializálás
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Session persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Persistence hiba:", error);
});

// Globális változók
window.firebaseAuth = auth;
window.ADMIN_EMAILS = ADMIN_EMAILS;

// Admin ellenőrzés
function isAdmin(email) {
    return ADMIN_EMAILS.includes(email?.toLowerCase());
}
window.isAdmin = isAdmin;

// ============================================
// DevTools védelem (csak nem-adminoknak)
// ============================================
function setupDevToolsProtection(userEmail) {
    if (isAdmin(userEmail)) {
        console.log("🔓 Admin mód - DevTools engedélyezve");
        return;
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    console.log("🔒 DevTools védelem aktív");
}

// ============================================
// Loading overlay
// ============================================
function hidePageContent() {
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
    if (overlay) overlay.remove();
}

// ============================================
// Auth védelem
// ============================================
function checkAuthAndProtect() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Publikus oldalak - NEM kell bejelentkezés
    const publicPages = ['login.html', 'index.html', 'hamarosan.html', 'konyv.html', 'vids.html', 'uncs.html', 'jatek.html', 'selenium.html'];
    
    // Admin oldal - külön kezeljük (saját auth logikája van)
    if (currentPage === 'admin.html') {
        return;
    }
    
    // Publikus oldal
    if (publicPages.includes(currentPage)) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                if (typeof window.showUserUI === 'function') {
                    window.showUserUI(user.email, isAdmin(user.email));
                }
                setupDevToolsProtection(user.email);
            } else {
                if (typeof window.showGuestUI === 'function') {
                    window.showGuestUI();
                }
            }
        });
        return;
    }

    // Védett oldal - elrejtjük amíg auth check fut
    hidePageContent();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ Bejelentkezve:", user.email);
            showPageContent();
            setupDevToolsProtection(user.email);
            
            if (typeof window.showUserUI === 'function') {
                window.showUserUI(user.email, isAdmin(user.email));
            }
        } else {
            console.log("❌ Nincs bejelentkezve, átirányítás...");
            sessionStorage.setItem('returnUrl', window.location.href);
            window.location.href = 'login.html';
        }
    });
}

// Kijelentkezés
window.logoutUser = async function() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Kijelentkezési hiba:", error);
    }
};

// Futtatás
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthAndProtect);
} else {
    checkAuthAndProtect();
}

console.log("🔥 BOMBASZ Auth System betöltve");
