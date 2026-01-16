// ============================================
// User UI - Felső sáv kijelentkezés gombbal
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

        // CSS hozzáadása
        const style = document.createElement('style');
        style.textContent = `
            #bombasz-user-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 48px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 99999;
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            #bombasz-user-bar .user-info {
                display: flex;
                align-items: center;
                gap: 12px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
            }

            #bombasz-user-bar .user-avatar {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-weight: 600;
                font-size: 0.85rem;
            }

            #bombasz-user-bar .admin-badge {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: #fff;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
            }

            #bombasz-user-bar .bar-actions {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            #bombasz-user-bar .admin-link {
                color: rgba(255, 255, 255, 0.7);
                text-decoration: none;
                font-size: 0.85rem;
                padding: 6px 12px;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            #bombasz-user-bar .admin-link:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            #bombasz-user-bar .logout-btn {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.3);
                color: #fca5a5;
                padding: 8px 16px;
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.85rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            #bombasz-user-bar .logout-btn:hover {
                background: rgba(239, 68, 68, 0.3);
                border-color: rgba(239, 68, 68, 0.5);
            }

            /* Body padding, hogy ne takarja el a content-et */
            body.has-user-bar {
                padding-top: 48px !important;
            }
        `;
        document.head.appendChild(style);

        // User bar HTML
        const bar = document.createElement('div');
        bar.id = 'bombasz-user-bar';
        
        const initial = email.charAt(0).toUpperCase();
        
        bar.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${initial}</div>
                <span>${email}</span>
                ${isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
            </div>
            <div class="bar-actions">
                ${isAdmin ? '<a href="admin.html" class="admin-link">⚙️ Admin Panel</a>' : ''}
                <button class="logout-btn" onclick="logoutUser()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Kijelentkezés
                </button>
            </div>
        `;

        document.body.insertBefore(bar, document.body.firstChild);
        document.body.classList.add('has-user-bar');
    };

    // Auto-init ha már van auth
    waitForAuth(() => {
        // Az auth.js fogja meghívni a showUserUI-t
    });
})();
