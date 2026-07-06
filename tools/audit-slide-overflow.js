// Slide-overflow audit for reveal.js decks.
// Usage: open a rendered deck in the browser, paste this into the DevTools
// console. Lists every slide whose content is taller than the 700px canvas
// (i.e., would be visually cut off at the bottom).
(() => {
  const slides = Reveal.getSlides();
  const H = Reveal.getConfig().height;
  const out = [];
  slides.forEach((el, i) => {
    const idx = Reveal.getIndices(el);
    Reveal.slide(idx.h, idx.v);
    el.offsetHeight; // force reflow
    if (el.scrollHeight > H + 5) {
      out.push({
        slide: i + 1,
        title: (el.querySelector('h1,h2')?.textContent || '').slice(0, 50),
        contentHeight: el.scrollHeight,
        overBy: el.scrollHeight - H
      });
    }
  });
  Reveal.slide(0);
  console.table(out.length ? out : [{ result: 'no overflow — deck is clean' }]);
  return out;
})();
