"use client";

import React from "react";

type InteractiveEl = HTMLElement & {
  dataset: { ttsActivated?: string; ttsLabelCache?: string };
};

function getPointerIsCoarse() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
}

function extractLabel(el: HTMLElement): string {
  // Prefer aria-label, then data-tts, then title, then visible text
  const aria = el.getAttribute("aria-label");
  if (aria && aria.trim()) return aria.trim();

  const dataTts = (el as any).dataset?.tts;
  if (dataTts && `${dataTts}`.trim()) return `${dataTts}`.trim();

  const title = el.getAttribute("title");
  if (title && title.trim()) return title.trim();

  // Fallback: use trimmed innerText (shortened)
  const text = (el as HTMLElement).innerText?.trim();
  if (text) return text.length > 120 ? `${text.slice(0, 117)}...` : text;

  // Final fallback by tag
  const tag = el.tagName.toLowerCase();
  if (tag === "a") return "Link";
  if (tag === "button") return "Button";
  return "Item";
}

function speak(
  text: string,
  opts?: { rate?: number; pitch?: number; lang?: string }
) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts?.rate ?? 1;
    u.pitch = opts?.pitch ?? 1;
    u.lang = opts?.lang ?? "en-US";
    window.speechSynthesis.speak(u);
  } catch {
    // swallow
  }
}

// Simple throttle to avoid spam on fast mouse moves
function throttle<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let last = 0;
  let t: number | undefined;
  let pendingArgs: any[] | null = null;

  const run = () => {
    if (pendingArgs) {
      fn(...pendingArgs);
      pendingArgs = null;
      last = Date.now();
    }
    t = undefined;
  };

  return ((...args: any[]) => {
    const now = Date.now();
    if (now - last >= wait) {
      fn(...args);
      last = now;
    } else {
      pendingArgs = args;
      if (!t) t = window.setTimeout(run, wait - (now - last));
    }
  }) as T;
}

export default function GlobalTTSAnnouncer() {
  const liveRef = React.useRef<HTMLDivElement | null>(null);
  const coarseRef = React.useRef<boolean>(false);
  const awaitingSecondTapRef = React.useRef<WeakMap<Element, number>>(
    new WeakMap()
  );
  const hoverSpeakThrottled = React.useRef<(el: HTMLElement) => void>();

  React.useEffect(() => {
    coarseRef.current = getPointerIsCoarse();
    hoverSpeakThrottled.current = throttle(
      (el: HTMLElement) => announceElement(el, { mode: "hover" }),
      800
    );

    const onPointerChange = () => {
      coarseRef.current = getPointerIsCoarse();
    };
    const mql = window.matchMedia("(pointer: coarse)");
    if (mql && "addEventListener" in mql) {
      mql.addEventListener("change", onPointerChange);
    }

    // Event delegation on the document
    const onTouchStart = (e: TouchEvent) => {
      const target = findInteractive(e.target as Element);
      if (!target) return;
      // Speak label immediately on touch exploration
      announceElement(target, { mode: "touch" });
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!coarseRef.current) return;
      const target = findInteractive(e.target as Element);
      if (!target) return;

      // Double-tap to activate: if not announced recently, prevent and instruct to tap again
      const last = awaitingSecondTapRef.current.get(target);
      const now = Date.now();
      const withinWindow = typeof last === "number" && now - last < 2500;

      if (!withinWindow) {
        e.stopPropagation();
        e.preventDefault();
        awaitingSecondTapRef.current.set(target, now);
        const label = extractLabel(target as HTMLElement);
        speak(`${label}. Touch again to open.`);
        // Also update aria-live for assistive tech fallback
        if (liveRef.current) {
          liveRef.current.textContent = `${label}. Touch again to open.`;
        }
        // Reset after 2.5s
        window.setTimeout(() => {
          if (awaitingSecondTapRef.current.get(target) === now) {
            awaitingSecondTapRef.current.delete(target);
          }
        }, 2600);
      } // else allow default click on second tap
    };

    const onMouseEnter = (e: MouseEvent) => {
      if (coarseRef.current) return;
      const target = findInteractive(e.target as Element);
      if (!target) return;
      hoverSpeakThrottled.current?.(target as HTMLElement);
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = findInteractive(e.target as Element);
      if (!target) return;
      announceElement(target, { mode: "focus" });
    };

    // Content reading for headings and tagged content
    const onContentHover = (e: MouseEvent) => {
      if (coarseRef.current) return;
      const el = findReadableContent(e.target as Element);
      if (!el) return;
      hoverSpeakThrottled.current?.(el as HTMLElement);
    };

    const onContentTouch = (e: TouchEvent) => {
      const el = findReadableContent(e.target as Element);
      if (!el) return;
      announceElement(el as HTMLElement, { mode: "touch-content" });
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("click", onClickCapture, true); // capture to prevent first tap
    document.addEventListener("mouseenter", onMouseEnter, true);
    document.addEventListener("focusin", onFocusIn, true);

    document.addEventListener("mouseenter", onContentHover, true);
    document.addEventListener("touchstart", onContentTouch, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart as any);
      document.removeEventListener("click", onClickCapture, true);
      document.removeEventListener("mouseenter", onMouseEnter, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("mouseenter", onContentHover, true);
      document.removeEventListener("touchstart", onContentTouch as any);

      if (mql && "removeEventListener" in mql) {
        mql.removeEventListener("change", onPointerChange);
      }
    };
  }, []);

  function findInteractive(start: Element | null): InteractiveEl | null {
    let el: Element | null = start;
    while (el && el !== document.body) {
      if (
        el instanceof HTMLElement &&
        !el.hasAttribute("data-tts-skip") &&
        (el.matches('a[href], button, [role="button"], [data-tts]') ||
          // Allow cards or custom elements to opt-in as buttons
          (el.getAttribute("tabindex") === "0" && el.hasAttribute("data-tts")))
      ) {
        return el as InteractiveEl;
      }
      el = el.parentElement;
    }
    return null;
  }

  function findReadableContent(start: Element | null): HTMLElement | null {
    let el: Element | null = start;
    while (el && el !== document.body) {
      if (
        el instanceof HTMLElement &&
        !el.hasAttribute("data-tts-skip") &&
        (el.matches("h1, h2, h3, [data-tts-content]") ||
          // explicit content via data-tts on non-interactive
          (el.hasAttribute("data-tts") &&
            !el.matches('a,button,[role="button"]')))
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function announceElement(
    el: HTMLElement,
    ctx: { mode: "touch" | "hover" | "focus" | "touch-content" }
  ) {
    const label = extractLabel(el);
    if (!label) return;

    if (ctx.mode === "touch") {
      speak(`${label}. Touch again to open.`);
      if (liveRef.current) {
        liveRef.current.textContent = `${label}. Touch again to open.`;
      }
    } else if (ctx.mode === "focus") {
      speak(`${label}. Press Enter to open.`);
      if (liveRef.current) {
        liveRef.current.textContent = `${label}. Press Enter to open.`;
      }
    } else {
      speak(label);
      if (liveRef.current) {
        liveRef.current.textContent = label;
      }
    }
  }

  // Hidden polite live region for SR fallback and cues
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      ref={liveRef}
    />
  );
}
