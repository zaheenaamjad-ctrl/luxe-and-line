import { useEffect, useRef } from "react";

function FloatingShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const items: Array<{x:number;y:number;vy:number;size:number;opacity:number}> = Array.from({length:30},()=>({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      vy: -(Math.random()*0.4+0.1),
      size: Math.random()*4+1,
      opacity: Math.random()*0.15+0.03,
    }));
    let animId: number;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const p of items){
        p.y+=p.vy;
        if(p.y<-10) p.y=canvas.height+10;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(201,168,76,${p.opacity})`;
        ctx.fill();
      }
      animId=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{cancelAnimationFrame(animId);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0"/>;
}

const sections = [
  {
    title: "1. Who We Are",
    body: "Luxe & Line is a UK-based luxury fashion boutique operating from Liverpool, Merseyside. We are committed to protecting your personal information and being transparent about how we use it. For any privacy-related queries, contact us at hello@luxeandline.uk or +44 7449 507661."
  },
  {
    title: "2. Information We Collect",
    body: "When you place an order with Luxe & Line, we collect personal information including your full name, email address, phone number, and delivery address. We may also collect information about your browsing behaviour on our website using essential cookies in order to maintain your shopping session and improve your experience."
  },
  {
    title: "3. How We Use Your Information",
    body: "Your information is used solely to: (a) process and fulfil your orders; (b) communicate with you about your order status and delivery; (c) respond to any queries or complaints you raise; and (d) improve our website and services. We do not sell, rent, or share your personal information with third parties for marketing purposes."
  },
  {
    title: "4. Legal Basis for Processing",
    body: "We process your data under the following legal bases: (a) Contract — processing is necessary to fulfil your order; (b) Legitimate Interests — to manage fraud prevention and service improvement; (c) Legal Obligation — to comply with UK financial and tax regulations. You may withdraw consent at any time for any processing based solely on consent."
  },
  {
    title: "5. Data Storage & Security",
    body: "All personal data is stored securely on UK-based or EU-compliant servers and is encrypted where applicable. Access to your data is restricted to authorised personnel only. We retain your data for a period of 2 years from your last order to comply with UK legal requirements. After this period, data is securely deleted unless otherwise required by law."
  },
  {
    title: "6. Cookies",
    body: "Our website uses only essential cookies to maintain your shopping cart and browsing session. We do not use tracking, advertising, or analytics cookies. You can disable cookies in your browser settings; however, this may affect the functionality of your shopping cart. No third-party cookies are installed on your device by us."
  },
  {
    title: "7. Sharing Your Data",
    body: "We may share your data with trusted third-party service providers solely for the purpose of fulfilling your order — for example, postal and courier services for delivery, and email service providers for order confirmations. These partners are contractually bound to handle your data securely and in compliance with UK GDPR. We never sell your data."
  },
  {
    title: "8. Your Rights Under UK GDPR",
    body: "Under UK GDPR, you have the following rights: (a) Right of Access — to request a copy of the data we hold on you; (b) Right to Rectification — to correct inaccurate data; (c) Right to Erasure — to request deletion of your data ('right to be forgotten'); (d) Right to Restrict Processing — to limit how we use your data; (e) Right to Data Portability — to receive your data in a structured, machine-readable format; (f) Right to Object — to object to processing based on legitimate interests. To exercise any of these rights, email us at hello@luxeandline.uk."
  },
  {
    title: "9. Data Retention",
    body: "Order records are retained for a minimum of 2 years for legal and accounting compliance. Customer account data is retained for as long as your account remains active. If you close your account or request erasure, we will delete your personal data within 30 days unless we are required by law to retain it."
  },
  {
    title: "10. Children's Privacy",
    body: "Our services are not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us immediately at hello@luxeandline.uk and we will delete it promptly."
  },
  {
    title: "11. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically. Continued use of our website after changes are posted constitutes your acceptance of the updated policy."
  },
  {
    title: "12. Contact & Complaints",
    body: "For any privacy-related queries: Email: hello@luxeandline.uk | Phone: +44 7405 358689 | Address: 39 Stanley Street, L7 0JN, Liverpool, UK. If you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk."
  },
];

export function Policy() {
  return (
    <div className="relative min-h-screen bg-background">
      <FloatingShapes />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Privacy Policy</h1>
          <div className="luxury-divider w-32 mx-auto" />
          <p className="text-xs font-body text-muted-foreground mt-4">Last updated: May 2026 · Compliant with UK GDPR</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border p-8 space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          <p className="text-foreground/70 text-sm leading-relaxed border-l-2 border-primary pl-4">
            Luxe & Line ("we", "our", "us") is committed to protecting the privacy and security of your personal information. This policy explains what data we collect, why we collect it, and how we handle it in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
          {sections.map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-serif text-lg text-foreground mb-3">{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
