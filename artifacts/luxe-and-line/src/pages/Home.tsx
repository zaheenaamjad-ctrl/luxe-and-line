import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/* ─── Typography animation hook ─────────────────────────── */
function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

/* ─── Luxury animated button ─────────────────────────────── */
function LuxuryButton({
  href,
  children,
  dark = false,
  testId,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
  testId?: string;
}) {
  return (
    <Link href={href}>
      <button
        data-testid={testId}
        className={`luxury-btn group relative overflow-hidden inline-flex items-center gap-3 px-10 py-4 uppercase tracking-[0.25em] text-xs font-body font-medium transition-all duration-500 ${
          dark
            ? "bg-primary text-primary-foreground"
            : "border border-white/60 text-white hover:border-primary"
        }`}
      >
        <span className="relative z-10 flex items-center gap-3">
          {children}
          <ArrowRight
            size={13}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </span>
        {/* Shimmer sweep */}
        <span className="luxury-btn-shine" />
      </button>
    </Link>
  );
}

/* ─── Video Hero — 6-stage scroll (video → text → video → …) ── */
// stage 0,2,4 = video playing (no text overlay)
// stage 1,3,5 = text visible over that video
// Each scroll increments stage by 1; after stage 5 user exits hero.
const VIDEOS = [
  {
    src: "/videos/swan.mp4",
    label: "New Arrival 2026",
    title: ["LUXE", "& LINE"],
    sub: "Summer 2026 · Premium Pakistani Fashion · Free UK Delivery",
    cta: "Explore Collection",
    link: "/shop",
  },
  {
    src: "/videos/video1.mp4",
    label: "The Collection",
    title: ["ELEGANCE", "REDEFINED"],
    sub: "Luxury Unstitched Lawn · Delivered Across the UK",
    cta: "Shop Collection",
    link: "/shop?category=shalwar-kameez",
  },
  {
    src: "/videos/video2.mp4",
    label: "Heritage Pret",
    title: ["CRAFTED", "FOR YOU"],
    sub: "Premium Embroidery Pret · Pakistani Heritage in Every Stitch",
    cta: "Explore Now",
    link: "/shop",
  },
];

function VideoHero({ onExit }: { onExit: () => void }) {
  // 6 stages: 0 = video1 no text, 1 = video1 text, 2 = video2 no text,
  //           3 = video2 text, 4 = video3 no text, 5 = video3 text
  const [stage, setStage] = useState(0);
  const [locked, setLocked] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastScrollTime = useRef(0);

  const videoIdx = Math.floor(stage / 2);   // 0, 1, 2
  const showText = stage % 2 === 1;          // true for stages 1, 3, 5

  // Play active video
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === videoIdx) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [videoIdx]);

  const advance = useCallback(() => {
    if (locked) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 700) return;
    lastScrollTime.current = now;
    setLocked(true);
    if (stage < 5) {
      setStage((s) => s + 1);
    } else {
      onExit();
    }
    setTimeout(() => setLocked(false), 750);
  }, [stage, locked, onExit]);

  const retreat = useCallback(() => {
    if (locked || stage === 0) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 700) return;
    lastScrollTime.current = now;
    setLocked(true);
    setStage((s) => s - 1);
    setTimeout(() => setLocked(false), 750);
  }, [stage, locked]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 20) advance();
      else if (e.deltaY < -20) retreat();
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) dy > 0 ? advance() : retreat();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); advance(); }
      if (e.key === "ArrowUp") { e.preventDefault(); retreat(); }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [advance, retreat]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* Videos */}
      {VIDEOS.map((vid, idx) => (
        <div
          key={idx}
          className="absolute inset-0"
          style={{
            transition: "opacity 1.1s ease, transform 1.1s ease",
            opacity: videoIdx === idx ? 1 : 0,
            transform:
              videoIdx === idx
                ? "scale(1)"
                : idx < videoIdx
                ? "scale(1.05) translateY(-3%)"
                : "scale(1.05) translateY(3%)",
            zIndex: videoIdx === idx ? 2 : 1,
          }}
        >
          <video
            ref={(el) => { videoRefs.current[idx] = el; }}
            src={vid.src}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="auto"
          />
          <div
            className="absolute inset-0"
            style={{
              background: showText
                ? "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.75) 100%)"
                : "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
              transition: "background 1s ease",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }}
          />
        </div>
      ))}

      {/* Text overlay — only visible on odd stages */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        style={{
          transition: "opacity 0.8s ease, transform 0.8s ease",
          opacity: showText ? 1 : 0,
          transform: showText ? "translateY(0)" : "translateY(30px)",
        }}
      >
        <p
          className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-primary font-body mb-6 opacity-90"
          style={{ transition: "opacity 0.7s ease 0.1s", opacity: showText ? 0.9 : 0 }}
        >
          Luxe &amp; Line — {VIDEOS[videoIdx].label}
        </p>

        <div className="mb-6">
          {VIDEOS[videoIdx].title.map((line, i) => (
            <div key={`${videoIdx}-${i}`} className="overflow-hidden">
              <h1
                className="font-serif leading-[0.88] text-white tracking-tight uppercase"
                style={{
                  fontSize: "clamp(3.5rem, 12vw, 10rem)",
                  transition: `opacity 0.7s ease ${0.15 + i * 0.12}s, transform 0.7s ease ${0.15 + i * 0.12}s`,
                  opacity: showText ? 1 : 0,
                  transform: showText ? "translateY(0)" : "translateY(50px)",
                  textShadow: "0 4px 50px rgba(0,0,0,0.5)",
                  fontStyle: i === 1 ? "italic" : "normal",
                }}
              >
                {i === 1 ? <span className="text-primary">{line}</span> : line}
              </h1>
            </div>
          ))}
        </div>

        {/* Gold divider */}
        <div
          className="mx-auto mb-6"
          style={{
            width: showText ? "140px" : "0px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, hsl(270,80%,65%), transparent)",
            transition: "width 1.1s ease 0.45s",
          }}
        />

        <p
          className="font-body text-sm md:text-base text-white/70 mb-10 tracking-[0.15em]"
          style={{
            transition: "opacity 0.7s ease 0.55s, transform 0.7s ease 0.55s",
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {VIDEOS[videoIdx].sub}
        </p>

        <div
          className="pointer-events-auto"
          style={{
            transition: "opacity 0.7s ease 0.7s, transform 0.7s ease 0.7s",
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <LuxuryButton href={VIDEOS[videoIdx].link} testId={`cta-video-${videoIdx}`}>
            {VIDEOS[videoIdx].cta}
          </LuxuryButton>
        </div>
      </div>

      {/* Progress dots — one per VIDEO (3 dots), active when that video is showing */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            data-testid={`dot-${i}`}
            onClick={() => { if (!locked) setStage(i * 2); }}
            className="transition-all duration-500 rounded-full"
            style={{
              width: 6,
              height: videoIdx === i ? 42 : 6,
              backgroundColor: videoIdx === i ? "hsl(270,80%,65%)" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* Scroll indicator — always visible, changes label */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
        <div className="scroll-indicator cursor-pointer" onClick={advance}>
          <div className="scroll-line" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.4em] font-body text-white/35">
          {stage === 5 ? "Enter" : showText ? "Next" : "Scroll"}
        </span>
      </div>

    </div>
  );
}

/* ─── Section reveal wrapper ─────────────────────────────── */
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s ease ${delay}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(36px)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Catalog section heading ────────────────────────────── */
function CatalogHeading({
  eyebrow,
  title,
  italic,
  desc,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  desc: string;
}) {
  return (
    <RevealSection className="text-center mb-16">
      <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-5">
        {eyebrow}
      </p>
      <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-3 leading-tight">
        {title}
        {italic && <> <em className="text-primary">{italic}</em></>}
      </h2>
      <div
        className="mx-auto my-5"
        style={{
          width: 80,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, hsl(270,80%,65%), transparent)",
        }}
      />
      <p className="text-sm font-body text-muted-foreground max-w-xl mx-auto leading-relaxed">
        {desc}
      </p>
    </RevealSection>
  );
}

/* ─── Single product card ────────────────────────────────── */
function CatalogCard({
  name,
  price,
  img,
  href,
  delay = 0,
  code,
  showSale = false,
  originalPrice,
  suitNumber,
}: {
  name: string;
  price: number;
  img: string;
  href: string;
  delay?: number;
  code?: string;
  showSale?: boolean;
  originalPrice?: number;
  suitNumber?: string;
}) {
  return (
    <RevealSection delay={delay}>
      <Link href={href}>
        <div className="group cursor-pointer">
          <div className="relative overflow-hidden bg-card aspect-[3/4] mb-3">
            <img
              src={img}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            {/* Code badge */}
            {code && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-[8px] uppercase tracking-widest px-2 py-0.5 font-body">
                {code}
              </div>
            )}
            {/* SALE badge */}
            {showSale && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] uppercase tracking-widest px-2 py-1 font-body font-bold shadow-lg">
                SALE
              </div>
            )}
            {/* Suit number */}
            {suitNumber && (
              <div className="absolute bottom-2 right-2 bg-primary/90 text-white text-[8px] uppercase tracking-widest px-2 py-0.5 font-body">
                #{suitNumber}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-[10px] uppercase tracking-[0.25em] font-body border border-white/70 px-5 py-2.5">
                View Details
              </span>
            </div>
          </div>
          <p className="font-serif text-sm text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
            {name}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-base font-body text-white font-bold price-glow">£{price}</p>
            {originalPrice && (
              <p className="text-sm font-body text-red-500 line-through font-medium">£{originalPrice}</p>
            )}
            <span className="text-muted-foreground text-[10px] font-body font-normal">incl. delivery</span>
          </div>
        </div>
      </Link>
    </RevealSection>
  );
}

/* ─── Nureh Gardenia section ─────────────────────────────── */
const NUREH_ITEMS = [
  { code: "NSG-215", img: "/product-images/nureh-gardenia/nsg-215.png", name: "Gardenia NSG-215", price: 65, id: 1 },
  { code: "NSG-216", img: "/product-images/nureh-gardenia/nsg-216.png", name: "Gardenia NSG-216", price: 65, id: 9 },
  { code: "NSG-217", img: "/product-images/nureh-gardenia/nsg-217.png", name: "Gardenia NSG-217", price: 65, id: 10 },
  { code: "NSG-218", img: "/product-images/nureh-gardenia/nsg-218.png", name: "Gardenia NSG-218", price: 65, id: 11 },
  { code: "NSG-219", img: "/product-images/nureh-gardenia/nsg-219.png", name: "Gardenia NSG-219", price: 65, id: 12 },
  { code: "NSG-220", img: "/product-images/nureh-gardenia/nsg-220.png", name: "Gardenia NSG-220", price: 65, id: 13 },
  { code: "NSG-221", img: "/product-images/nureh-gardenia/nsg-221.png", name: "Gardenia NSG-221", price: 65, id: 14 },
  { code: "NSG-222", img: "/product-images/nureh-gardenia/nsg-222.png", name: "Gardenia NSG-222", price: 65, id: 15 },
  { code: "NSG-223", img: "/product-images/nureh-gardenia/nsg-223.png", name: "Gardenia NSG-223", price: 65, id: 22 },
  { code: "NSG-224", img: "/product-images/nureh-gardenia/nsg-224.png", name: "Gardenia NSG-224", price: 65, id: 16 },
];

function NurehGardeniaSection() {
  return (
    <section className="py-28 px-6 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        {/* Portrait model video */}
        <RevealSection className="mb-16 flex justify-center">
          <div className="relative overflow-hidden" style={{ width: 340, aspectRatio: "9/16", maxHeight: "75vh" }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/model-gardenia.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-1">Gardenia by Nurèh</p>
              <p className="font-serif text-2xl text-white leading-tight">Summer 2026</p>
              <p className="font-body text-xs text-white/70 mt-1">10 Piece Set · Embroidered Lawn</p>
            </div>
          </div>
        </RevealSection>

        <CatalogHeading
          eyebrow="Gardenia by Nurèh · Summer 2026 New Arrival"
          title="Gardenia"
          italic="by Nurèh"
          desc="Embroidered and printed lawn collection with embroidered chiffon dupatta — by Riaz Arts. 10 piece set. Unstitched — delivered as fabric pieces, ready for your tailor."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-14">
          {NUREH_ITEMS.map((item, i) => (
            <CatalogCard
              key={item.code}
              code={item.code}
              name={item.name}
              price={item.price}
              originalPrice={100}
              showSale={true}
              suitNumber={item.code.replace("NSG-", "")}
              img={item.img}
              href={`/product/${item.id}`}
              delay={i * 50}
            />
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-nureh-shop">
            Shop Full Gardenia Range
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Zeenat Solid Pret section ──────────────────────────── */
const ZEENET_ITEMS = [
  { code: "ZPSP-01", img: "/product-images/zeenat/zpsp-01.png", name: "Solid Pret ZPSP-01", price: 45, id: 17 },
  { code: "ZPSP-02", img: "/product-images/zeenat/zpsp-02.png", name: "Solid Pret ZPSP-02", price: 45, id: 18 },
  { code: "ZPSP-03", img: "/product-images/zeenat/zpsp-03.png", name: "Solid Pret ZPSP-03", price: 45, id: 19 },
  { code: "ZPSP-04", img: "/product-images/zeenat/zpsp-04.png", name: "Solid Pret ZPSP-04", price: 45, id: 20 },
  { code: "ZPSP-05", img: "/product-images/zeenat/zpsp-05.png", name: "Solid Pret ZPSP-05", price: 45, id: 21 },
  { code: "ZPSP-06", img: "/product-images/zeenat/zpsp-06.png", name: "Solid Pret ZPSP-06", price: 45, id: 31 },
  { code: "ZPSP-07", img: "/product-images/zeenat/zpsp-07.png", name: "Solid Pret ZPSP-07", price: 45, id: 32 },
  { code: "ZPSP-08", img: "/product-images/zeenat/zpsp-08.png", name: "Solid Pret ZPSP-08", price: 45, id: 33 },
  { code: "ZPSP-09", img: "/product-images/zeenat/zpsp-09.png", name: "Solid Pret ZPSP-09", price: 45, id: 34 },
  { code: "ZPSP-10", img: "/product-images/zeenat/zpsp-10.png", name: "Solid Pret ZPSP-10", price: 45, id: 35 },
];

function ZeenatSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,28%,7%) 0%, hsl(265,25%,9%) 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Portrait model video */}
        <RevealSection className="mb-16 flex justify-center">
          <div className="relative overflow-hidden" style={{ width: 340, aspectRatio: "9/16", maxHeight: "75vh" }}>
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="/videos/model-zeenat.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-1">Zeenat</p>
              <p className="font-serif text-2xl text-white leading-tight">Solid Pret Vol-1</p>
              <p className="font-body text-xs text-white/70 mt-1">Embroidered Lawn · Fancy Chiffon Dupatta</p>
            </div>
          </div>
        </RevealSection>

        <CatalogHeading
          eyebrow="Zeenat · Summer 2026 New Arrival"
          title="Solid Pret"
          italic="Vol-1"
          desc="ZEENAT SOLID PRET STITCHED COTTON LAWN VOL-1 — Embroidered lawn with printed embroidered fancy chiffon dupatta. 10 designs · Sizes S, M, L · Ready to wear · UK delivery included."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-14">
          {ZEENET_ITEMS.map((item, i) => (
            <CatalogCard
              key={item.code}
              code={item.code}
              name={item.name}
              price={item.price}
              originalPrice={60}
              showSale={true}
              suitNumber={item.code.replace("ZPSP-", "")}
              img={item.img}
              href={`/product/${item.id}`}
              delay={i * 50}
            />
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-pret-shop">
            Shop Zeenat Collection
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Charizma Sunshine section ───────────────────────────── */
const CHARIZMA_ITEMS = [
  { code: "CSS-01", img: "/product-images/charizma/css-01.png", name: "Sun Shine CSS-01", price: 85, id: 2 },
  { code: "CSS-02", img: "/product-images/charizma/css-02.png", name: "Sun Shine CSS-02", price: 85, id: 23 },
  { code: "CSS-03", img: "/product-images/charizma/css-03.png", name: "Sun Shine CSS-03", price: 85, id: 24 },
  { code: "CSS-04", img: "/product-images/charizma/css-04.png", name: "Sun Shine CSS-04", price: 85, id: 25 },
  { code: "CSS-05", img: "/product-images/charizma/css-05.png", name: "Sun Shine CSS-05", price: 85, id: 26 },
  { code: "CSS-06", img: "/product-images/charizma/css-06.png", name: "Sun Shine CSS-06", price: 85, id: 27 },
  { code: "CSS-07", img: "/product-images/charizma/css-07.png", name: "Sun Shine CSS-07", price: 85, id: 28 },
  { code: "CSS-08", img: "/product-images/charizma/css-08.png", name: "Sun Shine CSS-08", price: 85, id: 29 },
  { code: "CSS-09", img: "/product-images/charizma/css-09.png", name: "Sun Shine CSS-09", price: 85, id: 30 },
];

function CharizmaSection() {
  return (
    <section className="py-28 px-6 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        {/* Portrait model video */}
        <RevealSection className="mb-16 flex justify-center">
          <div className="relative overflow-hidden" style={{ width: 340, aspectRatio: "9/16", maxHeight: "75vh" }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/model-charizma.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-1">Charizma</p>
              <p className="font-serif text-2xl text-white leading-tight">Sun Shine Vol. 01</p>
              <p className="font-body text-xs text-white/70 mt-1">Stitched Embroidered Lawn · 3-Piece</p>
            </div>
          </div>
        </RevealSection>

        <CatalogHeading
          eyebrow="Charizma · Summer 2026 New Arrival"
          title="Sun Shine"
          italic="Vol. 01"
          desc="Charizma Sun Shine Stitched Embroidered Lawn Suit Collection with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit — ready to wear. UK delivery included."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-14">
          {CHARIZMA_ITEMS.map((item, i) => (
            <CatalogCard
              key={item.code}
              code={item.code}
              name={item.name}
              price={item.price}
              originalPrice={115}
              showSale={true}
              suitNumber={item.code.replace("CSS-", "")}
              img={item.img}
              href={`/product/${item.id}`}
              delay={i * 50}
            />
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-charizma-shop">
            Shop Charizma Sun Shine
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Jeans section ──────────────────────────────────────── */
const JEANS_ITEMS = [
  { code: "J-01", img: "/product-images/jeans/j-women-lightblue.png", name: "Women's Wide Leg — Light Blue", price: 38, id: 4 },
  { code: "J-02", img: "/product-images/jeans/j-men-lightblue.png",   name: "Men's Straight Cut — Light Blue", price: 38, id: 5 },
  { code: "J-03", img: "/product-images/jeans/j-women-dark.png",      name: "Women's Wide Leg — Charcoal",    price: 38, id: 4 },
  { code: "J-04", img: "/product-images/jeans/j-men-dark.png",        name: "Men's Straight Cut — Charcoal",  price: 38, id: 5 },
  { code: "J-05", img: "/product-images/jeans/j-women-blue.png",      name: "Women's Wide Leg — Mid Blue",    price: 38, id: 4 },
  { code: "J-06", img: "/product-images/jeans/j-men-blue.png",        name: "Men's Straight Cut — Mid Blue",  price: 38, id: 5 },
];

function JeansSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,25%,6%) 0%, hsl(265,28%,8%) 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <CatalogHeading
          eyebrow="Premium Denim · Men & Women"
          title="Premium Jeans"
          italic="Collection"
          desc="Slim fit and wide-leg silhouettes for men and women. Light blue, mid blue and charcoal washes. Crafted for the modern wardrobe. Sizes 28–36. UK delivery included."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-14">
          {JEANS_ITEMS.map((item, i) => (
            <RevealSection key={item.code} delay={i * 40}>
              <Link href={`/product/${item.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-card aspect-[2/3] mb-3">
                    <img src={item.img} alt={item.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 object-top" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-[9px] uppercase tracking-[0.2em] font-body border border-white/60 px-3 py-1.5">View</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                      <p className="text-white text-[10px] font-body uppercase tracking-widest truncate">{item.code}</p>
                    </div>
                  </div>
                  <p className="font-body text-xs text-foreground/80 group-hover:text-primary transition-colors truncate">{item.name}</p>
                  <p className="text-xs font-body text-primary font-medium mt-0.5 price-glow">£{item.price}</p>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=jeans" dark testId="btn-jeans-shop">Shop Jeans</LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Wallets section ─────────────────────────────────────── */
const WALLET_ITEMS = [
  { img: "/product-images/wallets/w-accordion-brown.png", name: "Atrix Leather Accordion Wallet", desc: "Zip-around accordion design, 8+ card slots. Compact carry for everyday essentials.", price: 12, id: 6 },
  { img: "/product-images/wallets/w-embossed-brown.png",  name: "Embossed Button Wallet",         desc: "Embossed geometric detail with snap button closure. Slim profile, multiple card slots.", price: 12, id: 7 },
  { img: "/product-images/wallets/w-snap-beige.png",      name: "Snap Button Wallet — Beige",     desc: "Clean minimalist design in premium beige leather. Snap closure, card organiser inside.", price: 12, id: 7 },
];

function WalletsSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,28%,8%) 0%, hsl(265,25%,6%) 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <CatalogHeading
          eyebrow="Atrix Leather · Handcrafted"
          title="Leather Wallets"
          italic="by Atrix"
          desc="Genuine leather accordion card wallets. Zip-around and snap-button styles. Available in brown and beige. Each wallet holds 8+ cards. Premium everyday carry — £12 each."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {WALLET_ITEMS.map((item, i) => (
            <RevealSection key={item.name} delay={i * 80}>
              <Link href={`/product/${item.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-card aspect-square mb-4">
                    <img src={item.img} alt={item.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-[9px] uppercase tracking-[0.2em] font-body border border-white/60 px-4 py-2">View</span>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors mb-1">{item.name}</h3>
                  <p className="text-xs font-body text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                  <p className="font-serif text-xl text-primary price-glow">£{item.price}</p>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=wallets" dark testId="btn-wallets-shop">Shop Wallets</LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Pistachio Kunafa Bites section ─────────────────────── */
const KUNAFA_IMGS = [
  "/product-images/kunafa/k-jar-branded.png",
  "/product-images/kunafa/k-jar-open.png",
  "/product-images/kunafa/k-loose-pieces.png",
  "/product-images/kunafa/k-single-wrap.png",
];

function KunafaSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,25%,6%) 0%, hsl(265,28%,7%) 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <CatalogHeading
          eyebrow="B.C.C. · Premium Confectionery"
          title="Pistachio Kunafa Bites"
          italic="by B.C.C."
          desc="Classic Middle Eastern pistachio kunafa in premium chocolate form. Rich creamy pistachio filling with a satisfying crunch. Individually wrapped — perfect as a gift or treat. UK delivery included."
        />
        <RevealSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
            {KUNAFA_IMGS.map((img, i) => (
              <Link href="/product/8" key={i}>
                <div className="aspect-square overflow-hidden bg-card group cursor-pointer">
                  <img src={img} alt="Pistachio Kunafa Bites" loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-3">
              B.C.C. Pistachio Kunafa Bites · Premium Gift Box
            </p>
            <p className="font-serif text-5xl text-primary price-glow mb-1">£22</p>
            <p className="text-xs font-body text-muted-foreground mb-8">per box · UK delivery included</p>
            <LuxuryButton href="/product/8" dark testId="btn-kunafa-order">Order Kunafa Bites</LuxuryButton>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Brand promise banner ───────────────────────────────── */
function BrandBanner() {
  return (
    <section className="py-24 px-6 bg-background border-t border-border/30">
      <div className="max-w-5xl mx-auto text-center">
        <RevealSection>
          <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-5">
            Our Promise
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-foreground mb-6 leading-tight">
            Lahore&apos;s Finest,
            <br />
            <em className="text-primary">Delivered to Liverpool</em>
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Every piece we curate is hand-selected from Pakistan&apos;s most celebrated fashion
            houses. All prices include free UK delivery. WhatsApp us on{" "}
            <a href="tel:+447405358689" className="text-primary hover:underline">
              +44 7405 358689
            </a>{" "}
            for custom orders.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {[
              "Free UK Delivery",
              "Authentic Designs",
              "Custom Stitching Available",
              "WhatsApp Support",
              "Secure Checkout",
            ].map((tag) => (
              <span
                key={tag}
                className="border border-primary/30 text-primary text-[10px] uppercase tracking-widest font-body px-4 py-2"
              >
                {tag}
              </span>
            ))}
          </div>
          <LuxuryButton href="/shop" dark testId="btn-banner-shop">
            Explore All Products
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Contact footer strip ──────────────────────────────── */
function ContactStrip() {
  return (
    <section
      className="py-16 px-6 border-t border-border/30 text-center"
      style={{ background: "hsl(265,28%,5%)" }}
    >
      <RevealSection>
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-3">
          Liverpool, UK
        </p>
        <h2 className="font-serif text-3xl text-foreground mb-6">
          Questions? We&apos;re here for you.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm font-body text-muted-foreground mb-8">
          <a href="tel:+447405358689" className="hover:text-primary transition-colors">
            +44 7405 358689
          </a>
          <span className="hidden sm:block text-border">·</span>
          <a href="mailto:hello@luxeandline.co.uk" className="hover:text-primary transition-colors">
            hello@luxeandline.co.uk
          </a>
          <span className="hidden sm:block text-border">·</span>
          <span>39 Stanley Street, Liverpool L7 0JN</span>
        </div>
        <LuxuryButton href="/contact" testId="btn-contact">
          Contact Us
        </LuxuryButton>
      </RevealSection>
    </section>
  );
}

/* ─── Home root ─────────────────────────────────────────── */
export function Home() {
  const [videoDone, setVideoDone] = useState(false);
  useRevealOnScroll();

  return (
    <div className="w-full">
      {!videoDone && <VideoHero onExit={() => setVideoDone(true)} />}
      {/* Main content — only visible after video hero is dismissed */}
      <div
        style={{
          visibility: videoDone ? "visible" : "hidden",
          transition: "opacity 0.6s ease",
          opacity: videoDone ? 1 : 0,
        }}
      >
        <NurehGardeniaSection />
        <ZeenatSection />
        <CharizmaSection />
        <JeansSection />
        <WalletsSection />
        <KunafaSection />
        <BrandBanner />
        <ContactStrip />
      </div>
    </div>
  );
}
