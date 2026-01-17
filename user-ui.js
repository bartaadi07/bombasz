// ============================================
// BOMBASZ User UI - Bejelentkezési jelző
// Illeszkedik a BOMBASZ dizájnhoz (fekete-fehér, cyberpunk)
// ============================================

(function() {
    // Várjuk meg, amíg a Firebase auth betöltődik
    function waitForAuth(callback, maxAttempts = 50) {
        let attempts = 0;
        const check = setInterval(() => {
            attempts++;
            if (window.firebaseAuth || attempts >= maxAttempts) {
                clearInterval(check);
                if (window.firebaseAuth) {
                    callback();
                }
            }
        }, 100);
    }

    // User UI megjelenítése
    window.showUserUI = function(email, isAdmin) {
        // Ha már létezik, ne hozzunk létre újat
        if (document.getElementById('bombasz-user-bar')) {
            return;
        }

        // CSS hozzáadása - BOMBASZ stílusban
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Poppins:wght@400;600&display=swap');

            #bombasz-user-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 44px;
                background: #000000;
                border-bottom: 1px solid #333;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
                z-index: 99999;
                font-family: 'Poppins', sans-serif;
            }

            #bombasz-user-bar .user-info {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #fff;
                font-size: 0.8rem;
            }

            #bombasz-user-bar .user-avatar {
                width: 28px;
                height: 28px;
                background: #fff;
                color: #000;
                border-radius: 0;
                clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.85rem;
                font-family: 'Orbitron', sans-serif;
            }

            #bombasz-user-bar .user-email {
                color: #888;
                font-size: 0.75rem;
            }

            #bombasz-user-bar .admin-badge {
                background: #fff;
                color: #000;
                padding: 3px 8px;
                font-size: 0.65rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-family: 'Orbitron', sans-serif;
                clip-path: polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%);
            }

            #bombasz-user-bar .bar-actions {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            #bombasz-user-bar .admin-link {
                color: #888;
                text-decoration: none;
                font-size: 0.75rem;
                padding: 5px 10px;
                border: 1px solid #333;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            #bombasz-user-bar .admin-link:hover {
                background: #fff;
                color: #000;
                border-color: #fff;
            }

            #bombasz-user-bar .logout-btn {
                background: transparent;
                border: 1px solid #555;
                color: #fff;
                padding: 5px 12px;
                font-family: 'Poppins', sans-serif;
                font-size: 0.75rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            #bombasz-user-bar .logout-btn:hover {
                background: #fff;
                color: #000;
                border-color: #fff;
            }

            #bombasz-user-bar .logout-btn svg {
                width: 14px;
                height: 14px;
            }

            /* Body padding, hogy ne takarja el a content-et */
            body.has-user-bar {
                padding-top: 44px !important;
            }

            /* Mobilon kisebb */
            @media (max-width: 600px) {
                #bombasz-user-bar {
                    padding: 0 10px;
                    height: 40px;
                }

                #bombasz-user-bar .user-email {
                    display: none;
                }

                #bombasz-user-bar .admin-link span {
                    display: none;
                }

                #bombasz-user-bar .logout-btn span {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);

        // User bar HTML
        const bar = document.createElement('div');
        bar.id = 'bombasz-user-bar';
        
        const initial = email.charAt(0).toUpperCase();
        const displayName = email.split('@')[0];
        
        bar.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${initial}</div>
                <span class="user-email">${displayName}</span>
                ${isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
            </div>
            <div class="bar-actions">
                ${isAdmin ? '<a href="admin.html" class="admin-link"><span>⚙ Admin</span></a>' : ''}
                <button class="logout-btn" onclick="logoutUser()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Kilépés</span>
                </button>
            </div>
        `;

        document.body.insertBefore(bar, document.body.firstChild);
        document.body.classList.add('has-user-bar');
    };

    // Vendég UI (publikus oldalakhoz)
    window.showGuestUI = function() {
        if (document.getElementById('bombasz-user-bar')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Poppins:wght@400;600&display=swap');

            #bombasz-user-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 44px;
                background: #000000;
                border-bottom: 1px solid #333;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
                z-index: 99999;
                font-family: 'Poppins', sans-serif;
            }

            #bombasz-user-bar .user-info {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #666;
                font-size: 0.8rem;
            }

            #bombasz-user-bar .guest-icon {
                width: 28px;
                height: 28px;
                background: #333;
                color: #888;
                border-radius: 0;
                clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
            }

            #bombasz-user-bar .login-btn {
                background: #fff;
                border: none;
                color: #000;
                padding: 6px 14px;
                font-family: 'Poppins', sans-serif;
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                text-decoration: none;
                clip-path: polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%);
            }

            #bombasz-user-bar .login-btn:hover {
                background: #ccc;
            }

            body.has-user-bar {
                padding-top: 44px !important;
            }
        `;
        document.head.appendChild(style);

        const bar = document.createElement('div');
        bar.id = 'bombasz-user-bar';
        bar.innerHTML = `
            <div class="user-info">
                <div class="guest-icon">?</div>
                <span>Vendég</span>
            </div>
            <a href="login.html" class="login-btn">Bejelentkezés</a>
        `;

        document.body.insertBefore(bar, document.body.firstChild);
        document.body.classList.add('has-user-bar');
    };

    // Auto-init ha már van auth
    waitForAuth(() => {
        // Az auth.js fogja meghívni a showUserUI-t
    });
})();
