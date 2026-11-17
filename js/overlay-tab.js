(() => {
    const tabCloaks = {
        classroom: {
            title: 'Home - Classroom',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Google_Classroom_Logo.svg/3840px-Google_Classroom_Logo.svg.png'
        },
        drive: {
            title: 'Home - Google Drive',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Google_Drive_icon_(2026).svg/1280px-Google_Drive_icon_(2026).svg.png'
        },
        clever: {
            title: 'Resources',
            icon: 'https://support.highlandschools.org/wp-content/uploads/2020/11/clever1.png'
        },
        iready: {
            title: 'Math Home Page, i-Ready',
            icon: 'https://image.winudf.com/v2/image1/Y29tLmJybmJ5LmlyZWFkeV9pY29uXzE1NzMyNTgzODRfMDAy/icon.png?w=340&fakeurl=1'
        }
    };
    const requestedTabCloak = new URLSearchParams(window.location.search).get('tabCloak');
    const savedTabCloak = Object.hasOwn(tabCloaks, requestedTabCloak)
        ? requestedTabCloak
        : localStorage.getItem('homeTabCloak');
    const tabCloak = tabCloaks[savedTabCloak];

    if (tabCloak) {
        document.title = tabCloak.title;
        let favicon = document.querySelector('link[rel~="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = tabCloak.icon;
    }

    const overlay = document.createElement('aside');
    overlay.className = 'overlay-sidebar';
    const isGameScreen = document.body.classList.contains('game-screen');
    if (!document.getElementById('page-transition-script')) {
        const pageTransitionScript = document.createElement('script');
        pageTransitionScript.id = 'page-transition-script';
        pageTransitionScript.src = new URL('page-transition.js', document.currentScript.src).href;
        document.body.appendChild(pageTransitionScript);
    }
    const homePath = isGameScreen ? '../index.html' : 'index.html';
    const educationPath = isGameScreen ? '../education.html' : 'education.html';
    const otherWebsitesPath = isGameScreen ? '../otherwebsites.html' : 'otherwebsites.html';
    const searchPath = isGameScreen ? '../search.html' : 'search.html';
    const partnersPath = isGameScreen ? '../partners.html' : 'partners.html';
    overlay.innerHTML = `
        <div class="overlay-panel">
            <a href="${homePath}" aria-label="Home" title="Home">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>
                <span>Home</span>
            </a>
            <a href="${educationPath}" aria-label="Education" title="Education">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22zM21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 1 2.5 2z"/></svg>
                <span>Education</span>
            </a>
            <a href="${otherWebsitesPath}" aria-label="Other Websites" title="Other Websites">
                <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
                <span>Other Websites</span>
            </a>
            <a href="${searchPath}" aria-label="Search" title="Search">
                <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
                <span>Search</span>
            </a>
            <a href="${partnersPath}" aria-label="Partners" title="Partners">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/></svg>
                <span>Partners</span>
            </a>
        </div>
    `;

    document.body.appendChild(overlay);
    const settingsButton = document.querySelector('#settings');
    if (settingsButton) {
        settingsButton.classList.add('overlay-settings');
        settingsButton.setAttribute('aria-label', 'Settings');
        settingsButton.title = 'Settings';
        settingsButton.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/>
                <path d="M10 2h4l.7 3.1a7.7 7.7 0 0 1 1.5.9l3-.9 2 3.5-2.3 2.2a7.7 7.7 0 0 1 0 1.8l2.3 2.2-2 3.5-3-.9a7.7 7.7 0 0 1-1.5.9L14 22h-4l-.7-3.1a7.7 7.7 0 0 1-1.5-.9l-3 .9-2-3.5 2.3-2.2a7.7 7.7 0 0 1 0-1.8L2.8 9.2l2-3.5 3 .9a7.7 7.7 0 0 1 1.5-.9z"/>
            </svg>
            <span>Settings</span>
        `;
        overlay.appendChild(settingsButton);
    } else {
        const settingsLink = document.createElement('a');
        const siteRoot = new URL('../', document.currentScript.src);
        settingsLink.className = 'overlay-settings-link';
        settingsLink.href = new URL('index.html?openSettings=1', siteRoot).href;
        settingsLink.setAttribute('aria-label', 'Settings');
        settingsLink.title = 'Settings';
        settingsLink.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/>
                <path d="M10 2h4l.7 3.1a7.7 7.7 0 0 1 1.5.9l3-.9 2 3.5-2.3 2.2a7.7 7.7 0 0 1 0 1.8l2.3 2.2-2 3.5-3-.9a7.7 7.7 0 0 1-1.5.9L14 22h-4l-.7-3.1a7.7 7.7 0 0 1-1.5-.9l-3 .9-2-3.5 2.3-2.2a7.7 7.7 0 0 1 0-1.8L2.8 9.2l2-3.5 3 .9a7.7 7.7 0 0 1 1.5-.9z"/>
            </svg>
            <span>Settings</span>
        `;
        overlay.appendChild(settingsLink);
    }

    const gameFrame = document.querySelector('.game-screen iframe, #search-frame');

    if (gameFrame) {
        const fullscreenControl = document.createElement('button');
        fullscreenControl.className = 'fullscreen-control';
        fullscreenControl.type = 'button';
        fullscreenControl.textContent = 'Fullscreen';
        fullscreenControl.setAttribute('aria-label', 'Enter fullscreen');
        document.body.appendChild(fullscreenControl);
        gameFrame.setAttribute('allowfullscreen', '');
        gameFrame.setAttribute('allow', 'fullscreen; autoplay; gamepad');

        function updateFullscreenLabel() {
            const isFullscreen = document.fullscreenElement === gameFrame;
            fullscreenControl.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
            fullscreenControl.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
        }

        fullscreenControl.addEventListener('click', async () => {
            try {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                } else if (gameFrame.requestFullscreen) {
                    await gameFrame.requestFullscreen();
                } else if (gameFrame.webkitRequestFullscreen) {
                    gameFrame.webkitRequestFullscreen();
                }
            } catch (error) {
                fullscreenControl.textContent = 'Fullscreen unavailable';
            }
            updateFullscreenLabel();
        });

        const refreshControl = document.createElement('button');
        refreshControl.className = 'refresh-control';
        refreshControl.type = 'button';
        refreshControl.textContent = 'Refresh';
        refreshControl.setAttribute('aria-label', 'Refresh Education page or website');
        refreshControl.title = 'Refresh Education page or website';
        refreshControl.addEventListener('click', () => {
            gameFrame.src = gameFrame.src;
        });
        document.body.appendChild(refreshControl);

        const chromebookModeControl = document.createElement('button');
        chromebookModeControl.className = 'chromebook-mode-control';
        chromebookModeControl.type = 'button';
        chromebookModeControl.textContent = 'Chromebook Mode';
        chromebookModeControl.setAttribute('aria-pressed', 'false');
        chromebookModeControl.addEventListener('click', () => {
            const isEnabled = document.body.classList.toggle('chromebook-mode');
            chromebookModeControl.textContent = isEnabled ? 'Exit Chromebook Mode' : 'Chromebook Mode';
            chromebookModeControl.setAttribute('aria-pressed', String(isEnabled));
            document.dispatchEvent(new CustomEvent('chromebookmodechange', {
                detail: { enabled: isEnabled }
            }));
        });
        document.body.appendChild(chromebookModeControl);

        if (isGameScreen) {
            const refreshNotice = document.createElement('p');
            refreshNotice.className = 'iframe-refresh-notice';
            refreshNotice.textContent = 'If page says blocked press refresh button';
            document.body.appendChild(refreshNotice);
        }

        document.addEventListener('fullscreenchange', updateFullscreenLabel);
        document.addEventListener('webkitfullscreenchange', updateFullscreenLabel);
    }
})();
