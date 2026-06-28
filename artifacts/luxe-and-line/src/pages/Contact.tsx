import { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

function GeometricBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const shapes: Array<{ x: number; y: number; r: number; speed: number; angle: number; opacity: number }> = 
      Array.from({ length: 20 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 60 + 20,
        speed: Math.random() * 0.005 + 0.002,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.08 + 0.02,
      }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of shapes) {
        s.angle += s.speed;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.globalAlpha = s.opacity;
        ctx.strokeStyle = "hsl(43, 65%, 50%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI * 2) / 6;
          const px = Math.cos(a) * s.r;
          const py = Math.sin(a) * s.r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />;
}

const CONTACT_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://www.luxeandline.uk/contact",
      "url": "https://www.luxeandline.uk/contact",
      "name": "Contact Luxe & Line",
      "description": "Contact Luxe & Line UK via WhatsApp, email or our online form. Get help with sizing, orders, delivery and custom requests.",
      "isPartOf": { "@id": "https://www.luxeandline.uk/#website" },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.luxeandline.uk" },
          { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://www.luxeandline.uk/contact" },
        ],
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.luxeandline.uk/#business",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "telephone": "+447449507661",
          "email": "hello@luxeandline.uk",
          "availableLanguage": "English",
          "contactOption": "TollFree",
          "areaServed": "GB",
        },
      ],
    },
  ],
});

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Contact Us | Luxe & Line";
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDesc = metaDesc?.content ?? "";
    if (metaDesc) metaDesc.content = "Contact Luxe & Line UK via WhatsApp (+44 7449 507661), email hello@luxeandline.uk, or our online form. Fast response on sizing, orders and delivery.";
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevCanon = canon?.href ?? "";
    if (canon) canon.href = "https://www.luxeandline.uk/contact";
    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc!.content = prevDesc;
      if (canon) canon!.href = prevCanon;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: CONTACT_SCHEMA }} />
      <GeometricBg />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Get in Touch</p>
          <h1 className="font-serif text-5xl md:text-6xl gold-shimmer mb-6">Contact Us</h1>
          <div className="luxury-divider w-40 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-8">We'd love to hear from you</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-10">
              Whether you have a question about sizing, delivery, or want to place a custom order — we're here to help. Reach out via WhatsApp for the fastest response.
            </p>

            <div className="space-y-6">
              {[
                { icon: Phone, label: "WhatsApp / Phone", value: "+44 7449 507661", href: "https://wa.me/447449507661" },
                { icon: Mail, label: "Email", value: "luxeline26@gmail.com", href: "mailto:luxeline26@gmail.com" },
                { icon: MapPin, label: "Address", value: "39 Stanley Street, L7 0JN\nFairfield, Liverpool\nMerseyside, UK" },
                { icon: Clock, label: "Hours", value: "Mon – Sat: 9am – 8pm\nSunday: 12pm – 6pm" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 border border-primary/40 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-body text-muted-foreground mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-body text-foreground hover:text-primary transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm font-body text-foreground whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/447449507661"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-3 justify-center w-full py-4 font-body text-sm font-semibold uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #25D366, #1DA851)",
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(37,211,102,0.3)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div className="bg-card/80 backdrop-blur-sm border border-border p-8">
            <h2 className="font-serif text-xl text-foreground mb-6">Send a Message</h2>
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">Message Sent</h3>
                <p className="text-sm font-body text-muted-foreground">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { name: "name" as const, label: "Your Name", type: "text" },
                  { name: "email" as const, label: "Email Address", type: "email" },
                ].map(({ name, label, type }) => (
                  <div key={name}>
                    <label htmlFor={`contact-${name}`} className="block text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">{label}</label>
                    <input
                      id={`contact-${name}`}
                      type={type}
                      data-testid={`input-${name}`}
                      value={form[name]}
                      onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
                      required
                      aria-required="true"
                      className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="contact-message" className="block text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    data-testid="input-message"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    required
                    aria-required="true"
                    rows={5}
                    className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="button-send-message"
                  aria-label="Send message to Luxe & Line"
                  className="w-full bg-primary text-primary-foreground py-4 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} aria-hidden="true" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
