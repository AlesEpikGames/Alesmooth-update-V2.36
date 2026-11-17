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
    const savedTabCloak = localStorage.getItem('homeTabCloak');
    const tabCloak = tabCloaks[savedTabCloak];

    if (tabCloak) {
        const applyTabCloak = () => {
            if (document.title !== tabCloak.title) {
                document.title = tabCloak.title;
            }

            let favicon = document.querySelector('link[rel~="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            if (favicon.href !== tabCloak.icon) {
                favicon.href = tabCloak.icon;
            }
        };

        applyTabCloak();
        new MutationObserver(applyTabCloak).observe(document, {
            attributes: true,
            attributeFilter: ['href'],
            characterData: true,
            childList: true,
            subtree: true
        });
    }

    if (!document.getElementById('page-transition-script')) {
        const pageTransitionScript = document.createElement('script');
        pageTransitionScript.id = 'page-transition-script';
        pageTransitionScript.src = new URL('page-transition.js', document.currentScript.src).href;
        document.body.appendChild(pageTransitionScript);
    }

    const siteAdKey = '1f9a4048f68ce606e74de610934b9873';

    const addAd = () => {
        if (!document.body
            || document.getElementById('game-overlay-ad')
            || document.querySelector(`[data-site-ad-key="${siteAdKey}"]`)) {
            return;
        }

        const adSlot = document.createElement('aside');
        adSlot.id = 'game-overlay-ad';
        adSlot.dataset.siteAdKey = siteAdKey;
        adSlot.setAttribute('aria-label', 'Advertisement');
        adSlot.style.cssText = [
            'position:fixed',
            'top:8px',
            'right:8px',
            'z-index:2147483647',
            'width:min(468px,calc(100vw - 16px))',
            'height:60px',
            'overflow:hidden',
            'outline:3px solid #ff3b30',
            'outline-offset:2px'
        ].join(';');
        document.body.appendChild(adSlot);

        const hadAtOptions = Object.prototype.hasOwnProperty.call(window, 'atOptions');
        const previousAtOptions = window.atOptions;
        window.atOptions = {
            key: siteAdKey,
            format: 'iframe',
            height: 60,
            width: 468,
            params: {}
        };

        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = `https://bauval.org/22/${siteAdKey}`;
        const restoreAtOptions = () => {
            if (window.atOptions && window.atOptions.key === siteAdKey) {
                if (hadAtOptions) {
                    window.atOptions = previousAtOptions;
                } else {
                    delete window.atOptions;
                }
            }
        };
        adScript.addEventListener('load', restoreAtOptions, { once: true });
        adScript.addEventListener('error', restoreAtOptions, { once: true });
        adSlot.appendChild(adScript);

        const updateAdVisibility = () => {
            adSlot.hidden = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
        };
        document.addEventListener('fullscreenchange', updateAdVisibility);
        document.addEventListener('webkitfullscreenchange', updateAdVisibility);
        updateAdVisibility();
    };

    if (document.body) {
        addAd();
    } else {
        document.addEventListener('DOMContentLoaded', addAd, { once: true });
    }
})();
