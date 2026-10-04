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

function init() {
  jitterStrokes();
  initEmailCopy();
}

init();