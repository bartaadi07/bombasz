import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, 
  sendPasswordResetEmail, updateProfile 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  getDatabase, ref, set, get, push, onChildAdded, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAwRrAtHaNRh2DLwVkryA3wSf86h7aQCaI",
  authDomain: "konyv-93c63.firebaseapp.com",
  projectId: "konyv-93c63",
  storageBucket: "konyv-93c63.firebasestorage.app",
  messagingSenderId: "349471560585",
  appId: "1:349471560585:web:55c6e78499ebbca0540758",
  measurementId: "G-NF07N36ETJ"
};

// 🔹 Inicializálás
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// ---------------------------------------------
// 🔹 Globális Segédfüggvények
// ---------------------------------------------
function getUserName(user) {
    if (!user) return null;
    return user.displayName || user.email.split("@")[0];
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return; 
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

function highlightMentions(text) {
    if (!text) return "";
    const currentUser = auth.currentUser;
    const currentUserName = currentUser ? getUserName(currentUser) : null;
    
    return text.replace(/@(\w+)/g, (match, username) => {
        if (currentUser && username === currentUserName) {
            return `<mark class="mention" style="background-color:#4caf50;">${match}</mark>`; 
        }
        return `<mark class="mention">${match}</mark>`; 
    });
}

// ---------------------------------------------
// 🔹 Adatok (A CBZ és Könyv adatok)
// ---------------------------------------------
const books = {
    "book1": "<h2>Az Első Könyv Tartalma</h2><p>Ez egy próba szöveg. A lap görgetésekor a progress bar mutatja, hol tartasz.</p>",
    "cbz1": "<h2>Képregény Olvasó (CBZ)</h2><p>Kérlek válassz egy részt az olvasó indításához!</p>",
};
const cbzFiles = [
  '/comics/Magik 001 (2025) (Digital) (Kileko-Empire).cbz',
  // ... a többi 9 fájl URL-je ...
];


// ==========================================================
// 🚨 Kód Futtatása a DOM Betöltése Után 
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------
    // 🔹 HTML Elemtörzs (Most már a HTML kódnak megfelelően)
    // ---------------------------------------------
    const scrollToTopBtn = document.getElementById("scrollToTop-btn");
    const bookSelector = document.getElementById("bookSelector");
    const bookContent = document.getElementById("book-content");
    const progressBar = document.getElementById("progress-bar");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const authMessage = document.getElementById("auth-message");
    const authSection = document.getElementById("auth-section");
    const appSection = document.getElementById("app-section");
    const displayNameInput = document.getElementById("displayNameInput");
    const updateDisplayNameBtn = document.getElementById("updateDisplayNameBtn");
    const profileMessage = document.getElementById("profileMessage");
    const chatBox = document.getElementById("chat-box");
    const chatMessageInput = document.getElementById("chat-message");
    const sendMessageBtn = document.getElementById("send-message-btn");
    const loginBtn = document.getElementById("login-btn");
    const resetPasswordBtn = document.getElementById("reset-password-btn");
    const editProfileBtn = document.getElementById("editProfileBtn");
    const profileSection = document.getElementById("profile-section");
    const cbzSelector = document.getElementById("cbzSelector");
    const cbzPartSelector = document.getElementById("cbzPartSelector");
    
    
    // ---------------------------------------------
    // 🔹 ESEMÉNY FIGYELŐK (Auth)
    // ---------------------------------------------
    
    if (loginBtn) loginBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        authMessage.textContent = ""; 
        if (!email || !password) {
            authMessage.textContent = "Kérlek, töltsd ki az összes mezőt!";
            return;
        }
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                // A nézetváltást az onAuthStateChanged végzi
            })
            .catch(err => {
                authMessage.textContent = "Hibás e-mail cím vagy jelszó!";
                if (resetPasswordBtn) resetPasswordBtn.style.display = "inline-block";
            });
    });

    if (resetPasswordBtn) resetPasswordBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        if (!email) return authMessage.textContent = "Add meg az email címed!";
        sendPasswordResetEmail(auth, email)
            .then(() => authMessage.textContent = "✅ Ellenőrizd az emailed!")
            .catch(err => authMessage.textContent = "❌ Hiba: " + err.message);
    });

    // ... (A többi Auth és görgetési/választó események) ...

    // ---------------------------------------------
    // 🔹 CHAT FUNKCIÓK (Küldés és Frissítés)
    // ---------------------------------------------

    function sendMessage() {
        const user = auth.currentUser;
        if (!user) { showToast("Előbb jelentkezz be!"); return; }

        const text = chatMessageInput.value.trim();
        if (!text) return;

        const mentionMatch = text.match(/@(\w+)/g); 
        let mentions = mentionMatch ? mentionMatch.map(m => m.slice(1)) : [];

        push(ref(db, "chat"), {
            user: getUserName(user),
            text,
            mentions,
            time: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })
        });

        chatMessageInput.value = "";
    }
    
    if (sendMessageBtn) sendMessageBtn.addEventListener("click", sendMessage);
    if (chatMessageInput) chatMessageInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); 
            sendMessage();
        }
    });

    // 🚨 VALÓS IDEJŰ FRISSÍTÉS ÉS BAL/JOBB OLDALI ELRENDEZÉS
    const chatRef = ref(db, "chat");

    onChildAdded(chatRef, snapshot => {
        const msg = snapshot.val();
        const currentUser = auth.currentUser;
        const currentUserName = currentUser ? getUserName(currentUser) : null;
        const senderName = msg.user || "Névtelen";
        
        const div = document.createElement("div");
        div.classList.add("chat-msg");

        const highlightedText = highlightMentions(msg.text);
        
        // 🟢 FONTOS: EZ VÁLASZTJA SZÉT AZ ÜZENETEKET
        if (currentUser && senderName === currentUserName) {
            // SAJÁT ÜZENET: JOBBRA ZÁR (self), NÉV NÉLKÜL
            div.classList.add("self");
            div.innerHTML = `${highlightedText} <br><small class="chat-meta">${msg.time}</small>`;
        } else {
            // MÁSOK ÜZENETE: BALRA ZÁR (other), NÉVVEL
            div.classList.add("other");
            div.innerHTML = `<strong>${senderName}</strong>: ${highlightedText} <br><small class="chat-meta">${msg.time}</small>`;
        }

        if (chatBox) chatBox.appendChild(div);
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

        if (currentUser && msg.mentions && msg.mentions.includes(currentUserName)) {
            showToast(`✅ Téged említettek: ${msg.text}`);
        }
    });


    // ---------------------------------------------
    // 🔹 AUTH ÁLLAPOT (A nézetváltás motorja)
    // ---------------------------------------------
    onAuthStateChanged(auth, user => {
        if (user) {
            // ✅ BEJELENTKEZVE: Megjelenítjük az alkalmazást
            if (authSection) authSection.style.display = "none";
            if (appSection) appSection.style.display = "flex"; // Vagy block, a CSS-ed szerint

            if (sendMessageBtn) sendMessageBtn.disabled = false;
            if (chatMessageInput) {
                chatMessageInput.disabled = false;
                chatMessageInput.placeholder = "Írj üzenetet...";
            }
            if (bookSelector && bookSelector.value) loadBook(bookSelector.value);
        } else {
            // ❌ KIJELENTKEZVE: Megjelenítjük az autentikációs részt
            if (authSection) authSection.style.display = "flex"; // Vagy block, a CSS-ed szerint
            if (appSection) appSection.style.display = "none";

            if (sendMessageBtn) sendMessageBtn.disabled = true;
            if (chatMessageInput) {
                chatMessageInput.disabled = true;
                chatMessageInput.placeholder = "Jelentkezz be a küldéshez!";
            }
        }
    });

    // ---------------------------------------------
    // 🔹 KÖNYVKEZELÉS (A CBZ/ProgressBar függvények)
    // ---------------------------------------------
    
    function loadBook(key) {
        const body = document.body;

        if (key === "cbz1") {
            body.classList.add("cbz-mode");
            // loadCBZReader(); // CBZ olvasó inicializálása
            return;
        } else {
            body.classList.remove("cbz-mode");
        }

        if (bookContent) bookContent.innerHTML = books[key] || "<p>Ez a könyv még nem elérhető.</p>";
        updateProgressBar();
    }
    
    function updateProgressBar() {
        const scrollTop = window.scrollY;
        const docHeight = bookContent.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = scrollPercent + "%";
    }

    // A görgetés figyelő hozzáadása
    if (window.addEventListener) window.addEventListener("scroll", updateProgressBar);
    if (bookSelector) bookSelector.addEventListener("change", e => { loadBook(e.target.value); });

}); 
// 🚨 DOMContentLoaded ZÁRÓ BLOKK