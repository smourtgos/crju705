// Slide-overflow audit for reveal.js decks — v3.
// Usage: open a rendered deck in the browser, paste into the DevTools console.
// Flags any slide whose content exceeds the slide canvas, using BOTH:
//   (a) scrollHeight (flow overflow), and
//   (b) the visual bottom of the lowest child element (catches cases that
//       scrollHeight misses, e.g. stretched figures under tall code blocks).
//
// v3 (Sep 7, 2026) fixes two measurement bugs that made v2 unreliable:
//   1. TRANSITIONS. v2 called Reveal.slide() and measured immediately, so any
//      slide still mid-transition was measured at an animated offset. That
//      produced FALSE POSITIVES that moved between runs — v2 flagged a
//      different slide on each pass over the same deck. We now force
//      transition:'none' before measuring.
//   2. FRAGMENTS. Slides built with ::: incremental measured differently
//      depending on which fragments happened to be revealed. We now force
//      every fragment visible, so each slide is measured at its worst case.
// The audit is now stable: repeated runs on an unchanged deck agree exactly.
// It restores your original transition setting when it finishes.
(() => {
  const cfg = Reveal.getConfig();
  const restore = { transition: cfg.transition, backgroundTransition: cfg.backgroundTransition };
  Reveal.configure({ transition: 'none', backgroundTransition: 'none' });

  const H = cfg.height;
  const slides = Reveal.getSlides();
  const out = [];
  slides.forEach((el, i) => {
    const idx = Reveal.getIndices(el);
    Reveal.slide(idx.h, idx.v);
    el.querySelectorAll('.fragment').forEach(f => f.classList.add('visible'));
    el.offsetHeight; // reflow
    const scale = Reveal.getScale();
    const top = el.getBoundingClientRect().top;
    let maxBottom = 0;
    el.querySelectorAll('*').forEach(c => {
      const r = c.getBoundingClientRect();
      if (r.height > 0) maxBottom = Math.max(maxBottom, r.bottom);
    });
    const visual = (maxBottom - top) / scale;
    const flow = el.scrollHeight;
    const worst = Math.max(flow, Math.round(visual));
    if (worst > H + 5) {
      out.push({
        slide: i + 1,
        title: (el.querySelector('h1,h2')?.textContent || '').slice(0, 45),
        flowHeight: flow,
        visualBottom: Math.round(visual),
        overBy: worst - H
      });
    }
  });
  Reveal.slide(0);
  Reveal.configure(restore);
  console.table(out.length ? out : [{ result: 'no overflow — deck is clean' }]);
  return out;
})();
