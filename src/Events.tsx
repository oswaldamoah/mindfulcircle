import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import openMicHtml from "../open-mic-night.html?raw";
import { eventsData, type EventMeta } from "./eventsData";
import QRCode from "qrcode";
import { Share2 } from "lucide-react";

type EventItem = EventMeta & {
  galleryImages: string[];
};

const parseGalleryImages = (html: string) => {
  if (!html) return [] as string[];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const srcs = Array.from(doc.images)
    .map((img) => img.getAttribute("src") || "")
    .filter((src): src is string => Boolean(src));
  if (srcs.length > 0) return Array.from(new Set(srcs));

  // Fallback for very large HTML strings where DOM parsing can drop nodes.
  const fallback: string[] = [];
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgSrcRegex.exec(html))) {
    if (match[1]) fallback.push(match[1]);
  }
  return Array.from(new Set(fallback));
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
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareTitle, setShareTitle] = useState<string>("");
  const [shareCopied, setShareCopied] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const widgetAttempts = useRef(0);
  const widgetTimeout = useRef<number | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
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

  const getEventLink = (slug: string) => `${window.location.origin}/events/${slug}`;

  const openShare = (url: string, title: string) => {
    setShareUrl(url);
    setShareTitle(title);
    setShareCopied(false);
    setShareOpen(true);
  };

  const closeShare = () => {
    setShareOpen(false);
    setShareCopied(false);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareCopied(false);
    }
  };

  const handleShareApps = async () => {
    if (!navigator?.share) return;
    try {
      await navigator.share({ title: shareTitle, url: shareUrl });
    } catch {
      // Ignore share cancellation.
    }
  };

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "mindful-circle-event-qr.png";
    link.click();
  };

  const shareModal = shareOpen ? (
    <div className="share-modal" onClick={closeShare}>
      <div className="share-card" onClick={(event) => event.stopPropagation()}>
        <button className="share-close" onClick={closeShare} aria-label="Close share panel">
          <span aria-hidden="true">&times;</span>
        </button>
        <p className="share-kicker">Share event</p>
        <h3 className="share-title">{shareTitle}</h3>
        <div className="share-actions">
          <button className="share-btn" type="button" onClick={handleCopyLink}>
            {shareCopied ? "Link copied" : "Copy link"}
          </button>
          <button
            className="share-btn secondary"
            type="button"
            onClick={handleShareApps}
            disabled={!navigator?.share}
          >
            Share to apps
          </button>
          <button className="share-btn secondary" type="button" onClick={handleDownloadQr}>
            Download QR
          </button>
        </div>
        <div className="share-qr">
          <canvas ref={qrCanvasRef} aria-label="QR code" role="img" />
          <p>Scan to open this event page.</p>
        </div>
      </div>
    </div>
  ) : null;

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

  useEffect(() => {
    if (!shareOpen || !shareUrl || !qrCanvasRef.current) return;
    let isActive = true;
    const canvas = qrCanvasRef.current;
    // Render QR at high DPI so the embedded logo (ms.png) remains crisp.
    const displaySize = 220; // CSS pixels for display
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const pixelSize = Math.ceil(displaySize * ratio);

    // set canvas internal resolution to pixelSize but keep CSS size fixed
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;

    const renderQr = async () => {
      try {
        await QRCode.toCanvas(canvas, shareUrl, {
          errorCorrectionLevel: "H",
          margin: 2 * ratio,
          width: pixelSize,
          color: { dark: "#1c0b2b", light: "#ffffff" },
        });

        const ctx = canvas.getContext("2d");
        if (!ctx || !isActive) return;

        const logo = new Image();
        // Use base-aware URL so the asset loads in production and dev
        logo.src = `${import.meta.env.BASE_URL}ms.png`;
        logo.crossOrigin = "anonymous";
        logo.onload = () => {
          if (!isActive) return;
          // Draw the logo directly (no background). Increase size for better sharpness.
          // Reduce logo size by 30% to improve perceived sharpness when downscaled
          const logoSize = Math.floor(pixelSize * 0.34 * 0.7);
          const x = Math.floor((pixelSize - logoSize) / 2);
          const y = Math.floor((pixelSize - logoSize) / 2);
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            // use highest smoothing available for better downscale quality
            // @ts-ignore
            ctx.imageSmoothingQuality = 'high';
          }
          ctx.drawImage(logo, x, y, logoSize, logoSize);
        };
      } catch {
        // QR rendering failed.
      }
    };

    renderQr();
    return () => {
      isActive = false;
    };
  }, [shareOpen, shareUrl]);

  // Small haptics support: vibrate on pointerdown for primary CTAs (non-intrusive)
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest) return;
      const el = target.closest('.btn-donate, .mc-tickets-btn, .cta-donate-btn, .share-btn, .event-share-btn');
      if (!el) return;
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          (navigator as any).vibrate(10);
        }
      } catch {
        // ignore vibration errors
      }
    };

    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  useEffect(() => {
    const removeScript = () => {
      const existing = document.querySelector("script[data-egotickets='color-picnic']");
      if (existing) existing.remove();
    };

    const clearWidgetContainer = () => {
      const container = document.getElementById("egotickets-widget-container");
      if (container) container.innerHTML = "";
    };

    const removeWidgetFrames = () => {
      document
        .querySelectorAll<HTMLIFrameElement>("iframe[src*='egotickets.com']")
        .forEach((frame) => frame.remove());
    };

    if (selectedEvent?.slug !== "color-picnic") {
      setWidgetStatus("idle");
      removeScript();
      clearWidgetContainer();
      removeWidgetFrames();
      return;
    }

    const config = {
      maxRetries: 3,
      retryDelay: 2000,
      loadTimeout: 15000,
      widgetUrl: "https://egotickets.com/embed/the-color-picnic-mindful-circle.js?skip_mobile=true&v=2.1",
    };

    const cleanupTimeout = () => {
      if (widgetTimeout.current) {
        window.clearTimeout(widgetTimeout.current);
        widgetTimeout.current = null;
      }
    };

    const scheduleRetry = () => {
      if (widgetAttempts.current < config.maxRetries) {
        window.setTimeout(loadWidget, config.retryDelay);
      } else {
        setWidgetStatus("error");
      }
    };

    const loadWidget = () => {
      widgetAttempts.current += 1;
      setWidgetStatus("loading");
      cleanupTimeout();
      removeScript();

      widgetTimeout.current = window.setTimeout(() => {
        scheduleRetry();
      }, config.loadTimeout);

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = config.widgetUrl;
      script.dataset.egotickets = "color-picnic";

      script.onload = () => {
        cleanupTimeout();
        setWidgetStatus("loaded");
      };

      script.onerror = () => {
        cleanupTimeout();
        scheduleRetry();
      };

      const target = document.getElementsByTagName("head")[0]
        || document.getElementsByTagName("body")[0]
        || document.documentElement;
      target.appendChild(script);
    };

    widgetAttempts.current = 0;
    loadWidget();

    return () => {
      cleanupTimeout();
      removeScript();
    };
  }, [selectedEvent?.slug]);

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
              
              {selectedEvent.slug === "color-picnic" && (
                <div>
                  <p className="events-detail-label">Merch</p>
                  <a className="events-detail-value events-detail-link-inline" href="/merch#cap">Caps available now!</a>
                </div>
              )}
              {selectedEvent.partners.length > 0 && (
                <div>
                  <p className="events-detail-label">Partners</p>
                  <div className="events-partners-logos">
                    {selectedEvent.partners.map((partner) => (
                      partner.url ? (
                        <a
                          key={partner.name}
                          className="events-partner-link"
                          href={partner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="events-partner-logo"
                            src={partner.logo}
                            alt={partner.name}
                            loading="lazy"
                          />
                        </a>
                      ) : (
                        <img
                          key={partner.name}
                          className="events-partner-logo"
                          src={partner.logo}
                          alt={partner.name}
                          loading="lazy"
                        />
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selectedEvent.activities.length > 0 && (
              <div className="events-detail-activities">
                <p className="events-detail-label">DETAILS</p>
                <ul className="events-activity-list">
                  {selectedEvent.activities.map((activity) => (
                    <li key={activity}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}
            {(selectedEvent.galleryImages.length > 0
              || selectedEvent.slug === "color-picnic"
              || Boolean(selectedEvent.flyerImage)) && (
              <div className="events-detail-actions">
                <div className="events-detail-actions-row">
                  {selectedEvent.slug === "color-picnic" && (
                    <a className="btn-donate events-register-btn" href="#tickets">Register now</a>
                  )}
                  {selectedEvent.galleryImages.length > 0 && (
                    <a className="btn-donate" href="#gallery">View gallery</a>
                  )}
                  {selectedEvent.flyerImage && (
                    <button
                      className="events-detail-link"
                      type="button"
                      onClick={() => {
                        setStandaloneImage(selectedEvent.flyerImage || null);
                        setStandaloneTitle(selectedEvent.title);
                      }}
                    >
                      View flyer
                    </button>
                  )}

                  <button
                    className="events-share-icon"
                    type="button"
                    onClick={() => openShare(getEventLink(selectedEvent.slug), selectedEvent.title)}
                    aria-label="Share event"
                  >
                    <Share2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {selectedEvent.slug === "color-picnic" && (
          <section id="tickets" className="mc-tickets-section">
            <div
              id="egotickets-widget-container"
              className="egoticket_tickets"
              aria-live="polite"
              aria-busy={widgetStatus !== "loaded"}
            />
          </section>
        )}
        {selectedEvent.galleryImages.length > 0 && (
          <section id="gallery" className="events-gallery-section">
            <div className="events-gallery-header">
              <h2 className="events-gallery-title">Gallery</h2>
              <p className="events-gallery-body">
                Tap any photo to open the full gallery viewer.
              </p>
            </div>
            <div className="events-gallery-grid">
              {selectedEvent.galleryImages.map((src, index) => (
                <button
                  className="events-gallery-item"
                  type="button"
                  key={`${selectedEvent.slug}-${index}`}
                  onClick={() => {
                    setStandaloneImage(null);
                    setStandaloneTitle(null);
                    setActiveIndex(index);
                  }}
                >
                  <img src={src} alt={`${selectedEvent.title} gallery ${index + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}

        {shareModal}
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
            const isLeadUpcoming = index === 0 && event.status === "Upcoming";
            return (
              <article className={`event-card${isLeadUpcoming ? " event-card-featured" : ""}`} key={event.slug}>
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
                  <button
                    className="event-share-btn"
                    type="button"
                    onClick={() => openShare(getEventLink(event.slug), event.title)}
                    aria-label="Share event"
                  >
                    <Share2 size={16} aria-hidden="true" />
                  </button>
                  <span className="event-card-rank">#{String(index + 1).padStart(2, "0")}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {shareModal}
      
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
