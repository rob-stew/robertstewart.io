(function () {
    var sections = document.querySelectorAll('.section');

    if (!window.gsap || sections.length === 0) return;

    // no scroll effects on mobile; matches the 820px CSS breakpoint
    if (window.matchMedia('(max-width: 820px)').matches) return;

    var INK = '#111111';
    var FAINT = '#e4e4e1';
    var MEDIA_MIN = 0.06;

    gsap.registerPlugin(ScrollTrigger);

    var lenis = new Lenis({ lerp: 0.12 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // split each paragraph into word/char spans
    document.querySelectorAll('[data-fill] p').forEach(function (p) {
        var words = p.textContent.split(/\s+/).filter(Boolean);
        p.textContent = '';
        words.forEach(function (word, i) {
            var w = document.createElement('span');
            w.className = 'word';
            for (var c = 0; c < word.length; c++) {
                var ch = document.createElement('span');
                ch.className = 'char';
                ch.textContent = word[c];
                w.appendChild(ch);
            }
            p.appendChild(w);
            if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
        });
    });

    sections.forEach(function (section) {
        var media = section.querySelector('.section-media');

        // group words into visual lines by vertical position, across paragraphs
        var lines = [];
        section.querySelectorAll('[data-fill] p').forEach(function (p) {
            var lastTop = null;
            p.querySelectorAll('.word').forEach(function (w) {
                var top = w.offsetTop;
                if (lastTop === null || Math.abs(top - lastTop) > 4) {
                    lines.push([]);
                    lastTop = top;
                }
                lines[lines.length - 1].push(w);
            });
        });

        var lineChars = lines.map(function (lineWords) {
            var chars = [];
            lineWords.forEach(function (w) {
                chars.push.apply(chars, w.querySelectorAll('.char'));
            });
            return chars;
        });

        lineChars.forEach(function (chars) { gsap.set(chars, { color: FAINT }); });
        if (media) gsap.set(media, { opacity: MEDIA_MIN });

        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'center bottom',
                end: 'center top',
                scrub: 0.3
            }
        });

        // fill in, line by line from the top
        lineChars.forEach(function (chars) {
            tl.to(chars, { color: INK, ease: 'none', duration: 0.2, stagger: 0.012 });
        });

        var fillDur = tl.duration();
        if (media) tl.to(media, { opacity: 1, ease: 'none', duration: fillDur }, 0);

        // hold at full render around the middle of the screen
        tl.to({}, { duration: fillDur * 0.4 });

        // fade back out the same way while scrolling away
        var outStart = tl.duration();
        lineChars.forEach(function (chars) {
            tl.to(chars, { color: FAINT, ease: 'none', duration: 0.2, stagger: 0.012 });
        });
        if (media) tl.to(media, { opacity: MEDIA_MIN, ease: 'none', duration: fillDur }, outStart);
    });
})();
