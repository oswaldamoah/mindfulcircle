import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { ChevronLeft, ChevronRight, Download, Gift, Images, Share2, X } from "lucide-react";
import EventsPage from "./Events";
import { eventsData } from "./eventsData";
import MerchPage from "./Merch";

const copyToClipboard = (text: string) => {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
};

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

// Counts up once when element enters viewport
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const total = 80;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / total;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (frame >= total) { setCount(target); clearInterval(timer); }
    }, 20);
    return () => clearInterval(timer);
  }, [started, target]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

const WAIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// === BIRTHDAY ANNIVERSARY FEATURE: START ===
// Disable the entire birthday experience by changing this to false.
const BIRTHDAY_FEATURE_ENABLED = true;
const BIRTHDAY_SEEN_STORAGE_KEY = "mc_birthday_seen_v2";
const BIRTHDAY_AUTO_ADVANCE_MS = 10200;

type BirthdaySlide = {
  image?: string;
  eyebrow: string;
  title: string;
  body: string;
  note: string;
  finale?: boolean;
};

const BIRTHDAY_FLYERS = [
  assetUrl("events/1 year anniversary/mc1_1.jpg"),
  assetUrl("events/1 year anniversary/mc1_2.jpg"),
  assetUrl("events/1 year anniversary/mc1_3.jpg"),
];
const BIRTHDAY_LOGO = assetUrl("/ms.png");

const BIRTHDAY_SLIDES: BirthdaySlide[] = [
  {
    image: BIRTHDAY_FLYERS[0],
    eyebrow: "Happy 1st Anniversary",
    title: "One year of choosing hope.",
    body: "Mindful Circle began as a brave idea: create rooms where young people can breathe, be heard, and remember that their story is still unfolding.",
    note: "Every circle, flyer, conversation, and campaign has carried the same message: healing is possible when nobody has to walk alone.",
  },
  {
    image: BIRTHDAY_FLYERS[1],
    eyebrow: "The Journey",
    title: "Safe spaces that change lives.",
    body: "From peer support to awareness sessions, this movement has been building gentle spaces for mental health, honesty, recovery, and community care.",
    note: "The work is personal, practical, and hopeful: one open conversation can become the start of someone's next breath.",
  },
  {
    image: BIRTHDAY_FLYERS[2],
    eyebrow: "The Future",
    title: "More healing. More belonging.",
    body: "This birthday is not only a celebration. It is a promise to keep showing up with resources, compassion, advocacy, and creative moments of relief.",
    note: "Thank you for standing with a youth-led movement making mental health feel visible, human, and reachable.",
  },
  {
    eyebrow: "Mindful Circle @ 1",
    title: "A year of hope, held together.",
    body: "This is our first birthday, but the mission is bigger than a date: keep making mental health support feel safe, visible, and close enough to reach.",
    note: "View the anniversary flyers again, download them, or share Mindful Circle with someone who needs a softer place to land.",
    finale: true,
  },
];

const BIRTHDAY_CONFETTI = [
  { left: 3, delay: -500, duration: 5200, color: "#f97373", width: 9, height: 15 },
  { left: 8, delay: -1800, duration: 6100, color: "#ffd166", width: 7, height: 13 },
  { left: 14, delay: -2400, duration: 5700, color: "#3fb7a3", width: 8, height: 14 },
  { left: 19, delay: -700, duration: 6600, color: "#b07ad4", width: 10, height: 16 },
  { left: 25, delay: -3100, duration: 5900, color: "#ff8a5b", width: 7, height: 12 },
  { left: 31, delay: -1400, duration: 6400, color: "#f7c948", width: 9, height: 13 },
  { left: 38, delay: -2600, duration: 5400, color: "#8b52b5", width: 8, height: 15 },
  { left: 45, delay: -900, duration: 7000, color: "#53c2df", width: 7, height: 12 },
  { left: 52, delay: -3400, duration: 5800, color: "#ff5a8a", width: 9, height: 15 },
  { left: 58, delay: -1200, duration: 6300, color: "#6b3a92", width: 8, height: 13 },
  { left: 64, delay: -2800, duration: 5500, color: "#ffd166", width: 10, height: 16 },
  { left: 71, delay: -400, duration: 6800, color: "#2fbf9b", width: 7, height: 12 },
  { left: 77, delay: -2100, duration: 6000, color: "#f08a5d", width: 8, height: 14 },
  { left: 84, delay: -1600, duration: 6500, color: "#b07ad4", width: 9, height: 13 },
  { left: 91, delay: -3000, duration: 5600, color: "#f97373", width: 7, height: 12 },
  { left: 97, delay: -1000, duration: 7200, color: "#53c2df", width: 8, height: 15 },
];

function BirthdayAnniversaryFeature() {
  const [showBirthday, setShowBirthday] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const slideCount = BIRTHDAY_SLIDES.length;
  const active = BIRTHDAY_SLIDES[activeSlide];
  const isFinalSlide = Boolean(active.finale);
  const shareUrl = `${window.location.origin}/`;
  const shareTitle = "Mindful Circle @ 1";

  useEffect(() => {
    if (!BIRTHDAY_FEATURE_ENABLED) return;

    const timer = window.setTimeout(() => {
      let shouldOpen = true;

      try {
        shouldOpen = !sessionStorage.getItem(BIRTHDAY_SEEN_STORAGE_KEY);
        if (shouldOpen) sessionStorage.setItem(BIRTHDAY_SEEN_STORAGE_KEY, "1");
      } catch {
        shouldOpen = true;
      }

      if (shouldOpen) setShowBirthday(true);
    }, 650);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showBirthday || !isAutoPlaying || slideCount < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount);
    }, BIRTHDAY_AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [showBirthday, isAutoPlaying, slideCount]);

  useEffect(() => {
    if (!showBirthday) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showBirthday]);

  useEffect(() => {
    if (!showBirthday) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowBirthday(false);
      } else if (event.key === "ArrowRight") {
        goToSlide(activeSlide + 1);
      } else if (event.key === "ArrowLeft") {
        goToSlide(activeSlide - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showBirthday, activeSlide, slideCount]);

  useEffect(() => {
    if (!shareOpen || !qrCanvasRef.current) return;

    let isActive = true;
    const canvas = qrCanvasRef.current;
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    const displaySize = isMobile ? Math.round(220 * 0.7) : 220;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const pixelSize = Math.ceil(displaySize * ratio);

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
        logo.crossOrigin = "anonymous";
        logo.src = `${import.meta.env.BASE_URL}ms.png`;
        logo.onload = () => {
          if (!isActive) return;

          const logoSize = Math.floor(pixelSize * 0.24);
          const x = Math.floor((pixelSize - logoSize) / 2);
          const y = Math.floor((pixelSize - logoSize) / 2);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
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

  if (!BIRTHDAY_FEATURE_ENABLED) return null;

  const openBirthday = () => {
    setActiveSlide(0);
    setIsAutoPlaying(true);
    setShowBirthday(true);
  };

  const closeBirthday = () => {
    setShowBirthday(false);
    setShareOpen(false);
  };

  function goToSlide(index: number, pause = true) {
    if (pause) setIsAutoPlaying(false);
    setActiveSlide((index + slideCount) % slideCount);
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;

    const touch = event.changedTouches[0];
    if (!touch) {
      touchStart.current = null;
      return;
    }

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;

    goToSlide(deltaX < 0 ? activeSlide + 1 : activeSlide - 1);
  };

  const openShareMenu = () => {
    setIsAutoPlaying(false);
    setShareCopied(false);
    setShareOpen(true);
  };

  const closeShareMenu = () => {
    setShareOpen(false);
    setShareCopied(false);
  };

  const copyShareLink = async () => {
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

  const shareToApps = async () => {
    if (!navigator?.share) return;

    try {
      await navigator.share({ title: shareTitle, url: shareUrl });
    } catch {
      // Ignore share cancellation.
    }
  };

  const downloadQr = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "mindful-circle-anniversary-qr.png";
    link.click();
  };

  const downloadFlyer = async (url: string, name = "mindful-circle-anniversary.jpg") => {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("download-failed");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
    }
  };

  const downloadAll = () => {
    BIRTHDAY_FLYERS.forEach((flyer, index) => {
      window.setTimeout(() => {
        downloadFlyer(flyer, `mindful-circle-anniversary-${index + 1}.jpg`);
      }, index * 160);
    });
  };

  const viewCarousel = () => {
    setIsAutoPlaying(false);
    setActiveSlide(0);
  };

  return (
    <>
      <button
        className="birthday-gift-button"
        type="button"
        onClick={openBirthday}
        aria-label="Open Mindful Circle birthday story"
      >
        <Gift size={22} aria-hidden="true" />
        <span className="birthday-gift-spark" aria-hidden="true" />
      </button>

      {showBirthday && (
        <div className="birthday-modal" role="dialog" aria-modal="true" aria-labelledby="birthday-title" onClick={closeBirthday}>
          <div className="birthday-card" onClick={(event) => event.stopPropagation()}>
            <div className="birthday-confetti-field" aria-hidden="true">
              {BIRTHDAY_CONFETTI.map((piece, index) => (
                <span
                  key={`${piece.left}-${index}`}
                  className="birthday-confetti-piece"
                  style={{
                    left: `${piece.left}%`,
                    width: piece.width,
                    height: piece.height,
                    background: piece.color,
                    animationDelay: `${piece.delay}ms`,
                    animationDuration: `${piece.duration}ms`,
                  }}
                />
              ))}
            </div>

            <button className="birthday-close" type="button" onClick={closeBirthday} aria-label="Close birthday story">
              <X size={18} aria-hidden="true" />
            </button>

            <div
              className={`birthday-card-shell${isFinalSlide ? " is-final" : ""}`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="birthday-media-panel">
                {isFinalSlide ? (
                  <div className="birthday-finale-frame" aria-hidden="true">
                    <div className="birthday-finale-mark">
                      <img src={BIRTHDAY_LOGO} alt="" loading="lazy" />
                      <strong>@ 1</strong>
                    </div>
                    <div className="birthday-finale-collage">
                      {BIRTHDAY_FLYERS.map((flyer) => (
                        <img key={flyer} src={flyer} alt="" loading="lazy" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="birthday-flyer-frame">
                    <img key={active.image} src={active.image} alt={`${active.title} flyer`} loading="lazy" />
                  </div>
                )}

                <div className="birthday-thumb-row" aria-label="Birthday flyer slides">
                  {BIRTHDAY_SLIDES.map((slide, index) => (
                    <button
                      key={slide.image ?? slide.title}
                      className={`birthday-thumb${index === activeSlide ? " is-active" : ""}`}
                      type="button"
                      onClick={() => goToSlide(index)}
                      aria-label={`Show birthday slide ${index + 1}`}
                      aria-current={index === activeSlide ? "true" : undefined}
                    >
                      {slide.image ? (
                        <img src={slide.image} alt="" loading="lazy" />
                      ) : (
                        <span className="birthday-thumb-finale">@1</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="birthday-story-panel">
                <p className="birthday-kicker">{active.eyebrow}</p>
                <h2 className="birthday-title" id="birthday-title">{active.title}</h2>
                <p className="birthday-sub" aria-live="polite">{active.body}</p>
                <p className="birthday-note">{active.note}</p>

                <div className="birthday-progress" aria-hidden="true">
                  <span>0{activeSlide + 1}</span>
                  <div className="birthday-progress-track">
                    <span
                      key={activeSlide}
                      className={`birthday-progress-fill${isAutoPlaying ? "" : " is-paused"}`}
                      style={{ animationDuration: `${BIRTHDAY_AUTO_ADVANCE_MS}ms` }}
                    />
                  </div>
                  <span>0{slideCount}</span>
                </div>

                <div className="birthday-nav-row">
                  <button className="birthday-nav-btn" type="button" onClick={() => goToSlide(activeSlide - 1)} aria-label="Previous birthday slide">
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button className="birthday-nav-btn" type="button" onClick={() => goToSlide(activeSlide + 1)} aria-label="Next birthday slide">
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>

                {isFinalSlide && (
                  <div className="birthday-actions birthday-final-actions">
                    <button className="birthday-primary" type="button" onClick={viewCarousel}>
                      <Images size={16} aria-hidden="true" />
                      View carousel
                    </button>
                    <button className="birthday-secondary" type="button" onClick={downloadAll}>
                      <Download size={16} aria-hidden="true" />
                      Download flyers
                    </button>
                    <button className="birthday-secondary" type="button" onClick={openShareMenu}>
                      <Share2 size={16} aria-hidden="true" />
                      Share site
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {shareOpen && (
        <div className="share-modal birthday-share-modal" onClick={closeShareMenu}>
          <div className="share-card" onClick={(event) => event.stopPropagation()}>
            <button className="share-close" type="button" onClick={closeShareMenu} aria-label="Close share panel">
              <span aria-hidden="true">&times;</span>
            </button>
            <p className="share-kicker">Share Mindful Circle</p>
            <h3 className="share-title">{shareTitle}</h3>
            <div className="share-actions">
              <button className="share-btn" type="button" onClick={copyShareLink}>
                {shareCopied ? "Link copied" : "Copy link"}
              </button>
              <button
                className="share-btn secondary"
                type="button"
                onClick={shareToApps}
                disabled={!navigator?.share}
              >
                Share to apps
              </button>
              <button className="share-btn secondary" type="button" onClick={downloadQr}>
                Download QR
              </button>
            </div>
            <div className="share-qr">
              <canvas ref={qrCanvasRef} aria-label="QR code" role="img" />
              <p>Scan to open Mindful Circle.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// === BIRTHDAY ANNIVERSARY FEATURE: END ===

// Donate Modal
function DonateModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState<number | null>(50);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { setAmount("50"); }, []);

  const handlePreset = (v: number) => { setPreset(v); setAmount(String(v)); };

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2200);
  };

  const note = (ch: "momo" | "telecel" | "bank") => {
    const c = amount ? `GHS ${amount}` : "a donation";
    const d = name.trim() || "[Name]";
    if (ch === "momo")    return `Hi, I'd like to donate ${c} to Mindful Circle. My name is ${d}. Sending to MTN MoMo 0599078844 (Eugene Kwesi Arkhurst).`;
    if (ch === "telecel") return `Hi, I'd like to donate ${c} to Mindful Circle. My name is ${d}. Sending to Telecel Cash 0206238800 (Eugene Kwesi Arkhurst).`;
    return `Hi, I'd like to donate ${c} to Mindful Circle. My name is ${d}. Sending by bank transfer, Stanbic Bank, account 9040014155508, Gerald Kwesi Amoako.`;
  };

  const wa = (msg: string) => `https://wa.me/233599078844?text=${encodeURIComponent(msg)}`;

  const channels = [
    { id: "telecel", label: "Telecel Cash",                holder: "Eugene Kwesi Arkhurst", num: "0206238800",    nk: "tn", mk: "tm", cls: "logo-telecel",  logo: assetUrl("/tcash.png"), alt: "Telecel", wa: true  },
    { id: "bank",    label: "Stanbic Bank, West Hills Mall", holder: "Gerald Kwesi Amoako", num: "9040014155508", nk: "bn", mk: "bm", cls: "logo-bank",     logo: assetUrl("/stanbic.png"), alt: "Stanbic", wa: false },
  ] as const;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
        </button>

        <h2 className="modal-h2">Donate to Mindful Circle</h2>
        <p className="modal-desc">Every cedi goes directly into mental health programs, awareness campaigns, peer support, and community circles.</p>

        <div className="mfield">
          <label className="mlabel">Amount <span className="mlabel-unit">GHS</span></label>
          <div className="preset-row">
            {[10, 20, 50, 100].map(p => (
              <button key={p} className={`preset-btn${preset === p ? " sel" : ""}`} onClick={() => handlePreset(p)}>₵{p}</button>
            ))}
          </div>
          <input className="minput" type="number" min="1" placeholder="Other amount"
            value={amount} onChange={e => { setAmount(e.target.value); setPreset(null); }} />
        </div>

        <div className="mfield">
          <label className="mlabel">Your name <span className="mlabel-opt">optional, so we can thank you</span></label>
          <input className="minput" type="text" placeholder="e.g. Abena Mensah" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="mhr" />

        <p className="mlabel" style={{ marginBottom: "1rem" }}>Send via</p>

        <div className="ch-list">
          {channels.map((c) => (
            <div className="ch-card" key={c.id}>
              <div className="ch-top">
                <div className={`ch-logo ${c.cls}`}>
                  <img src={c.logo} alt={c.alt} className="ch-logo-img" onError={e => (e.currentTarget.style.display = "none")} loading="lazy" />
                </div>
                <div className="ch-info">
                  <p className="ch-name">{c.label}</p>
                  <button className="ch-num" onClick={() => handleCopy(c.num, c.nk)}>
                    {c.num}
                    {copied === c.nk
                      ? <span className="badge-ok">Copied</span>
                      : <span className="badge-tap">copy</span>}
                  </button>
                  <p className="ch-holder">{c.holder}</p>
                </div>
              </div>
              <div className="ch-actions">
                <button className="ch-copy" onClick={() => handleCopy(note(c.id as "momo"|"telecel"|"bank"), c.mk)}>
                  {copied === c.mk ? "✓ Copied" : c.id === "bank" ? "Copy bank details" : "Copy payment message"}
                </button>
                {c.wa && (
                  <a className="ch-wa" href={wa(note(c.id as "momo"|"telecel"))} target="_blank" rel="noopener noreferrer">
                    <WAIcon /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="modal-assurance">
          Every donation made to Mindful Circle has gone, without exception, into mental health awareness activities, peer support sessions, and community programs. That will not change.
        </p>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [modal, setModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [path, setPath] = useState(() => window.location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const copy = (text: string, key: string) => {
    copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2200);
  };

  const openModal = () => setModal(true);
  const isEventsList = path === "/events";
  const isEventsDetail = path.startsWith("/events/");
  const isMerchPage = path === "/merch";
  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/%20/g, " ")
      .replace(/\s+/g, "-")
      .replace(/_+/g, "-");
  const rawSlug = isEventsDetail ? decodeURIComponent(path.replace("/events/", "")) : "";
  const eventSlug = isEventsDetail ? normalizeSlug(rawSlug) : null;
  const handleNav = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("/")) return;
    event.preventDefault();
    const [nextPath, hash] = href.split("#");
    const targetPath = nextPath || "/";
    window.history.pushState({}, "", targetPath + (hash ? `#${hash}` : ""));
    setPath(targetPath);
    setMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const target = document.getElementById(hash);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  };
  const hasUpcomingEvents = eventsData.some((event) => event.status === "Upcoming");
  const navItems = (isEventsList || isEventsDetail)
    ? [
        { label: "Home", href: "/" },
        { label: "Events", href: "/events", highlight: hasUpcomingEvents },
        { label: "Merch", href: "/merch" },
        { label: "Donate", href: "/#donate" },
      ]
    : [
        { label: "About", href: "#about" },
        { label: "Events", href: "/events", highlight: hasUpcomingEvents },
        { label: "Merch", href: "/merch" },
        { label: "Donate", href: "#donate" },
      ];

  return (
    <div className="root">
      {modal && <DonateModal onClose={() => setModal(false)} />}
      <BirthdayAnniversaryFeature />

      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-logobox">
              <a href="/" onClick={handleNav("/")}>
              <img src="/ms.png" alt="Mindful Circle" className="header-logo-img" onError={e => (e.currentTarget.style.display = "none")} loading="lazy" /></a>
              <span className="header-logo-fb">MC</span>
            </div>
            <div className="header-brand-text">
              <span className="header-name">Mindful Circle</span>
              <span className="header-sub">Mental Health Initiative</span>
            </div>
          </div>
          <nav className="header-nav">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleNav(item.href)}
                className={item.highlight ? "nav-dot" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            className={`menu-toggle${hasUpcomingEvents ? " has-dot" : ""}`}
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-panel" onClick={(event) => event.stopPropagation()}>
            <button className="menu-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              &times;
            </button>
            <div className="menu-links">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNav(item.href)}
                  className={item.highlight ? "nav-dot" : undefined}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {isEventsList ? (
        <EventsPage />
      ) : eventSlug ? (
        <EventsPage selectedSlug={eventSlug} />
      ) : isMerchPage ? (
        <MerchPage />
      ) : (
        <>
          {/* ── Hero Section── */}
          <section className="hero">
            <div className="hero-glow" />
            <div className="hero-inner">
              <p className="hero-kicker">A movement, not a moment.</p>
              <h1 className="hero-h1">
                Safe spaces for<br /><em>young minds.</em>
              </h1>
              <p className="hero-body">
                Mindful Circle is a youth-led movement creating stigma-free spaces where young people can share, breathe, and heal together. Every donation goes directly into the circles, campaigns, and peer support sessions that make that possible.
              </p>
              <div className="hero-cta-row">
                <button className="btn-donate" onClick={openModal}>Donate Now</button>
                <div className="hero-social-row">
                  <a href="https://instagram.com/the_mindfulcircle" target="_blank" rel="noopener noreferrer" className="social-chip ig-chip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    @the_mindfulcircle
                  </a>
                  <a href="https://www.tiktok.com/@the_mindful_circle" target="_blank" rel="noopener noreferrer" className="social-chip tt-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
                    </svg>
                    @the_mindful_circle
                  </a>
                  <a href="mailto:miindfulcircle@gmail.com" className="social-chip email-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                    miindfulcircle@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── About ── */}
          <section id="about" className="about-section">
            <div className="section-wrap">
              <div className="about-grid">
                <div className="about-left">
                  <h2 className="section-h2">What is Mindful Circle?</h2>
                  <p>Mindful Circle is a <strong>youth-led mental health movement</strong> building safe, stigma-free spaces where young people can breathe, share, and heal, in schools, communities, and online.</p>
                  <p>We run community circles, peer-support sessions, awareness campaigns, and creative projects that make mental health support visible, normal, and accessible, especially for those who've never had access to it.</p>
                  <p>Join us to put more people in spaces, where they feel safe enough to express themselves.</p>
                </div>
                <div className="about-right">
                  <p className="about-right-heading">OUR ACTIVITIES</p>
                  <div className="about-list">
                    <div className="about-item">
                      <div className="about-item-line" />
                      <p>Safe-circle conversations in schools and communities</p>
                    </div>
                    <div className="about-item">
                      <div className="about-item-line" />
                      <p>Training peer supporters and youth mental health advocates</p>
                    </div>
                    <div className="about-item">
                      <div className="about-item-line" />
                      <p>Creative campaigns that challenge stigma through storytelling</p>
                    </div>
                    <div className="about-item">
                      <div className="about-item-line" />
                      <p>Mental health outreach events</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Impact ── */}
          <section id="impact" className="impact-section">
            <div className="impact-glow" />
            <div className="section-wrap">
              <h2 className="section-h2 light">The work so far.</h2>
              <p className="impact-desc">
                Since Mindful Circle began, <strong>every donation received has gone directly into mental health awareness activities, peer support programs, and community initiatives.</strong> Our events are where many of these moments come to life, and we keep them open, welcoming, and youth-led.
              </p>
              <div className="stats-grid">
                <div className="stat-block">
                  <div className="stat-num"><AnimatedNumber target={500} suffix="+" /></div>
                  <p className="stat-label">Young people reached</p>
                </div>
                <div className="stat-block">
                  <div className="stat-num"><AnimatedNumber target={30} suffix="+" /></div>
                  <p className="stat-label">Community circles held</p>
                </div>
                <div className="stat-block">
                  <div className="stat-num"><AnimatedNumber target={100} suffix="%" /></div>
                  <p className="stat-label">Of donations go to programs</p>
                </div>
              </div>
              <div className="impact-events-strip">
                <div>
                  <p className="impact-events-title">See our events</p>
                  <p className="impact-events-body">Open mic nights, community circles, and creative sessions where young people feel safe to speak.</p>
                </div>
                <a className="btn-donate-light" href="/events" onClick={handleNav("/events")}>Explore Events</a>
              </div>
              <div className="impact-cta-strip">
                <p>Stand for mental health with Mindful Circle by supporting care, awareness, and hope.</p>
                <button className="btn-donate-light" onClick={openModal}>Donate Now</button>
              </div>
            </div>
          </section>

          {/* ── Donate ── */}
          <section id="donate" className="donate-section">
            <div className="section-wrap">
              <div className="donate-header">
                <h2 className="section-h2">Donate directly.</h2>
                <p className="donate-desc">
                  Tap any number to copy it and send via mobile money or bank transfer. For a step-by-step flow with a pre-written payment message, use the button below.
                </p>
              </div>

              <div className="donate-layout">
                {/* Quick-copy channel cards */}
                <div className="qc-col">
                  {[
                    { label: "Telecel Cash",                    owner: "Eugene Kwesi Arkhurst", num: "0206238800",    key: "tcl",  cls: "logo-telecel",  logo: assetUrl("/tcash.png"), alt: "Telecel Cash" },
                    { label: "Stanbic Bank, West Hills Mall",  owner: "Gerald Kwesi Amoako",   num: "9040014155508", key: "bank", cls: "logo-bank",     logo: assetUrl("/stanbic.png"), alt: "Stanbic Bank"  },
                  ].map(c => (
                    <div className="qc-card" key={c.key}>
                      <div className="qc-card-top">
                        <div className={`qc-logo ${c.cls}`}>
                          <img src={c.logo} alt={c.alt} className="qc-logo-img" onError={e => (e.currentTarget.style.display = "none")} loading="lazy" />
                        </div>
                        <div>
                          <p className="qc-label">{c.label}</p>
                          <p className="qc-owner">{c.owner}</p>
                        </div>
                      </div>
                      <button className="qc-num-btn" onClick={() => copy(c.num, c.key)}>
                        <span className="qc-num-text">{c.num}</span>
                        {copied === c.key
                          ? <span className="qc-tag-ok">Copied</span>
                          : <span className="qc-tag">copy</span>}
                      </button>
                    </div>
                  ))}
                </div>

                {/* CTA panel */}
                <div className="cta-panel">
                  <div className="cta-panel-glow" />
                  <div className="cta-logo-wrap">
                    <img src="/ms.png" alt="Mindful Circle" className="cta-logo-img" onError={e => (e.currentTarget.style.display = "none")} loading="lazy" />
                    <span className="cta-logo-fb">MC</span>
                  </div>
                  <h3 className="cta-panel-h3">Donate with guidance</h3>
                  <p className="cta-panel-body">
                    Choose an amount, enter your name, and get a ready-made payment message to send via WhatsApp, or copy the details and send manually.
                  </p>
                  <button className="btn-donate cta-donate-btn" onClick={openModal}>
                    Donate Now
                  </button>
                 
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-brand">
              <div className="footer-logobox">
                <img src="/ms.png" alt="Mindful Circle" className="header-logo-img" onError={e => (e.currentTarget.style.display = "none")} loading="lazy" />
                <span className="header-logo-fb">MC</span>
              </div>
              <div>
                <p className="footer-name">Mindful Circle</p>
                <p className="footer-tag">Youth-led Mental Health Initiative</p>
              </div>
            </div>
            <p className="footer-note">All donations go directly into mental health awareness, community circles, and peer support programs.</p>
          </div>
          <div className="footer-right">
            <a href="https://instagram.com/the_mindfulcircle" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
            <a href="https://www.tiktok.com/@the_mindful_circle" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/></svg>
              TikTok
            </a>
            <a href="mailto:miindfulcircle@gmail.com" className="footer-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
              Email
            </a>
          </div>
        </div>
        <p className="footer-copy">© 2025 Mindful Circle. All rights reserved.</p>
      </footer>
    </div>
  );
}
