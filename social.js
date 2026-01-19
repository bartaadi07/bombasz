import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

let currentUid = null;
let currentUsername = "";
let activeChatId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUid = user.uid;
        currentUsername = user.displayName || user.email.split('@')[0];
        if (typeof window.showUserUI === 'function') window.showUserUI(user, false);
        loadFriends();
    } else {
        window.location.href = 'login.html';
    }
});

// KERESÉS
const searchInput = document.getElementById('user-search');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    if (val.length < 2) { searchResults.innerHTML = ''; return; }

    onValue(ref(db, 'users'), (snapshot) => {
        const users = snapshot.val();
        if (!users) return;
        let html = '', found = false;

        for (let uid in users) {
            const dbName = users[uid].username || users[uid].displayName || users[uid].email?.split('@')[0] || "Ismeretlen";
            if (uid !== currentUid && dbName.toLowerCase().includes(val)) {
                found = true;
                html += `
                <div class="user-card">
                    <div class="user-info"><b>${dbName}</b></div>
                    <button class="btn-action" onclick="addFriend('${uid}', '${dbName}')">Jelölés</button>
                </div>`;
            }
        }
        searchResults.innerHTML = found ? html : '<div style="color:gray; font-size:0.7rem; padding:10px;">Nincs találat</div>';
    }, { onlyOnce: true });
});

// BARÁT HOZZÁADÁSA
window.addFriend = function(targetUid, targetName) {
    if (!currentUid) return;
    set(ref(db, `friends/${currentUid}/${targetUid}`), { username: targetName })
        .then(() => set(ref(db, `friends/${targetUid}/${currentUid}`), { username: currentUsername }))
        .then(() => { alert(`${targetName} hozzáadva!`); searchInput.value = ''; searchResults.innerHTML = ''; })
        .catch(err => console.error("Permission error: Ellenőrizd a szabályokat!", err));
};

// LISTÁZÁS ÉS CHAT
function loadFriends() {
    onValue(ref(db, `friends/${currentUid}`), (snapshot) => {
        const friends = snapshot.val();
        const container = document.getElementById('friends-list');
        if (!friends) { container.innerHTML = '<small style="color:#444">Nincs barátod.</small>'; return; }
        let html = '';
        for (let uid in friends) {
            html += `<div class="user-card" style="cursor:pointer" onclick="openChat('${uid}', '${friends[uid].username}')">
                <b>${friends[uid].username}</b></div>`;
        }
        container.innerHTML = html;
    });
}

window.openChat = function(friendUid, friendName) {
    document.getElementById('chat-target-name').innerText = `BESZÉLGETÉS: ${friendName.toUpperCase()}`;
    activeChatId = currentUid < friendUid ? `${currentUid}_${friendUid}` : `${friendUid}_${currentUid}`;
    onValue(ref(db, `chats/${activeChatId}`), (snapshot) => {
        const messages = snapshot.val();
        const msgContainer = document.getElementById('chat-messages');
        let html = '';
        for (let id in messages) {
            const side = messages[id].senderId === currentUid ? 'sent' : 'received';
            html += `<div class="message ${side}">${messages[id].text}</div>`;
        }
        msgContainer.innerHTML = html;
        msgContainer.scrollTop = msgContainer.scrollHeight;
    });
};

const msgInput = document.getElementById('msg-input');
const sendMessage = () => {
    if (!msgInput.value.trim() || !activeChatId) return;
    push(ref(db, `chats/${activeChatId}`), { senderId: currentUid, text: msgInput.value, timestamp: serverTimestamp() });
    msgInput.value = '';
};
document.getElementById('send-btn').addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });