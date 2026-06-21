/*
  Mouth of Sauron — content script.
  Runs at document_start on YouTube, Facebook, Instagram, TikTok.

  Default state: BLOCKING ON for every platform. Settings live in
  chrome.storage.sync. When a platform is toggled off we add
  `mos-allow-<platform>` to <html>, which un-hides the CSS rules in
  content.css and disables redirects/overlays for that site.
*/

(function () {
  "use strict";

  var DEFAULTS = {
    master: true,
    youtube: true,
    facebook: true,
    instagram: true,
    tiktok: true
  };

  function platform() {
    var h = location.hostname.replace(/^www\./, "").replace(/^m\./, "");
    if (h.endsWith("youtube.com")) return "youtube";
    if (h.endsWith("facebook.com")) return "facebook";
    if (h.endsWith("instagram.com")) return "instagram";
    if (h.endsWith("tiktok.com")) return "tiktok";
    return null;
  }

  var PLATFORM = platform();
  if (!PLATFORM) return;

  var lastHref = location.href;
  var observer = null;
  var active = false;

  function hide(el) {
    if (el && el.style) el.style.setProperty("display", "none", "important");
  }

  function climb(el, n) {
    var cur = el;
    while (cur && cur.parentElement && n-- > 0) cur = cur.parentElement;
    return cur;
  }

  // ---------------- Redirects ----------------

  function doRedirect() {
    if (!active) return;
    var path = location.pathname;

    if (PLATFORM === "youtube") {
      var m = path.match(/^\/shorts\/([^/?#]+)/);
      if (m) {
        location.replace(
          location.origin + "/watch?v=" + m[1] + location.search.replace(/^\?/, "&")
        );
      }
    } else if (PLATFORM === "facebook") {
      if (/^\/reel(s)?\//.test(path)) location.replace("https://www.facebook.com/");
    } else if (PLATFORM === "instagram") {
      if (/^\/reels?\//.test(path)) location.replace("https://www.instagram.com/");
    } else if (PLATFORM === "tiktok") {
      // TikTok is shorts end-to-end — block the whole experience with an overlay.
      injectBlockOverlay();
    }
  }

  // ---------------- DOM hiding (Meta sites need JS, not just CSS) ----------------

  function hidePass() {
    if (!active) return;

    if (PLATFORM === "facebook") {
      document
        .querySelectorAll('a[href^="/reel/"], a[href^="https://www.facebook.com/reel/"]')
        .forEach(function (a) {
          var unit = a.closest('[role="article"]') || climb(a, 6);
          hide(unit || a);
        });
      document.querySelectorAll('div[aria-label="Reels"]').forEach(function (el) {
        hide(el.closest('[role="navigation"] *') ? el : climb(el, 1) || el);
      });
    } else if (PLATFORM === "instagram") {
      document.querySelectorAll('a[href="/reels/"], a[href^="/reels/"]').forEach(function (a) {
        // Nav entry: hide the list item / link wrapper.
        hide(climb(a, 1) || a);
      });
    }
  }

  function startObserver() {
    if (observer || PLATFORM === "tiktok" || PLATFORM === "youtube") return;
    var run = debounce(hidePass, 350);
    observer = new MutationObserver(run);
    var target = document.body || document.documentElement;
    observer.observe(target, { childList: true, subtree: true });
    hidePass();
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  // ---------------- Block overlay (TikTok) ----------------

  function injectBlockOverlay() {
    if (document.getElementById("mos-block-overlay")) return;
    var build = function () {
      if (document.getElementById("mos-block-overlay")) return;
      var root = document.documentElement;
      var o = document.createElement("div");
      o.id = "mos-block-overlay";
      o.innerHTML =
        '<div class="mos-eye">👁️</div>' +
        "<h1>The Mouth is shut.</h1>" +
        "<p>TikTok is silenced by the Mouth of Sauron. The whole feed is Shorts, so the whole site is held.</p>" +
        "<p>Open the extension and toggle <code>TikTok</code> off to pass.</p>";
      root.appendChild(o);
      // Stop the feed from playing/loading behind the curtain.
      try {
        document.documentElement.style.setProperty("overflow", "hidden", "important");
      } catch (e) {}
    };
    if (document.documentElement) build();
    else document.addEventListener("DOMContentLoaded", build);
  }

  function removeBlockOverlay() {
    var o = document.getElementById("mos-block-overlay");
    if (o) o.remove();
    try {
      document.documentElement.style.removeProperty("overflow");
    } catch (e) {}
  }

  // ---------------- Apply settings ----------------

  function apply(settings) {
    var enabled = settings.master && settings[PLATFORM];
    active = enabled;

    // Class controls the CSS hide rules: present `mos-allow-X` => show.
    document.documentElement.classList.toggle("mos-allow-" + PLATFORM, !enabled);

    if (!enabled) {
      stopObserver();
      removeBlockOverlay();
      return;
    }

    doRedirect();
    startObserver();
    hidePass();
  }

  function load() {
    chrome.storage.sync.get(DEFAULTS, apply);
  }

  // React to popup toggles without forcing a reload for CSS-based changes.
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "sync") load();
  });

  // ---------------- SPA navigation watch ----------------

  function onUrlChanged() {
    if (location.href === lastHref) return;
    lastHref = location.href;
    if (active) doRedirect();
  }

  ["pushState", "replaceState"].forEach(function (m) {
    var orig = history[m];
    history[m] = function () {
      var r = orig.apply(this, arguments);
      onUrlChanged();
      return r;
    };
  });
  window.addEventListener("popstate", onUrlChanged);
  setInterval(onUrlChanged, 1000);

  // Kick off as early as possible.
  load();
})();
