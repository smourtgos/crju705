// gap-explorer.js - CRJU 705 teaching widget (Sep 28, 2026)
// Four ways to see what a two-group test measures and what it means when the
// interval for the difference crosses zero. Each widget is a
// <div class="gap-explorer" data-config="{json}"> written by R, so every
// number (estimates, n, the interval from prop.test() or t.test(), the
// bayes_prop_test() probability) comes from the real output.
//
// Spread: se = (hi - lo) / 3.92, from R's interval. Both prop.test() and
// t.test() intervals are symmetric around the observed gap, so concept 3's
// green stretch is exactly R's interval. Group spreads are rescaled so they
// combine to that same se.
(function () {
  "use strict";
  var COL = { A: "#73000A", B: "#4A76B5", same: "#495057", other: "#D62728",
              ok: "#2E7D32", bad: "#C62828", line: "#ADB5BD", text: "#212529",
              muted: "#6C757D", band: "#4A76B5" };
  var W = 900, H = 400, L = 60, R = 840, AX = 318;
  var uid = 0, FS = 1;   // FS: text multiplier, 1.45 in a reveal.js slide, 1.3 on a web page

  function rn() { var u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function T(x, y, s, o) { o = o || {};
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || "middle") + '" style="font-size:' +
      ((o.sz || 15) * FS).toFixed(1) + 'px;fill:' + (o.c || COL.muted) + ';font-weight:' + (o.w || 400) + '">' + esc(s) + "</text>"; }
  function niceStep(span, n) { var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
  function pctTxt(p) { return p < 0.01 ? "less than 1%" : p > 0.99 ? "more than 99%" : Math.round(100 * p) + "%"; }

  function GapExplorer(root) {
    this.root = root;
    this.cfg = JSON.parse(root.getAttribute("data-config"));
    this.ci = 0;
    this.O = this.cfg.default || 1;
    this.timer = null;
    this.id = "ge" + (uid++);
    this.fs = root.closest(".reveal") ? 1.45 : 1.3;
    this.build();
    this.init();
  }

  GapExplorer.prototype.cmp = function () {
    var c = this.cfg.comparisons[this.ci];
    if (!c._ready) {
      c.se = (c.hi - c.lo) / 3.92;
      var k = c.se / Math.sqrt(c.sa0 * c.sa0 + c.sb0 * c.sb0);
      c.sa = c.sa0 * k; c.sb = c.sb0 * k;
      var lo = Math.min(c.lo, 0, c.obs - 4.2 * c.se), hi = Math.max(c.hi, 0, c.obs + 4.2 * c.se), pad = 0.06 * (hi - lo);
      c.xlo = lo - pad; c.xhi = hi + pad;
      c.dollars = c.unit === "dollars";
      c._ready = true;
    }
    return c;
  };

  GapExplorer.prototype.fmtGap = function (g) { var c = this.cmp();
    if (c.dollars) return (g < 0 ? "-" : "+") + "$" + Math.round(Math.abs(g)).toLocaleString("en-US");
    return (g > 0 ? "+" : "") + g.toFixed(1); };
  GapExplorer.prototype.fmtVal = function (v) { var c = this.cmp();
    return c.dollars ? "$" + Math.round(v).toLocaleString("en-US") : v.toFixed(1) + "%"; };
  GapExplorer.prototype.unitWord = function () { return this.cmp().dollars ? "" : " points"; };
  GapExplorer.prototype.X = function (g) { var c = this.cmp(); return L + (g - c.xlo) / (c.xhi - c.xlo) * (R - L); };

  GapExplorer.prototype.build = function () {
    var self = this, cfg = this.cfg;
    var names = ["1 · Rerun the study", "2 · Arrows between groups", "3 · Is zero plausible?", "4 · More-data dial"];
    var h = '<div class="ge-row">';
    names.forEach(function (n, i) { h += '<button class="ge-btn ge-o" data-o="' + (i + 1) + '">' + n + "</button>"; });
    h += "</div><div class=\"ge-row\">";
    if (cfg.comparisons.length > 1) {
      cfg.comparisons.forEach(function (c, i) { h += '<button class="ge-btn ge-c" data-c="' + i + '">' + esc(c.label) + "</button>"; });
      h += '<span class="ge-sep"></span>';
    }
    h += '<button class="ge-btn ge-play">Play</button><button class="ge-btn ge-step">Step</button>' +
      '<button class="ge-btn ge-reset">Reset</button>' +
      '<span class="ge-dial"><span class="ge-lab">Study size</span><input type="range" min="0" max="100" value="50" class="ge-range">' +
      '<span class="ge-dialv"></span></span></div>' +
      '<svg class="ge-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Animation of the difference between two groups"></svg>' +
      '<div class="ge-cap"></div>';
    this.root.innerHTML = h;
    this.svg = this.root.querySelector(".ge-svg");
    this.cap = this.root.querySelector(".ge-cap");
    this.playBtn = this.root.querySelector(".ge-play");
    this.range = this.root.querySelector(".ge-range");
    this.root.querySelectorAll(".ge-o").forEach(function (b) {
      b.addEventListener("click", function () { self.O = +b.getAttribute("data-o"); self.init(); }); });
    this.root.querySelectorAll(".ge-c").forEach(function (b) {
      b.addEventListener("click", function () { self.ci = +b.getAttribute("data-c"); self.init(); }); });
    this.playBtn.addEventListener("click", function () { self.togglePlay(); });
    this.root.querySelector(".ge-step").addEventListener("click", function () { self.stop(); self.tick(); });
    this.root.querySelector(".ge-reset").addEventListener("click", function () { self.init(); });
    this.range.addEventListener("input", function () { self.draw(); });
  };

  GapExplorer.prototype.init = function () {
    this.stop();
    var c = this.cmp(), O = this.O;
    var st3 = (c.xhi - c.xlo) / 90;   // concept 3 sweep step, aligned so one candidate is exactly 0
    this.S = { gaps: [], arrows: [], first: true, va: c.ea, vb: c.eb, done: [], step3: st3,
               cand: -Math.floor((0 - c.xlo) / st3) * st3 };
    this.range.value = 50;
    var play = O !== 4;
    ["ge-play", "ge-step", "ge-reset"].forEach(function (k) { this.root.querySelector("." + k).style.display = play ? "" : "none"; }, this);
    this.root.querySelector(".ge-dial").style.display = play ? "none" : "inline-flex";
    this.root.querySelectorAll(".ge-o").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-o") === O); });
    var ci = this.ci;
    this.root.querySelectorAll(".ge-c").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-c") === ci); });
    this.draw();
  };

  GapExplorer.prototype.stop = function () {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.playBtn) this.playBtn.textContent = "Play";
  };
  GapExplorer.prototype.finished = function () {
    var c = this.cmp();
    return (this.O <= 2 && this.S.gaps.length >= 500) || (this.O === 3 && this.S.cand > c.xhi);
  };
  GapExplorer.prototype.togglePlay = function () {
    var self = this;
    if (this.timer) { this.stop(); return; }
    if (this.finished()) this.init();
    this.playBtn.textContent = "Pause";
    var loop = function () {
      if (self.finished()) { self.stop(); return; }
      self.tick();
      var n = self.S.gaps.length, d = self.O === 3 ? 140 : (n < 12 ? 650 : n < 60 ? 90 : 18);
      self.timer = setTimeout(loop, d);
    };
    loop();
  };

  GapExplorer.prototype.tick = function () {
    var c = this.cmp(), S = this.S;
    if (this.O === 1 || this.O === 2) {
      if (S.gaps.length >= 500) return;
      var a = c.ea + c.sa * rn(), b = c.eb + c.sb * rn();
      S.first = false; S.va = a; S.vb = b; S.gaps.push(a - b); S.arrows.push([a, b]);
    } else if (this.O === 3) {
      if (S.cand > c.xhi) return;
      S.done.push(S.cand); S.cand += S.step3;
    }
    this.draw();
  };

  // ---- shared pieces --------------------------------------------------------
  GapExplorer.prototype.numline = function (zy) {
    var c = this.cmp(), self = this, h = "";
    h += '<line x1="' + L + '" x2="' + R + '" y1="' + AX + '" y2="' + AX + '" style="stroke:' + COL.line + ';stroke-width:1.5"/>';
    var st = niceStep(c.xhi - c.xlo, 8);
    for (var g = Math.ceil(c.xlo / st) * st; g <= c.xhi; g += st) {
      var gg = Math.abs(g) < st / 1e6 ? 0 : g;
      var lab = c.dollars ? (gg === 0 ? "$0" : (gg < 0 ? "-" : "+") + "$" + Math.round(Math.abs(gg) / 1000) + "k") : (gg > 0 ? "+" : "") + (+gg.toFixed(2));
      h += '<line x1="' + self.X(gg) + '" x2="' + self.X(gg) + '" y1="' + AX + '" y2="' + (AX + 5) + '" style="stroke:' + COL.line + '"/>' + T(self.X(gg), AX + 20, lab, { sz: 13 });
    }
    h += '<line x1="' + this.X(0) + '" x2="' + this.X(0) + '" y1="' + (zy ? zy + 6 : 60) + '" y2="' + (AX + 6) + '" style="stroke:' + COL.text + ';stroke-width:3"/>';
    var zr = this.X(0) > R - 220;   // zero near the right edge: label goes on its left
    if (zy) h += T(this.X(0) + (zr ? -7 : 7), zy, "0 = no difference", { a: zr ? "end" : "start", c: COL.text, w: 600, sz: 15 });
    h += T(L, AX + 58, "← " + c.left, { a: "start", sz: 15, c: COL.text }) + T(R, AX + 58, c.right + " →", { a: "end", sz: 15, c: COL.text });
    h += T((L + R) / 2, AX + 78, "Gap: " + c.A + " minus " + c.B + (c.dollars ? " (dollars)" : " (percentage points)"), { sz: 13 });
    return h;
  };
  GapExplorer.prototype.pile = function (gaps) {
    var c = this.cmp(), self = this, cnt = {}, h = "", bin = (c.xhi - c.xlo) / 95;
    var big = gaps.length > 150, r = big ? 2.3 : 3.4, dy = big ? 4.6 : 6.8;
    gaps.forEach(function (g, i) {
      var b = Math.round(g / bin); cnt[b] = (cnt[b] || 0) + 1;
      var y = AX - 5 - (cnt[b] - 1) * dy; if (y < 196) return;
      var other = (g < 0) !== (c.obs < 0), last = i === gaps.length - 1;
      h += '<circle cx="' + self.X(b * bin) + '" cy="' + y + '" r="' + (last ? r + 2 : r) + '" style="fill:' + (other ? COL.other : COL.same) + ';opacity:' + (last ? 1 : 0.7) + '"/>';
    });
    return h;
  };
  // After enough reruns, show where the middle 95% of reruns land in the long
  // run (the estimate +/- 1.96 standard errors), which is R's interval exactly.
  // A 500-draw percentile would wobble around it and could land on the wrong
  // side of zero for a close call like Rossi.
  GapExplorer.prototype.band95 = function (gaps) {
    if (gaps.length < 150) return "";
    var c = this.cmp(), lo = c.lo, hi = c.hi;
    this.S.band = [lo, hi];
    return '<rect x="' + this.X(lo) + '" y="' + (AX + 27) + '" width="' + (this.X(hi) - this.X(lo)) + '" height="9" rx="3" style="fill:' + COL.band + ';opacity:.8"/>';
  };
  GapExplorer.prototype.otherTxt = function (gaps) {
    var n = gaps.length, k = Math.round(this.shareOther(gaps) * n);
    return n < 100 ? k + " of " + n : pctTxt(k / n);
  };
  GapExplorer.prototype.shareOther = function (gaps) {
    var c = this.cmp(), o = 0; gaps.forEach(function (g) { if ((g < 0) !== (c.obs < 0)) o++; });
    return gaps.length ? o / gaps.length : 0;
  };

  // ---- concept 1: rerun the study ------------------------------------------
  GapExplorer.prototype.grid = function (x0, y0, rate, col, label) {
    var k = Math.round(rate), h = "";
    for (var i = 0; i < 100; i++) {
      var r = Math.floor(i / 10), cc = i % 10, on = i < k;
      h += '<rect x="' + (x0 + cc * 12) + '" y="' + (y0 + r * 12) + '" width="10" height="10" rx="2" style="fill:' + (on ? col : "none") + ';stroke:' + (on ? col : COL.line) + '"/>';
    }
    return h + T(x0 + 59, y0 + 134, label[0], { c: col, sz: 15, w: 600 }) + T(x0 + 59, y0 + 154, label[1], { c: col, sz: 15 });
  };
  GapExplorer.prototype.draw1 = function () {
    var c = this.cmp(), S = this.S, h = "";
    h += T(W / 2, 18, S.first ? "The study we actually have" : "Rerun #" + S.gaps.length + ": " + c.rerun, { c: COL.text, sz: 17, w: 600 });
    if (c.type === "prop") {
      h += this.grid(230, 24, S.va, COL.A, [c.A, Math.round(S.va) + " of 100 " + c.out]);
      h += this.grid(560, 24, S.vb, COL.B, [c.B, Math.round(S.vb) + " of 100 " + c.out]);
    } else {
      var lo = Math.min(c.ea, c.eb) - 4 * Math.max(c.sa, c.sb), hi = Math.max(c.ea, c.eb) + 4 * Math.max(c.sa, c.sb);
      var P = function (v) { return 160 + (v - lo) / (hi - lo) * 580; };
      h += '<line x1="160" x2="740" y1="120" y2="120" style="stroke:' + COL.line + '"/>';
      var st = niceStep(hi - lo, 6);
      for (var v = Math.ceil(lo / st) * st; v <= hi; v += st) h += T(P(v), 138, "$" + Math.round(v / 1000) + "k", { sz: 13 });
      [[S.va, COL.A, c.A], [S.vb, COL.B, c.B]].forEach(function (t, i) {
        h += '<circle cx="' + P(t[0]) + '" cy="120" r="9" style="fill:' + t[1] + '"/>' +
          T(P(t[0]), i === 0 ? 100 : 160, t[2] + " average: $" + Math.round(t[0]).toLocaleString("en-US"), { c: t[1], sz: 15, w: 600 });
      });
      h += '<line x1="' + P(S.vb) + '" x2="' + P(S.va) + '" y1="62" y2="62" style="stroke:' + COL.text + ';stroke-width:2" marker-end="url(#' + this.id + 'ah)"/>' +
        T((P(S.va) + P(S.vb)) / 2, 54, "gap " + this.fmtGap(S.va - S.vb), { c: COL.text, sz: 14 });
    }
    h += this.pile(S.gaps) + this.numline(204) + this.band95(S.gaps);
    var cap;
    if (S.first) cap = "Our data: " + c.A + " " + this.fmtVal(c.ea) + " vs " + c.B + " " + this.fmtVal(c.eb) + ", a gap of " + this.fmtGap(c.obs) + this.unitWord() + ". Press Play to rerun it, again and again.";
    else {
      cap = S.gaps.length + " reruns: <b style=\"color:" + (this.shareOther(S.gaps) > 0 ? COL.other : COL.same) + "\">" + this.otherTxt(S.gaps) + " landed on the other side of zero.</b>";
      if (S.band) cap += " Blue bar: where the middle 95% of reruns land in the long run, " + this.fmtGap(S.band[0]) + " to " + this.fmtGap(S.band[1]) + ". That is R's 95% interval.";
    }
    return [h, cap];
  };

  // ---- concept 2: arrows between the groups --------------------------------
  GapExplorer.prototype.draw2 = function () {
    var c = this.cmp(), S = this.S, self = this, h = "";
    var lo = Math.min(c.ea, c.eb) - 4 * Math.max(c.sa, c.sb), hi = Math.max(c.ea, c.eb) + 4 * Math.max(c.sa, c.sb);
    var P = function (v) { return L + (v - lo) / (hi - lo) * (R - L); }, base = 150;
    h += T(W / 2, 18, c.dollars ? "Where each group's true average could be" : "Where each group's true rate could be", { c: COL.text, sz: 17, w: 600 });
    [[c.ea, c.sa, COL.A, c.A], [c.eb, c.sb, COL.B, c.B]].forEach(function (t) {
      var d = "", step = (hi - lo) / 300;
      for (var v = lo; v <= hi; v += step) { var y = base - 95 * Math.exp(-0.5 * Math.pow((v - t[0]) / t[1], 2)); d += (d ? "L" : "M") + P(v).toFixed(1) + "," + y.toFixed(1); }
      h += '<path d="' + d + '" style="fill:none;stroke:' + t[2] + ';stroke-width:2.5"/>' + T(P(t[0]), base - 102, t[3], { c: t[2], sz: 15, w: 600 });
    });
    h += '<line x1="' + L + '" x2="' + R + '" y1="' + base + '" y2="' + base + '" style="stroke:' + COL.line + '"/>';
    var st = niceStep(hi - lo, 8);
    for (var v = Math.ceil(lo / st) * st; v <= hi; v += st) h += T(P(v), base + 16, c.dollars ? "$" + Math.round(v / 1000) + "k" : (+v.toFixed(2)) + "%", { sz: 13 });
    var recent = S.arrows.slice(-10);
    recent.forEach(function (ab, i) {
      var last = i === recent.length - 1, other = (ab[0] - ab[1] < 0) !== (c.obs < 0), y = base - 8 - (recent.length - 1 - i) * 7;
      if (last) h += '<circle cx="' + P(ab[0]) + '" cy="' + y + '" r="5" style="fill:' + COL.A + '"/><circle cx="' + P(ab[1]) + '" cy="' + y + '" r="5" style="fill:' + COL.B + '"/>';
      h += '<line x1="' + P(ab[1]) + '" x2="' + P(ab[0]) + '" y1="' + y + '" y2="' + y + '" style="stroke:' + (other ? COL.other : COL.text) + ';stroke-width:' + (last ? 3 : 1.5) + ';opacity:' + (last ? 1 : 0.35) + '" marker-end="url(#' + self.id + 'ah)"/>';
    });
    h += this.pile(S.gaps) + this.numline(200);
    var cap;
    if (!S.gaps.length) cap = "Each curve is where that group's true " + (c.dollars ? "average" : "rate") + " could be. Press Play: pick one plausible value from each curve and draw the arrow from " + c.B + " to " + c.A + ". The arrow is the gap.";
    else {
      cap = S.gaps.length + " arrows: <b style=\"color:" + (this.shareOther(S.gaps) > 0 ? COL.other : COL.same) + "\">" + this.otherTxt(S.gaps) + " point the other way</b> (they cross zero).";
      if (c.prob_other !== null && c.prob_other !== undefined) cap += " bayes_prop_test() put it at " + pctTxt(c.prob_other) + ".";
    }
    return [h, cap];
  };

  // ---- concept 3: is zero a plausible truth? -------------------------------
  GapExplorer.prototype.draw3 = function () {
    var c = this.cmp(), S = this.S, self = this, h = "", se = c.se;
    var cand = Math.min(S.cand, c.xhi), started = S.done.length > 0;
    if (started) {
      var d = "", step = (c.xhi - c.xlo) / 300, base = 205;
      for (var g = c.xlo; g <= c.xhi; g += step) { var y = base - 120 * Math.exp(-0.5 * Math.pow((g - cand) / se, 2)); d += (d ? "L" : "M") + this.X(g).toFixed(1) + "," + y.toFixed(1); }
      var ord = Math.abs(c.obs - cand) <= 1.96 * se;
      h += T(W / 2, 18, "Suppose the true gap were " + this.fmtGap(cand) + this.unitWord(), { c: COL.text, sz: 17, w: 600 });
      h += '<rect x="' + this.X(cand - 1.96 * se) + '" y="80" width="' + (this.X(cand + 1.96 * se) - this.X(cand - 1.96 * se)) + '" height="125" style="fill:' + COL.line + ';opacity:.25"/>';
      h += '<path d="' + d + '" style="fill:none;stroke:' + COL.same + ';stroke-width:2"/>' + T(Math.min(R - 190, Math.max(L + 190, this.X(cand))), 72, "studies like ours would usually land in the gray", { sz: 13 });
      h += '<line x1="' + this.X(c.obs) + '" x2="' + this.X(c.obs) + '" y1="80" y2="205" style="stroke:' + COL.A + ';stroke-width:3.5"/>' + T(this.X(c.obs), 225, "our result: " + this.fmtGap(c.obs), { c: COL.A, sz: 15, w: 600 });
      h += T(W / 2, 44, ord ? "Our result would be ordinary: this truth is plausible" : "Our result would be surprising: this truth is ruled out", { c: ord ? COL.ok : COL.bad, sz: 16, w: 600 });
    } else {
      h += T(W / 2, 18, "Which true gaps fit our data?", { c: COL.text, sz: 17, w: 600 });
      h += '<line x1="' + this.X(c.obs) + '" x2="' + this.X(c.obs) + '" y1="80" y2="205" style="stroke:' + COL.A + ';stroke-width:3.5"/>' + T(this.X(c.obs), 225, "our result: " + this.fmtGap(c.obs), { c: COL.A, sz: 15, w: 600 });
    }
    var w = (R - L) / 90 + 0.6;
    S.done.forEach(function (g) {
      var o = Math.abs(c.obs - g) <= 1.96 * se, z = Math.abs(g) < S.step3 / 2;
      h += '<rect x="' + (self.X(g) - w / 2) + '" y="262" width="' + w + '" height="26" style="fill:' + (o ? COL.ok : COL.bad) + ';opacity:' + (z ? 1 : 0.55) + (z ? ';stroke:' + COL.text + ';stroke-width:2.5' : '') + '"/>';
    });
    h += T(L, 254, "Each possible true gap, checked:", { a: "start", sz: 13 });
    h += this.numline(null);
    var zr3 = this.X(0) > R - 220;
    h += T(this.X(0) + (zr3 ? -7 : 7), 248, "0 = no difference", { a: zr3 ? "end" : "start", c: COL.text, sz: 15, w: 600 });
    var zeroDone = S.done.length && S.done[S.done.length - 1] >= -S.step3 / 2, zOk = Math.abs(c.obs) <= 1.96 * se, cap;
    if (!started) cap = "Press Play to sweep across possible truths. At each one: if that were the true gap, would a result like ours be ordinary (green) or surprising (red)? Watch what happens at zero.";
    else if (!zeroDone) cap = "Green so far = true gaps our data cannot rule out. Keep going until the sweep reaches zero.";
    else cap = (zOk ? "<b style=\"color:" + COL.ok + "\">Zero is green.</b> \"No difference\" is still a plausible truth, so the interval crosses zero and we fail to reject."
      : "<b style=\"color:" + COL.bad + "\">Zero is red.</b> If there were no difference, a result like ours would be surprising, so \"no difference\" is ruled out.") +
      " The green stretch is the 95% interval: " + this.fmtGap(c.lo) + " to " + this.fmtGap(c.hi) + ".";
    return [h, cap];
  };

  // ---- concept 4: the more-data dial ---------------------------------------
  GapExplorer.prototype.draw4 = function () {
    var c = this.cmp(), h = "", v = +this.range.value, f = Math.pow(4, (v - 50) / 50), se = c.se / Math.sqrt(f);
    var na = Math.round(c.na * f), nb = Math.round(c.nb * f);
    this.root.querySelector(".ge-dialv").textContent = Math.round(f * 100) + "% of our data (" + na.toLocaleString("en-US") + " + " + nb.toLocaleString("en-US") + " " + c.unit_group + ")";
    var peak = 230 * Math.sqrt(f / 4), d = "", step = (c.xhi - c.xlo) / 300;
    for (var g = c.xlo; g <= c.xhi; g += step) { var y = AX - 4 - peak * Math.exp(-0.5 * Math.pow((g - c.obs) / se, 2)); d += (d ? "L" : "M") + this.X(g).toFixed(1) + "," + y.toFixed(1); }
    var lo = c.obs - 1.96 * se, hi = c.obs + 1.96 * se, cross = lo < 0 && hi > 0;
    var zl = this.X(0) < L + 260;   // zero near the left edge: title goes on the right
    h += T(zl ? R : L, 18, f < 0.99 ? "The same gap, with less data" : f > 1.01 ? "The same gap, with more data" : "Our actual data", { a: zl ? "end" : "start", c: COL.text, sz: 17, w: 600 });
    h += '<path d="' + d + "L" + this.X(c.xhi) + "," + (AX - 4) + "L" + this.X(c.xlo) + "," + (AX - 4) + 'Z" style="fill:' + COL.band + ';opacity:.18"/><path d="' + d + '" style="fill:none;stroke:' + COL.band + ';stroke-width:2.5"/>';
    h += '<line x1="' + this.X(c.obs) + '" x2="' + this.X(c.obs) + '" y1="60" y2="' + (AX - 4) + '" style="stroke:' + COL.A + ';stroke-dasharray:5 4;stroke-width:2"/>' + T(this.X(c.obs), 52, "gap " + this.fmtGap(c.obs), { c: COL.A, sz: 15, w: 600 });
    var x1 = Math.max(L, this.X(lo)), x2 = Math.min(R, this.X(hi));
    h += '<rect x="' + x1 + '" y="' + (AX + 27) + '" width="' + (x2 - x1) + '" height="9" rx="3" style="fill:' + (cross ? COL.other : COL.band) + '"/>';
    h += this.numline(38);
    var cap = "95% interval: " + this.fmtGap(lo) + " to " + this.fmtGap(hi) + ". <b style=\"color:" + (cross ? COL.other : COL.ok) + "\">" +
      (cross ? "It crosses zero: with this much data we cannot rule out no difference." : "It stays clear of zero.") +
      "</b> Drag the slider: the gap never moves; only how sure we can be about it.";
    return [h, cap];
  };

  GapExplorer.prototype.draw = function () {
    FS = this.fs;
    var out = [this.draw1, this.draw2, this.draw3, this.draw4][this.O - 1].call(this);
    var defs = '<defs><marker id="' + this.id + 'ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9z" fill="context-stroke" stroke="none"/></marker></defs>';
    this.svg.innerHTML = defs + out[0];
    this.cap.innerHTML = out[1];
  };

  function boot() { document.querySelectorAll(".gap-explorer").forEach(function (el) { if (!el._ge) el._ge = new GapExplorer(el); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
