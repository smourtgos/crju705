// Slide-overflow audit for reveal.js decks — v2.
// Usage: open a rendered deck in the browser, paste into the DevTools console.
// Flags any slide whose content exceeds the slide canvas, using BOTH:
//   (a) scrollHeight (flow overflow), and
//   (b) the visual bottom of the lowest child element (catches cases that
//       scrollHeight misses, e.g. stretched figures under tall code blocks).
(() => {
  const H = Reveal.getConfig().height;
  const slides = Reveal.getSlides();
  const out = [];
  slides.forEach((el, i) => {
    const idx = Reveal.getIndices(el);
    Reveal.slide(idx.h, idx.v);
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
  console.table(out.length ? out : [{ result: 'no overflow — deck is clean' }]);
  return out;
})();
