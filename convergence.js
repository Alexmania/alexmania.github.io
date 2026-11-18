(function () {
  "use strict";
  var host = document.getElementById("convergence-canvas");
  if (!host) return;
  var fallback = host.parentElement ? host.parentElement.querySelector("svg.convergence-static") : null;
  var slider = document.getElementById("convergence-slider");
  var valueOut = document.getElementById("convergence-value");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = host.getContext("2d");
  if (!ctx) return;
  /* Hide the static fallback only once the canvas has drawn successfully,
     so a canvas failure never leaves a blank band. */
  var W = 1120, H = 320, DPR = Math.min(window.devicePixelRatio || 1, 2);
  host.width = W * DPR; host.height = H * DPR;
  ctx.scale(DPR, DPR);
  var N = 300, dots = [], t = 0, merge = 1, target = 1, running = false, raf = null;
  function theme() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return "dark";
    if (attr === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function colors() {
    return theme() === "dark"
      ? { line: "#E89A6B", dot: "#B9C6BF", contour: "rgba(154,181,176,0.5)" }
      : { line: "#C46A3B", dot: "#2E5A4A", contour: "rgba(94,122,114,0.55)" };
  }
  function lineY(x) { return H * 0.52 + Math.sin(x / 260) * 26 - (x / W) * 18; }
  function seed() {
    dots = [];
    for (var i = 0; i < N; i++) {
      var x = Math.random() * W;
      dots.push({
        x: x, homeX: x,
        y: lineY(x) + (Math.random() - 0.5) * 190,
        lineY: lineY(x),
        speed: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        r: 1.2 + Math.random() * 2.0,
        a: 0.35 + Math.random() * 0.4
      });
    }
  }
  function draw() {
    var c = colors();
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = c.contour; ctx.lineWidth = 1;
    for (var c2 = 0; c2 < 4; c2++) {
      ctx.beginPath();
      for (var x = 0; x <= W; x += 14) {
        var y = H * (0.22 + c2 * 0.13) + Math.sin(x / 180 + c2 * 1.7) * 14 + Math.sin(x / 61 + c2) * 6;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = c.line; ctx.globalAlpha = 0.35 + merge * 0.65; ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (var x2 = 0; x2 <= W; x2 += 10) {
      if (x2 === 0) ctx.moveTo(x2, lineY(x2)); else ctx.lineTo(x2, lineY(x2));
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var drift = Math.sin(t * d.speed + d.phase) * 10 * (1 - merge);
      var y = d.lineY + (d.y - d.lineY) * (1 - merge) + drift;
      var onLine = merge > 0.97;
      ctx.fillStyle = onLine ? c.line : c.dot;
      ctx.globalAlpha = onLine ? 0.95 : d.a * (1 - merge * 0.4);
      ctx.beginPath(); ctx.arc(d.x, y, d.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (fallback && fallback.style.display !== "none") fallback.style.display = "none";
  }
  function frame() {
    merge += (target - merge) * 0.06;
    if (Math.abs(target - merge) < 0.002) merge = target;
    t += 0.016;
    draw();
    if (running) raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
  function setMerge(v) {
    target = v / 100;
    if (valueOut) valueOut.textContent = v >= 100 ? "Merged" : v <= 0 ? "Fragmented" : v + "% merged";
    if (reduceMotion) { merge = target; draw(); return; }
    start();
    setTimeout(function () { if (Math.abs(target - merge) < 0.01) stop(); }, 2400);
  }
  seed();
  if (slider) {
    slider.addEventListener("input", function () { setMerge(Number(slider.value)); });
    slider.addEventListener("change", function () { setMerge(Number(slider.value)); });
  }
  merge = 1; target = 1; draw();
  if (!reduceMotion && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && target !== merge) start(); else if (!entry.isIntersecting) stop();
      });
    }).observe(host);
  }
})();
