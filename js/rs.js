(function () {
    if (!window.fetch || navigator.webdriver) return;
    fetch('https://rs-beacon.robertstewartmn.workers.dev/hit', {
        method: 'POST',
        body: JSON.stringify({ p: location.pathname, r: document.referrer || '' }),
        keepalive: true,
        mode: 'no-cors'
    }).catch(function () {});
})();
