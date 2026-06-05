import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable, tenantsTable, tenantSettingsTable, leadsTable, visualiserRequestsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireTenantAccess } from "../middlewares/auth";
import { sendEmail, buildQuoteRequestAdminEmail, buildQuoteRequestCustomerEmail, buildContactAdminEmail, buildContactCustomerEmail, buildVisualiserAdminEmail } from "../lib/email";
import { sendSms } from "../lib/sms";
import { buildSmtpConfig, buildSmsCreds } from "./settings";

const router = Router();
function tid(req: any) { return req.authUser?.tenantId!; }

async function getTenantWithSettings(slug: string) {
  const tenants = await db.select().from(tenantsTable).where(eq(tenantsTable.slug, slug)).limit(1);
  if (!tenants.length) return null;
  const settings = await db.select().from(tenantSettingsTable).where(eq(tenantSettingsTable.tenantId, tenants[0].id)).limit(1);
  return { tenant: tenants[0], settings: settings[0] };
}

// Public contact form submission
router.post("/public/:tenantSlug/contact", async (req, res) => {
  try {
    const ts = await getTenantWithSettings(req.params.tenantSlug);
    if (!ts) { res.status(404).json({ error: "Tenant not found" }); return; }
    const { tenant, settings } = ts;
    const msg = await db.insert(contactMessagesTable).values({ ...req.body, tenantId: tenant.id, source: "contact_form" }).returning();

    const adminEmail = settings?.adminNotificationEmail || tenant.email;
    const customerEmail = req.body.email;
    const smtp = buildSmtpConfig(settings);
    const smsCreds = buildSmsCreds(settings);
    const adminPhone = settings?.adminNotificationPhone;

    if (adminEmail) {
      sendEmail({ ...buildContactAdminEmail({ tenantName: tenant.name, name: req.body.name, email: adminEmail, phone: req.body.phone, message: req.body.message }), to: adminEmail }, smtp)
        .catch(e => req.log.error({ err: e }, "Failed to send contact admin email"));
    }
    if (customerEmail) {
      sendEmail({ ...buildContactCustomerEmail({ tenantName: tenant.name, name: req.body.senderName || req.body.name || '', tenantPhone: tenant.phone || '', tenantEmail: adminEmail || tenant.email || '' }), to: customerEmail }, smtp)
        .catch(e => req.log.error({ err: e }, "Failed to send contact customer email"));
    }
    if (adminPhone && smsCreds) {
      sendSms(adminPhone, `New contact from ${req.body.name || "someone"}${req.body.phone ? ` — ${req.body.phone}` : ""}`, smsCreds)
        .catch(e => req.log.error({ err: e }, "Failed to send contact admin SMS"));
    }

    res.status(201).json(msg[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// Public quote request
router.post("/public/:tenantSlug/quote-request", async (req, res) => {
  try {
    const ts = await getTenantWithSettings(req.params.tenantSlug);
    if (!ts) { res.status(404).json({ error: "Tenant not found" }); return; }
    const { tenant, settings } = ts;
    const lead = await db.insert(leadsTable).values({ ...req.body, tenantId: tenant.id, status: "New", source: "Website" }).returning();

    const adminEmail = settings?.adminNotificationEmail || tenant.email;
    const customerEmail = req.body.email;
    const smtp = buildSmtpConfig(settings);
    const smsCreds = buildSmsCreds(settings);
    const adminPhone = settings?.adminNotificationPhone;

    if (adminEmail) {
      sendEmail({ ...buildQuoteRequestAdminEmail({ tenantName: tenant.name, firstName: req.body.firstName, lastName: req.body.lastName, email: adminEmail, phone: req.body.phone, serviceInterest: req.body.serviceInterest, address: req.body.address, postcode: req.body.postcode, budget: req.body.budget, notes: req.body.notes }), to: adminEmail }, smtp)
        .catch(e => req.log.error({ err: e }, "Failed to send quote admin email"));
    }
    if (customerEmail) {
      sendEmail({ ...buildQuoteRequestCustomerEmail({ tenantName: tenant.name, tenantPhone: tenant.phone || '', tenantEmail: adminEmail || tenant.email || '', firstName: req.body.firstName, serviceInterest: req.body.serviceInterest }), to: customerEmail }, smtp)
        .catch(e => req.log.error({ err: e }, "Failed to send quote customer email"));
    }
    if (adminPhone && smsCreds) {
      const name = `${req.body.firstName || ""} ${req.body.lastName || ""}`.trim() || "someone";
      sendSms(adminPhone, `New quote from ${name}${req.body.phone ? ` — ${req.body.phone}` : ""}`, smsCreds)
        .catch(e => req.log.error({ err: e }, "Failed to send quote admin SMS"));
    }

    res.status(201).json(lead[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// Public visualiser submission — alias at /visualiser for generated API client
router.post("/visualiser", async (req, res) => {
  try {
    const slug = req.body.tenantSlug;
    if (!slug) { res.status(400).json({ error: "tenantSlug required" }); return; }
    const ts = await getTenantWithSettings(slug);
    if (!ts) { res.status(404).json({ error: "Tenant not found" }); return; }
    const { tenant, settings } = ts;
    const { tenantSlug: _slug, ...rest } = req.body;
    const r = await db.insert(visualiserRequestsTable).values({ ...rest, tenantId: tenant.id, status: "pending" }).returning();

    const adminEmail = settings?.adminNotificationEmail || tenant.email;
    const smtp = buildSmtpConfig(settings);
    const smsCreds = buildSmsCreds(settings);
    const adminPhone = settings?.adminNotificationPhone;

    if (adminEmail) {
      sendEmail(buildVisualiserAdminEmail({ tenantName: tenant.name, adminEmail, name: req.body.firstName ? `${req.body.firstName} ${req.body.lastName || ''}`.trim() : req.body.name, email: req.body.email, phone: req.body.phone, renderColour: req.body.colourPreference || req.body.renderColour, notes: req.body.notes }), smtp)
        .catch(e => req.log.error({ err: e }, "Failed to send visualiser admin email"));
    }
    if (adminPhone && smsCreds) {
      const name = req.body.firstName ? `${req.body.firstName} ${req.body.lastName || ''}`.trim() : req.body.name || "someone";
      sendSms(adminPhone, `New visualiser request from ${name}`, smsCreds)
        .catch(e => req.log.error({ err: e }, "Failed to send visualiser admin SMS"));
    }

    res.status(201).json(r[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// Public visualiser submission
router.post("/public/:tenantSlug/visualiser", async (req, res) => {
  try {
    const ts = await getTenantWithSettings(req.params.tenantSlug);
    if (!ts) { res.status(404).json({ error: "Tenant not found" }); return; }
    const { tenant, settings } = ts;
    const r = await db.insert(visualiserRequestsTable).values({ ...req.body, tenantId: tenant.id, status: "pending" }).returning();

    const adminEmail = settings?.adminNotificationEmail || tenant.email;
    const smtp = buildSmtpConfig(settings);
    const smsCreds = buildSmsCreds(settings);
    const adminPhone = settings?.adminNotificationPhone;

    if (adminEmail) {
      sendEmail(buildVisualiserAdminEmail({ tenantName: tenant.name, adminEmail, name: req.body.name, email: req.body.email, phone: req.body.phone, renderColour: req.body.renderColour, notes: req.body.notes }), smtp)
        .catch(e => req.log.error({ err: e }, "Failed to send visualiser admin email"));
    }
    if (adminPhone && smsCreds) {
      sendSms(adminPhone, `New visualiser request from ${req.body.name || "someone"}`, smsCreds)
        .catch(e => req.log.error({ err: e }, "Failed to send visualiser admin SMS"));
    }

    res.status(201).json(r[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// Admin: list contact messages
router.get("/contact-messages", requireTenantAccess, async (req, res) => {
  try {
    const msgs = await db.select().from(contactMessagesTable).where(eq(contactMessagesTable.tenantId, tid(req))).orderBy(sql`${contactMessagesTable.createdAt} desc`);
    res.json(msgs);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/contact-messages/:id", requireTenantAccess, async (req, res) => {
  try {
    const msg = await db.select().from(contactMessagesTable).where(and(eq(contactMessagesTable.id, Number(req.params.id)), eq(contactMessagesTable.tenantId, tid(req)))).limit(1);
    if (!msg.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json(msg[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/contact-messages/:id", requireTenantAccess, async (req, res) => {
  try {
    await db.delete(contactMessagesTable).where(and(eq(contactMessagesTable.id, Number(req.params.id)), eq(contactMessagesTable.tenantId, tid(req))));
    res.status(204).send();
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
