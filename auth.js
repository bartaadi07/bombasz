// ============================================
// BOMBASZ.HU - Végleges Auth & Sync
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signOut, 
    setPersistence, browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, ref, set, onDisconnect, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const ADMIN_EMAILS = ["bartaadikonyv@gmail.com", "balazs.hajdu00@gmail.com", "hajdub@kkszki.hu", "adam070702@gmail.com"];

const firebaseConfig = {
    apiKey: "AIzaSyAwRrAtHaNRh2DLwVkryA3wSf86h7aQCaI",
    authDomain: "konyv-93c63.firebaseapp.com",
    databaseURL: "https://konyv-93c63-default-rtdb.firebaseio.com",
    projectId: "konyv-93c63",
    storageBucket: "konyv-93c63.firebasestorage.app",
    messagingSenderId: "308577632498",
    appId: "1:308577632498:web:yourappid"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

setPersistence(auth, browserLocalPersistence);

// Globális kijelentkezés
window.logoutUser = async function() {
    if (auth.currentUser) {
        await set(ref(db, 'status/' + auth.currentUser.uid), null);
    }
    await signOut(auth);
    window.location.reload(); // Frissítjük az oldalt a vendég nézethez
};

onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'login.html', 'hamarosan.html'];

    if (user) {
        // 1. Adatmentés & Online státusz
        const userData = {
            username: user.displayName || user.email.split('@')[0],
            email: user.email,
            lastSeen: serverTimestamp()
        };
        set(ref(db, 'users/' + user.uid), userData);
        
        const statusRef = ref(db, 'status/' + user.uid);
        set(statusRef, { online: true });
        onDisconnect(statusRef).remove();

        // 2. UI Frissítése
        if (typeof window.showUserUI === 'function') {
            window.showUserUI(user, ADMIN_EMAILS.includes(user.email.toLowerCase()));
        }
    } else {
        // 3. Vendég mód vagy Átirányítás
        if (!publicPages.includes(currentPage) && currentPage !== 'admin.html') {
            window.location.href = 'login.html';
        }
        if (typeof window.showGuestUI === 'function') {
            window.showGuestUI();
        }
    }
});