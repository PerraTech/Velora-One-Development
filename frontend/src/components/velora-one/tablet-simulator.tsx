"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Expand, Tablet, X } from "lucide-react";
import { TabletApp } from "./tablet-app";

export function TabletSimulator() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const hintId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function show() {
    setMounted(true);
    dialogRef.current?.showModal();
    setOpen(true);
    closeRef.current?.focus();
  }

  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
    const first = elements[0];
    const last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  return <>
    <button type="button" ref={triggerRef} className="module-preview-link" aria-haspopup="dialog" onClick={show}><Tablet size={18} aria-hidden="true" />Open Tablet Simulator</button>
    <dialog ref={dialogRef} className="one-simulator" aria-labelledby={titleId} aria-describedby={hintId} onKeyDown={trapFocus} onClose={() => { setOpen(false); triggerRef.current?.focus(); }}>
      <div className="one-simulator-panel">
      <div className="one-simulator-toolbar"><h2 id={titleId}>VELORA ONE · Tablet Simulator</h2><div className="one-simulator-controls"><Link href="/previews/velora-one"><Expand size={16} aria-hidden="true" />Open volledig scherm</Link><button type="button" ref={closeRef} aria-label="Tablet Simulator sluiten" onClick={() => dialogRef.current?.close()}><X size={18} aria-hidden="true" />Sluiten</button></div></div>
      <div className="one-tablet-frame"><span className="one-tablet-camera" aria-hidden="true" /><div className="one-tablet-screen">{mounted && <TabletApp />}</div></div>
      <p id={hintId} className="one-simulator-hint">Interactieve frontend met gesimuleerde gegevens. Druk op Escape om te sluiten.</p>
      </div>
    </dialog>
  </>;
}
