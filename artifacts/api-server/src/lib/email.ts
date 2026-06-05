import nodemailer from "nodemailer";
import { logger } from "./logger";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload, smtp: SmtpConfig | null | undefined): Promise<void> {
  if (!smtp?.host || !smtp?.user || !smtp?.pass) {
    logger.info({ to: payload.to, subject: payload.subject }, "[EMAIL - NOT CONFIGURED] Would send email");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port ?? 587,
    secure: smtp.secure ?? false,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  await transporter.sendMail({
    from: smtp.from || smtp.user,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

export function buildQuoteRequestAdminEmail(opts: {
  tenantName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceInterest?: string;
  address?: string;
  postcode?: string;
  budget?: string;
  notes?: string;
}): EmailPayload {
  return {
    to: opts.email,
    subject: `New Quote Request — ${opts.firstName} ${opts.lastName}`,
    html: `
      <h2>New Quote Request Received</h2>
      <p>A new quote request has been submitted on your ${opts.tenantName} website.</p>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Name</td><td style="padding:8px">${opts.firstName} ${opts.lastName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px"><a href="mailto:${opts.email}">${opts.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:8px">${opts.phone || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Service</td><td style="padding:8px">${opts.serviceInterest || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Address</td><td style="padding:8px">${[opts.address, opts.postcode].filter(Boolean).join(", ") || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Budget</td><td style="padding:8px">${opts.budget || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Notes</td><td style="padding:8px">${opts.notes || "—"}</td></tr>
      </table>
    `,
    text: `New quote request from ${opts.firstName} ${opts.lastName}\nEmail: ${opts.email}\nPhone: ${opts.phone}\nService: ${opts.serviceInterest}\nAddress: ${opts.address} ${opts.postcode}\nNotes: ${opts.notes}`,
  };
}

export function buildQuoteRequestCustomerEmail(opts: {
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  firstName: string;
  serviceInterest?: string;
}): EmailPayload {
  return {
    to: opts.tenantEmail,
    subject: `Thanks for your enquiry — ${opts.tenantName}`,
    html: `
      <h2>Thanks for getting in touch, ${opts.firstName}!</h2>
      <p>We've received your quote request and will be in touch within 24 hours to arrange a free survey.</p>
      ${opts.serviceInterest ? `<p>You enquired about: <strong>${opts.serviceInterest}</strong></p>` : ""}
      <p>In the meantime, if you have any questions please don't hesitate to contact us:</p>
      <ul>
        <li>Phone: <a href="tel:${opts.tenantPhone}">${opts.tenantPhone}</a></li>
        <li>Email: <a href="mailto:${opts.tenantEmail}">${opts.tenantEmail}</a></li>
      </ul>
      <p>— The ${opts.tenantName} Team</p>
    `,
    text: `Thanks ${opts.firstName}! We've received your quote request and will be in touch within 24 hours. Questions? Call ${opts.tenantPhone} or email ${opts.tenantEmail}.`,
  };
}

export function buildContactAdminEmail(opts: {
  tenantName: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}): EmailPayload {
  return {
    to: opts.email,
    subject: `New Contact Message — ${opts.name}`,
    html: `
      <h2>New Contact Message</h2>
      <p>Someone has sent a message via your ${opts.tenantName} website contact form.</p>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Name</td><td style="padding:8px">${opts.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px"><a href="mailto:${opts.email}">${opts.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:8px">${opts.phone || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Message</td><td style="padding:8px">${opts.message}</td></tr>
      </table>
    `,
    text: `New message from ${opts.name} (${opts.email}): ${opts.message}`,
  };
}

export function buildContactCustomerEmail(opts: {
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  name: string;
}): EmailPayload {
  return {
    to: opts.tenantEmail,
    subject: `We've received your message — ${opts.tenantName}`,
    html: `
      <h2>Message received, ${opts.name}!</h2>
      <p>Thank you for contacting ${opts.tenantName}. We'll get back to you as soon as possible, usually within a few hours during business hours.</p>
      <p>If your enquiry is urgent, please call us on <a href="tel:${opts.tenantPhone}">${opts.tenantPhone}</a>.</p>
      <p>— The ${opts.tenantName} Team</p>
    `,
    text: `Thanks ${opts.name}! We've received your message and will respond shortly. Urgent? Call ${opts.tenantPhone}.`,
  };
}

export function buildVisualiserAdminEmail(opts: {
  tenantName: string;
  adminEmail: string;
  name: string;
  email: string;
  phone?: string;
  renderColour?: string;
  notes?: string;
}): EmailPayload {
  return {
    to: opts.adminEmail,
    subject: `New Visualiser Request — ${opts.name}`,
    html: `
      <h2>New Visualiser Request</h2>
      <p>A customer has submitted a colour visualiser request on your ${opts.tenantName} website.</p>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Name</td><td style="padding:8px">${opts.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px"><a href="mailto:${opts.email}">${opts.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:8px">${opts.phone || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Colour</td><td style="padding:8px">${opts.renderColour || "—"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Notes</td><td style="padding:8px">${opts.notes || "—"}</td></tr>
      </table>
    `,
    text: `New visualiser request from ${opts.name} (${opts.email}). Colour: ${opts.renderColour}. Notes: ${opts.notes}`,
  };
}
