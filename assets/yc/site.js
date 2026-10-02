(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */

  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- Copy BibTeX ---------- */

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy]");
    if (!button) return;
    var pre = button.parentElement.querySelector("pre");
    if (!pre) return;
    var done = function () {
      button.textContent = "Copied";
      setTimeout(function () { button.textContent = "Copy"; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pre.innerText).then(done, function () {});
    } else {
      var range = document.createRange();
      range.selectNodeContents(pre);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  /* ---------- Motif: a price path, read as a graph ----------
     A seeded random walk with volatility clustering. Its swing highs and
     lows (a zig-zag filter) become nodes; nearby nodes of the same kind are
     joined into small cliques, peaks above the path and troughs below. */

  var figure = document.querySelector("[data-motif]");
  if (!figure) return;
  var svg = figure.querySelector("svg");
  var NS = "http://www.w3.org/2000/svg";

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussian(rand) {
    var u = 1 - rand(), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Generated once; only the projection changes on resize.
  var series = (function () {
    var rand = rng(54);
    var n = 260, p = 0, r = 0, v = 1, out = [0];
    for (var i = 1; i < n; i++) {
      v = Math.sqrt(0.08 + 0.82 * v * v + 0.1 * r * r);
      r = 0.02 + v * gaussian(rand);
      p += r;
      out.push(p);
    }
    return out;
  })();

  function swings(values, threshold) {
    var pts = [], dir = 0, ext = 0;
    for (var i = 1; i < values.length; i++) {
      if (dir >= 0 && values[i] > values[ext]) { ext = i; if (dir === 0) dir = 1; }
      else if (dir <= 0 && values[i] < values[ext]) { ext = i; if (dir === 0) dir = -1; }
      if (dir === 1 && values[ext] - values[i] > threshold) {
        pts.push({ i: ext, kind: "peak" }); dir = -1; ext = i;
      } else if (dir === -1 && values[i] - values[ext] > threshold) {
        pts.push({ i: ext, kind: "trough" }); dir = 1; ext = i;
      }
    }
    return pts;
  }

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function draw(animate) {
    var w = svg.clientWidth, h = svg.clientHeight;
    if (!w || !h) return;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var min = Math.min.apply(null, series), max = Math.max.apply(null, series);
    var top = h * 0.24, bottom = h * 0.76;
    var x = function (i) { return (i / (series.length - 1)) * w; };
    var y = function (i) { return bottom - ((series[i] - min) / (max - min)) * (bottom - top); };

    var d = "";
    for (var i = 0; i < series.length; i++) d += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(i).toFixed(1);

    var nodes = swings(series, (max - min) * 0.08);
    var arcs = el("g", {});
    ["peak", "trough"].forEach(function (kind) {
      var group = nodes.filter(function (n) { return n.kind === kind; });
      var sign = kind === "peak" ? -1 : 1;
      for (var a = 0; a < group.length; a++) {
        for (var b = a + 1; b < Math.min(a + 3, group.length); b++) {
          var x1 = x(group[a].i), y1 = y(group[a].i), x2 = x(group[b].i), y2 = y(group[b].i);
          var lift = Math.min((x2 - x1) * 0.32, h * 0.22);
          var cy = (sign < 0 ? Math.min(y1, y2) : Math.max(y1, y2)) + sign * lift;
          arcs.appendChild(el("path", {
            class: "arc",
            d: "M" + x1 + " " + y1 + "Q" + (x1 + x2) / 2 + " " + cy + " " + x2 + " " + y2
          }));
        }
      }
    });

    var price = el("path", { class: "price", d: d });
    svg.appendChild(arcs);
    svg.appendChild(price);

    nodes.forEach(function (n) {
      var c = el("circle", {
        class: "node" + (n.kind === "trough" ? " node--down" : ""),
        cx: x(n.i), cy: y(n.i), r: 3.5
      });
      c.style.transitionDelay = (x(n.i) / w * 0.7).toFixed(2) + "s";
      svg.appendChild(c);
    });

    figure.classList.add("is-ready");

    if (!animate || reduceMotion) {
      figure.classList.add("is-drawn");
      return;
    }
    var length = price.getTotalLength();
    price.style.strokeDasharray = length;
    price.style.strokeDashoffset = length;
    price.getBoundingClientRect();
    price.style.transition = "stroke-dashoffset 1.8s cubic-bezier(.45,.05,.25,1)";
    price.style.strokeDashoffset = 0;
    setTimeout(function () { figure.classList.add("is-drawn"); }, 900);
  }

  // The figure is hidden until ready, so reveal it before measuring.
  figure.classList.add("is-ready");
  draw(true);

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { draw(false); }, 150);
  });
})();
