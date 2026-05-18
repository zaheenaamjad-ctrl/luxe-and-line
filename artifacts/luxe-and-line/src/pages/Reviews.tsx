import { useState } from "react";
import { Star, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Link } from "wouter";

const REVIEWS = [
  {
    id: 1,
    name: "Ayesha Rahman",
    location: "Manchester, UK",
    rating: 5,
    date: "April 2026",
    review:
      "Absolutely stunning quality! I ordered the Nureh Gardenia suit and it arrived beautifully packaged within 4 days. The fabric is exactly as described — luxurious and lightweight. Will definitely be ordering again!",
    product: "Nureh Gardenia — Grace Vol. 01",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  {
    id: 2,
    name: "Zara Khan",
    location: "Birmingham, UK",
    rating: 5,
    date: "March 2026",
    review:
      "I was a bit hesitant ordering from an online boutique but Luxe & Line exceeded all my expectations. The jeans fit perfectly — I sent my waist × length measurements and they got it spot on. Great communication too.",
    product: "Premium Wide-Leg Jeans",
    avatar: "https://i.pravatar.cc/80?img=23",
  },
  {
    id: 3,
    name: "Fatima Malik",
    location: "London, UK",
    rating: 5,
    date: "May 2026",
    review:
      "The Pistachio Kunafa Bites were a massive hit at our family gathering! Everyone was asking where I bought them. The packaging is gorgeous and delivery was super fast. Already ordered a second box!",
    product: "Pistachio Kunafa Bites",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: 4,
    name: "Sarah Ahmed",
    location: "Bradford, UK",
    rating: 4,
    date: "April 2026",
    review:
      "Beautiful Charizma Sun Shine suit — the embroidered chiffon dupatta is just gorgeous. Delivery was 5 days which was within the promised timeframe. The packaging made it feel like a proper luxury purchase.",
    product: "Charizma Sun Shine CSS-03",
    avatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    id: 5,
    name: "Nadia Hussain",
    location: "Leeds, UK",
    rating: 5,
    date: "February 2026",
    review:
      "I've ordered three times now and every single time the quality has been perfect. The Atrix leather wallets make brilliant gifts — bought them for my brothers and they absolutely loved them. Highly recommend!",
    product: "Atrix Leather Accordion Wallet",
    avatar: "https://i.pravatar.cc/80?img=15",
  },
  {
    id: 6,
    name: "Hina Qureshi",
    location: "Leicester, UK",
    rating: 5,
    date: "March 2026",
    review:
      "The Zeenat embroidered collection is honestly breathtaking. The photos don't do it justice — in person the embroidery work is incredibly detailed. Arrived quickly and the size guide was very helpful. 10/10.",
    product: "Zeenat Embroidered Collection",
    avatar: "https://i.pravatar.cc/80?img=5",
  },
];

const FAQS = [
  {
    q: "How long does delivery take across the UK?",
    a: "All orders are delivered within 4–5 business days after payment confirmation. We ship across the entire UK and all prices already include delivery costs — there are absolutely no hidden charges at checkout.",
  },
  {
    q: "Can I request custom stitching for the shalwar kameez?",
    a: "Yes! Our shalwar kameez collections are available as unstitched fabric so they can be tailored to your exact measurements. You can WhatsApp us on +44 7449 507661 with your measurements and we'll guide you through the process. Local stitching services are also available in the Liverpool area.",
  },
  {
    q: "Do the jeans come in standard sizes or can I order with my exact measurements?",
    a: "Our jeans are available in preset waist × length sizes (27×30, 28×31, 29×31, 30×30, 32×29, 32×30, 34×30, 34×31). You can also enter completely custom measurements directly on the product page. If you're unsure about sizing, WhatsApp us and we'll help you choose the right fit before you order.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept Bank Transfer and Cash on Delivery (COD). Payment details are provided after your order is placed. For bank transfers, payment must be confirmed before your order is dispatched. COD is available for most UK addresses — contact us to confirm for your area.",
  },
  {
    q: "What is your return and exchange policy?",
    a: "We accept returns and exchanges within 7 days of delivery, provided items are in their original, unworn condition with original packaging intact. Please contact us at luxeline26@gmail.com or WhatsApp us on +44 7449 507661 within this period to arrange. Full details are in our Terms & Conditions.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}
        />
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <p className="font-serif text-lg text-foreground group-hover:text-primary transition-colors pr-6 leading-snug">
          {q}
        </p>
        {open ? (
          <ChevronUp size={18} className="text-primary shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <p className="pb-5 text-sm font-body text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export function Reviews() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <section
        className="py-28 px-6 text-center border-b border-border/30"
        style={{ background: "linear-gradient(180deg, hsl(265,28%,5%) 0%, hsl(265,25%,8%) 100%)" }}
      >
        <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-4">Customer Love</p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-5 leading-tight">
          Real Reviews
        </h1>
        <p className="font-body text-sm text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
          Honest feedback from our customers across the UK. No filters, no fabrications — just real experiences from real people.
        </p>
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={22} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="font-serif text-4xl text-white">{avg}</span>
          <span className="text-sm font-body text-muted-foreground">/ 5 &nbsp;·&nbsp; {REVIEWS.length} reviews</span>
        </div>
        <Link
          href="/shop"
          className="inline-block text-[11px] uppercase tracking-[0.3em] font-body font-medium text-primary border border-primary/50 px-8 py-3 hover:bg-primary/10 transition-colors"
        >
          Shop Now
        </Link>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="flex flex-col p-6"
              style={{
                background: "hsl(265,25%,8%)",
                border: "1px solid hsl(265,20%,16%)",
                borderRadius: 4,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=6b21a8&color=fff&size=80`;
                  }}
                />
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">{r.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{r.location}</p>
                </div>
              </div>
              <StarRating rating={r.rating} />
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3 flex-1">
                "{r.review}"
              </p>
              <div className="mt-4 pt-4 border-t border-border/25 flex items-center justify-between">
                <p className="text-[9px] font-body text-primary uppercase tracking-widest leading-snug">{r.product}</p>
                <p className="text-[9px] font-body text-muted-foreground/50 shrink-0 ml-2">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="py-20 px-6 border-t border-border/30"
        style={{ background: "hsl(265,28%,6%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-4 text-center">
            Got Questions?
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-12 text-center leading-tight">
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
          <div className="mt-16 text-center">
            <p className="font-body text-sm text-muted-foreground mb-4">Still have a question?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] font-body font-medium text-primary border border-primary/50 px-8 py-3 hover:bg-primary/10 transition-colors"
            >
              <MessageCircle size={14} /> Contact Us
            </Link>
          </div>
        </div>
      </section>

      <ReviewSubmitSection />
    </div>
  );
}

function ReviewSubmitSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, customerEmail: email || null, rating, title: title || null, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit review.");
      } else {
        setSuccess(true);
        setName(""); setEmail(""); setRating(5); setTitle(""); setBody("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-6 border-t border-border/30" style={{ background: "hsl(265,25%,7%)" }}>
      <div className="max-w-xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-4 text-center">Share Your Experience</p>
        <h2 className="font-serif text-3xl text-foreground mb-10 text-center">Leave a Review</h2>

        {success ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={22} className="text-green-400 fill-green-400" />
            </div>
            <p className="font-serif text-xl text-foreground mb-2">Thank you!</p>
            <p className="font-body text-sm text-muted-foreground">Your review has been submitted and is now live.</p>
            <button onClick={() => setSuccess(false)} className="mt-6 text-xs font-body text-primary uppercase tracking-widest hover:underline">
              Leave another review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-3">Rating *</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={`transition-colors ${s <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Review Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Stunning quality!"
                className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Your Review *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
                placeholder="Tell us about your experience..."
                className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-body bg-red-500/10 border border-red-500/20 px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 font-body uppercase tracking-[0.2em] text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
              style={{ background: "hsl(270,80%,65%)", color: "#fff" }}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <><Star size={15} /> Submit Review</>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
