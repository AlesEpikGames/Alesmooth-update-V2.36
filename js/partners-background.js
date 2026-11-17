(() => {
    const savedBackground = localStorage.getItem('homeBackground');
    if (savedBackground) {
        document.body.style.backgroundImage = `url("${savedBackground}")`;
    }
})();