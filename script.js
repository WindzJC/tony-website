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
