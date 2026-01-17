// ============================================
// BOMBASZ User UI - Egységes HUD Bar
// ============================================

(function() {
    function waitForAuth(callback, maxAttempts = 50) {
        let attempts = 0;
        const check = setInterval(() => {
            attempts++;
            if (window.firebaseAuth || attempts >= maxAttempts) {
                clearInterval(check);
                if (window.firebaseAuth) callback();
            }
        }, 100);
    }

    // Közös CSS
    const sharedCSS = `
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
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background 0.2s;
        }

        #bombasz-user-bar .user-info:hover {
            background: rgba(255,255,255,0.1);
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

        /* Dropdown */
        #bombasz-user-dropdown {
            position: absolute;
            top: 44px;
            left: 16px;
            background: #111;
            border: 1px solid #333;
            min-width: 280px;
            max-height: 400px;
            overflow-y: auto;
            display: none;
            z-index: 100000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        #bombasz-user-dropdown.open {
            display: block;
        }

        #bombasz-user-dropdown .dropdown-header {
            padding: 12px 16px;
            border-bottom: 1px solid #333;
            font-size: 0.8rem;
            color: #888;
        }

        #bombasz-user-dropdown .dropdown-header strong {
            color: #fff;
            font-family: 'Orbitron', sans-serif;
        }

        #bombasz-user-dropdown .watched-section {
            padding: 12px 16px;
        }

        #bombasz-user-dropdown .watched-section h4 {
            font-size: 0.7rem;
            color: #666;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        #bombasz-user-dropdown .watched-item {
            padding: 10px;
            background: #1a1a1a;
            margin-bottom: 8px;
            cursor: pointer;
            transition: background 0.2s;
            border: 1px solid #222;
        }

        #bombasz-user-dropdown .watched-item:hover {
            background: #252525;
            border-color: #444;
        }

        #bombasz-user-dropdown .watched-title {
            font-size: 0.85rem;
            color: #fff;
            font-weight: 600;
            margin-bottom: 4px;
        }

        #bombasz-user-dropdown .watched-progress-text {
            font-size: 0.75rem;
            color: #666;
        }

        #bombasz-user-dropdown .progress-container {
            height: 4px;
            background: #333;
            margin-top: 6px;
        }

        #bombasz-user-dropdown .progress-bar {
            height: 100%;
            background: #fff;
        }

        #bombasz-user-dropdown .no-history {
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.85rem;
        }

        /* Scrollbar elrejtése */
        #bombasz-user-dropdown::-webkit-scrollbar {
            width: 0;
        }

        body.has-user-bar {
            padding-top: 44px !important;
        }

        /* Responsive */
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

            #bombasz-user-bar .admin-badge {
                padding: 2px 6px;
                font-size: 0.6rem;
            }

            #bombasz-user-dropdown {
                left: 10px;
                right: 10px;
                min-width: auto;
            }

            body.has-user-bar {
                padding-top: 40px !important;
            }
        }
    `;

    // User UI megjelenítése
    window.showUserUI = function(email, isAdmin) {
        if (document.getElementById('bombasz-user-bar')) return;

        const style = document.createElement('style');
        style.textContent = sharedCSS;
        document.head.appendChild(style);

        const initial = email.charAt(0).toUpperCase();
        const displayName = email.split('@')[0];

        const bar = document.createElement('div');
        bar.id = 'bombasz-user-bar';
        bar.innerHTML = `
            <div class="user-info" id="bombasz-user-toggle">
                <div class="user-avatar">${initial}</div>
                <span class="user-email">${displayName}</span>
                ${isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 4px; opacity: 0.5;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
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

        // Dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'bombasz-user-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-header">
                <strong>Üdv, ${displayName}!</strong><br>
                <span style="font-size: 0.7rem;">film/sorozat kérés: dc: bartaadi</span>
            </div>
            <div class="watched-section">
                <h4>Legutóbb nézettek</h4>
                <div id="bombasz-watched-list">
                    <div class="no-history">Betöltés...</div>
                </div>
            </div>
        `;

        document.body.insertBefore(bar, document.body.firstChild);
        document.body.insertBefore(dropdown, document.body.firstChild);
        document.body.classList.add('has-user-bar');

        // Toggle dropdown
        const toggle = document.getElementById('bombasz-user-toggle');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            if (dropdown.classList.contains('open')) {
                loadWatchedHistory();
            }
        });

        // Kívülre kattintás bezárja
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        // Exportálás a vids.html számára
        window.bombaszUserEmail = email;
        window.bombaszDisplayName = displayName;
    };

    // Vendég UI
    window.showGuestUI = function() {
        if (document.getElementById('bombasz-user-bar')) return;

        const style = document.createElement('style');
        style.textContent = sharedCSS;
        document.head.appendChild(style);

        const bar = document.createElement('div');
        bar.id = 'bombasz-user-bar';
        bar.innerHTML = `
            <div class="user-info">
                <div class="guest-icon">?</div>
                <span class="user-email">Vendég</span>
            </div>
            <a href="login.html" class="login-btn">Bejelentkezés</a>
        `;

        document.body.insertBefore(bar, document.body.firstChild);
        document.body.classList.add('has-user-bar');
    };

    // Előzmények betöltése (Firebase-ből)
    async function loadWatchedHistory() {
        const listEl = document.getElementById('bombasz-watched-list');
        if (!listEl) return;

        // Próbáljuk elérni a Firebase-t
        if (!window.firebaseAuth || !window.firebaseAuth.currentUser) {
            listEl.innerHTML = '<div class="no-history">Nincs előzmény</div>';
            return;
        }

        try {
            // Ha van globális allProgressData (vids.html állítja be)
            if (window.allProgressData && window.seriesData) {
                renderWatchedList(window.allProgressData, window.seriesData);
            } else {
                // Próbáljuk Firebase-ből betölteni
                const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
                const db = getDatabase();
                const user = window.firebaseAuth.currentUser;
                const snapshot = await get(ref(db, `progress/${user.uid}`));
                
                if (snapshot.exists() && window.seriesData) {
                    renderWatchedList(snapshot.val(), window.seriesData);
                } else {
                    listEl.innerHTML = '<div class="no-history">Még nincs előzmény</div>';
                }
            }
        } catch (error) {
            console.error('Előzmények betöltési hiba:', error);
            listEl.innerHTML = '<div class="no-history">Nem sikerült betölteni</div>';
        }
    }

    function renderWatchedList(progressData, seriesData) {
        const listEl = document.getElementById('bombasz-watched-list');
        if (!listEl) return;

        const items = Object.keys(progressData)
            .map(key => {
                const info = seriesData[key];
                if (!info) return null;
                return {
                    key,
                    title: info.title,
                    totalVideos: info.videos.length,
                    watchedIndex: progressData[key].index,
                    timestamp: progressData[key].timestamp
                };
            })
            .filter(i => i)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);

        if (items.length === 0) {
            listEl.innerHTML = '<div class="no-history">Még nincs előzmény</div>';
            return;
        }

        listEl.innerHTML = items.map(item => {
            const watchedCount = Math.min(item.watchedIndex + 1, item.totalVideos);
            const progressPercent = (watchedCount / item.totalVideos) * 100;
            return `
                <div class="watched-item" data-series="${item.key}">
                    <div class="watched-title">${item.title}</div>
                    <div class="watched-progress-text">${watchedCount}/${item.totalVideos} rész</div>
                    <div class="progress-container"><div class="progress-bar" style="width: ${progressPercent}%"></div></div>
                </div>
            `;
        }).join('');

        // Kattintás kezelése
        listEl.querySelectorAll('.watched-item').forEach(item => {
            item.addEventListener('click', () => {
                const seriesKey = item.dataset.series;
                // Ha van loadSeries függvény (vids.html), használjuk
                if (typeof window.loadSeries === 'function') {
                    window.loadSeries(seriesKey);
                    document.getElementById('mainPage')?.style.setProperty('display', 'none');
                    document.getElementById('seriesPage')?.style.setProperty('display', 'flex');
                }
                document.getElementById('bombasz-user-dropdown')?.classList.remove('open');
            });
        });
    }

    // Globális függvény az előzmények frissítéséhez
    window.updateBombaszWatchedList = function(progressData, seriesData) {
        window.allProgressData = progressData;
        window.seriesData = seriesData;
    };

    waitForAuth(() => {});
})();
