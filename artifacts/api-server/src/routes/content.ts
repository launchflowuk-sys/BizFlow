import { Router } from "express";
import { db } from "@workspace/db";
import {
  servicesTable, areasTable, galleryImagesTable, beforeAfterTable,
  reviewsTable, caseStudiesTable, faqsTable, teamMembersTable, tenantSettingsTable
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireTenantAccess } from "../middlewares/auth";

const router = Router();
function tid(req: any) { return req.authUser?.tenantId!; }

// Helper: generic CRUD factory
function crud<T>(table: any, routePrefix: string, extraInsert?: (req: any) => object) {
  router.get(`/api/${routePrefix}`, requireTenantAccess, async (req, res) => {
    try {
      const rows = await db.select().from(table).where(eq(table.tenantId, tid(req)));
      res.json(rows);
    } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
  });
  router.post(`/api/${routePrefix}`, requireTenantAccess, async (req, res) => {
    try {
      const row = await db.insert(table).values({ ...req.body, tenantId: tid(req), ...(extraInsert ? extraInsert(req) : {}) }).returning() as any[];
      res.status(201).json(row[0]);
    } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
  });
  router.get(`/api/${routePrefix}/:id`, requireTenantAccess, async (req, res) => {
    try {
      const row = await db.select().from(table).where(and(eq(table.id, Number(req.params.id)), eq(table.tenantId, tid(req)))).limit(1);
      if (!row.length) { res.status(404).json({ error: "Not found" }); return; }
      res.json(row[0]);
    } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
  });
  router.patch(`/api/${routePrefix}/:id`, requireTenantAccess, async (req, res) => {
    try {
      const row = await db.update(table).set(req.body).where(and(eq(table.id, Number(req.params.id)), eq(table.tenantId, tid(req)))).returning();
      if (!row.length) { res.status(404).json({ error: "Not found" }); return; }
      res.json(row[0]);
    } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
  });
  router.delete(`/api/${routePrefix}/:id`, requireTenantAccess, async (req, res) => {
    try {
      await db.delete(table).where(and(eq(table.id, Number(req.params.id)), eq(table.tenantId, tid(req))));
      res.status(204).send();
    } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
  });
}

crud(servicesTable, "services");
crud(areasTable, "areas");
crud(galleryImagesTable, "gallery");
crud(beforeAfterTable, "before-after");
crud(reviewsTable, "reviews");
crud(caseStudiesTable, "case-studies");
crud(faqsTable, "faqs");
crud(teamMembersTable, "team");

function maskSecrets(row: any) {
  const { smtpPass: _sp, twilioAuthToken: _tat, ...safe } = row;
  return safe;
}

// Settings — single record per tenant
router.get("/settings", requireTenantAccess, async (req, res) => {
  try {
    const settings = await db.select().from(tenantSettingsTable).where(eq(tenantSettingsTable.tenantId, tid(req))).limit(1);
    if (!settings.length) {
      const newSettings = await db.insert(tenantSettingsTable).values({ tenantId: tid(req) }).returning();
      res.json(maskSecrets(newSettings[0]));
      return;
    }
    res.json(maskSecrets(settings[0]));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/settings", requireTenantAccess, async (req, res) => {
  try {
    const body = req.body as any;
    // Strip out blank password/token fields so they don't overwrite stored values
    if (!body.smtpPass) delete body.smtpPass;
    if (!body.twilioAuthToken) delete body.twilioAuthToken;

    const existing = await db.select().from(tenantSettingsTable).where(eq(tenantSettingsTable.tenantId, tid(req))).limit(1);
    if (!existing.length) {
      const newSettings = await db.insert(tenantSettingsTable).values({ ...body, tenantId: tid(req) }).returning();
      res.json(maskSecrets(newSettings[0]));
      return;
    }
    const updated = await db.update(tenantSettingsTable).set(body).where(eq(tenantSettingsTable.tenantId, tid(req))).returning();
    res.json(maskSecrets(updated[0]));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
