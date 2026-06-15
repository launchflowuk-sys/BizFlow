import { db } from "@workspace/db";
import {
  galleryImagesTable,
  beforeAfterTable,
  caseStudiesTable,
  tenantsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const OLD_LOCATIONS = ["Bolton", "Salford", "Manchester", "Birmingham", "Oldham", "Bury", "Rochdale", "Stockport", "Wigan"];

async function hasOldData(tenantId: number): Promise<boolean> {
  const galleryRows = await db
    .select({ caption: galleryImagesTable.caption })
    .from(galleryImagesTable)
    .where(eq(galleryImagesTable.tenantId, tenantId))
    .limit(3);

  const caseRows = await db
    .select({ location: caseStudiesTable.location, title: caseStudiesTable.title })
    .from(caseStudiesTable)
    .where(eq(caseStudiesTable.tenantId, tenantId))
    .limit(3);

  const galleryStale = galleryRows.some(r => OLD_LOCATIONS.some(loc => r.caption?.includes(loc)));
  const caseStale = caseRows.some(r =>
    OLD_LOCATIONS.some(loc => r.location?.includes(loc) || r.title?.includes(loc))
  );

  return galleryStale || caseStale;
}

export async function runSeedFixIfNeeded(): Promise<void> {
  try {
    const tenants = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, "amo-rendering"))
      .limit(1);

    if (!tenants.length) return;
    const tenantId = tenants[0].id;

    if (!(await hasOldData(tenantId))) {
      logger.info("Seed fix: data already correct, skipping");
      return;
    }

    logger.info("Seed fix: old location data detected — applying Essex/London corrections");

    // ── Gallery images ──────────────────────────────────────────────────────
    await db.delete(galleryImagesTable).where(eq(galleryImagesTable.tenantId, tenantId));
    await db.insert(galleryImagesTable).values([
      { tenantId, imageUrl: "/gal-romford.webp",            caption: "Silicone render — Romford",            altText: "Silicone rendered detached house, Romford Essex",          featured: false, sortOrder: 10 },
      { tenantId, imageUrl: "/gal-london-silicone.webp",    caption: "Silicone render — London",             altText: "Silicone rendered Victorian terrace, London",              featured: false, sortOrder: 20 },
      { tenantId, imageUrl: "/gal-brentwood-silicone.webp", caption: "Silicone render — Brentwood",          altText: "Silicone rendered period corner property, Brentwood",      featured: false, sortOrder: 30 },
      { tenantId, imageUrl: "/gal-ewi-ba.webp",             caption: "EWI transformation — Grays, Essex",    altText: "Before and after EWI render, Grays Essex",                featured: true,  sortOrder: 40 },
      { tenantId, imageUrl: "/gal-krend-london.webp",       caption: "K Rend — London",                      altText: "K Rend rendered semi-detached house, London",              featured: false, sortOrder: 50 },
      { tenantId, imageUrl: "/gal-krend-chelmsford.webp",   caption: "K Rend — Chelmsford",                  altText: "K Rend rendered detached house, Chelmsford Essex",         featured: false, sortOrder: 60 },
      { tenantId, imageUrl: "/gal-monocouche-grays.webp",   caption: "Monocouche render — Grays",            altText: "Monocouche rendered semi-detached, Grays Thurrock",        featured: false, sortOrder: 70 },
      { tenantId, imageUrl: "/gal-monocouche-basildon.webp",caption: "Monocouche render — Basildon",         altText: "Monocouche rendered property, Basildon Essex",             featured: false, sortOrder: 80 },
      { tenantId, imageUrl: "/gal-pebble-billericay.webp",  caption: "Pebbledash removal — Billericay",      altText: "Pebbledash removal and silicone render, Billericay Essex", featured: false, sortOrder: 90 },
    ]);

    // ── Before / after ──────────────────────────────────────────────────────
    await db.delete(beforeAfterTable).where(eq(beforeAfterTable.tenantId, tenantId));
    await db.insert(beforeAfterTable).values([
      {
        tenantId,
        title: "Grays Semi-Detached — Pebbledash to Silicone Render",
        description: "Complete exterior transformation — pebbledash removed and K-Rend silicone render applied in warm white.",
        beforeImageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
        afterImageUrl:  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        sortOrder: 1,
      },
      {
        tenantId,
        title: "Thurrock Terrace — Monocouche Render Refresh",
        description: "Old cracked render stripped back and replaced with through-coloured monocouche in light grey.",
        beforeImageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        afterImageUrl:  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
        sortOrder: 2,
      },
      {
        tenantId,
        title: "Romford 1960s Semi — EWI and Silicone Render",
        description: "External wall insulation and silicone render completely transformed this solid-wall property in Romford.",
        beforeImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        afterImageUrl:  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        sortOrder: 3,
      },
    ]);

    // ── Case studies ────────────────────────────────────────────────────────
    await db.delete(caseStudiesTable).where(eq(caseStudiesTable.tenantId, tenantId));
    await db.insert(caseStudiesTable).values([
      {
        tenantId,
        title: "Victorian Semi-Detached Transformation in Grays",
        slug: "victorian-semi-grays",
        location: "Grays, Thurrock, Essex",
        tagline: "Pebble dash to silicone render — a complete exterior transformation in Thurrock",
        challenge: "The property had original 1930s pebble dash that was crumbling and absorbing moisture. The homeowners wanted a modern, clean finish that would last for decades and require minimal maintenance.",
        solution: "We removed all pebble dash, treated the underlying brickwork for any damp issues, applied a base coat and then finished with K-Rend silicone render in a warm white colour. The team worked efficiently over 5 days with minimal disruption to the family.",
        result: "The property was completely transformed. The homeowners reported that neighbours stopped to compliment the house, and the property value increased by an estimated £15,000. The silicone render carries a 25-year manufacturer guarantee.",
        heroImageUrl: "/cs-grays.webp",
        clientName: "The Harrison Family",
        projectDuration: "5 days",
        published: true,
        featured: true,
      },
      {
        tenantId,
        title: "New Build Estate — Monocouche Specification Project in Basildon",
        slug: "new-build-estate-basildon",
        location: "Basildon, Essex",
        tagline: "Large-scale monocouche rendering for a 24-unit residential development in Essex",
        challenge: "A regional house builder required consistent, high-quality monocouche render across a 24-unit development in Basildon to tight programme deadlines. The render had to meet planning specification and achieve a uniform finish across all units.",
        solution: "AMO Rendering mobilised a team of 8 certified applicators and managed the project in phases to meet the builder's handover schedule. We used a single batch of monocouche colour to guarantee consistency across all units.",
        result: "All 24 units were rendered to specification and handed over on programme. The builder has since appointed AMO Rendering as their preferred rendering contractor for future Essex developments.",
        heroImageUrl: "/cs-new-build.webp",
        clientName: "Redrow Homes Essex",
        projectDuration: "6 weeks",
        published: true,
        featured: true,
      },
      {
        tenantId,
        title: "EWI and Silicone Render — Thermal Upgrade in Romford",
        slug: "ewi-silicone-romford",
        location: "Romford, London",
        tagline: "External wall insulation transforms a 1960s property in East London",
        challenge: "The property was a 1960s solid-wall build with very poor thermal performance. The owners were spending over £2,400 per year on heating and wanted to significantly reduce their energy bills.",
        solution: "We installed a 90mm EWI board system over the entire exterior, finished with silicone render in a contemporary grey. The work included full beading, window surrounds and all detailing.",
        result: "Post-installation energy monitoring showed a 38% reduction in heating costs. The home achieved a C EPC rating (up from E) and the exterior transformation attracted significant local interest.",
        heroImageUrl: "/cs-romford.webp",
        clientName: "Mr & Mrs Patel",
        projectDuration: "8 days",
        published: true,
        featured: true,
      },
    ]);

    logger.info("Seed fix: gallery, before/after and case studies updated to Essex/London locations");
  } catch (err) {
    logger.error({ err }, "Seed fix failed — non-fatal, server will still start");
  }
}
