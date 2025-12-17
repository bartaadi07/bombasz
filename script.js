import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, updateProfile,
    sendEmailVerification, deleteUser,
    setPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    getDatabase, ref, set, get, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAwRrAtHaNRh2DLwVkryA3wSf86h7aQCaI",
    authDomain: "konyv-93c63.firebaseapp.com",
    projectId: "konyv-93c63",
    storageBucket: "konyv-93c63.firebasestorage.app",
    messagingSenderId: "349471560585",
    appId: "1:349471560585:web:55c6e78499ebbca0540758",
    measurementId: "G-NF07N36ETJ"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const $ = (sel) => document.querySelector(sel);
function revealMsg(node, text, type = "") {
    if (!node) return;
    node.textContent = text;
    node.className = "form-msg" + (type ? " " + type : "");
    node.style.display = "block";
    try { node.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (_) { }
}
const normalizeUsername = (s = "") =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);

{
    const form = $("#register-form");
    const msg = $("#register-msg");

    form?.addEventListener("submit", async (e) => {
        e.preventDefault(); e.stopPropagation();
        revealMsg(msg, "");

        const rawName = $("#regDisplayName").value.trim();
        const email = $("#regEmail").value.trim();
        const pass = $("#regPassword").value;
        const pass2 = $("#regPassword2").value;

        const uname = normalizeUsername(rawName);
        if (!rawName) return revealMsg(msg, "Adj meg egy felhasználónevet.", "error");
        if (uname.length < 3) return revealMsg(msg, "A felhasználónév túl rövid (min. 3 karakter, ékezet nélkül).", "error");
        if (!email || !pass || !pass2) return revealMsg(msg, "Kérlek, tölts ki minden mezőt!", "error");
        if (pass !== pass2) return revealMsg(msg, "A két jelszó nem egyezik.", "error");
        if (pass.length < 6) return revealMsg(msg, "A jelszónak legalább 6 karakteresnek kell lennie.", "error");

        try {
            const unameRef = ref(db, "usernames/" + uname);
            const pre = await get(unameRef);
            if (pre.exists()) return revealMsg(msg, "Ez a felhasználónév már foglalt. Válassz másikat.", "error");

            await setPersistence(auth, browserSessionPersistence);
            const cred = await createUserWithEmailAndPassword(auth, email, pass);

            const claim = await runTransaction(unameRef, (current) => {
                if (current === null) return { uid: cred.user.uid, displayName: rawName };
                return;
            });
            if (!claim.committed) {
                try { await deleteUser(cred.user); } catch (_) { }
                return revealMsg(msg, "Sajnálom, közben lefoglalták ezt a nevet. Válassz másikat!", "error");
            }

            try { await updateProfile(cred.user, { displayName: rawName }); } catch (_) { }

            await set(ref(db, "users/" + cred.user.uid), {
                displayName: rawName,
                username: uname,
                email,
                createdAt: serverTimestamp()
            });

            try { await sendEmailVerification(cred.user); } catch (_) { }

            revealMsg(msg, "✅ Sikeres regisztráció! Ellenőrizd az e-mailed a megerősítéshez.", "success");
            form.reset();
        } catch (err) {
            let text = "Hiba történt a regisztráció során.";
            if (err?.code === "auth/email-already-in-use") text = "Ez az e-mail már használatban van.";
            if (err?.code === "auth/invalid-email") text = "Érvénytelen e-mail cím.";
            if (err?.code === "auth/weak-password") text = "Gyenge jelszó (min. 6 karakter).";
            revealMsg(msg, "❌ " + text, "error");
            console.error(err);
        }
    });
}
document.addEventListener('keydown', function (e) {
    if (e.key === "F12") e.preventDefault();
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C")) e.preventDefault();
    if (e.ctrlKey && (e.key === "u" || e.key === "s")) e.preventDefault();
});