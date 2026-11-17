(() => {
    const pageTransitionScriptUrl = document.currentScript ? document.currentScript.src : '';
    const siteAdKey = '1f9a4048f68ce606e74de610934b9873';
    const stateKey = 'page-transition-background';
    const mainBackgroundKey = 'main-menu-background';
    const styleId = 'page-transition-styles';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const leaveDuration = reducedMotion ? 1 : 120;
    const enterDuration = reducedMotion ? 1 : 420;
    const faceCount = 12;
    const faceSize = 88;
    const frameDuration = 1000 / 60;
    const backgroundSelector = [
        '.background-particle',
        '.christmas-lights',
        '.menu-face',
        '.menu-particle'
    ].join(',');
    const backgroundProperties = [
        'background-color',
        'background-image',
        'background-position',
        'background-size',
        'background-repeat',
        'background-attachment',
        'background-origin',
        'background-clip',
        'background-blend-mode'
    ];

    function installTransition(targetDocument) {
        const root = targetDocument.documentElement;
        const body = targetDocument.body;
        const view = targetDocument.defaultView;
        if (!root || !body || !view || root.dataset.pageTransition === 'installed') return;

        root.dataset.pageTransition = 'installed';
        installStyles(targetDocument);
        const incomingState = restoreIncomingBackground(targetDocument);
        const hasIncomingTransition = Boolean(incomingState);
        if (!hasIncomingTransition && !body.classList.contains('home-page')) {
            applyMainMenuBackground(targetDocument, getMainMenuBackground(view));
        }
        if (view === view.top && !body.classList.contains('home-page')) {
            const addAd = () => addSiteAd(targetDocument);
            if (targetDocument.readyState === 'loading') {
                targetDocument.addEventListener('DOMContentLoaded', addAd, { once: true });
            } else {
                addAd();
            }
        }
        if (hasIncomingTransition) animateIncomingSidebar(targetDocument);
        if (view === view.top
            && !body.classList.contains('home-page')
            && !body.classList.contains('game-screen')) {
            addAmbientBackground(targetDocument, incomingState);
        }
        if (body.classList.contains('home-page')) {
            const saveMainBackground = () => storeMainMenuBackground(targetDocument);
            view.setTimeout(saveMainBackground, 0);
            view.addEventListener('load', saveMainBackground, { once: true });

            const backgroundObserver = new view.MutationObserver(saveMainBackground);
            backgroundObserver.observe(body, { attributes: true, attributeFilter: ['style'] });
        }

        targetDocument.addEventListener('click', event => {
            const eventTarget = event.target instanceof view.Element
                ? event.target
                : event.target && event.target.parentElement;
            const link = eventTarget && eventTarget.closest('a[href]');
            if (!link || link.hasAttribute('download')) return;

            const destinationWindow = getDestinationWindow(link, view);
            if (!destinationWindow) return;

            const requestedDestination = new URL(link.href, view.location.href);
            let destinationOrigin;
            let sourceDocument;
            try {
                destinationOrigin = destinationWindow.location.origin;
                sourceDocument = destinationWindow.document;
            } catch (error) {
                return;
            }

            if (requestedDestination.origin !== destinationOrigin) return;
            const destination = resolveDestination(requestedDestination, destinationWindow);
            if (destination.origin !== destinationOrigin) return;
            const current = new URL(destinationWindow.location.href);
            if (destination.pathname === current.pathname && destination.search === current.search) return;

            try {
                const state = captureBackground(sourceDocument, destination.href, destinationWindow);
                destinationWindow.sessionStorage.setItem(stateKey, JSON.stringify(state));
            } catch (error) {
                console.error('Unable to preserve the page background for navigation.', error);
                return;
            }

            event.preventDefault();
            sourceDocument.documentElement.classList.add('page-transition-leaving');
            destinationWindow.setTimeout(() => {
                destinationWindow.location.assign(destination.href);
            }, leaveDuration);
        }, true);

        targetDocument.querySelectorAll('iframe').forEach(attachFrame);

        const frameObserver = new view.MutationObserver(records => {
            records.forEach(record => {
                record.addedNodes.forEach(node => {
                    if (!(node instanceof view.Element)) return;
                    if (node.matches('iframe')) attachFrame(node);
                    node.querySelectorAll('iframe').forEach(attachFrame);
                });
            });
        });
        frameObserver.observe(root, { childList: true, subtree: true });

        function attachFrame(frame) {
            if (frame.dataset.pageTransition === 'observed') return;
            frame.dataset.pageTransition = 'observed';

            const installInFrame = () => {
                if (frame.hasAttribute('sandbox') && !frame.sandbox.contains('allow-same-origin')) return;
                if (!frame.hasAttribute('srcdoc') && frame.hasAttribute('src')) {
                    const frameUrl = new URL(frame.getAttribute('src'), view.location.href);
                    if (frameUrl.origin !== view.location.origin) return;
                }

                if (frame.contentDocument) installTransition(frame.contentDocument);
            };

            frame.addEventListener('load', installInFrame);
            installInFrame();
        }
    }

    function addSiteAd(targetDocument) {
        if (!targetDocument.body
            || targetDocument.body.classList.contains('home-page')
            || targetDocument.querySelector(`[data-site-ad-key="${siteAdKey}"]`)
            || targetDocument.getElementById('game-overlay-ad')) {
            return;
        }

        const transitionScript = targetDocument.getElementById('page-transition-script');
        const sourceUrl = transitionScript && transitionScript.src
            ? transitionScript.src
            : pageTransitionScriptUrl;
        if (!sourceUrl) {
            console.error('Unable to locate the shared page script for the site ad.');
            return;
        }

        const adLoader = targetDocument.createElement('script');
        adLoader.async = true;
        adLoader.src = new URL('game-overlay-ad.js', sourceUrl).href;
        targetDocument.body.appendChild(adLoader);
    }

    function installStyles(targetDocument) {
        if (targetDocument.getElementById(styleId)) return;

        const style = targetDocument.createElement('style');
        style.id = styleId;
        style.textContent = `
            .snow-background-gif {
                position: fixed;
                z-index: 0;
                top: 0;
                width: 50vw;
                height: 100vh;
                object-fit: cover;
                opacity: 0.65;
                filter: grayscale(1) brightness(1.3) contrast(1.25);
                pointer-events: none;
                user-select: none;
            }

            .snow-background-gif--left {
                left: 0;
            }

            .snow-background-gif--right {
                right: 0;
            }

            .floating-face {
                position: fixed;
                z-index: 0;
                width: ${faceSize}px;
                height: ${faceSize}px;
                object-fit: contain;
                cursor: pointer;
            }

            html.page-transition-leaving body > :not(script):not(style):not(.floating-face):not(.background-particle):not(.snow-background-gif):not(.christmas-lights):not(.menu-face):not(.menu-particle) {
                animation: page-transition-leave ${leaveDuration}ms ease forwards;
                pointer-events: none !important;
            }

            html.page-transition-entering body > :not(script):not(style):not(.floating-face):not(.background-particle):not(.snow-background-gif):not(.christmas-lights):not(.menu-face):not(.menu-particle):not(.overlay-sidebar) {
                animation: page-transition-enter ${enterDuration}ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
            }

            .page-transition-sidebar-entering .overlay-panel a,
            .page-transition-sidebar-entering .overlay-settings-link,
            .page-transition-sidebar-entering .overlay-settings {
                animation: page-transition-enter ${enterDuration}ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
            }

            @keyframes page-transition-leave {
                to {
                    opacity: 0;
                    transform: translate3d(0, -12px, 0);
                }
            }

            @keyframes page-transition-enter {
                from {
                    opacity: 0;
                    transform: translate3d(0, 48px, 0);
                }
                to {
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
            }

        `;
        (targetDocument.head || targetDocument.documentElement).appendChild(style);
    }

    function animateIncomingSidebar(targetDocument) {
        const view = targetDocument.defaultView;
        const animateSidebar = () => {
            const sidebar = targetDocument.querySelector('.overlay-sidebar');
            if (!sidebar) return false;
            sidebar.classList.add('page-transition-sidebar-entering');
            view.setTimeout(() => {
                sidebar.classList.remove('page-transition-sidebar-entering');
            }, enterDuration);
            return true;
        };

        if (animateSidebar()) return;

        const observer = new view.MutationObserver(() => {
            if (!animateSidebar()) return;
            observer.disconnect();
        });
        observer.observe(targetDocument.body, { childList: true, subtree: true });
        view.addEventListener('load', () => observer.disconnect(), { once: true });
    }

    function getDestinationWindow(link, currentWindow) {
        const target = link.target.toLowerCase();
        if (!target || target === '_self') return currentWindow;
        if (target === '_parent') return currentWindow.parent;
        if (target === '_top') return currentWindow.top;
        return null;
    }

    function resolveDestination(destination, destinationWindow) {
        const redirectsToWiiMenu = destination.pathname.endsWith('/index.html')
            || destination.pathname.endsWith('/');
        const hasIndexOverride = destination.searchParams.get('menuPreview') === 'original'
            || destination.searchParams.get('openSettings') === '1'
            || destination.searchParams.get('chooseMenu') === '1';

        if (redirectsToWiiMenu && !hasIndexOverride) {
            try {
                if (destinationWindow.localStorage.getItem('preferredSiteMenu') === 'wii') {
                    return new URL('wiimenu.html', destination);
                }
            } catch (error) {
                console.error('Unable to check the preferred home page for navigation.', error);
            }
        }
        return destination;
    }

    function captureBackground(sourceDocument, destination, destinationWindow) {
        const view = sourceDocument.defaultView;
        const background = sourceDocument.body.classList.contains('home-page')
            ? captureMainMenuBackground(sourceDocument, view)
            : getMainMenuBackground(destinationWindow);

        if (sourceDocument.body.classList.contains('home-page')) {
            storeMainMenuBackground(sourceDocument);
        }

        return {
            destination,
            context: destinationWindow === destinationWindow.top ? 'top' : 'frame',
            createdAt: Date.now(),
            rootBackground: background.rootBackground,
            bodyBackground: background.bodyBackground,
            floatingFaces: captureFloatingFaces(sourceDocument)
        };
    }

    function captureFloatingFaces(sourceDocument) {
        return Array.from(sourceDocument.querySelectorAll('.floating-face'))
            .map(face => ({
                x: Number.parseFloat(face.style.left),
                y: Number.parseFloat(face.style.top),
                vx: Number(face.dataset.velocityX),
                vy: Number(face.dataset.velocityY)
            }))
            .filter(face => [face.x, face.y, face.vx, face.vy].every(Number.isFinite));
    }

    function getAdvancedFloatingFaces(incomingState, view) {
        if (!incomingState || !Array.isArray(incomingState.floatingFaces)) return [];

        const states = incomingState.floatingFaces
            .filter(face => face && [face.x, face.y, face.vx, face.vy].every(Number.isFinite))
            .map(face => ({ x: face.x, y: face.y, vx: face.vx, vy: face.vy }));
        const elapsedFrames = Math.min(
            1800,
            Math.max(0, Math.floor((Date.now() - incomingState.createdAt) / frameDuration))
        );
        for (let frame = 0; frame < elapsedFrames; frame += 1) {
            states.forEach(state => advanceFloatingFace(state, view.innerWidth, view.innerHeight));
        }
        return states;
    }

    function addAmbientBackground(targetDocument, incomingState) {
        const view = targetDocument.defaultView;
        ['left', 'right'].forEach(side => {
            const snow = targetDocument.createElement('img');
            snow.className = `snow-background-gif snow-background-gif--${side}`;
            snow.src = 'images/snow.gif';
            snow.alt = '';
            snow.setAttribute('aria-hidden', 'true');
            targetDocument.body.appendChild(snow);
        });

        const savedFaces = getAdvancedFloatingFaces(incomingState, view);
        const states = [];
        for (let index = 0; index < faceCount; index += 1) {
            const savedFace = savedFaces[index];
            const state = savedFace
                && [savedFace.x, savedFace.y, savedFace.vx, savedFace.vy].every(Number.isFinite)
                ? { x: savedFace.x, y: savedFace.y, vx: savedFace.vx, vy: savedFace.vy }
                : {
                    x: 8 + ((index * 17) % 84) * view.innerWidth / 100,
                    y: 12 + ((index * 23) % 74) * view.innerHeight / 100,
                    vx: (Math.random() - 0.5) * 2.5,
                    vy: (Math.random() - 0.5) * 2.5
                };
            const face = targetDocument.createElement('img');
            face.className = 'floating-face';
            face.src = 'images/santa-face.png';
            face.alt = '';
            face.setAttribute('aria-hidden', 'true');
            state.element = face;
            states.push(state);
            face.addEventListener('click', () => {
                state.vx = (Math.random() - 0.5) * 12;
                state.vy = -7 - Math.random() * 5;
            });
            targetDocument.body.appendChild(face);
        }

        states.forEach(state => renderFloatingFace(state));

        const moveFaces = () => {
            states.forEach(state => {
                advanceFloatingFace(state, view.innerWidth, view.innerHeight);
                renderFloatingFace(state);
            });
            view.requestAnimationFrame(moveFaces);
        };
        view.requestAnimationFrame(moveFaces);
    }

    function advanceFloatingFace(state, width, height) {
        state.x += state.vx;
        state.y += state.vy;
        state.vy += 0.08;

        if (state.x <= 0 || state.x >= width - faceSize) {
            state.x = Math.max(0, Math.min(state.x, width - faceSize));
            state.vx *= -1;
        }
        if (state.y <= 0 || state.y >= height - faceSize) {
            state.y = Math.max(0, Math.min(state.y, height - faceSize));
            state.vy *= -0.9;
        }
    }

    function renderFloatingFace(state) {
        state.element.style.left = `${state.x}px`;
        state.element.style.top = `${state.y}px`;
        state.element.dataset.velocityX = String(state.vx);
        state.element.dataset.velocityY = String(state.vy);
    }

    function captureMainMenuBackground(sourceDocument, view) {
        return {
            rootBackground: getBackgroundStyle(sourceDocument.documentElement, view),
            bodyBackground: getBackgroundStyle(sourceDocument.body, view)
        };
    }

    function storeMainMenuBackground(sourceDocument) {
        const view = sourceDocument.defaultView;
        try {
            const background = captureMainMenuBackground(sourceDocument, view);
            view.localStorage.setItem(mainBackgroundKey, JSON.stringify(background));
        } catch (error) {
            console.error('Unable to save the main menu background.', error);
        }
    }

    function getMainMenuBackground(view) {
        let savedBackground;
        try {
            savedBackground = view.localStorage.getItem(mainBackgroundKey);
            if (savedBackground) {
                const background = JSON.parse(savedBackground);
                if (background.rootBackground && background.bodyBackground) return background;
            }
        } catch (error) {
            console.error('Unable to load the main menu background.', error);
        }

        let savedImage;
        try {
            savedImage = view.localStorage.getItem('homeBackground');
        } catch (error) {
            console.error('Unable to read the saved main menu image.', error);
        }
        return {
            rootBackground: {
                'background-color': 'rgb(24, 21, 21)',
                'background-image': 'none',
                'background-position': '0% 0%',
                'background-size': 'auto',
                'background-repeat': 'repeat',
                'background-attachment': 'scroll',
                'background-origin': 'padding-box',
                'background-clip': 'border-box',
                'background-blend-mode': 'normal'
            },
            bodyBackground: {
                'background-color': 'rgb(8, 127, 61)',
                'background-image': savedImage
                    ? { localStorageKey: 'homeBackground' }
                    : 'linear-gradient(135deg, rgb(166, 0, 33) 0%, rgb(212, 20, 50) 48%, rgb(8, 127, 61) 100%)',
                'background-position': '50% 50%',
                'background-size': 'cover',
                'background-repeat': 'no-repeat',
                'background-attachment': 'scroll',
                'background-origin': 'padding-box',
                'background-clip': 'border-box',
                'background-blend-mode': 'normal'
            }
        };
    }

    function getBackgroundStyle(element, view) {
        const computedStyle = view.getComputedStyle(element);
        const properties = {};
        backgroundProperties.forEach(property => {
            properties[property] = computedStyle.getPropertyValue(property);
        });

        const storedBackground = view.localStorage.getItem('homeBackground');
        if (storedBackground && properties['background-image'].includes(storedBackground)) {
            properties['background-image'] = { localStorageKey: 'homeBackground' };
        }
        return properties;
    }

    function getIncomingState(targetDocument) {
        const view = targetDocument.defaultView;
        let serializedState;
        let storage;
        try {
            storage = view.sessionStorage;
            serializedState = storage.getItem(stateKey);
        } catch (error) {
            console.error('Unable to read the page transition background.', error);
            return null;
        }
        if (!serializedState) return null;

        let state;
        try {
            state = JSON.parse(serializedState);
        } catch (error) {
            console.error('Unable to parse the page transition background.', error);
            clearIncomingState(storage);
            return null;
        }

        if (!state || typeof state.createdAt !== 'number' || typeof state.destination !== 'string') {
            clearIncomingState(storage);
            return null;
        }
        if (Date.now() - state.createdAt > 30000) {
            clearIncomingState(storage);
            return null;
        }

        let currentUrl;
        let destinationUrl;
        try {
            currentUrl = new URL(view.location.href);
            destinationUrl = new URL(state.destination);
        } catch (error) {
            console.error('Unable to match the page transition destination.', error);
            clearIncomingState(storage);
            return null;
        }

        const isTopContext = view === view.top;
        if (state.context !== (isTopContext ? 'top' : 'frame')
            || currentUrl.origin !== destinationUrl.origin
            || currentUrl.pathname !== destinationUrl.pathname
            || currentUrl.search !== destinationUrl.search) {
            return null;
        }
        return state;
    }

    function prepaintIncomingBackground(targetDocument) {
        if (targetDocument.body) return;
        const state = getIncomingState(targetDocument);
        if (!state && isMainMenuDocument(targetDocument)) return;

        const view = targetDocument.defaultView;
        const background = state || getMainMenuBackground(view);
        applyBackgroundStyle(targetDocument.documentElement, background.rootBackground, view);

        const style = targetDocument.createElement('style');
        style.id = 'page-transition-prepaint-style';
        style.textContent = 'body {}';
        targetDocument.head.appendChild(style);
        const bodyRule = style.sheet.cssRules[0].style;
        Object.entries(background.bodyBackground).forEach(([property, value]) => {
            bodyRule.setProperty(property, resolveBackgroundValue(value, view), 'important');
        });
    }

    function isMainMenuDocument(targetDocument) {
        const path = new URL(targetDocument.defaultView.location.href).pathname;
        return path.endsWith('/index.html') || path.endsWith('/');
    }

    function clearIncomingState(storage) {
        try {
            storage.removeItem(stateKey);
        } catch (error) {
            console.error('Unable to clear the page transition background.', error);
        }
    }

    function restoreIncomingBackground(targetDocument) {
        const state = getIncomingState(targetDocument);
        if (!state) return null;

        const view = targetDocument.defaultView;
        clearIncomingState(view.sessionStorage);
        if (targetDocument.body.classList.contains('home-page')) {
            view.__incomingFloatingFaces = getAdvancedFloatingFaces(state, view);
        }
        applyMainMenuBackground(targetDocument, state);

        targetDocument.documentElement.classList.add('page-transition-entering');
        view.setTimeout(() => {
            targetDocument.documentElement.classList.remove('page-transition-entering');
        }, enterDuration);
        return state;
    }

    function applyMainMenuBackground(targetDocument, background) {
        const view = targetDocument.defaultView;
        applyBackgroundStyle(targetDocument.documentElement, background.rootBackground, view);
        applyBackgroundStyle(targetDocument.body, background.bodyBackground, view);
        const prepaintStyle = targetDocument.getElementById('page-transition-prepaint-style');
        if (prepaintStyle) prepaintStyle.remove();
        targetDocument.querySelectorAll(backgroundSelector).forEach(element => element.remove());
    }

    function applyBackgroundStyle(element, properties, view) {
        Object.entries(properties).forEach(([property, value]) => {
            element.style.setProperty(property, resolveBackgroundValue(value, view), 'important');
        });
    }

    function resolveBackgroundValue(value, view) {
        if (value && typeof value === 'object' && value.localStorageKey) {
            const storedBackground = view.localStorage.getItem(value.localStorageKey);
            return storedBackground ? `url("${storedBackground}")` : 'none';
        }
        return value;
    }

    prepaintIncomingBackground(document);
    if (document.body) {
        installTransition(document);
    } else {
        const bodyObserver = new MutationObserver(() => {
            if (!document.body) return;
            bodyObserver.disconnect();
            installTransition(document);
        });
        bodyObserver.observe(document.documentElement, { childList: true });
        document.addEventListener('DOMContentLoaded', () => {
            bodyObserver.disconnect();
            installTransition(document);
        }, { once: true });
    }
})();
