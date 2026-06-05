import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";

export const tenantSettingsTable = pgTable("tenant_settings", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenantsTable.id).unique(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#f97316"),
  secondaryColor: text("secondary_color").default("#1e293b"),
  heroHeadline: text("hero_headline"),
  heroSubheadline: text("hero_subheadline"),
  heroImageUrl: text("hero_image_url"),
  aboutText: text("about_text"),
  aboutImageUrl: text("about_image_url"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  googleMapsUrl: text("google_maps_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  youtubeUrl: text("youtube_url"),
  tiktokUrl: text("tiktok_url"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  googleAnalyticsId: text("google_analytics_id"),
  termsContent: text("terms_content"),
  privacyContent: text("privacy_content"),
  ctaText: text("cta_text").default("Get a Free Quote"),
  showReviews: boolean("show_reviews").default(true),
  showGallery: boolean("show_gallery").default(true),
  showBlog: boolean("show_blog").default(true),
  showBeforeAfter: boolean("show_before_after").default(true),
  trustBadges: jsonb("trust_badges").$type<string[]>().default([]),
  adminNotificationEmail: text("admin_notification_email"),
  customerEmail: text("customer_email"),
  // SMTP settings (per-tenant, used by Nodemailer)
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port").default(587),
  smtpSecure: boolean("smtp_secure").default(false),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
  smtpFrom: text("smtp_from"),
  // Twilio SMS settings (per-tenant)
  twilioAccountSid: text("twilio_account_sid"),
  twilioAuthToken: text("twilio_auth_token"),
  twilioFromNumber: text("twilio_from_number"),
  adminNotificationPhone: text("admin_notification_phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTenantSettingsSchema = createInsertSchema(tenantSettingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTenantSettings = z.infer<typeof insertTenantSettingsSchema>;
export type TenantSettings = typeof tenantSettingsTable.$inferSelect;
