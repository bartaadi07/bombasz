// firebase-messaging-sw.js
// Compat buildet használunk, mert SW-ban ez a legstabilabb.
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAwRrAtHaNRh2DLwVkryA3wSf86h7aQCaI",
  authDomain: "konyv-93c63.firebaseapp.com",
  projectId: "konyv-93c63",
  storageBucket: "konyv-93c63.firebasestorage.app",
  messagingSenderId: "349471560585",
  appId: "1:349471560585:web:55c6e78499ebbca0540758",
  measurementId: "G-NF07N36ETJ"
});

const messaging = firebase.messaging();

// Háttér push érkezésekor (amikor az oldal nincs fókuszban / nincs nyitva)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Új üzenet';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
