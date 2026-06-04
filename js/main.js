/* =====================================================================
   CritNCoin Studios — main.js
   Minimal, dependency-free, fails gracefully.
   Handles:
     1. Marks <html> as has-js (enables scroll-reveal styling)
     2. Current year in any element with [data-year]
     3. Scroll-reveal: fades + lifts elements as they enter view
     4. Simple screenshot lightbox (opt-in via data attributes)
   A small global, window.CritReveal(scope), lets other scripts (blog.js)
   reveal content they inject after load.
   ===================================================================== */
(function () {
  "use strict";

  /* --- 1. Mark JS available (CSS uses html.has-js to hide .reveal) --- */
  document.documentElement.classList.add("has-js");

  /* --- 2. Footer year ------------------------------------------------ */
  try {
    var year = new Date().getFullYear();
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  } catch (e) { /* never break the page over a date */ }

  /* --- 3. Scroll reveal --------------------------------------------- */
  /* Auto-tags common content blocks with .reveal, then observes them so
     they fade + rise into view. Also exposed as window.CritReveal so
     dynamically-added cards (the blog) can be revealed too. */
  var REVEAL_SELECTOR =
    ".card, .devlog-card, .roadmap-item, .panel, .screenshot-frame, " +
    ".shot-cell, .under-construction-plaque, .empty-panel, .section-divider";

  var supportsIO = "IntersectionObserver" in window;
  var observer = supportsIO
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" })
    : null;

  function reveal(scope) {
    var root = scope || document;
    var nodes = root.querySelectorAll(REVEAL_SELECTOR);
    nodes.forEach(function (el) {
      if (el.classList.contains("reveal")) return; /* already handled */
      el.classList.add("reveal");
      if (observer) {
        observer.observe(el);
      } else {
        el.classList.add("in-view"); /* no IO -> just show it */
      }
    });
  }
  window.CritReveal = reveal;

  try { reveal(document); } catch (e) { /* visuals only */ }

  /* --- 4. Screenshot lightbox --------------------------------------- */
  /* Any element with [data-lightbox-src] opens the shared #lightbox.
     If the markup is missing we simply do nothing. Uses event delegation
     so triggers added later (blog/gallery) work automatically. */
  try {
    var lightbox = document.getElementById("lightbox");
    if (lightbox) {
      var imgEl = lightbox.querySelector("img");
      var closeEl = lightbox.querySelector(".lightbox-close");

      var open = function (src, alt) {
        if (!imgEl || !src) return;
        imgEl.src = src;
        imgEl.alt = alt || "Screenshot";
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
      };
      var close = function () {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        if (imgEl) imgEl.removeAttribute("src");
      };

      document.addEventListener("click", function (ev) {
        var trigger = ev.target.closest("[data-lightbox-src]");
        if (trigger) {
          open(trigger.getAttribute("data-lightbox-src"),
               trigger.getAttribute("data-lightbox-alt"));
        }
      });
      /* keyboard: open on Enter/Space for role="button" thumbnails */
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") close();
        if ((ev.key === "Enter" || ev.key === " ")) {
          var t = document.activeElement;
          if (t && t.hasAttribute && t.hasAttribute("data-lightbox-src")) {
            ev.preventDefault();
            open(t.getAttribute("data-lightbox-src"),
                 t.getAttribute("data-lightbox-alt"));
          }
        }
      });

      if (closeEl) closeEl.addEventListener("click", close);
      lightbox.addEventListener("click", function (ev) {
        if (ev.target === lightbox) close(); /* click backdrop to close */
      });
    }
  } catch (e) { /* lightbox is a nicety, not a requirement */ }
})();
