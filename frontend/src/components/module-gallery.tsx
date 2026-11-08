"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Minus, Plus, X } from "lucide-react";
import type { ModuleImage } from "@/lib/modules";

export function ModuleGallery({ images, title }: { images: readonly [ModuleImage, ...ModuleImage[]]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const hintId = useId();
  const image = images[active];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function select(index: number) {
    setActive(index);
    setZoom(1);
    viewportRef.current?.scrollTo({ left: 0, top: 0 });
  }

  function showLightbox() {
    setZoom(1);
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function navigate(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom(value => Math.min(4, value + .5));
      return;
    }
    if (event.key === "-") {
      event.preventDefault();
      setZoom(value => Math.max(1, value - .5));
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      setZoom(1);
      viewportRef.current?.scrollTo({ left: 0, top: 0 });
      return;
    }
    // Escape en focus binnen de modal worden door het native dialog afgehandeld.
    // Bij vergroting blijven de pijltjestoetsen beschikbaar om het beeld te verschuiven.
    if (zoom !== 1) return;
    if (event.key === "ArrowRight" && active < images.length - 1) {
      event.preventDefault();
      select(active + 1);
    } else if (event.key === "ArrowLeft" && active > 0) {
      event.preventDefault();
      select(active - 1);
    }
  }

  return <div className="module-gallery">
    <button type="button" className="gallery-open" onClick={showLightbox} aria-label={`Vergroot referentiebeeld ${active + 1} van ${title}`} aria-haspopup="dialog">
      <span className="gallery-frame"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 850px) 90vw, 45vw" /></span>
      <span className="gallery-caption"><span>Referentiebeeld {active + 1} / {images.length}</span><Expand size={16} aria-hidden="true" /></span>
    </button>
    {images.length > 1 && <div className="gallery-thumbnails" role="group" aria-label="Referentiebeeld kiezen">
      {images.map((item, index) => <button key={`${item.src.src}-${index}`} type="button" onClick={() => select(index)} aria-label={`Toon referentiebeeld ${index + 1}: ${item.alt}`} aria-pressed={active === index}>
        <Image src={item.src} alt="" fill sizes="72px" />
      </button>)}
    </div>}
    <dialog ref={dialogRef} className="gallery-lightbox" aria-labelledby={headingId} aria-describedby={hintId} onKeyDown={navigate} onClose={() => { setOpen(false); setZoom(1); }}>
      <div className="lightbox-content">
        <div className="lightbox-toolbar">
          <h2 id={headingId}>{title} <span>{active + 1} / {images.length}</span></h2>
          <div className="lightbox-controls" role="group" aria-label="Afbeeldingsbediening">
            {images.length > 1 && <>
              <button type="button" aria-label="Vorig referentiebeeld" disabled={active === 0} onClick={() => select(active - 1)}><ChevronLeft size={20} aria-hidden="true" /></button>
              <button type="button" aria-label="Volgend referentiebeeld" disabled={active === images.length - 1} onClick={() => select(active + 1)}><ChevronRight size={20} aria-hidden="true" /></button>
            </>}
            <button type="button" aria-label="Uitzoomen" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .5))}><Minus size={20} aria-hidden="true" /></button>
            <button type="button" className="zoom-reset" aria-label="Zoom herstellen naar 100 procent" onClick={() => { setZoom(1); viewportRef.current?.scrollTo({ left: 0, top: 0 }); }}><span aria-live="polite">{Math.round(zoom * 100)}%</span></button>
            <button type="button" aria-label="Inzoomen" disabled={zoom >= 4} onClick={() => setZoom(value => Math.min(4, value + .5))}><Plus size={20} aria-hidden="true" /></button>
            <button type="button" aria-label="Galerij sluiten" onClick={() => dialogRef.current?.close()} autoFocus><X size={20} aria-hidden="true" /></button>
          </div>
        </div>
        <div ref={viewportRef} className="lightbox-viewport" tabIndex={0} role="region" aria-label="Referentiebeeld; scroll om het vergrote beeld te verschuiven">
          <div className="lightbox-canvas" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
            {open && <Image src={image.src} alt={image.alt} fill sizes="100vw" unoptimized />}
          </div>
        </div>
        <p className="lightbox-hint" id={hintId}>Escape om te sluiten · + / − om te zoomen · Scroll bij vergroting</p>
      </div>
    </dialog>
  </div>;
}
