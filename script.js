/* Tony Abruzzo — homepage concept by Astra Productions
   One quiet device: the gold script "and" from the book's cover
   draws itself in, once, in the title and beside each story.
   Without JavaScript, or with reduced motion, every "and" simply shows. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  var marks = document.querySelectorAll(".and[data-draw]");
  if (!marks.length) return;

  document.documentElement.classList.add("js");

  var titleMark = document.querySelector(".title .and[data-draw]");

  function draw(el) { el.classList.add("is-drawn"); }

  // The title's "and" waits for the script font so it never redraws mid-stroke.
  function drawTitle() {
    if (!titleMark) return;
    setTimeout(function () { draw(titleMark); }, 280);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(drawTitle, drawTitle);
  } else {
    drawTitle();
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        draw(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.6 });

  Array.prototype.forEach.call(marks, function (el) {
    if (el !== titleMark) io.observe(el);
  });

  // Safety net: nothing stays hidden if an observer never fires.
  window.addEventListener("load", function () {
    setTimeout(function () { Array.prototype.forEach.call(marks, draw); }, 6000);
  });
})();

/* Meet Tony: the author introduction film.
   Nothing from YouTube's player loads until Play is pressed; then the
   privacy-enhanced embed replaces the still in place, with sound and the
   full set of player controls. Without JavaScript, Play opens YouTube. */
(function () {
  "use strict";

  var frame = document.querySelector(".film-frame[data-youtube-id]");
  if (!frame || !document.querySelector || !("addEventListener" in window)) return;

  var id = frame.getAttribute("data-youtube-id");
  var link = frame.querySelector("a.film-play");
  var still = frame.querySelector(".film-still");
  if (!id || !link) return;

  frame.classList.add("is-enhanced");

  // The still: YouTube's full-size frame, then its standard one.
  // A missing size comes back as a 120 x 90 placeholder rather than an error.
  if (still) {
    var fallbacks = ["https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"];
    var settle = function () {
      if (still.naturalWidth > 120) { still.classList.add("is-loaded"); return; }
      var next = fallbacks.shift();
      if (next) { still.src = next; }
      else if (still.parentNode) { still.parentNode.removeChild(still); still = null; }
    };
    still.addEventListener("load", settle);
    still.addEventListener("error", settle);
    if (still.complete && still.naturalWidth) settle();
  }

  // Upgrade the YouTube link into a real button that plays the film here.
  var button = document.createElement("button");
  button.type = "button";
  button.className = link.className;
  while (link.firstChild) button.appendChild(link.firstChild);
  link.parentNode.replaceChild(button, link);

  var label = button.querySelector(".film-play-label");
  var warmed = false;
  function warm() {
    if (warmed) return;
    warmed = true;
    var hint = document.createElement("link");
    hint.rel = "preconnect";
    hint.href = "https://www.youtube-nocookie.com";
    document.head.appendChild(hint);
  }
  button.addEventListener("pointerenter", warm);
  button.addEventListener("focus", warm);

  var started = false;
  button.addEventListener("click", function () {
    if (started) return;
    started = true;
    warm();

    var player = document.createElement("iframe");
    player.className = "film-player";
    player.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
      "?autoplay=1&rel=0&playsinline=1";
    player.title = "Meet Tony Abruzzo: an introduction to the author (YouTube video player)";
    player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    player.setAttribute("allowfullscreen", "");
    player.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

    frame.classList.add("is-loading");
    frame.setAttribute("aria-busy", "true");
    if (label) label.firstChild.nodeValue = "Loading the film";

    var revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      frame.classList.remove("is-loading");
      frame.classList.add("is-playing");
      frame.removeAttribute("aria-busy");
      // Keyboard and screen-reader users land in the player, not on a vanished button.
      try { player.focus(); } catch (e) {}
      setTimeout(function () {
        if (button.parentNode) button.parentNode.removeChild(button);
        if (still && still.parentNode) still.parentNode.removeChild(still);
      }, 650);
    }
    player.addEventListener("load", reveal);
    setTimeout(reveal, 8000); // never leave someone waiting on the still

    frame.appendChild(player);
  });
})();
