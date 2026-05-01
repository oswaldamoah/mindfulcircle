import { useEffect, useMemo, useRef, useState } from "react";
import openMicHtml from "../open-mic-night.html?raw";

export default function EventsPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const images = useMemo(() => {
    if (!openMicHtml) return [] as string[];
    const doc = new DOMParser().parseFromString(openMicHtml, "text/html");
    const srcs = Array.from(doc.images)
      .map((img) => img.src)
      .filter((src): src is string => Boolean(src));
    return Array.from(new Set(srcs));
  }, []);
  const activeImage = activeIndex === null ? null : images[activeIndex] ?? null;

  const goNext = () => {
    if (!images.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % images.length;
    });
  };

  const goPrev = () => {
    if (!images.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + images.length) % images.length;
    });
  };

  const closeModal = () => {
    setActiveIndex(null);
    setIsPlaying(false);
  };

  const showSwipeHint = activeIndex === 0;

  const downloadAsPng = async () => {
    if (!activeImage) return;
    try {
      const response = await fetch(activeImage, { mode: "cors" });
      if (!response.ok) throw new Error("download-failed");
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-canvas");
      ctx.drawImage(bitmap, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "mindful-circle-event.png";
      link.click();
    } catch {
      const link = document.createElement("a");
      link.href = activeImage;
      link.download = "mindful-circle-event";
      link.click();
    }
  };

  useEffect(() => {
    if (!isPlaying || activeIndex === null) return;
    const timer = window.setInterval(() => {
      goNext();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeIndex, images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, images.length]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    if (!start) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    touchStart.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    if (dx > 0) goPrev();
  };

  return (
    <main className="events-page">
      <section className="events-intro">
        <div className="events-intro-inner">
          <p className="events-kicker">Events</p>
          <h1 className="events-title">Moments we create together.</h1>
          <p className="events-body">
            Our events are safe, creative spaces where young people share their stories and find community. Explore past gatherings and the energy that makes them special.
          </p>
          <div className="events-card">
            <div>
              <p className="events-card-title">Open Mic Night</p>
              <p className="events-card-body">A night of stories, music, and courage from our community.</p>
            </div>
            <a className="btn-donate" href="#open-mic-night">View gallery</a>
          </div>
        </div>
      </section>
      <section id="open-mic-night" className="events-gallery-section">
        <div className="events-gallery-header">
          <h2 className="events-gallery-title">Open Mic Night Gallery</h2>
          <p className="events-gallery-body">Tap any photo to preview and download.</p>
        </div>
        <div className="events-gallery-grid">
          {images.length === 0 ? (
            <div className="events-gallery-empty">Gallery images will appear here once loaded.</div>
          ) : (
            images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                className="events-gallery-item"
                type="button"
                onClick={() => setActiveIndex(index)}
              >
                <img src={src} alt={`Open Mic Night ${index + 1}`} loading="lazy" />
              </button>
            ))
          )}
        </div>
      </section>

      {activeImage && (
        <div className="events-modal" onClick={closeModal}>
          <div
            className="events-modal-card"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button className="events-modal-close" onClick={closeModal} aria-label="Close preview">
              <span aria-hidden="true">&times;</span>
            </button>
            <button className="events-modal-nav prev" onClick={goPrev} aria-label="Previous image">
              <span aria-hidden="true">&lsaquo;</span>
            </button>
            <button className="events-modal-nav next" onClick={goNext} aria-label="Next image">
              <span aria-hidden="true">&rsaquo;</span>
            </button>
            <div className={showSwipeHint ? "events-modal-media show-swipe" : "events-modal-media"}>
              <img className="events-modal-image" src={activeImage} alt="Open Mic Night preview" />
              {showSwipeHint && <div className="events-modal-swipe">Swipe left or right</div>}
            </div>
            <div className="events-modal-actions">
              <a className="events-modal-link" href={activeImage} target="_blank" rel="noopener noreferrer">
                Open full size
              </a>
              <button className="events-modal-link" onClick={() => setIsPlaying((prev) => !prev)} type="button">
                {isPlaying ? "Pause slideshow" : "Play slideshow"}
              </button>
              <button className="btn-donate" type="button" onClick={downloadAsPng}>Download PNG</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
