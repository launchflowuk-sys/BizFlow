import { Router } from "express";
import { db } from "@workspace/db";
import { tenantSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireTenantAccess } from "../middlewares/auth";
import { sendEmail } from "../lib/email";
import { sendSms } from "../lib/sms";
import type { SmtpConfig } from "../lib/email";
import type { SmsCreds } from "../lib/sms";

const router = Router();

function buildSmtpConfig(settings: any): SmtpConfig | null {
  if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPass) return null;
  return {
    host: settings.smtpHost,
    port: settings.smtpPort ?? 587,
    secure: settings.smtpSecure ?? false,
    user: settings.smtpUser,
    pass: settings.smtpPass,
    from: settings.smtpFrom || settings.smtpUser,
  };
}

function buildSmsCreds(settings: any): SmsCreds | null {
  if (!settings?.twilioAccountSid || !settings?.twilioAuthToken || !settings?.twilioFromNumber) return null;
  return {
    accountSid: settings.twilioAccountSid,
    authToken: settings.twilioAuthToken,
    fromNumber: settings.twilioFromNumber,
  };
}

router.post("/settings/test-email", requireTenantAccess, async (req, res) => {
  try {
    const tenantId = (req as any).authUser?.tenantId;
    const rows = await db.select().from(tenantSettingsTable).where(eq(tenantSettingsTable.tenantId, tenantId)).limit(1);
    const settings = rows[0];
    const smtp = buildSmtpConfig(settings);

    if (!smtp) {
      res.json({ ok: false, error: "SMTP is not configured. Please enter your mail server details and save first." });
      return;
    }

    const to = settings?.adminNotificationEmail || settings?.email;
    if (!to) {
      res.json({ ok: false, error: "No admin notification email address configured to send the test to." });
      return;
    }

    await sendEmail(
      {
        to,
        subject: "LaunchFlow — Test Email",
        html: "<h2>Test email</h2><p>Your email notifications are working correctly.</p>",
        text: "Your email notifications are working correctly.",
      },
      smtp
    );

    res.json({ ok: true });
  } catch (err: any) {
    req.log.error({ err }, "test-email failed");
    res.json({ ok: false, error: err?.message || "Unknown error" });
  }
});

router.post("/settings/test-sms", requireTenantAccess, async (req, res) => {
  try {
    const tenantId = (req as any).authUser?.tenantId;
    const rows = await db.select().from(tenantSettingsTable).where(eq(tenantSettingsTable.tenantId, tenantId)).limit(1);
    const settings = rows[0];
    const creds = buildSmsCreds(settings);

    if (!creds) {
      res.json({ ok: false, error: "Twilio is not configured. Please enter your Account SID, Auth Token, and From Number and save first." });
      return;
    }

    const to = settings?.adminNotificationPhone;
    if (!to) {
      res.json({ ok: false, error: "No admin notification phone number configured to send the test SMS to." });
      return;
    }

    await sendSms(to, "LaunchFlow test SMS — your SMS notifications are working correctly.", creds);

    res.json({ ok: true });
  } catch (err: any) {
    req.log.error({ err }, "test-sms failed");
    res.json({ ok: false, error: err?.message || "Unknown error" });
  }
});

export { buildSmtpConfig, buildSmsCreds };
export default router;
