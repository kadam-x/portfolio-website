const MIN_DURATION = 0.07;
const DURATION_RANGE = 0.12;
const MIN_GAP = 0.004;
const GAP_RANGE = 0.024;
const OPENING_STROKES = 5;
const OPENING_DURATION_MULTIPLIER = 1.5;
const OPENING_GAP_MULTIPLIER = 1.6;

function jitterStrokes() {
  const strokes = document.querySelectorAll(".signature .stroke");
  if (!strokes.length) return;

  let cursor = parseFloat(
    strokes[0]?.style.animationDelay.replace("s", "") || "0"
  );

  strokes.forEach((stroke, i) => {
    const opening = i < OPENING_STROKES;
    const duration =
      (MIN_DURATION + Math.random() * DURATION_RANGE) *
      (opening ? OPENING_DURATION_MULTIPLIER : 1);
    const gap =
      (MIN_GAP + Math.random() * GAP_RANGE) *
      (opening ? OPENING_GAP_MULTIPLIER : 1);
    cursor += gap;
    stroke.style.animationDuration = `${duration.toFixed(3)}s`;
    stroke.style.animationDelay = `${cursor.toFixed(3)}s`;
    cursor += duration * 0.55;
  });
}

function initEmailCopy() {
  document.querySelectorAll(".email-copy").forEach((btn) => {
    const hint = btn.parentElement?.querySelector(".copy-hint");
    const originalHint = hint?.textContent ?? "(click to copy)";
    let resetTimeout;

    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-email");
      if (!email) return;

      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      if (hint) {
        clearTimeout(resetTimeout);
        hint.textContent = "copied to clipboard";
        hint.classList.add("copied");
        resetTimeout = setTimeout(() => {
          hint.textContent = originalHint;
          hint.classList.remove("copied");
        }, 1500);
      }
    });
  });
}

function initEntries() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  document.querySelectorAll(".project-entry").forEach((entry) => {
    const summary = entry.querySelector(":scope > summary");
    const collapse = entry.querySelector(":scope > .entry-collapse");
    const body = collapse?.querySelector(":scope > .entry-body");
    if (!summary || !collapse || !body) return;

    let expanded = entry.open;
    let cancel = null;

    function setOpen(open) {
      cancel?.();
      cancel = null;
      entry.open = open;
      collapse.style.height = open ? "auto" : "0px";
    }

    function animate(from, to, done) {
      cancel?.();
      collapse.style.transition = "none";
      collapse.style.height = `${from}px`;
      void collapse.offsetHeight;
      collapse.style.transition = `height var(--entry-duration) var(--entry-ease)`;
      collapse.style.height = `${to}px`;

      let ended = false;
      const onEnd = (event) => {
        if (event.target !== collapse || event.propertyName !== "height") return;
        ended = true;
        cancel = null;
        collapse.removeEventListener("transitionend", onEnd);
        done();
      };

      collapse.addEventListener("transitionend", onEnd);
      cancel = () => {
        if (ended) return;
        ended = true;
        collapse.removeEventListener("transitionend", onEnd);
      };
    }

    // Closing keeps entry.open true for the duration so the browser keeps the
    // content rendered; it is only cleared once the panel has finished
    // collapsing. Without this the content is hidden before it can animate.
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      expanded = !expanded;

      if (reducedMotion) {
        setOpen(expanded);
        return;
      }

      const from = collapse.getBoundingClientRect().height;

      if (expanded) {
        entry.open = true;
        animate(from, body.scrollHeight, () => {
          collapse.style.transition = "none";
          collapse.style.height = "auto";
        });
      } else {
        animate(from, 0, () => {
          collapse.style.transition = "none";
          collapse.style.height = "0px";
          entry.open = false;
        });
      }
    });
  });
}

function init() {
  jitterStrokes();
  initEmailCopy();
  initEntries();
}

init();