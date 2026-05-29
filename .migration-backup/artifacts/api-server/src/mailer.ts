import { Resend } from "resend";
import { logger } from "./lib/logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM ?? "Luxe & Line <hello@luxeandline.uk>";
const REPLY_TO = "hello@luxeandline.uk";
const SITE_URL = process.env.SITE_URL ?? "https://www.luxeandline.uk";

logger.info(
  { resendConfigured: !!RESEND_API_KEY, from: FROM, siteUrl: SITE_URL },
  "Mailer initialised"
);

export const ADMIN_NOTIFICATION_EMAILS = [
  "syedimad348@gmail.com",
  "zaheenaamjad@gmail.com",
  "luxeline26@gmail.com",
];

interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  address: string;
  city?: string | null;
  postCode?: string | null;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Luxe &amp; Line</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ef;min-width:100%;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2ddd6;">
          <tr>
            <td style="padding:36px 48px 28px;border-bottom:2px solid #1a1228;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Est. Liverpool · United Kingdom</p>
              <h1 style="margin:0;font-size:30px;font-weight:300;letter-spacing:4px;text-transform:uppercase;color:#1a1228;font-family:Georgia,'Times New Roman',serif;">LUXE &amp; LINE</h1>
              <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#9b7f3e,transparent);margin:12px auto 0;"></div>
            </td>
          </tr>
          ${content}
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #e8e4dd;background:#f9f7f4;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;color:#1a1228;letter-spacing:2px;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">LUXE &amp; LINE</p>
              <p style="margin:0 0 4px;font-size:11px;color:#7a6e64;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">39 Stanley Street, Liverpool L7 0JN, United Kingdom</p>
              <p style="margin:0 0 10px;font-size:11px;color:#7a6e64;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">+44 7449 507661 &nbsp;&middot;&nbsp; hello@luxeandline.uk</p>
              <p style="margin:0;font-size:10px;color:#a09689;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&copy; ${new Date().getFullYear()} Luxe &amp; Line. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!resend) {
    logger.warn("sendOrderConfirmationEmail: RESEND_API_KEY not set, skipping");
    return;
  }

  const addressLines = [data.address, data.city, data.postCode].filter(Boolean).join(", ");
  const paymentLabel = data.paymentMethod === "bank-transfer"
    ? "Bank Transfer — we will email you bank details within 1 hour. Please transfer within 48 hours to confirm your order."
    : "Cash on Delivery — our team will collect payment when your order arrives.";

  const itemRows = data.items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #ede9e3;font-size:13px;color:#3d3229;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${item.name} &times; ${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #ede9e3;font-size:13px;color:#3d3229;text-align:right;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&pound;${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join("");

  const body = `
  <tr>
    <td style="padding:36px 48px 0;">
      <p style="margin:0 0 6px;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order Confirmed</p>
      <h2 style="margin:0 0 20px;font-size:24px;font-weight:300;color:#1a1228;font-family:Georgia,'Times New Roman',serif;">Thank you, ${data.customerName}</h2>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        We've received your order and will begin processing it right away. Estimated delivery is <strong style="color:#1a1228;">4&ndash;5 business days</strong>.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 48px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border:1px solid #e2ddd6;">
        <tr><td style="padding:16px 20px 12px;border-bottom:1px solid #e2ddd6;">
          <p style="margin:0;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order #${data.orderId}</p>
        </td></tr>
        <tr><td style="padding:4px 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${itemRows}
            <tr>
              <td style="padding:14px 0 4px;font-size:15px;font-weight:700;color:#1a1228;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Total</td>
              <td style="padding:14px 0 4px;font-size:15px;font-weight:700;color:#9b7f3e;text-align:right;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&pound;${data.total.toFixed(2)}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:12px 20px 16px;border-top:1px solid #e2ddd6;">
          <p style="margin:0 0 4px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Delivery Address</p>
          <p style="margin:4px 0 0;font-size:13px;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${addressLines || data.address}</p>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 48px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf9f0;border:1px solid #e8dfc8;border-left:3px solid #9b7f3e;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Payment</p>
          <p style="margin:0;font-size:13px;color:#5c5147;line-height:1.6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${paymentLabel}</p>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 48px 36px;text-align:center;">
      <a href="${SITE_URL}/shop" style="display:inline-block;background:#1a1228;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">Continue Shopping</a>
    </td>
  </tr>
  <tr>
    <td style="padding:0 48px 36px;border-top:1px solid #ede9e3;">
      <p style="margin:16px 0 8px;font-size:12px;color:#7a6e64;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Questions? WhatsApp: +44 7449 507661 &nbsp;&middot;&nbsp; Email: hello@luxeandline.uk</p>
    </td>
  </tr>`;

  const html = emailWrapper(body);
  const text = `Order Confirmed — Luxe & Line\n\nDear ${data.customerName},\n\nOrder #${data.orderId} confirmed.\n\nItems:\n${data.items.map((i) => `  ${i.name} x${i.quantity} — £${(i.price * i.quantity).toFixed(2)}`).join("\n")}\n\nTotal: £${data.total.toFixed(2)}\nDelivery: ${addressLines || data.address}\n\nFor queries: hello@luxeandline.uk or WhatsApp +44 7449 507661`;

  try {
    const result = await resend.emails.send({
      from: FROM, replyTo: REPLY_TO,
      to: data.customerEmail,
      subject: `Order #${data.orderId} confirmed — Luxe & Line`,
      html, text,
      headers: { "List-Unsubscribe": `<mailto:hello@luxeandline.uk?subject=unsubscribe>` },
    });
    logger.info({ orderId: data.orderId, to: data.customerEmail, emailId: result.data?.id }, "Order confirmation email sent");
  } catch (err) {
    logger.error({ err, orderId: data.orderId, to: data.customerEmail, from: FROM }, "Failed to send order confirmation email");
  }

  const adminHtml = emailWrapper(`
  <tr><td style="padding:28px 48px 36px;">
    <p style="margin:0 0 4px;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">New Order</p>
    <h2 style="margin:0 0 20px;font-size:22px;font-weight:300;color:#1a1228;font-family:Georgia,'Times New Roman',serif;">Order #${data.orderId} — ${data.customerName}</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:5px 0;font-size:13px;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#1a1228;">Email:</strong> ${data.customerEmail}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#1a1228;">Total:</strong> &pound;${data.total.toFixed(2)} via ${data.paymentMethod}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#1a1228;">Address:</strong> ${addressLines || data.address}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#1a1228;">Items:</strong> ${data.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td></tr>
    </table>
    <div style="margin-top:20px;">
      <a href="${SITE_URL}/admin" style="display:inline-block;background:#1a1228;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:12px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">View in Admin</a>
    </div>
  </td></tr>`);

  try {
    const result = await resend.emails.send({
      from: FROM, replyTo: data.customerEmail,
      to: ADMIN_NOTIFICATION_EMAILS,
      subject: `New order #${data.orderId} — ${data.customerName} — £${data.total.toFixed(2)}`,
      html: adminHtml,
    });
    logger.info({ orderId: data.orderId, emailId: result.data?.id }, "Admin order notification sent");
  } catch (err) {
    logger.error({ err, orderId: data.orderId }, "Failed to send admin order notification");
  }
}

const STATUS_LABELS: Record<string, string> = {
  processing: "Processing",
  shipped: "Dispatched",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_MESSAGES: Record<string, string> = {
  processing: "We're now preparing your order for dispatch.",
  shipped: "Great news — your order is on its way! It should arrive within 4&ndash;5 business days.",
  out_for_delivery: "Your order is out for delivery today. Please ensure someone is available to receive it.",
  delivered: "Your order has been delivered. We hope you love everything!",
  cancelled: "Your order has been cancelled. If you believe this is an error, please contact us immediately.",
};

export async function sendOrderStatusEmail(
  orderId: number,
  customerName: string,
  customerEmail: string,
  newStatus: string,
): Promise<void> {
  if (!resend) {
    logger.warn("sendOrderStatusEmail: RESEND_API_KEY not set, skipping");
    return;
  }
  const label = STATUS_LABELS[newStatus];
  const message = STATUS_MESSAGES[newStatus];
  if (!label || !message) return;

  const accentColor = newStatus === "cancelled" ? "#c0392b" : newStatus === "delivered" ? "#27ae60" : "#9b7f3e";

  const body = `
  <tr>
    <td style="padding:36px 48px 28px;">
      <p style="margin:0 0 6px;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${accentColor};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order Update</p>
      <h2 style="margin:0 0 8px;font-size:26px;font-weight:300;color:#1a1228;font-family:Georgia,'Times New Roman',serif;">Order #${orderId}</h2>
      <div style="display:inline-block;background:${accentColor}1a;border:1px solid ${accentColor}4d;padding:6px 16px;margin-bottom:20px;">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accentColor};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">${label}</p>
      </div>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.75;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Dear ${customerName},<br/><br/>${message}
      </p>
      ${newStatus !== "cancelled" ? `
      <div style="text-align:center;margin-top:8px;">
        <a href="${SITE_URL}/shop" style="display:inline-block;background:#1a1228;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">Continue Shopping</a>
      </div>` : ""}
    </td>
  </tr>
  <tr>
    <td style="padding:0 48px 36px;border-top:1px solid #ede9e3;">
      <p style="margin:16px 0 4px;font-size:12px;color:#7a6e64;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Questions? We're here to help.</p>
      <p style="margin:0;font-size:12px;color:#3d3229;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">WhatsApp: +44 7449 507661 &nbsp;&middot;&nbsp; hello@luxeandline.uk</p>
    </td>
  </tr>`;

  const text = `Order #${orderId} Update — ${label}\n\nDear ${customerName},\n\n${message.replace(/<[^>]+>/g, "")}\n\nFor queries: hello@luxeandline.uk or WhatsApp +44 7449 507661\n\nLuxe & Line`;

  try {
    const result = await resend.emails.send({
      from: FROM, replyTo: REPLY_TO,
      to: customerEmail,
      subject: `Order #${orderId} — ${label} · Luxe & Line`,
      html: emailWrapper(body), text,
      headers: { "List-Unsubscribe": `<mailto:hello@luxeandline.uk?subject=unsubscribe>` },
    });
    logger.info({ orderId, to: customerEmail, status: newStatus, emailId: result.data?.id }, "Order status email sent");
  } catch (err) {
    logger.error({ err, orderId, to: customerEmail, status: newStatus, from: FROM }, "Failed to send order status email");
  }
}

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  if (!resend) {
    logger.warn("sendWelcomeEmail: RESEND_API_KEY not set, skipping");
    return;
  }

  const body = `
  <tr>
    <td style="padding:36px 48px 28px;">
      <p style="margin:0 0 6px;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Welcome to Luxe &amp; Line</p>
      <h2 style="margin:0 0 20px;font-size:26px;font-weight:300;color:#1a1228;font-family:Georgia,'Times New Roman',serif;">Hello, ${name}</h2>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.75;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Welcome to Luxe &amp; Line — your home for premium South Asian fashion, leather accessories and artisan confectionery, delivered anywhere in the UK with free delivery on every order.
      </p>
      <p style="margin:0 0 28px;font-size:14px;line-height:1.75;color:#5c5147;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Your account is now active. Browse our latest Nureh Gardenia, Charizma and Luxury Pret collections, or treat someone to our award-worthy Kunafa Chocolates.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 48px 28px;text-align:center;">
      <a href="${SITE_URL}/shop" style="display:inline-block;background:#1a1228;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:4px;text-transform:uppercase;padding:16px 40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">Shop the Collection</a>
    </td>
  </tr>
  <tr>
    <td style="padding:0 48px 36px;border-top:1px solid #ede9e3;">
      <p style="margin:16px 0 4px;font-size:12px;color:#7a6e64;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Need help? We'd love to hear from you.</p>
      <p style="margin:0;font-size:12px;color:#3d3229;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">WhatsApp: <a href="https://wa.me/447449507661" style="color:#9b7f3e;text-decoration:none;">+44 7449 507661</a> &nbsp;&middot;&nbsp; <a href="mailto:hello@luxeandline.uk" style="color:#9b7f3e;text-decoration:none;">hello@luxeandline.uk</a></p>
    </td>
  </tr>`;

  const text = `Welcome to Luxe & Line, ${name}!\n\nYour account is now active. Browse our collections at ${SITE_URL}/shop\n\nFree UK delivery on every order.\n\nQuestions? WhatsApp +44 7449 507661 or email hello@luxeandline.uk`;

  try {
    const result = await resend.emails.send({
      from: FROM, replyTo: REPLY_TO,
      to: email,
      subject: `Welcome to Luxe & Line, ${name}`,
      html: emailWrapper(body), text,
      headers: { "List-Unsubscribe": `<mailto:hello@luxeandline.uk?subject=unsubscribe>` },
    });
    logger.info({ to: email, emailId: result.data?.id }, "Welcome email sent");
  } catch (err) {
    logger.error({ err, to: email, from: FROM }, "Failed to send welcome email");
  }

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: ADMIN_NOTIFICATION_EMAILS,
      subject: `New customer: ${name} (${email})`,
      html: emailWrapper(`<tr><td style="padding:28px 48px 36px;">
        <p style="margin:0 0 4px;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#9b7f3e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">New Registration</p>
        <h2 style="margin:0 0 16px;font-size:22px;font-weight:300;color:#1a1228;font-family:Georgia,'Times New Roman',serif;">New Customer Account</h2>
        <p style="margin:0 0 6px;font-size:13px;color:#3d3229;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>Name:</strong> ${name}</p>
        <p style="margin:0;font-size:13px;color:#3d3229;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>Email:</strong> ${email}</p>
      </td></tr>`),
      text: `New customer: ${name} (${email})`,
    });
    logger.info({ emailId: result.data?.id }, "Admin new-customer notification sent");
  } catch (err) {
    logger.error({ err }, "Failed to send admin new-customer notification");
  }
}
