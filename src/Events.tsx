import { useMemo, useState } from "react";
import openMicHtml from "../open-mic-night.html?raw";

export default function EventsPage() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const images = useMemo(() => {
    if (!openMicHtml) return [] as string[];
    const doc = new DOMParser().parseFromString(openMicHtml, "text/html");
    const srcs = Array.from(doc.images)
      .map((img) => img.src)
      .filter((src): src is string => Boolean(src));
    return Array.from(new Set(srcs));
  }, []);

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
                onClick={() => setActiveImage(src)}
              >
                <img src={src} alt={`Open Mic Night ${index + 1}`} loading="lazy" />
              </button>
            ))
          )}
        </div>
      </section>

      {activeImage && (
        <div className="events-modal" onClick={() => setActiveImage(null)}>
          <div className="events-modal-card" onClick={(event) => event.stopPropagation()}>
            <button className="events-modal-close" onClick={() => setActiveImage(null)} aria-label="Close preview">
              <span aria-hidden="true">&times;</span>
            </button>
            <img src={activeImage} alt="Open Mic Night preview" />
            <div className="events-modal-actions">
              <a className="events-modal-link" href={activeImage} target="_blank" rel="noopener noreferrer">Open full size</a>
              <a className="btn-donate" href={activeImage} download>Download</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
