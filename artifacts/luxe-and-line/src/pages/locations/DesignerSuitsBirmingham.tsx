import { Link } from "wouter";

export function DesignerSuitsBirmingham() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Luxe & Line",
        "description": "Designer suits and luxury fashion delivered across Birmingham and the West Midlands.",
        "url": "https://www.luxeandline.uk/designer-suits-birmingham",
        "telephone": "+447449507661",
        "email": "hello@luxeandline.uk",
        "address": { "@type": "PostalAddress", "addressLocality": "Liverpool", "postalCode": "L7 0JN", "addressCountry": "GB" },
        "areaServed": { "@type": "City", "name": "Birmingham" },
        "priceRange": "££",
        "image": "https://www.luxeandline.uk/og-image.jpg"
      })}} />

      <nav className="text-xs font-body text-muted-foreground mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span>Designer Suits Birmingham</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-3">Serving Birmingham · Free UK Delivery</p>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 leading-tight">
          Designer Suits Birmingham | Luxe &amp; Line
        </h1>
        <div className="luxury-divider w-16 mb-6" />
        <p className="text-muted-foreground font-body leading-relaxed text-base">
          Premium designer suits and luxury fashion delivered free across Birmingham. Fully stitched, ready to wear — dispatched from Liverpool with love.
        </p>
      </header>

      <div className="prose prose-invert max-w-none font-body space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Birmingham's Online Destination for Designer Suits</h2>
          <p>
            Birmingham is one of the UK's most fashion-forward cities, with a rich cultural diversity that drives demand for truly exceptional designer suits. At <strong className="text-foreground">Luxe & Line</strong>, we're proud to serve Birmingham's discerning community with premium stitched suits, delivered free to all B postcodes within 4–5 business days.
          </p>
          <p>
            Whether you're in Edgbaston, Solihull, Moseley, or Birmingham city centre, our luxury fashion collection arrives directly at your door. No compromise on quality. No compromise on convenience.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Designer Suits for Every Birmingham Occasion</h2>
          <p>
            Birmingham's calendar is filled with occasions that deserve exceptional fashion. From Eid celebrations in Sparkhill and Handsworth to weddings in the Jewellery Quarter venues, our curated collection has a suit for every significant moment.
          </p>
          <h3 className="font-serif text-xl text-foreground mt-6 mb-3">Wedding Season</h3>
          <p>
            Our <Link href="/shop?category=shalwar-kameez" className="text-primary hover:underline">Nureh Gardenia embroidered suits</Link> are among the most popular choices for Birmingham wedding guests and hosts alike. The heavy embellishment and rich fabrics are designed to photograph beautifully and wear comfortably throughout long celebrations.
          </p>
          <h3 className="font-serif text-xl text-foreground mt-6 mb-3">Eid &amp; Cultural Celebrations</h3>
          <p>
            For Eid, our Charizma Sun Shine Vol.01 and Luxury Pret collections offer vibrant, celebratory designs that honour the occasion with appropriate splendour. All available for immediate dispatch — no waiting for tailoring.
          </p>
          <h3 className="font-serif text-xl text-foreground mt-6 mb-3">Everyday Luxury</h3>
          <p>
            Our lighter-weight designs work beautifully for everyday wear in Birmingham's busy lifestyle. Pair with minimal accessories for a polished, put-together look on any day of the week.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Quality That Speaks for Itself</h2>
          <p>
            Every designer suit in the Luxe & Line collection is:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fully stitched and ready to wear — no alteration required</li>
            <li>Made from carefully selected premium fabrics</li>
            <li>Inspected before dispatch to ensure perfect quality</li>
            <li>Dispatched in protective packaging to preserve condition</li>
            <li>Backed by our 7-day easy returns policy</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Beyond Suits — Our Full Birmingham Collection</h2>
          <p>
            Luxe & Line offers more than designer suits. Our <Link href="/shop?category=jeans" className="text-primary hover:underline">premium denim jeans</Link> feature custom waist × length sizing for a perfect fit. Our <Link href="/shop?category=wallets" className="text-primary hover:underline">Atrix leather wallets</Link> are the ideal complement to any wardrobe. And our <Link href="/shop" className="text-primary hover:underline">artisan Kunafa Chocolates</Link> make extraordinary gifts.
          </p>
          <p>
            All delivered free to Birmingham. All available right now.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Order &amp; Contact</h2>
          <p>
            Browse our collection, place your order online, and receive your items within 4–5 business days anywhere in Birmingham and the West Midlands. Our team is available via WhatsApp (+44 7449 507661) or email (hello@luxeandline.uk).
          </p>
          <p>
            Read our <Link href="/blog/how-to-style-stitched-suits-uk-2026" className="text-primary hover:underline">2026 styling guide</Link> for inspiration, or check our <Link href="/reviews" className="text-primary hover:underline">customer reviews</Link> from buyers across the UK.
          </p>
        </section>

        <div className="mt-12 p-6 border border-primary/20 bg-card">
          <p className="font-serif text-xl text-foreground mb-2">Shop designer suits — delivered to Birmingham</p>
          <p className="text-muted-foreground text-sm mb-4">Free UK delivery · Fully stitched · Premium quality</p>
          <Link href="/shop?category=shalwar-kameez">
            <button className="bg-primary text-primary-foreground px-8 py-3 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
              Browse Designer Suits
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}
