import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './TooltipLayer.module.css';

/* One styled tooltip for the whole app. Any element with data-tooltip shows its text when the
   pointer rests on it, and at once when it gets keyboard focus. Screen readers already hear the
   element's aria-label, so the bubble itself is hidden from them. */

// how long the pointer rests on an element before its tooltip appears
const HOVER_DELAY = 350;
// space between the element and the bubble, and between the bubble and the screen's edge
const GAP = 8;

interface Shown {
  text: string;
  anchor: DOMRect;
}

// Mounted once in App; reads data-tooltip from whatever the pointer or focus is on.
const TooltipLayer = () => {
  const [shown, setShown] = useState<Shown | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const bubble = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer = 0;
    let current: Element | null = null;
    const withTooltip = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>('[data-tooltip]') : null;
    const show = (element: HTMLElement) => {
      const text = element.dataset.tooltip;
      if (!text) return;
      current = element;
      setShown({ text, anchor: element.getBoundingClientRect() });
    };
    const hide = () => {
      window.clearTimeout(timer);
      current = null;
      setShown(null);
    };
    // the bubble was placed for where the element was, so a scroll takes it away; a tooltip still
    // waiting to appear stays on its way (it measures the element when it shows), because the
    // browser reports a scroll after the pointer has already come to rest on the element
    const hideShown = () => {
      current = null;
      setShown(null);
    };

    const onPointerOver = (event: PointerEvent) => {
      // a tap on a phone is a click, not a hover
      if (event.pointerType === 'touch') return;
      const element = withTooltip(event.target);
      if (!element || element === current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => show(element), HOVER_DELAY);
    };
    const onPointerOut = (event: PointerEvent) => {
      const element = withTooltip(event.target);
      // moving between the parts of one element doesn't leave it
      if (
        !element ||
        (event.relatedTarget instanceof Node && element.contains(event.relatedTarget))
      )
        return;
      hide();
    };
    const onFocusIn = (event: FocusEvent) => {
      const element = withTooltip(event.target);
      if (element?.matches(':focus-visible')) show(element);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('pointerdown', hide);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', hideShown, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('pointerdown', hide);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', hideShown, true);
    };
  }, []);

  // above the element when there is room, below otherwise, and never past the screen's edges
  useLayoutEffect(() => {
    if (!shown || !bubble.current) {
      setPosition(null);
      return;
    }
    const { width, height } = bubble.current.getBoundingClientRect();
    const { anchor } = shown;
    const centred = anchor.left + anchor.width / 2 - width / 2;
    const left = Math.min(Math.max(centred, GAP), window.innerWidth - width - GAP);
    const above = anchor.top - height - GAP;
    setPosition({ left, top: above >= GAP ? above : anchor.bottom + GAP });
  }, [shown]);

  if (!shown) return null;
  return (
    <div
      ref={bubble}
      className={styles.tooltip}
      aria-hidden="true"
      style={
        position
          ? { left: position.left, top: position.top }
          : { left: 0, top: 0, visibility: 'hidden' }
      }
    >
      {shown.text}
    </div>
  );
};

export default TooltipLayer;
