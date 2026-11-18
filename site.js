(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");
  var toggle = document.querySelector("[data-theme-toggle]");
  var stored = null;
  try { stored = localStorage.getItem("mist-machine-theme"); } catch (e) {}
  if (stored === "light" || stored === "dark") { root.setAttribute("data-theme", stored); }
  function syncToggle() {
    if (!toggle) return;
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
    toggle.textContent = dark ? "Light" : "Dark";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("mist-machine-theme", next); } catch (e) {}
      syncToggle();
    });
    syncToggle();
  }
  var menuBtn = document.querySelector("[data-menu-button]");
  var nav = document.getElementById("primary-nav");
  var closeBtn = document.querySelector("[data-menu-close]");
  var lastFocus = null;
  function setOpen(open) {
    if (!nav || !menuBtn) return;
    nav.setAttribute("data-open", open ? "true" : "false");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      lastFocus = document.activeElement;
      var first = nav.querySelector("a");
      if (first) first.focus();
    } else if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () { setOpen(nav.getAttribute("data-open") !== "true"); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") setOpen(false);
      if (e.key === "Tab" && nav.getAttribute("data-open") === "true") {
        var items = nav.querySelectorAll("a, button");
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  var revealEls = document.querySelectorAll(".reveal");
  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Safety net: content must never stay hidden if the observer
       never fires (fast scroll, full-page capture, odd browsers). */
    setTimeout(revealAll, 1500);
  } else {
    revealAll();
  }
})();
