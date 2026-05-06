import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import openMicHtml from "../open-mic-night.html?raw";
import { eventsData, type EventMeta } from "./eventsData";

type EventItem = EventMeta & {
  galleryImages: string[];
};

const parseGalleryImages = (html: string) => {
  if (!html) return [] as string[];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const srcs = Array.from(doc.images)
    .map((img) => img.src)
    .filter((src): src is string => Boolean(src));
  return Array.from(new Set(srcs));
};

const usePopstateNav = () => {
  return (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("/")) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
};

export default function EventsPage({ selectedSlug }: { selectedSlug?: string | null }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [standaloneImage, setStandaloneImage] = useState<string | null>(null);
  const [standaloneTitle, setStandaloneTitle] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const openMicImages = useMemo(() => parseGalleryImages(openMicHtml), []);
  const events = useMemo<EventItem[]>(
    () =>
      eventsData.map((event) => ({
        ...event,
        galleryImages: event.slug === "open-mic-night" ? openMicImages : [],
      })),
    [openMicImages]
  );
  const selectedEvent = selectedSlug
    ? events.find((event) => event.slug === selectedSlug) || null
    : null;
  const galleryImages = selectedEvent?.galleryImages ?? [];
  const activeImage = activeIndex === null ? null : galleryImages[activeIndex] ?? null;
  const modalImage = activeImage ?? standaloneImage;
  const isGalleryModal = activeImage !== null;
  const modalTitle = selectedEvent?.title ?? standaloneTitle ?? "Event";
  const handleNav = usePopstateNav();

  const goNext = () => {
    if (!galleryImages.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % galleryImages.length;
    });
  };

  const goPrev = () => {
    if (!galleryImages.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + galleryImages.length) % galleryImages.length;
    });
  };

  const closeModal = () => {
    setActiveIndex(null);
    setIsPlaying(false);
    setStandaloneImage(null);
    setStandaloneTitle(null);
  };

  const showSwipeHint = isGalleryModal && activeIndex === 0;

  const downloadAsPng = async () => {
    if (!modalImage) return;
    try {
      const response = await fetch(modalImage, { mode: "cors" });
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
      link.href = modalImage;
      link.download = "mindful-circle-event";
      link.click();
    }
  };

  useEffect(() => {
    if (!isPlaying || activeIndex === null || !isGalleryModal) return;
    const timer = window.setInterval(() => {
      goNext();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeIndex, galleryImages.length, isGalleryModal]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, galleryImages.length]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
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

  if (selectedSlug && !selectedEvent) {
    return (
      <main className="events-page">
        <section className="events-hero">
          <div className="events-hero-inner">
            <p className="events-kicker">Events</p>
            <h1 className="events-title">We could not find that event.</h1>
            <p className="events-body">
              The event you are looking for might have moved. Head back to the full list.
            </p>
            <a className="btn-donate" href="/events" onClick={handleNav("/events")}>Back to events</a>
          </div>
        </section>
      </main>
    );
  }

  if (selectedEvent) {
    return (
      <main className="events-page">
        <section className="events-detail-hero">
          <div className="events-detail-inner">
            <a className="events-back" href="/events" onClick={handleNav("/events")}>
              Back to events
            </a>
            <div className="events-detail-top">
              <div className="event-date-stack">
                <span className="event-date-month">{selectedEvent.date.month}</span>
                <span className="event-date-day">{selectedEvent.date.day}</span>
                <span className="event-date-year">{selectedEvent.date.year}</span>
              </div>
              <span
                className={`event-status-pill${selectedEvent.status === "Upcoming" ? " upcoming" : ""}`}
              >
                {selectedEvent.status}
              </span>
            </div>
            <h1 className="events-detail-title">{selectedEvent.title}</h1>
            <p className="events-detail-body">{selectedEvent.summary}</p>
            <div className="events-detail-meta">
              <div>
                <p className="events-detail-label">Location</p>
                <p className="events-detail-value">{selectedEvent.location}</p>
              </div>
              <div>
                <p className="events-detail-label">Highlight</p>
                <p className="events-detail-value">{selectedEvent.highlight}</p>
              </div>
              <div>
                <p className="events-detail-label">Time</p>
                <p className="events-detail-value">{selectedEvent.time}</p>
              </div>
            </div>
            {selectedEvent.activities.length > 0 && (
              <div className="events-detail-activities">
                <p className="events-detail-label">Activities</p>
                <ul className="events-activity-list">
                  {selectedEvent.activities.map((activity) => (
                    <li key={activity}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="events-detail-actions">
              {selectedEvent.galleryImages.length > 0 ? (
                <a className="btn-donate" href="#gallery">View gallery</a>
              ) : (
                <button className="btn-donate" type="button" disabled>Gallery coming soon</button>
              )}
            </div>
          </div>
        </section>

        <section id="gallery" className="events-gallery-section">
          <div className="events-gallery-header">
            <p className="events-gallery-body">Tap any photo to preview and download.</p>
          </div>
          <div className="events-gallery-grid">
            {galleryImages.length === 0 ? (
              <div className="events-gallery-empty">Gallery images will appear here once loaded.</div>
            ) : (
              galleryImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  className="events-gallery-item"
                  type="button"
                  onClick={() => setActiveIndex(index)}
                >
                  <img src={src} alt={`${selectedEvent.title} ${index + 1}`} loading="lazy" />
                </button>
              ))
            )}
          </div>
        </section>

        {modalImage && (
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
              {isGalleryModal && galleryImages.length > 1 && (
                <>
                  <button className="events-modal-nav prev" onClick={goPrev} aria-label="Previous image">
                    <span aria-hidden="true">&lsaquo;</span>
                  </button>
                  <button className="events-modal-nav next" onClick={goNext} aria-label="Next image">
                    <span aria-hidden="true">&rsaquo;</span>
                  </button>
                </>
              )}
              <div className={showSwipeHint ? "events-modal-media show-swipe" : "events-modal-media"}>
                <img className="events-modal-image" src={modalImage} alt={`${modalTitle} preview`} />
                {showSwipeHint && <div className="events-modal-swipe">Swipe left or right</div>}
              </div>
              <div className="events-modal-actions">
                <a className="events-modal-link" href={modalImage} target="_blank" rel="noopener noreferrer">
                  Open full size
                </a>
                {isGalleryModal && galleryImages.length > 1 && (
                  <button className="events-modal-link" onClick={() => setIsPlaying((prev) => !prev)} type="button">
                    {isPlaying ? "Pause slideshow" : "Play slideshow"}
                  </button>
                )}
                <button className="btn-donate" type="button" onClick={downloadAsPng}>Download PNG</button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="events-page">
      <section className="events-hero">
        <div className="events-hero-inner">
          <p className="events-kicker">Events</p>
          <h1 className="events-title">Next up, and memories we keep.</h1>
          <p className="events-body">
            Explore our upcoming circles and recent highlights. Each event has a gallery preview so you can see the energy before you arrive.
          </p>
        </div>
      </section>
      <section className="events-grid-section">
        <div className="events-grid">
          {events.map((event, index) => {
            const previewImages = event.galleryImages.slice(0, 3);
            const hasFlyer = event.status === "Upcoming" && event.flyerImage;
            return (
              <article className="event-card" key={event.slug}>
                <div className="event-card-top">
                  <div className="event-date-stack">
                    <span className="event-date-month">{event.date.month}</span>
                    <span className="event-date-day">{event.date.day}</span>
                    <span className="event-date-year">{event.date.year}</span>
                  </div>
                  <span className={`event-status-pill${event.status === "Upcoming" ? " upcoming" : ""}`}>
                    {event.status}
                  </span>
                </div>
                <h2 className="event-card-title">{event.title}</h2>
                <p className="event-card-body">{event.summary}</p>
                <div className="event-card-meta">
                  <span>{event.location}</span>
                  <span className="event-meta-dot">•</span>
                  <span>{event.time}</span>
                  <span className="event-meta-dot">•</span>
                  <span>{event.highlight}</span>
                </div>
                {hasFlyer ? (
                  <button
                    className="event-flyer"
                    type="button"
                    onClick={() => {
                      setStandaloneImage(event.flyerImage || null);
                      setStandaloneTitle(event.title);
                    }}
                  >
                    <img src={event.flyerImage} alt={`${event.title} flyer`} loading="lazy" />
                    <span className="event-flyer-label">Tap to view full flyer</span>
                  </button>
                ) : (
                  <div className="event-preview-stack" style={{ zIndex: 2 - index }}>
                    {previewImages.length > 0 ? (
                      previewImages.map((src, imgIndex) => (
                        <div key={`${src}-${imgIndex}`} className={`events-preview-card preview-${imgIndex}`}>
                          <img src={src} alt={`${event.title} preview ${imgIndex + 1}`} loading="lazy" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="events-preview-card preview-0 events-preview-fallback" />
                        <div className="events-preview-card preview-1 events-preview-fallback" />
                        <div className="events-preview-card preview-2 events-preview-fallback" />
                      </>
                    )}
                  </div>
                )}
                <div className="event-card-actions">
                  <a className="btn-donate" href={`/events/${event.slug}`} onClick={handleNav(`/events/${event.slug}`)}>
                    {event.status === "Upcoming" ? "Register" : "View gallery"}
                  </a>
                  <span className="event-card-rank">#{String(index + 1).padStart(2, "0")}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {modalImage && (
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
            <div className="events-modal-media">
              <img className="events-modal-image" src={modalImage} alt={`${modalTitle} flyer`} />
            </div>
            <div className="events-modal-actions">
              <a className="events-modal-link" href={modalImage} target="_blank" rel="noopener noreferrer">
                Open full size
              </a>
              <button className="btn-donate" type="button" onClick={downloadAsPng}>Download PNG</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
