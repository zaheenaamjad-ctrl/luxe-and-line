import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Link, useLocation } from "wouter";

type Reply = {
  text: string;
  links?: { label: string; href: string }[];
};

const RESPONSES: { keywords: string[]; reply: Reply }[] = [
  {
    keywords: ["jeans", "denim", "trouser", "pant"],
    reply: {
      text: "We have a great premium jeans range! Wide-leg and straight-cut styles for men and women in light blue, mid blue and charcoal. Custom waist × length sizing available too. 💜",
      links: [{ label: "Browse Jeans Collection →", href: "/shop?category=jeans" }],
    },
  },
  {
    keywords: ["shalwar", "kameez", "suit", "lawn", "nureh", "charizma", "zeenat", "embroidered", "dress", "clothes", "clothing"],
    reply: {
      text: "We carry Nureh Gardenia, Charizma Sun Shine Vol.01, and Zeenat Embroidered collections — all with free UK delivery! Beautiful unstitched lawn fabric. 🌸",
      links: [{ label: "Shop Shalwar Kameez →", href: "/shop?category=shalwar-kameez" }],
    },
  },
  {
    keywords: ["wallet", "leather", "atrix", "purse", "card"],
    reply: {
      text: "Our Atrix genuine leather wallets start at just £12 including UK delivery! Accordion and snap-button styles available in brown and beige. 💛",
      links: [{ label: "Shop Leather Wallets →", href: "/shop?category=wallets" }],
    },
  },
  {
    keywords: ["kunafa", "sweet", "food", "pistachio", "chocolate", "snack", "treat", "bites"],
    reply: {
      text: "You'll love our Pistachio Kunafa Bites by B.C.C! Rich creamy pistachio filling in premium chocolate — £22 per box with free UK delivery. 🍫",
      links: [{ label: "Order Kunafa Bites →", href: "/product/8" }],
    },
  },
  {
    keywords: ["terms", "condition", "legal", "rule"],
    reply: {
      text: "You can read our full Terms & Conditions at any time — covers orders, returns, delivery and more. 📋",
      links: [{ label: "Terms & Conditions →", href: "/terms" }],
    },
  },
  {
    keywords: ["privacy", "policy", "data", "gdpr", "information"],
    reply: {
      text: "We take your privacy seriously and fully comply with UK GDPR. Read our full Privacy Policy below. 🔒",
      links: [{ label: "Privacy Policy →", href: "/policy" }],
    },
  },
  {
    keywords: ["order", "track", "delivery", "shipping", "dispatch", "arrive", "when"],
    reply: {
      text: "All orders are delivered within 4–5 business days after payment confirmation. Free UK delivery is included on everything! 📦",
      links: [{ label: "Contact Us →", href: "/contact" }],
    },
  },
  {
    keywords: ["payment", "pay", "bank", "cod", "cash", "transfer"],
    reply: {
      text: "We accept Bank Transfer and Cash on Delivery (COD). Full payment details are shown at checkout after placing your order. 💳",
      links: [{ label: "Start Shopping →", href: "/shop" }],
    },
  },
  {
    keywords: ["return", "refund", "exchange", "cancel", "replace", "wrong"],
    reply: {
      text: "For returns and exchanges, contact us within 7 days of delivery. We always aim to make things right! Full returns policy in our Terms & Conditions. ✨",
      links: [{ label: "Terms & Conditions →", href: "/terms" }],
    },
  },
  {
    keywords: ["contact", "phone", "email", "whatsapp", "call", "message", "reach"],
    reply: {
      text: "You can WhatsApp or call us on +44 7449 507661, or email luxeline26@gmail.com. We reply within 24 hours! 💜",
      links: [{ label: "Contact Page →", href: "/contact" }],
    },
  },
  {
    keywords: ["size", "sizing", "fit", "measurement", "waist", "length", "xl", "medium"],
    reply: {
      text: "For shalwar kameez we offer XS to XXL. For jeans we have waist×length sizing (e.g. 32×30) plus a custom measurement option on the product page. 📏",
      links: [{ label: "Contact Us for Help →", href: "/contact" }],
    },
  },
  {
    keywords: ["review", "rating", "feedback", "testimonial", "customer"],
    reply: {
      text: "See what our happy customers across the UK say — all real, honest reviews! 💬",
      links: [{ label: "Read Customer Reviews →", href: "/reviews" }],
    },
  },
  {
    keywords: ["faq", "question", "help", "how", "what"],
    reply: {
      text: "Great question! Check our FAQ section for the most common questions about delivery, sizing, payments and more. 🙋",
      links: [{ label: "View FAQs →", href: "/reviews#faq" }],
    },
  },
  {
    keywords: ["shop", "collection", "browse", "buy", "product", "all"],
    reply: {
      text: "Browse our full collection — shalwar kameez, jeans, leather wallets and pistachio kunafa. Free UK delivery on every item! 🛍️",
      links: [{ label: "Shop All Collections →", href: "/shop" }],
    },
  },
  {
    keywords: ["about", "brand", "story", "who", "liverpool"],
    reply: {
      text: "We're a Liverpool-based luxury boutique bringing authentic Pakistani fashion to British wardrobes. Read our full story below. 🏴󠁧󠁢󠁥󠁮󠁧󠁿💜",
      links: [{ label: "Our Story →", href: "/about" }],
    },
  },
];

const DEFAULT_REPLY: Reply = {
  text: "Sorry, our owner didn't allow me to talk about that. Please ask questions related to our store and I'll give you the answer respectfully. Thank you sweetheart! ❤️ You can also reach us directly on WhatsApp for anything!",
  links: [{ label: "Chat on WhatsApp →", href: "https://wa.me/447449507661" }],
};

const WELCOME =
  "Hi! Welcome to Luxe & Line 💜 I'm your virtual assistant. Ask me about our collections, delivery, sizing, payments — anything shop-related!";

interface Message {
  from: "bot" | "user";
  text: string;
  links?: { label: string; href: string }[];
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: WELCOME },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 80);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  const isHome = location === "/";
  const showButton = !isHome || scrolled;

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    let botReply: Reply = DEFAULT_REPLY;
    for (const { keywords, reply } of RESPONSES) {
      if (keywords.some((kw) => lower.includes(kw))) {
        botReply = reply;
        break;
      }
    }

    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "bot", ...botReply },
    ]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 text-white text-[11px] font-body font-semibold uppercase tracking-wider transition-all duration-500 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, hsl(270,80%,65%), hsl(270,60%,48%))",
          borderRadius: 50,
          padding: "11px 18px",
          boxShadow: "0 6px 28px rgba(120,60,200,0.45)",
          opacity: showButton ? 1 : 0,
          pointerEvents: showButton ? "auto" : "none",
          transform: showButton ? "translateY(0) scale(1)" : "translateY(16px) scale(0.9)",
        }}
      >
        {open ? <X size={15} /> : <MessageCircle size={15} />}
        <span>{open ? "Close" : "Ask us anything"}</span>
      </button>

      {open && (
        <div
          className="fixed bottom-[72px] right-6 z-50 flex flex-col"
          style={{
            width: 316,
            maxHeight: 470,
            background: "hsl(265,32%,8%)",
            border: "1px solid hsl(270,50%,40%,0.35)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(270,80%,58%), hsl(270,60%,42%))" }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-body font-semibold tracking-wide">Luxe & Line Assistant</p>
              <p className="text-white/70 text-[10px] font-body">Always here to help 💜</p>
            </div>
          </div>

          <div
            className="overflow-y-auto px-3 py-3 space-y-2.5"
            style={{ flex: "1 1 auto", minHeight: 0, maxHeight: 340 }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[88%] px-3 py-2 text-xs font-body leading-relaxed"
                  style={{
                    background:
                      msg.from === "user"
                        ? "linear-gradient(135deg, hsl(270,80%,60%), hsl(270,60%,44%))"
                        : "hsl(265,22%,15%)",
                    borderRadius:
                      msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    color: msg.from === "user" ? "#fff" : "hsl(280,20%,80%)",
                  }}
                >
                  <p>{msg.text}</p>
                  {msg.links?.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block mt-2 text-[10px] uppercase tracking-wider font-semibold"
                      style={{ color: msg.from === "user" ? "rgba(255,255,255,0.9)" : "hsl(270,80%,72%)" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div
            className="px-3 py-2.5 shrink-0 border-t flex gap-2 items-center"
            style={{ borderColor: "hsl(270,50%,40%,0.2)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about jeans, delivery, sizing..."
              className="flex-1 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-full px-3.5 py-1.5 text-xs font-body text-foreground placeholder:text-muted-foreground/40 transition-colors"
            />
            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95"
              style={{ background: "linear-gradient(135deg, hsl(270,80%,62%), hsl(270,60%,46%))" }}
            >
              <Send size={12} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
