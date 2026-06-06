import { Switch, Route, useParams, Router as WouterRouter, Link as WouterLink } from "wouter";
import { useGetPublicSite, useListPublicServices, useListPublicAreas, useBrowsePublicGallery, useListPublicBeforeAfter, useListPublicReviews, useListPublicCaseStudies, useListPublicFaqs, useBrowsePublicBlog, useGetPublicBlogPost, useGetPublicService, useGetPublicArea, useGetPublicCaseStudy, useSubmitContact, useSubmitQuoteRequest, useCreateVisualiserRequest, useRequestUploadUrl } from "@workspace/api-client-react";
import { useState, useRef, useEffect, createContext, useContext } from "react";
const SiteBaseCtx = createContext('');
const useSiteBase = () => useContext(SiteBaseCtx);

const BLUE = "#1F8CFF";
const NAVY = "#0A121C";
const LIGHT_BG = "#F6F8FB";
const TEXT = "#26323F";
const MUTED = "#64717F";

const ALL_AREAS = [
  "Grays","Thurrock","Basildon","Brentwood","Romford","Dagenham",
  "Barking","Ilford","Upminster","Hornchurch","Rainham","Chelmsford",
  "Southend","Dartford","Gravesend","Chigwell","Epping","London","Essex",
];

const AREA_IMAGES: Record<string, string> = {
  "grays":      "/gal-monocouche-grays.webp",
  "romford":    "/gal-romford.webp",
  "brentwood":  "/gal-brentwood-silicone.webp",
  "basildon":   "/gal-monocouche-basildon.webp",
  "chelmsford": "/gal-krend-chelmsford.webp",
  "london":     "/gal-london-silicone.webp",
  "billericay": "/gal-pebble-billericay.webp",
  "thurrock":   "/gal-monocouche-grays.webp",
};

const SERVICE_BA_IMAGES: Record<string, string> = {
  "silicone-render":    "/ba-silicone.webp",
  "monocouche-render":  "/ba-monocouche.webp",
  "k-rend":             "/ba-krend.webp",
  "ewi-systems":        "/gal-ewi-ba.webp",
  "pebble-dash-removal":"/ba-pebbledash.webp",
  "render-repairs":     "/ba-silicone.webp",
};

const STATIC_SERVICES = [
  { slug: "silicone-render", name: "Silicone Rendering", tagline: "THE UK'S MOST POPULAR MODERN RENDER", desc: "Flexible, breathable and weather-resistant render finish ideal for long-lasting protection and a clean modern exterior.", benefits: ["Fully weatherproof","Self-cleaning surface","15-year guarantee"] },
  { slug: "monocouche-render", name: "Monocouche Rendering", tagline: "THROUGH-COLOURED RENDER FOR LASTING BEAUTY", desc: "A coloured-through render system designed to create a durable, low-maintenance finish with a sharp modern look.", benefits: ["Through-coloured","Single coat application","Highly durable"] },
  { slug: "k-rend", name: "K Rend", tagline: "SPECIALIST K-REND APPROVED APPLICATORS", desc: "A popular render system for UK homes, offering textured finishes, strong weather protection and a clean external appearance.", benefits: ["K-Rend approved applicators","Superior colour retention","High durability"] },
  { slug: "ewi-systems", name: "External Wall Insulation", tagline: "IMPROVE THERMAL PERFORMANCE AND APPEARANCE", desc: "Improve the appearance and thermal performance of your property with an insulated render system.", benefits: ["Improves EPC rating","Reduces heating bills","Modern exterior finish"] },
  { slug: "pebble-dash-removal", name: "Pebbledash Removal", tagline: "REMOVE DATED PEBBLEDASH FOR GOOD", desc: "Remove dated pebbledash and replace it with a smooth, modern rendered finish.", benefits: ["Complete removal","Surface prepared correctly","Modern finish applied"] },
  { slug: "render-repairs", name: "Render Repairs", tagline: "STOP DAMAGE BEFORE IT SPREADS", desc: "Repair cracked, damaged or failing render before it becomes a bigger issue.", benefits: ["Crack and impact repairs","Colour-matched finish","Prevents water ingress"] },
];

const SERVICE_CARD_IMAGES: Record<string, string> = {
  "silicone-render":    "/svc-silicone.webp",
  "monocouche-render":  "/svc-monocouche.webp",
  "k-rend":             "/svc-krend.webp",
  "ewi-systems":        "/gal-ewi-ba.webp",
  "pebble-dash-removal":"/svc-pebbledash.webp",
  "render-repairs":     "/ba-silicone.webp",
};

const PROCESS_STEPS = [
  { n: 1, title: "Send Photos", body: "Upload photos of your property exterior so we can assess the existing condition." },
  { n: 2, title: "Discuss Finish", body: "Choose the render system and appearance that suits your property and budget." },
  { n: 3, title: "Get a Quote", body: "Receive clear next steps and a quote based on the work required." },
  { n: 4, title: "Professional Preparation", body: "Surfaces are properly prepared before any rendering begins." },
  { n: 5, title: "Clean Modern Finish", body: "Your property is completed with a sharp, durable exterior render." },
];

const WHY_POINTS = [
  "Rendering specialists — not general builders",
  "Based locally in Grays, Thurrock",
  "Serving Essex and London",
  "Clean modern finishes on every project",
  "Photo-based quote requests available",
  "Clear communication from enquiry to completion",
  "Work focused on kerb appeal, protection and long-term finish",
];

function PageSEO({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const created = !meta;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description;
    return () => {
      document.title = prev;
      if (created) meta?.parentNode?.removeChild(meta);
    };
  }, [title, description]);
  return null;
}

function Spinner() {
  return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BLUE }}/></div>;
}

function CheckIcon({ color = BLUE }: { color?: string }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke={color} strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function BlueBtn({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <WouterLink href={href} style={{ backgroundColor: BLUE }} className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity ${className}`}>
      {children}
    </WouterLink>
  );
}

function OutlineBtn({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <WouterLink href={href} className={`inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-semibold transition-colors ${dark ? 'border-white/40 text-white hover:bg-white/10' : 'border-slate-300 text-[#26323F] hover:border-[#1F8CFF] hover:text-[#1F8CFF]'}`}>
      {children}
    </WouterLink>
  );
}

function ImageUpload({ onUploaded, label = "Upload photo", hint }: { onUploaded: (url: string) => void; label?: string; hint?: string }) {
  const requestUrl = useRequestUploadUrl();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setState("uploading");
    setPreview(URL.createObjectURL(file));
    try {
      const result = await requestUrl.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type } }) as any;
      await fetch(result.uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      onUploaded(result.objectPath);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${state === "done" ? "border-green-400 bg-green-50" : "border-slate-300 bg-slate-50 hover:border-[#1F8CFF]"}`}
      >
        {preview ? (
          <div className="space-y-2">
            <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded object-cover"/>
            {state === "uploading" && <p className="text-xs text-slate-500">Uploading…</p>}
            {state === "done" && <p className="text-xs text-green-600 font-medium">✓ Uploaded successfully</p>}
            {state === "error" && <p className="text-xs text-red-500">Upload failed — try again</p>}
          </div>
        ) : (
          <div className="space-y-1">
            <svg className="w-8 h-8 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <p className="text-sm text-slate-500">Click to upload a photo</p>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="hidden md:block text-xs text-white py-2" style={{ backgroundColor: "#0A1F3A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <span>Based in Grays, Thurrock — serving Essex &amp; London</span>
        <span className="text-slate-400">Silicone Rendering • K Rend • EWI • Pebbledash Removal</span>
      </div>
    </div>
  );
}

function MobileBar({ tenantSlug, phone }: { tenantSlug: string; phone?: string }) {
  const siteBase = useSiteBase();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-slate-200 shadow-lg">
      <a href={phone ? `tel:${phone}` : `tel:01375123456`} className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold bg-white text-[#26323F] hover:bg-slate-50 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
        Call AMO
      </a>
      <a href={`${siteBase}/quote`} className="flex-1 flex items-center justify-center py-4 text-sm font-bold text-white" style={{ backgroundColor: BLUE }}>
        Get Quote
      </a>
    </div>
  );
}

function SiteNav({ tenant, settings, tenantSlug }: any) {
  const siteBase = useSiteBase();
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Services", href: "/services" },
    { label: "Before & After", href: "/gallery" },
    { label: "Areas", href: "/areas" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Reviews", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ];
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between lg:grid lg:grid-cols-3">
        {/* Left — logo */}
        <a href={siteBase || '/'} className="flex-shrink-0">
          <img src={settings?.logoUrl || "/amo-logo.webp"} alt={tenant?.name || "AMO Rendering"} className="h-14 sm:h-16 w-auto object-contain" />
        </a>
        {/* Centre — nav links */}
        <div className="hidden lg:flex items-center justify-center gap-6 text-sm font-medium">
          {links.map(l => (
            <WouterLink key={l.href} href={l.href} className="transition-colors hover:text-[#1F8CFF] whitespace-nowrap" style={{ color: TEXT }}>{l.label}</WouterLink>
          ))}
        </div>
        {/* Right — phone + CTA + mobile burger */}
        <div className="flex items-center justify-end gap-3">
          <div className="hidden lg:flex items-center gap-3">
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="text-sm font-semibold hover:text-[#1F8CFF] transition-colors" style={{ color: TEXT }}>{settings.phone}</a>
            )}
            <BlueBtn href={`${siteBase}/quote`}>Get Quote</BlueBtn>
          </div>
          <button className="lg:hidden p-2 rounded-md hover:bg-slate-100" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" style={{ color: TEXT }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/>
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          {links.map(l => (
            <WouterLink key={l.href} href={l.href} className="block py-2 text-sm font-medium hover:text-[#1F8CFF]" style={{ color: TEXT }} onClick={() => setOpen(false)}>{l.label}</WouterLink>
          ))}
          {settings?.phone && <a href={`tel:${settings.phone}`} className="block py-2 text-sm font-semibold" style={{ color: BLUE }}>{settings.phone}</a>}
          <div className="pt-2"><BlueBtn href={`${siteBase}/quote`} className="w-full">Get a Free Quote</BlueBtn></div>
        </div>
      )}
    </nav>
  );
}

function PageHero({ tenantSlug, crumb, title, subtitle }: { tenantSlug: string; crumb: string; title: string; subtitle: string }) {
  const siteBase = useSiteBase();
  return (
    <section style={{ backgroundColor: NAVY }} className="py-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <a href={siteBase || '/'} className="hover:text-white transition-colors">AMO Rendering</a>
          <span>/</span>
          <span>{crumb}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight max-w-2xl">{title}</h1>
        <p className="text-lg text-slate-300 leading-relaxed max-w-xl">{subtitle}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <BlueBtn href={`${siteBase}/quote`}>Request a Free Quote</BlueBtn>
          <OutlineBtn href={`${siteBase}/gallery`} dark>View Before &amp; After</OutlineBtn>
        </div>
      </div>
    </section>
  );
}

function SiteFooter({ tenant, settings, tenantSlug }: any) {
  const siteBase = useSiteBase();
  return (
    <footer style={{ backgroundColor: NAVY }} className="text-slate-300 pb-20 md:pb-0">
      {/* CTA strip */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-white font-bold text-lg">Ready to transform your property?</p>
            <p className="text-slate-400 text-sm mt-1">Get a free quote — send photos and AMO will advise on the best render system.</p>
          </div>
          <div className="flex-shrink-0">
            <BlueBtn href={`${siteBase}/quote`}>Get a Free Quote</BlueBtn>
          </div>
        </div>
      </div>

      {/* Main columns — equal 4-col grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-1 space-y-4">
          <img
            src="/amo-logo-dark.webp"
            alt={tenant?.name || "AMO Rendering"}
            className="h-16 w-auto object-contain"
          />
          <p className="text-sm leading-relaxed text-slate-400">
            Rendering specialists based in Grays, Thurrock — serving Essex and London with silicone render, monocouche, K Rend, EWI and pebbledash removal.
          </p>
          <div className="space-y-1.5 text-sm text-slate-400">
            <p className="text-slate-300 font-medium">Grays, Thurrock, Essex</p>
            {settings?.phone && (
              <p><a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">{settings.phone}</a></p>
            )}
            <p><a href="mailto:info@amorendering.co.uk" className="hover:text-white transition-colors">info@amorendering.co.uk</a></p>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-white mb-4">Services</p>
          {[
            { label: "Silicone Rendering", slug: "silicone-render" },
            { label: "Monocouche Rendering", slug: "monocouche-render" },
            { label: "K Rend", slug: "k-rend" },
            { label: "External Wall Insulation", slug: "ewi-systems" },
            { label: "Pebbledash Removal", slug: "pebble-dash-removal" },
            { label: "Render Repairs", slug: "render-repairs" },
          ].map(s => (
            <a key={s.slug} href={`${siteBase}/services/${s.slug}`} className="block text-sm text-slate-400 hover:text-white transition-colors">{s.label}</a>
          ))}
        </div>

        {/* Areas */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-white mb-4">Areas</p>
          {["Grays","Thurrock","Basildon","Romford","Chelmsford","Brentwood","London"].map(a => (
            <a key={a} href={`${siteBase}/areas/${a.toLowerCase()}`} className="block text-sm text-slate-400 hover:text-white transition-colors">{a}</a>
          ))}
        </div>

        {/* Company */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-white mb-4">Company</p>
          {[
            { label: "Gallery", href: `${siteBase}/gallery` },
            { label: "Case Studies", href: `${siteBase}/case-studies` },
            { label: "Reviews", href: `${siteBase}/reviews` },
            { label: "FAQs", href: `${siteBase}/faqs` },
            { label: "Contact", href: `${siteBase}/contact` },
            { label: "Get a Quote", href: `${siteBase}/quote` },
          ].map(l => (
            <a key={l.label} href={l.href} className="block text-sm text-slate-400 hover:text-white transition-colors">{l.label}</a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 border-t border-slate-800 flex flex-wrap gap-3 items-center justify-between text-xs text-slate-600">
        <span>&copy; {new Date().getFullYear()} {tenant?.name || "AMO Rendering"}. All rights reserved.</span>
        <div className="flex gap-5">
          <a href={`${siteBase}/faqs`} className="hover:text-slate-400 transition-colors">FAQs</a>
          <a href={`${siteBase}/contact`} className="hover:text-slate-400 transition-colors">Contact</a>
          <a href={`${siteBase}/quote`} className="hover:text-slate-400 transition-colors">Get a Quote</a>
        </div>
      </div>
    </footer>
  );
}

function QuoteCTASection({ tenantSlug, phone }: { tenantSlug: string; phone?: string }) {
  const siteBase = useSiteBase();
  return (
    <section style={{ backgroundColor: NAVY }} className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white space-y-6">
        <h2 className="text-3xl font-bold">Ready to Modernise Your Property Exterior?</h2>
        <p className="text-lg text-slate-300">Send us your details and upload photos of your property. AMO Rendering will review your project and help you choose the right rendering solution.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <BlueBtn href={`${siteBase}/quote`}>Request a Free Quote</BlueBtn>
          <OutlineBtn href={`${siteBase}/visualiser`} dark>Upload Property Photos</OutlineBtn>
        </div>
        {phone && <p className="text-slate-400 text-sm">Or call us directly: <a href={`tel:${phone}`} className="text-white font-semibold hover:text-[#8EC8FF]">{phone}</a></p>}
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div style={{ backgroundColor: "#E8F3FF" }} className="border-b border-[#8EC8FF]/40 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-6 text-sm font-medium" style={{ color: TEXT }}>
        {["Rendering Specialists","Based in Grays, Thurrock","Essex & London","Free Quote Requests","Photo Upload Available"].map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <CheckIcon color={BLUE}/>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────

function HomePage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data, isLoading } = useGetPublicSite(tenantSlug);
  if (isLoading) return <Spinner/>;
  if (!data) return <div className="p-8 text-center text-slate-500">Site not found</div>;
  const { tenant, settings, featuredServices, featuredReviews, recentCaseStudies, featuredBeforeAfter, globalFaqs } = data as any;
  const services = featuredServices?.length ? featuredServices : STATIC_SERVICES;

  return (
    <div>
      <PageSEO title="AMO Rendering | Silicone Render Specialists — Grays, Essex & London" description="AMO Rendering provides expert silicone render, monocouche, K Rend, EWI and pebbledash removal across Grays, Thurrock, Essex and London. Request a free quote today."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[580px] md:min-h-[680px] flex items-center">
        {/* Background image */}
        <img
          src="/hero-home.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        {/* Subtle overlay — just enough to make text crisp */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,22,40,0.72) 0%, rgba(10,22,40,0.45) 60%, rgba(10,22,40,0.25) 100%)" }}/>
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 w-full">
          <div className="max-w-2xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1F8CFF]/40 bg-[#1F8CFF]/15 px-4 py-1.5 text-xs font-semibold text-[#8EC8FF] tracking-wide uppercase">
              Silicone Render Specialists · Grays, Thurrock
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
              Transform Tired Exterior Walls With Premium Silicone Rendering
            </h1>
            <p className="text-lg text-slate-200 leading-relaxed">
              AMO Rendering provides silicone rendering, monocouche render, K Rend, external wall insulation and pebbledash removal for homes and properties across Grays, Thurrock, Essex and London.
            </p>
            <div className="flex flex-wrap gap-4">
              <BlueBtn href={`${siteBase}/quote`} className="h-12 px-8 text-base">Request a Free Quote</BlueBtn>
              <OutlineBtn href={`${siteBase}/gallery`} dark>View Before &amp; After Work</OutlineBtn>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {["Based in Grays, Thurrock","Serving Essex & London","Silicone Render Specialists","Photo Quotes Available"].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-slate-200">
                  <CheckIcon color="#8EC8FF"/>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustBar/>

      {/* Transformations */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Real Results</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: TEXT }}>See What Professional Rendering Can Do</h2>
            <p className="mt-4 max-w-2xl mx-auto" style={{ color: MUTED }}>From cracked render and tired pebbledash to clean, modern exterior finishes that last decades.</p>
          </div>

          {/* Featured showcase */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
            <img
              src="/ba-silicone.webp"
              alt="Silicone render before and after — Essex property transformation by AMO Rendering"
              className="w-full object-cover"
            />
            {/* Trust strip below the image */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
              {[
                { icon: "🛡️", label: "Up to 15-Year Guarantee", sub: "Written & backed by AMO" },
                { icon: "🌧️", label: "Weather-Resistant Finish", sub: "Silicone repels rain & damp" },
                { icon: "📍", label: "Essex & London", sub: "Local specialists, fast quotes" },
                { icon: "📸", label: "Free Photo Quote", sub: "Upload photos, get a price" },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="px-6 py-5 flex items-start gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: TEXT }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: "100+", label: "Projects Completed" },
              { num: "15yr", label: "Guarantee Available" },
              { num: "Essex", label: "& London Coverage" },
              { num: "5★", label: "Average Customer Rating" },
            ].map(({ num, label }) => (
              <div key={label} className="rounded-2xl bg-white border border-slate-200 py-6 text-center shadow-sm">
                <div className="text-3xl font-bold" style={{ color: BLUE }}>{num}</div>
                <div className="text-xs font-medium mt-1" style={{ color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>

          {/* More service before/afters — 2×2 grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                src: "/ba-monocouche.webp",
                alt: "Monocouche render before and after — Essex bungalow transformation",
                title: "Monocouche Render",
                tag: "Seamless. Low Maintenance.",
              },
              {
                src: "/ba-krend.webp",
                alt: "K Rend silicone render before and after — Essex detached home",
                title: "K Rend System",
                tag: "Original Silicone Render",
              },
              {
                src: "/ba-pebbledash.webp",
                alt: "Pebbledash removal and render before and after — Essex semi",
                title: "Pebbledash Removal",
                tag: "Complete Strip & Render",
              },
              {
                src: "/ba-ewi.webp",
                alt: "EWI external wall insulation before and after — Essex semi",
                title: "EWI Systems",
                tag: "Insulate & Transform",
              },
            ].map(({ src, alt, title, tag }) => (
              <div key={src} className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white group hover:shadow-xl transition-shadow duration-300">
                <div className="overflow-hidden">
                  <img
                    src={src}
                    alt={alt}
                    className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <p className="font-semibold text-sm" style={{ color: TEXT }}>{title}</p>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#E8F3FF]" style={{ color: BLUE }}>{tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <BlueBtn href={`${siteBase}/gallery`}>View All Transformations</BlueBtn>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>What We Do</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: TEXT }}>Rendering Services For Homes &amp; Properties Across Essex And London</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((s: any) => (
              <a key={s.id || s.slug} href={`${siteBase}/services/${s.slug}`} className="group rounded-2xl border border-slate-200 p-7 space-y-4 hover:border-[#1F8CFF] hover:shadow-md transition-all bg-white">
                <h3 className="font-bold text-lg" style={{ color: TEXT }}>{s.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.tagline || s.desc || s.description}</p>
                {(s.benefits as string[])?.slice(0,3).map((b: string) => (
                  <div key={b} className="flex items-center gap-2 text-xs" style={{ color: MUTED }}><CheckIcon color={BLUE}/>{b}</div>
                ))}
                <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all" style={{ color: BLUE }}>
                  Find out more <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                </span>
              </a>
            ))}
          </div>
          <div className="mt-10 text-center"><BlueBtn href={`${siteBase}/services`}>View All Services</BlueBtn></div>
        </div>
      </section>

      {/* Why Choose AMO */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BLUE }}>Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: TEXT }}>Why Homeowners Choose AMO Rendering</h2>
            <ul className="space-y-4">
              {WHY_POINTS.map(p => (
                <li key={p} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                  <span className="text-base" style={{ color: TEXT }}>{p}</span>
                </li>
              ))}
            </ul>
            <BlueBtn href={`${siteBase}/quote`}>Request a Free Quote</BlueBtn>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Silicone Rendering", sub: "Weather-resistant finish" },{ label: "Pebbledash Removal", sub: "Clean modern replacement" },{ label: "External Wall Insulation", sub: "Thermal performance" },{ label: "Render Repairs", sub: "Stop damage spreading" }].map(c => (
              <div key={c.label} className="rounded-xl p-5 bg-white border border-slate-200 space-y-1">
                <div className="font-semibold text-sm" style={{ color: TEXT }}>{c.label}</div>
                <div className="text-xs" style={{ color: MUTED }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: TEXT }}>A Simple Process From First Enquiry To Finished Exterior</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.n} className="relative text-center space-y-3">
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-full h-px border-t-2 border-dashed border-slate-200"/>
                )}
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg" style={{ backgroundColor: BLUE }}>{s.n}</div>
                <h3 className="font-bold text-sm" style={{ color: TEXT }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      {recentCaseStudies?.length > 0 && (
        <section style={{ backgroundColor: LIGHT_BG }} className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: BLUE }}>Our Work</p>
                <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: TEXT }}>Featured Case Studies</h2>
                <p className="mt-2 text-sm" style={{ color: MUTED }}>Real projects. Real results. Click to read the full story.</p>
              </div>
              <a href={`${siteBase}/case-studies`} className="text-sm font-semibold shrink-0" style={{ color: BLUE }}>View all case studies →</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCaseStudies.map((cs: any) => (
                <a
                  key={cs.id}
                  href={`${siteBase}/case-studies/${cs.slug}`}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  style={{ minHeight: "380px" }}
                >
                  {/* Image */}
                  {cs.heroImageUrl
                    ? <img src={cs.heroImageUrl} alt={cs.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="absolute inset-0" style={{ backgroundColor: NAVY }}/>
                  }
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.35) 50%, transparent 100%)" }}/>
                  {/* Location badge top-left */}
                  {cs.location && (
                    <div className="relative z-10 p-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: BLUE }}>{cs.location}</span>
                    </div>
                  )}
                  {/* Text pinned to bottom */}
                  <div className="relative z-10 mt-auto p-6 space-y-2">
                    <h3 className="font-bold text-lg text-white leading-snug">{cs.title}</h3>
                    {cs.tagline && <p className="text-sm text-slate-300 leading-relaxed">{cs.tagline}</p>}
                    <span className="inline-block text-xs font-semibold pt-2" style={{ color: "#8EC8FF" }}>Read case study →</span>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-10 text-center"><BlueBtn href={`${siteBase}/case-studies`}>View All Case Studies</BlueBtn></div>
          </div>
        </section>
      )}

      {/* Areas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Service Area</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: TEXT }}>Rendering Services Across Essex And London</h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {ALL_AREAS.map(a => (
              <a key={a} href={`${siteBase}/areas`} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium hover:border-[#1F8CFF] hover:text-[#1F8CFF] transition-colors" style={{ color: TEXT }}>{a}</a>
            ))}
          </div>
          <p className="text-center mt-8 text-sm" style={{ color: MUTED }}>Not sure if we cover your area? <a href={`${siteBase}/contact`} className="font-semibold hover:underline" style={{ color: BLUE }}>Get in touch and we'll let you know.</a></p>
        </div>
      </section>

      {/* Reviews */}
      {featuredReviews?.length > 0 && (
        <section style={{ backgroundColor: NAVY }} className="py-20 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#8EC8FF" }}>Reviews</p>
              <h2 className="text-3xl sm:text-4xl font-bold">Trusted By Homeowners Across Essex And London</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredReviews.map((r: any) => (
                <div key={r.id} className="rounded-2xl p-7 space-y-4" style={{ backgroundColor: "#0F1E2E" }}>
                  <StarRating rating={r.rating}/>
                  {r.title && <h3 className="font-bold text-white">{r.title}</h3>}
                  <p className="text-sm text-slate-300 leading-relaxed">"{r.content}"</p>
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="text-sm font-semibold text-white">{r.reviewerName}</div>
                    {r.reviewerLocation && <div className="text-xs text-slate-500 mt-0.5">{r.reviewerLocation}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center"><OutlineBtn href={`${siteBase}/reviews`} dark>Read All Reviews</OutlineBtn></div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {globalFaqs?.length > 0 && (
        <section style={{ backgroundColor: LIGHT_BG }} className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>FAQs</p>
              <h2 className="text-3xl font-bold" style={{ color: TEXT }}>Common Questions About Rendering</h2>
            </div>
            <div className="space-y-3">
              {globalFaqs.map((faq: any) => (
                <details key={faq.id} className="group rounded-xl border border-slate-200 bg-white px-6 py-5">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold" style={{ color: TEXT }}>
                    {faq.question}
                    <svg className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180" style={{ color: BLUE }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 text-center"><BlueBtn href={`${siteBase}/faqs`}>View All FAQs</BlueBtn></div>
          </div>
        </section>
      )}

      <QuoteCTASection tenantSlug={tenantSlug} phone={settings?.phone}/>

      <section style={{ backgroundColor: BLUE }} className="py-14">
        <div className="max-w-3xl mx-auto px-4 text-center text-white space-y-5">
          <h2 className="text-3xl font-bold">Transform Your Exterior With AMO Rendering</h2>
          <a href={`${siteBase}/quote`} className="inline-flex items-center rounded-md bg-white px-8 py-3 text-sm font-bold hover:bg-slate-50 transition-colors" style={{ color: BLUE }}>Get My Free Quote</a>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES PAGE
// ─────────────────────────────────────────────────────────────────────────────

function ServicesPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: services, isLoading } = useListPublicServices(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};
  const list = (services as any[])?.length ? (services as any[]) : STATIC_SERVICES;

  return (
    <div>
      <PageSEO title="Rendering Services | AMO Rendering — Essex & London" description="Expert rendering services across Essex and London — silicone render, monocouche, K Rend, EWI, pebbledash removal and repair. Get a free quote."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Rendering Services Across Essex & London" title="Rendering Services Across Essex & London" subtitle="Specialist exterior rendering services for homeowners and properties across Grays, Thurrock, Essex and London."/>

      {/* Service Photo Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>What We Do</p>
            <h2 className="text-3xl font-bold" style={{ color: TEXT }}>Choose The Right Render System For Your Property</h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: MUTED }}>Every property is different. AMO Rendering helps you choose the right approach based on existing surface condition, desired finish and long-term performance.</p>
          </div>
          {isLoading ? <Spinner/> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((s: any) => {
                const img = SERVICE_CARD_IMAGES[s.slug];
                return (
                  <a
                    key={s.id || s.slug}
                    href={`${siteBase}/services/${s.slug}`}
                    className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl hover:border-[#1F8CFF] transition-all flex flex-col"
                  >
                    {/* Photo */}
                    <div className="relative overflow-hidden" style={{ height: 220 }}>
                      {img ? (
                        <img
                          src={img}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white" style={{ backgroundColor: NAVY }}>
                          {(s.name || '?')[0]}
                        </div>
                      )}
                      {/* Tagline pill */}
                      {s.tagline && (
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: BLUE }}>
                            {s.tagline}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 space-y-3">
                      <h2 className="text-lg font-bold group-hover:text-[#1F8CFF] transition-colors" style={{ color: TEXT }}>{s.name}</h2>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: MUTED }}>{s.desc || s.description}</p>
                      {(s.benefits as string[])?.length > 0 && (
                        <ul className="space-y-1.5 pt-1">
                          {(s.benefits as string[]).slice(0, 3).map((b: string) => (
                            <li key={b} className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
                              <CheckIcon color={BLUE}/>{b}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-semibold pt-1" style={{ color: BLUE }}>
                        See {s.name} <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Not sure section */}
      <section style={{ backgroundColor: NAVY }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8EC8FF" }}>How We Help</p>
            <h2 className="text-3xl font-bold">Not Sure Which Rendering Service You Need?</h2>
            <p className="text-slate-300 leading-relaxed">Customers often know the problem — not the solution. AMO can review photos of your property, discuss the existing wall condition and guide you towards the most suitable option for your budget and finish goals.</p>
            <div className="space-y-6">
              {[{ n: 1, title: "Send photos", body: "Show the current exterior wall condition so we can assess what's there." },{ n: 2, title: "Discuss finish", body: "Choose the appearance and render type that suits your property and budget." },{ n: 3, title: "Get a quote", body: "Receive clear next steps and a price based on the work required." }].map(step => (
                <div key={step.n} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: BLUE }}>{step.n}</div>
                  <div>
                    <h3 className="font-bold text-white">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <BlueBtn href={`${siteBase}/quote`}>Request A Quote</BlueBtn>
          </div>
          {/* 2×2 photo mosaic */}
          <div className="grid grid-cols-2 gap-3">
            {["/svc-silicone.webp", "/svc-monocouche.webp", "/svc-krend.webp", "/svc-pebbledash.webp"].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ height: 170 }}>
                <img src={src} alt="AMO Rendering work" className="w-full h-full object-cover"/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Send Photos For A Rendering Quote</h2>
          <p style={{ color: MUTED }}>Tell AMO what your property needs and upload clear photos of the exterior walls.</p>
          <BlueBtn href={`${siteBase}/quote`}>Request A Quote</BlueBtn>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE DETAIL PAGE
// ─────────────────────────────────────────────────────────────────────────────

function ServiceDetailPage({ tenantSlug, slug }: { tenantSlug: string; slug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: service, isLoading } = useGetPublicService(tenantSlug, slug);
  const { tenant, settings } = (siteData as any) || {};
  const s = service as any;
  const staticService = STATIC_SERVICES.find(ss => ss.slug === slug);
  const fallback = staticService || { name: slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '), desc: "", tagline: "", benefits: [] };

  const name = s?.name || fallback.name;
  const description = s?.description || fallback.desc;
  const benefits = (s?.benefits as string[])?.length ? (s.benefits as string[]) : fallback.benefits;

  return (
    <div>
      <PageSEO title={`${name} in Essex & London | AMO Rendering`} description={description || `Professional ${name} service across Essex and London. AMO Rendering — free quotes available.`}/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>

      {isLoading ? <Spinner/> : (
        <>
          <PageHero tenantSlug={tenantSlug} crumb={`${name} in Essex & London`} title={`${name} in Essex & London`} subtitle={description || `Expert ${name} for homeowners and properties across Grays, Thurrock, Essex and London.`}/>

          {/* Main content + sidebar */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <article className="lg:col-span-2 space-y-10">
                  {/* What is it */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE }}>Service Detail</p>
                    <h2 className="text-2xl font-bold" style={{ color: TEXT }}>What Is {name}?</h2>
                    <p className="leading-relaxed" style={{ color: MUTED }}>{description || `${name} is a professional exterior rendering service that improves the appearance and protection of your property's exterior walls.`}</p>
                    <p className="leading-relaxed" style={{ color: MUTED }}>AMO Rendering works with homeowners and property owners who want a cleaner, sharper and more modern exterior finish. The focus is not just applying render — it is improving the way the property looks and helping protect exterior walls with the right system.</p>
                  </div>

                  {/* Why choose */}
                  {benefits.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Why Homeowners Choose This Service</h2>
                      <ul className="space-y-3">
                        {benefits.map((b: string) => (
                          <li key={b} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                            <span className="text-sm" style={{ color: TEXT }}>{b}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                          <span className="text-sm" style={{ color: TEXT }}>Suitable for Essex and London properties</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                          <span className="text-sm" style={{ color: TEXT }}>Quote available with property photos</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Before & After impact */}
                  {(() => {
                    const baImg = SERVICE_BA_IMAGES[slug];
                    return baImg ? (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <div className="relative">
                          <img
                            src={baImg}
                            alt={`${name} before and after — Essex property transformation`}
                            className="w-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                            <span className="rounded-md bg-slate-900/80 px-2 py-1 text-xs text-white font-semibold">Before</span>
                            <span className="rounded-md px-2 py-1 text-xs text-white font-semibold" style={{ backgroundColor: BLUE }}>After</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8F3FF]" style={{ color: BLUE }}>Essex</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8F3FF]" style={{ color: BLUE }}>{name}</span>
                          </div>
                          <h3 className="font-semibold text-sm" style={{ color: TEXT }}>Real transformation — Essex property</h3>
                          <p className="text-xs mt-1" style={{ color: MUTED }}>See the full difference a quality render makes. <a href={`${siteBase}/gallery`} className="font-semibold" style={{ color: BLUE }}>View more before &amp; afters →</a></p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Our process */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Our Process</h2>
                    <p className="leading-relaxed" style={{ color: MUTED }}>We start by understanding your property, current exterior wall condition and the finish you want to achieve. Photos help us assess the work needed before we discuss the most appropriate render system.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[{ n: 1, title: "Send photos", body: "Show us the existing surface and wall condition." },{ n: 2, title: "Discuss finish", body: "Choose the render system and colour direction." },{ n: 3, title: "Get a quote", body: "Receive a clear quote based on the work required." }].map(step => (
                        <div key={step.n} className="rounded-xl border border-slate-200 p-5 space-y-2 bg-white">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: BLUE }}>{step.n}</div>
                          <h3 className="font-bold text-sm" style={{ color: TEXT }}>{step.title}</h3>
                          <p className="text-xs" style={{ color: MUTED }}>{step.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {s?.content && <div className="prose prose-slate max-w-none leading-relaxed" style={{ color: MUTED }}>{s.content}</div>}
                </article>

                {/* Sidebar */}
                <aside className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-4 bg-white shadow-sm">
                    <h3 className="font-bold text-lg" style={{ color: TEXT }}>Get A Quote for {name}</h3>
                    <p className="text-sm" style={{ color: MUTED }}>Upload property photos and tell AMO what exterior finish you want.</p>
                    <BlueBtn href={`${siteBase}/quote`} className="w-full">Request Quote</BlueBtn>
                    <div className="space-y-2 pt-2">
                      <a href={`${siteBase}/gallery`} className="block text-sm font-semibold hover:text-[#1F8CFF] transition-colors" style={{ color: BLUE }}>View Before &amp; After →</a>
                      <a href={`${siteBase}/contact`} className="block text-sm font-semibold hover:text-[#1F8CFF] transition-colors" style={{ color: BLUE }}>Contact AMO →</a>
                      <a href={`${siteBase}/visualiser`} className="block text-sm font-semibold hover:text-[#1F8CFF] transition-colors" style={{ color: BLUE }}>Render Visualiser →</a>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-3 bg-white">
                    <h3 className="font-bold text-sm" style={{ color: TEXT }}>Other Services</h3>
                    {STATIC_SERVICES.filter(ss => ss.slug !== slug).map(ss => (
                      <a key={ss.slug} href={`${siteBase}/services/${ss.slug}`} className="block text-sm py-2 border-b border-slate-100 last:border-0 hover:text-[#1F8CFF] transition-colors" style={{ color: MUTED }}>{ss.name}</a>
                    ))}
                  </div>
                  <div className="rounded-2xl p-6 space-y-3 text-white" style={{ backgroundColor: NAVY }}>
                    <h3 className="font-bold">Based in Grays, Thurrock</h3>
                    <p className="text-sm text-slate-400">Serving Essex and London. Photo-based quotes available.</p>
                    <a href={`${siteBase}/areas`} className="block text-sm font-semibold" style={{ color: "#8EC8FF" }}>View Areas Covered →</a>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <QuoteCTASection tenantSlug={tenantSlug} phone={settings?.phone}/>
        </>
      )}

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AREAS PAGE
// ─────────────────────────────────────────────────────────────────────────────

function AreasPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: areas, isLoading } = useListPublicAreas(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};

  const areaList: any[] = (areas as any[])?.length
    ? (areas as any[])
    : ALL_AREAS.map(a => ({
        name: a,
        slug: a.toLowerCase().replace(/\s+/g, '-'),
        county: a === 'London' ? 'Greater London' : 'Essex',
        description: `Silicone rendering, K Rend, monocouche render, EWI and pebbledash removal for properties in ${a} and nearby areas.`,
      }));

  const withPhoto = areaList.filter(a => AREA_IMAGES[(a.slug || a.name?.toLowerCase())]);
  const withoutPhoto = areaList.filter(a => !AREA_IMAGES[(a.slug || a.name?.toLowerCase())]);

  return (
    <div>
      <PageSEO title="Areas We Cover | AMO Rendering — Essex & London" description="AMO Rendering covers Grays, Thurrock, Essex, London, Basildon, Romford, Chelmsford and surrounding areas. Local rendering specialists."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Areas We Cover" title="Local Rendering Across Essex & London" subtitle="AMO Rendering is based in Grays, Thurrock. We cover Essex, Greater London and surrounding areas for all rendering services."/>

      {/* Photo area cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Where We Work</p>
            <h2 className="text-3xl font-bold" style={{ color: TEXT }}>Rendering Services Near You</h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: MUTED }}>From Grays and Thurrock through Essex and into London, AMO Rendering provides specialist exterior rendering across the region.</p>
          </div>
          {isLoading ? <Spinner/> : (
            <>
              {/* Areas with photos — tall overlay cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                {withPhoto.map((a: any) => {
                  const slug = a.slug || a.name?.toLowerCase();
                  const img = AREA_IMAGES[slug];
                  return (
                    <a
                      key={a.id || slug}
                      href={`${siteBase}/areas/${slug}`}
                      className="group relative rounded-2xl overflow-hidden flex flex-col justify-end hover:shadow-xl transition-all"
                      style={{ height: 280 }}
                    >
                      <img
                        src={img}
                        alt={`Rendering in ${a.name}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* gradient overlay */}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,22,40,0.90) 0%, rgba(10,22,40,0.30) 55%, transparent 100%)' }}/>
                      {/* county badge */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: BLUE }}>
                          {a.county || 'Essex'}
                        </span>
                      </div>
                      {/* text */}
                      <div className="relative p-5 space-y-1">
                        <h2 className="text-lg font-bold text-white leading-tight">Rendering in {a.name}</h2>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{a.description || `Silicone, monocouche, K Rend and pebbledash removal in ${a.name}.`}</p>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold pt-1" style={{ color: '#8EC8FF' }}>
                          View Area <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
              {/* Areas without photos — compact list cards */}
              {withoutPhoto.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {withoutPhoto.map((a: any) => {
                    const slug = a.slug || a.name?.toLowerCase();
                    return (
                      <a
                        key={a.id || slug}
                        href={`${siteBase}/areas/${slug}`}
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-[#1F8CFF] hover:shadow-md transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold group-hover:text-[#1F8CFF] transition-colors" style={{ color: TEXT }}>{a.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: MUTED }}>{a.county || 'Essex'}</p>
                        </div>
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: BLUE }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Why local section — photo left, copy right */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 2×2 mosaic */}
          <div className="grid grid-cols-2 gap-3">
            {["/gal-monocouche-grays.webp","/gal-romford.webp","/gal-krend-chelmsford.webp","/gal-brentwood-silicone.webp"].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ height: 180 }}>
                <img src={src} alt="AMO Rendering local work" className="w-full h-full object-cover"/>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE }}>Why Local Matters</p>
            <h2 className="text-3xl font-bold" style={{ color: TEXT }}>Based in Grays, Serving the Region</h2>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>AMO Rendering operates from Grays, Thurrock — meaning short travel times, consistent quality and a team that understands the property types, weather conditions and rendering challenges specific to Essex and London homes.</p>
            <ul className="space-y-4">
              {[
                { title: "Quick response across Essex", body: "Our Grays base puts us within easy reach of Basildon, Chelmsford, Brentwood, Romford and central London." },
                { title: "Familiar with local property types", body: "We regularly work on 1930s semis, new-builds, commercial renders and period properties across the region." },
                { title: "Known in the local area", body: "Reviews from Grays, Thurrock, Romford and Brentwood customers reflect a consistent standard of work." },
              ].map(p => (
                <li key={p.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0"><CheckIcon color={BLUE}/></div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: TEXT }}>{p.title}</p>
                    <p className="text-xs leading-relaxed mt-0.5" style={{ color: MUTED }}>{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <BlueBtn href={`${siteBase}/quote`}>Get a Quote For Your Area</BlueBtn>
          </div>
        </div>
      </section>

      {/* Services available everywhere */}
      <section style={{ backgroundColor: NAVY }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8EC8FF' }}>Available Across All Areas</p>
            <h2 className="text-2xl font-bold text-white">Every Service, Wherever You Are</h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">AMO Rendering offers all render systems across Essex and London — no area is limited to a single service.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATIC_SERVICES.map(s => (
              <a key={s.slug} href={`${siteBase}/services/${s.slug}`} className="group rounded-xl border border-slate-700 bg-slate-800 p-4 text-center hover:border-[#1F8CFF] hover:bg-slate-700 transition-all">
                <p className="text-sm font-semibold text-white group-hover:text-[#8EC8FF] transition-colors">{s.name}</p>
                <p className="text-[10px] mt-1.5 text-slate-500 group-hover:text-slate-400 transition-colors">View service →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="relative py-20 overflow-hidden">
        <img src="/amo-team.webp" alt="AMO Rendering team" className="absolute inset-0 w-full h-full object-cover object-center"/>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.60) 60%, transparent 100%)' }}/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-lg space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8EC8FF' }}>Ready To Start?</p>
            <h2 className="text-3xl font-bold text-white">Get A Free Quote For Your Property</h2>
            <p className="text-slate-300 text-sm leading-relaxed">Tell AMO where you are and what you need. We'll review your photos, advise on the best render system and provide a clear price.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <BlueBtn href={`${siteBase}/quote`}>Request A Free Quote</BlueBtn>
              <OutlineBtn href={`${siteBase}/contact`} dark>Call Us</OutlineBtn>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AREA DETAIL PAGE
// ─────────────────────────────────────────────────────────────────────────────

function AreaDetailPage({ tenantSlug, slug }: { tenantSlug: string; slug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: area, isLoading } = useGetPublicArea(tenantSlug, slug);
  const { tenant, settings } = (siteData as any) || {};
  const a = area as any;
  const areaName = a?.name || slug.split('-').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' ');

  return (
    <div>
      <PageSEO title={`Rendering in ${areaName} | AMO Rendering`} description={a?.description || `Professional silicone rendering, monocouche, K Rend and pebbledash removal in ${areaName}. AMO Rendering — free quotes available.`}/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>

      {isLoading ? <Spinner/> : a ? (
        <>
          <PageHero tenantSlug={tenantSlug} crumb={`Rendering in ${areaName}`} title={`Rendering in ${areaName}`} subtitle={a.description || `Silicone rendering, K Rend, monocouche render, external wall insulation and pebbledash removal for properties in ${areaName}.`}/>

          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <article className="lg:col-span-2 space-y-10">
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE }}>Local Rendering</p>
                    <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Exterior Rendering Services in {areaName}</h2>
                    <p className="leading-relaxed" style={{ color: MUTED }}>AMO Rendering provides professional exterior rendering services for homeowners and property owners in {areaName}. The focus is on transforming tired walls, dated pebbledash and failing exterior finishes into cleaner, sharper and more modern rendered surfaces.</p>
                    <p className="leading-relaxed" style={{ color: MUTED }}>Whether your property needs silicone rendering, K Rend, monocouche render, pebbledash removal or render repairs, AMO can review your property details and help identify the right next step.</p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Services Available in {areaName}</h2>
                    <ul className="space-y-2">
                      {["Silicone Rendering","Monocouche Rendering","K Rend","External Wall Insulation","Pebbledash Removal","Render Repairs"].map(s => (
                        <li key={s} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                          <span className="text-sm font-medium" style={{ color: TEXT }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Local Project Style</h2>
                    <p className="leading-relaxed" style={{ color: MUTED }}>Many properties across Essex and London benefit from a cleaner external finish. Rendering can improve kerb appeal, refresh dated walls and create a more consistent property exterior.</p>
                    {a.content && <p className="leading-relaxed" style={{ color: MUTED }}>{a.content}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {STATIC_SERVICES.map(s => (
                      <a key={s.slug} href={`${siteBase}/services/${s.slug}`} className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-[#1F8CFF] transition-colors">
                        <h3 className="font-semibold text-sm group-hover:text-[#1F8CFF] transition-colors" style={{ color: TEXT }}>{s.name}</h3>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: MUTED }}>{s.desc}</p>
                      </a>
                    ))}
                  </div>
                </article>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-4 bg-white shadow-sm">
                    <h3 className="font-bold text-lg" style={{ color: TEXT }}>Get A Quote in {areaName}</h3>
                    <p className="text-sm" style={{ color: MUTED }}>Upload property photos and tell AMO what exterior finish you want.</p>
                    <BlueBtn href={`${siteBase}/quote`} className="w-full">Request Quote</BlueBtn>
                    <div className="space-y-2 pt-2">
                      <a href={`${siteBase}/gallery`} className="block text-sm font-semibold" style={{ color: BLUE }}>View Before &amp; After →</a>
                      <a href={`${siteBase}/contact`} className="block text-sm font-semibold" style={{ color: BLUE }}>Contact AMO →</a>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-3 bg-white">
                    <h3 className="font-bold text-sm" style={{ color: TEXT }}>Other Areas</h3>
                    {["Grays","Thurrock","Essex","London","Basildon","Brentwood","Romford"].filter(n => n.toLowerCase() !== slug).map(n => (
                      <a key={n} href={`${siteBase}/areas/${n.toLowerCase()}`} className="block text-sm py-2 border-b border-slate-100 last:border-0 hover:text-[#1F8CFF] transition-colors" style={{ color: MUTED }}>{n}</a>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* Services section */}
          <section style={{ backgroundColor: LIGHT_BG }} className="py-14">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
              <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Rendering Services in {areaName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {STATIC_SERVICES.slice(0,3).map(s => (
                  <div key={s.slug} className="rounded-xl bg-white border border-slate-200 p-5 space-y-2">
                    <h3 className="font-bold text-sm" style={{ color: TEXT }}>{s.name}</h3>
                    <p className="text-xs" style={{ color: MUTED }}>{s.desc}</p>
                    <a href={`${siteBase}/services/${s.slug}`} className="text-xs font-semibold" style={{ color: BLUE }}>Learn more →</a>
                  </div>
                ))}
              </div>
              <BlueBtn href={`${siteBase}/quote`}>Get a Free Quote for {areaName}</BlueBtn>
            </div>
          </section>
        </>
      ) : <div className="p-8 text-center" style={{ color: MUTED }}>Area not found</div>}

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY / BEFORE & AFTER PAGE
// ─────────────────────────────────────────────────────────────────────────────

const SHOWCASE_ITEMS = [
  { src: "/ba-silicone.webp",    alt: "Silicone render before and after — Essex detached home",  title: "Silicone Render",      tag: "Silicone Rendering",   span: "md:col-span-2" },
  { src: "/ba-krend.webp",       alt: "K Rend before and after — Essex detached home",           title: "K Rend System",        tag: "K Rend",               span: "" },
  { src: "/ba-monocouche.webp",  alt: "Monocouche render before and after — Essex bungalow",     title: "Monocouche Render",    tag: "Monocouche",           span: "" },
  { src: "/ba-pebbledash.webp",  alt: "Pebbledash removal before and after — Essex semi",        title: "Pebbledash Removal",   tag: "Pebbledash Removal",   span: "" },
  { src: "/ba-ewi.webp",         alt: "EWI before and after — Essex semi-detached",              title: "EWI Systems",          tag: "EWI",                  span: "" },
];

function GalleryPage({ tenantSlug }: { tenantSlug: string }) {
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: images, isLoading } = useBrowsePublicGallery(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};

  return (
    <div>
      <PageSEO title="Before & After Rendering Gallery | AMO Rendering" description="See real rendering transformations across Essex and London. Silicone render, monocouche and EWI before and after photos from AMO Rendering."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>

      {/* Dark hero header */}
      <section style={{ backgroundColor: NAVY }} className="py-16 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span>AMO Rendering</span><span>/</span><span>Before &amp; After</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold">Before &amp; After Transformations</h1>
              <p className="text-lg text-slate-300 max-w-2xl">Real properties across Essex and London — see exactly what professional rendering does to tired pebbledash and failing exterior walls.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shrink-0">
              {[{ num: "100+", label: "Projects" },{ num: "5★", label: "Rated" },{ num: "15yr", label: "Guarantee" },{ num: "Free", label: "Quotes" }].map(s => (
                <div key={s.label} className="rounded-xl py-3 px-4" style={{ backgroundColor: "#ffffff12" }}>
                  <div className="text-xl font-bold" style={{ color: "#8EC8FF" }}>{s.num}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured showcase — editorial grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: BLUE }}>By Service Type</p>
            <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Rendering Transformations</h2>
          </div>

          {/* Large featured + 2 right */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {/* Large silicone card */}
            <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-md border border-slate-200 group hover:shadow-xl transition-shadow duration-300">
              <img src="/ba-silicone.webp" alt="Silicone render before and after" className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"/>
              <div className="px-5 py-4 flex items-center justify-between bg-white">
                <p className="font-bold" style={{ color: TEXT }}>Silicone Render</p>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E8F3FF]" style={{ color: BLUE }}>Durable. Weather-Resistant.</span>
              </div>
            </div>
            {/* K Rend + Monocouche stacked */}
            <div className="flex flex-col gap-5">
              {[
                { src: "/ba-krend.webp", title: "K Rend System", tag: "Original Silicone Render" },
                { src: "/ba-monocouche.webp", title: "Monocouche Render", tag: "Seamless. Low Maintenance." },
              ].map(({ src, title, tag }) => (
                <div key={src} className="rounded-2xl overflow-hidden shadow-md border border-slate-200 group hover:shadow-xl transition-shadow duration-300">
                  <img src={src} alt={title} className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"/>
                  <div className="px-4 py-3 flex items-center justify-between bg-white">
                    <p className="font-semibold text-sm" style={{ color: TEXT }}>{title}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#E8F3FF]" style={{ color: BLUE }}>{tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pebbledash + EWI side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { src: "/ba-pebbledash.webp", title: "Pebbledash Removal", tag: "Complete Strip & Render" },
              { src: "/ba-ewi.webp", title: "EWI Systems", tag: "Insulate & Transform" },
            ].map(({ src, title, tag }) => (
              <div key={src} className="rounded-2xl overflow-hidden shadow-md border border-slate-200 group hover:shadow-xl transition-shadow duration-300">
                <img src={src} alt={title} className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"/>
                <div className="px-5 py-4 flex items-center justify-between bg-white">
                  <p className="font-bold" style={{ color: TEXT }}>{title}</p>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E8F3FF]" style={{ color: BLUE }}>{tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team trust section */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/amo-team.webp"
                alt="The AMO Rendering team — Essex rendering specialists"
                className="w-full object-cover"
              />
            </div>
            {/* Trust content */}
            <div className="space-y-7">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BLUE }}>Meet The Team</p>
                <h2 className="text-3xl font-bold leading-snug" style={{ color: TEXT }}>Essex Rendering Specialists — Built On Trust</h2>
                <p className="mt-4 leading-relaxed" style={{ color: MUTED }}>Every job is handled by our own trained, uniformed team — never subcontracted. We show up on time, work cleanly and don't leave until you're happy with the result.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "🛡️", title: "Up to 15-Year Guarantee", body: "Written guarantee on every job we complete." },
                  { icon: "👷", title: "Our Own Team Only", body: "No subcontractors. The same crew start to finish." },
                  { icon: "📍", title: "Based in Grays, Essex", body: "Local specialists — we know the area and its properties." },
                  { icon: "📸", title: "Free Photo Quote", body: "Send us photos and we'll price your job, no obligation." },
                ].map(({ icon, title, body }) => (
                  <div key={title} className="rounded-xl bg-white border border-slate-200 p-4 space-y-1 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <p className="font-bold text-sm" style={{ color: TEXT }}>{title}</p>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project gallery — regular photos in 3-col grid, featured images as full-width partitions */}
      {!isLoading && (images as any[])?.length > 0 && (() => {
        const sorted = [...(images as any[])].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
        // Split into segments: each segment is an array of regular images, followed by an optional featured divider
        const segments: { regulars: any[]; divider: any | null }[] = [];
        let current: any[] = [];
        for (const img of sorted) {
          if (img.featured) {
            segments.push({ regulars: current, divider: img });
            current = [];
          } else {
            current.push(img);
          }
        }
        if (current.length > 0) segments.push({ regulars: current, divider: null });

        return (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="mb-10">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: BLUE }}>Project Portfolio</p>
                <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Work Across Essex & London</h2>
              </div>
              {segments.map((seg, si) => (
                <div key={si}>
                  {/* Regular photos grid */}
                  {seg.regulars.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {seg.regulars.map((img: any) => (
                        <div key={img.id} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                          <div className="overflow-hidden">
                            <img src={img.imageUrl} alt={img.altText || img.caption || "Rendering project"} className="w-full aspect-[4/3] object-cover group-hover:scale-[1.03] transition-transform duration-500"/>
                          </div>
                          {img.caption && (
                            <div className="px-4 py-3 flex items-center gap-2">
                              <span className="text-xs" style={{ color: MUTED }}>📍</span>
                              <p className="text-xs font-medium" style={{ color: MUTED }}>{img.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Featured full-width divider */}
                  {seg.divider && (
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-lg relative group">
                      <img
                        src={seg.divider.imageUrl}
                        alt={seg.divider.altText || seg.divider.caption || "Transformation"}
                        className="w-full object-cover"
                        style={{ maxHeight: "480px", objectPosition: "center" }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 px-6 py-4" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.75), transparent)" }}>
                        <p className="text-white font-semibold text-sm">📍 {seg.divider.caption}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      <QuoteCTASection tenantSlug={tenantSlug} phone={settings?.phone}/>
      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS PAGE
// ─────────────────────────────────────────────────────────────────────────────

function ReviewsPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: reviews, isLoading } = useListPublicReviews(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};
  const list = (reviews as any[]) || [];
  const avgRating = list?.length ? Math.round(list.reduce((s, r) => s + r.rating, 0) / list.length * 10) / 10 : 5;

  return (
    <div>
      <PageSEO title="Customer Reviews | AMO Rendering — Essex & London" description="Read verified customer reviews from homeowners across Essex and London. AMO Rendering — trusted rendering specialists."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>

      {/* Hero with aggregate */}
      <section style={{ backgroundColor: NAVY }} className="py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <a href={siteBase || '/'} className="hover:text-white">AMO Rendering</a>
            <span>/</span><span>Reviews</span>
          </div>
          <h1 className="text-4xl font-bold">AMO Rendering Reviews</h1>
          <p className="text-lg text-slate-300 max-w-2xl">Customer feedback from homeowners looking for cleaner exterior finishes, better communication and modern rendering work.</p>
          {list.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <StarRating rating={5}/>
              <span className="text-2xl font-bold">{avgRating}/5</span>
              <span className="text-slate-400">from {list.length} reviews</span>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <BlueBtn href={`${siteBase}/quote`}>Request a Free Quote</BlueBtn>
            <OutlineBtn href={`${siteBase}/gallery`} dark>View Before &amp; After</OutlineBtn>
          </div>
        </div>
      </section>

      {/* Review cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {isLoading ? <Spinner/> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((r: any) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-7 space-y-4">
                  <StarRating rating={r.rating}/>
                  {r.title && <h3 className="font-bold" style={{ color: TEXT }}>{r.title}</h3>}
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>"{r.content}"</p>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="font-semibold text-sm" style={{ color: TEXT }}>{r.reviewerName}</div>
                    {r.reviewerLocation && <div className="text-xs mt-0.5" style={{ color: MUTED }}>{r.reviewerLocation}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Why Homeowners Trust AMO Rendering</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ title: "Local Specialists", body: "Based in Grays, Thurrock — not a national call centre." },{ title: "Photo-Based Quotes", body: "Upload property photos for an accurate quote." },{ title: "Clear Communication", body: "Updates from first enquiry to finished project." },{ title: "Modern Finishes", body: "Clean, durable render systems applied correctly." }].map(t => (
              <div key={t.title} className="rounded-xl bg-white border border-slate-200 p-5 space-y-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                <h3 className="font-bold text-sm" style={{ color: TEXT }}>{t.title}</h3>
                <p className="text-xs" style={{ color: MUTED }}>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteCTASection tenantSlug={tenantSlug} phone={settings?.phone}/>
      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE STUDIES PAGE
// ─────────────────────────────────────────────────────────────────────────────

function CaseStudiesPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: caseStudies, isLoading } = useListPublicCaseStudies(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};

  return (
    <div>
      <PageSEO title="Rendering Case Studies | AMO Rendering — Essex & London" description="Detailed rendering project case studies from across Essex and London. See the challenge, solution and results from real AMO Rendering projects."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Rendering Case Studies" title="Rendering Case Studies" subtitle="Detailed examples of rendering projects across Essex and London, showing the problem, solution and finished exterior result."/>

      {/* Case study cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {isLoading ? <Spinner/> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(caseStudies as any[])?.map((cs: any) => (
                <a
                  key={cs.id}
                  href={`${siteBase}/case-studies/${cs.slug}`}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  style={{ minHeight: "360px" }}
                >
                  {cs.heroImageUrl
                    ? <img src={cs.heroImageUrl} alt={cs.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="absolute inset-0" style={{ backgroundColor: NAVY }}/>
                  }
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.35) 55%, transparent 100%)" }}/>
                  {cs.location && (
                    <div className="relative z-10 p-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: BLUE }}>{cs.location}</span>
                    </div>
                  )}
                  <div className="relative z-10 mt-auto p-6 space-y-2">
                    <h2 className="font-bold text-lg text-white leading-snug">{cs.title}</h2>
                    <p className="text-sm text-slate-300">{cs.tagline}</p>
                    {cs.projectDuration && <p className="text-xs text-slate-400">Duration: {cs.projectDuration}</p>}
                    <span className="inline-block text-xs font-semibold pt-1" style={{ color: "#8EC8FF" }}>Read case study →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why case studies section */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE }}>What Case Studies Show</p>
            <h2 className="text-2xl font-bold" style={{ color: TEXT }}>More Than Just A Finished Photo</h2>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>Each case study outlines the original problem — what the property looked like and why the homeowner wanted to change it — and the solution chosen by AMO Rendering. Then the result: what the property looks like now and what the customer achieved.</p>
          </div>
          <div className="space-y-4">
            {[{ title: "The Problem", body: "What the existing surface looked like and why it needed attention." },{ title: "The Solution", body: "Which render system was selected and how it was applied." },{ title: "The Result", body: "The completed exterior and the outcome for the homeowner." }].map(s => (
              <div key={s.title} className="flex items-start gap-4 rounded-xl bg-white border border-slate-200 p-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: TEXT }}>{s.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteCTASection tenantSlug={tenantSlug} phone={settings?.phone}/>
      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE STUDY DETAIL PAGE
// ─────────────────────────────────────────────────────────────────────────────

function CaseStudyDetailPage({ tenantSlug, slug }: { tenantSlug: string; slug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: cs, isLoading } = useGetPublicCaseStudy(tenantSlug, slug);
  const { tenant, settings } = (siteData as any) || {};
  const c = cs as any;

  return (
    <div>
      <PageSEO title={c ? `${c.title} | AMO Rendering` : "Case Study | AMO Rendering"} description={c?.tagline || "Detailed rendering project case study from AMO Rendering — see the challenge, solution and results."}/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>

      {isLoading ? <Spinner/> : c ? (
        <>
          <section style={{ backgroundColor: NAVY }} className="text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left — project info */}
                <div className="py-14 pr-0 lg:pr-12 flex flex-col justify-center space-y-5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <a href={`${siteBase}/case-studies`} className="hover:text-white transition-colors">Case Studies</a>
                    <span>/</span>
                    <span className="text-slate-300">{c.title}</span>
                  </div>
                  {c.location && (
                    <span className="self-start text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: BLUE + "30", color: "#8EC8FF" }}>
                      {c.location}
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-4xl font-bold leading-snug">{c.title}</h1>
                  {c.tagline && <p className="text-lg text-slate-300">{c.tagline}</p>}
                  <div className="flex flex-wrap gap-6 text-sm text-slate-400 pt-2 border-t border-slate-700">
                    {c.clientName && (
                      <div><span className="text-slate-500 text-xs uppercase tracking-wide block mb-0.5">Client</span>{c.clientName}</div>
                    )}
                    {c.projectDuration && (
                      <div><span className="text-slate-500 text-xs uppercase tracking-wide block mb-0.5">Duration</span>{c.projectDuration}</div>
                    )}
                    {c.location && (
                      <div><span className="text-slate-500 text-xs uppercase tracking-wide block mb-0.5">Location</span>{c.location}</div>
                    )}
                  </div>
                </div>
                {/* Right — full image, no crop */}
                {c.heroImageUrl && (
                  <div className="flex items-center lg:py-8">
                    <img
                      src={c.heroImageUrl}
                      alt={`Before and after — ${c.title}`}
                      className="w-full rounded-xl shadow-2xl"
                      style={{ maxHeight: "420px", objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <article className="lg:col-span-2 space-y-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: LIGHT_BG }}>
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BLUE }}>Project Summary</div>
                    {c.location && <span className="text-xs" style={{ color: MUTED }}>{c.location}</span>}
                    {c.projectDuration && <span className="text-xs" style={{ color: MUTED }}>Duration: {c.projectDuration}</span>}
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xl font-bold" style={{ color: TEXT }}>The Problem</h2>
                    <p className="leading-relaxed" style={{ color: MUTED }}>{c.challenge || "The property exterior looked tired and needed a more modern, cleaner finish. The existing surface affected kerb appeal and made the home look older than it needed to."}</p>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xl font-bold" style={{ color: TEXT }}>The Solution</h2>
                    <p className="leading-relaxed" style={{ color: MUTED }}>{c.solution || "AMO Rendering reviewed the exterior condition and selected a suitable rendering approach. The aim was to create a clean, consistent finish that improved the look of the property while supporting external wall protection."}</p>
                  </div>

                  {/* Before/After */}
                  {c.heroImageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                      <img
                        src={c.heroImageUrl}
                        alt={`Before and after — ${c.title}`}
                        className="w-full object-cover"
                      />
                      <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: LIGHT_BG }}>
                        <span className="rounded-md bg-slate-900/75 px-2 py-1 text-xs text-white font-semibold">Before</span>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        <span className="rounded-md px-2 py-1 text-xs text-white font-semibold" style={{ backgroundColor: BLUE }}>After</span>
                        <p className="text-xs ml-2" style={{ color: MUTED }}>The completed exterior gave the property a sharper, more modern appearance.</p>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl p-6" style={{ backgroundColor: BLUE + "10", border: `1px solid ${BLUE}30` }}>
                    <h2 className="text-xl font-bold mb-3" style={{ color: TEXT }}>Customer Outcome</h2>
                    <p className="leading-relaxed" style={{ color: TEXT }}>{c.result || "The main result was a visible exterior transformation: a cleaner frontage, improved finish and stronger kerb appeal."}</p>
                  </div>
                </article>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-4 bg-white shadow-sm">
                    <h3 className="font-bold text-lg" style={{ color: TEXT }}>Want A Similar Finish?</h3>
                    <p className="text-sm" style={{ color: MUTED }}>Request a quote and upload photos of your property.</p>
                    <BlueBtn href={`${siteBase}/quote`} className="w-full">Request Quote</BlueBtn>
                    <a href={`${siteBase}/gallery`} className="block text-sm font-semibold pt-2" style={{ color: BLUE }}>View More Transformations →</a>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-3 bg-white">
                    <h3 className="font-bold text-sm" style={{ color: TEXT }}>More Case Studies</h3>
                    <a href={`${siteBase}/case-studies`} className="block text-sm py-2 font-semibold" style={{ color: BLUE }}>← Back to all case studies</a>
                  </div>
                  <div className="rounded-2xl p-6 space-y-3 text-white" style={{ backgroundColor: NAVY }}>
                    <h3 className="font-bold">Based in Grays, Thurrock</h3>
                    <p className="text-sm text-slate-400">Free quotes available for Essex and London properties.</p>
                    <a href={`${siteBase}/contact`} className="block text-sm font-semibold" style={{ color: "#8EC8FF" }}>Contact AMO →</a>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </>
      ) : <div className="p-8 text-center" style={{ color: MUTED }}>Case study not found</div>}

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQs PAGE
// ─────────────────────────────────────────────────────────────────────────────

function FaqsPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: faqs, isLoading } = useListPublicFaqs(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};

  return (
    <div>
      <PageSEO title="Rendering FAQs | AMO Rendering — Essex & London" description="Answers to common questions about rendering, including silicone render, monocouche, K Rend, pebbledash removal and EWI."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Rendering FAQs" title="Rendering FAQs" subtitle="Common questions about silicone rendering, pebbledash removal, K Rend, EWI and quote requests."/>

      {/* FAQ intro */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-10 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {["Silicone Rendering","Pebbledash Removal","K Rend & EWI","Quote Process"].map(t => (
            <div key={t} className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-xs font-semibold" style={{ color: BLUE }}>{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {isLoading ? <Spinner/> : (
            <div className="space-y-3">
              {(faqs as any[])?.map((faq: any) => (
                <details key={faq.id} className="group rounded-xl border border-slate-200 bg-white px-6 py-5">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold" style={{ color: TEXT }}>
                    {faq.question}
                    <svg className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180" style={{ color: BLUE }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>{faq.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still have questions */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-7 space-y-4">
            <h3 className="font-bold text-lg" style={{ color: TEXT }}>Still Have Questions?</h3>
            <p className="text-sm" style={{ color: MUTED }}>Send AMO a message and we'll respond with the information you need.</p>
            <BlueBtn href={`${siteBase}/contact`}>Contact AMO</BlueBtn>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-7 space-y-4">
            <h3 className="font-bold text-lg" style={{ color: TEXT }}>Ready To Get A Quote?</h3>
            <p className="text-sm" style={{ color: MUTED }}>Upload photos of your property and tell us what exterior finish you're looking for.</p>
            <BlueBtn href={`${siteBase}/quote`}>Request A Quote</BlueBtn>
          </div>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOG LIST PAGE
// ─────────────────────────────────────────────────────────────────────────────

function BlogListPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: posts, isLoading } = useBrowsePublicBlog(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};

  return (
    <div>
      <PageSEO title="Rendering Advice & Guides | AMO Rendering Blog" description="Helpful guidance for homeowners considering silicone rendering, exterior wall finishes, pebbledash removal and property transformation across Essex and London."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Rendering Advice & Guides" title="Rendering Advice & Guides" subtitle="Helpful guidance for homeowners considering silicone rendering, exterior wall finishes, pebbledash removal and property transformation."/>

      {/* Blog posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {isLoading ? <Spinner/> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(posts as any[])?.map((post: any) => (
                <a key={post.id} href={`${siteBase}/blog/${post.slug}`} className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all bg-white">
                  {post.heroImageUrl
                    ? <img src={post.heroImageUrl} alt={post.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"/>
                    : <div className="w-full h-52 flex items-center justify-center" style={{ backgroundColor: BLUE + "08" }}><svg className="w-12 h-12 opacity-20" style={{ color: BLUE }} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg></div>
                  }
                  <div className="p-5 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BLUE }}>Rendering Guide</div>
                    <h2 className="font-bold group-hover:text-[#1F8CFF] transition-colors line-clamp-2" style={{ color: TEXT }}>{post.title}</h2>
                    {post.excerpt && <p className="text-sm line-clamp-2" style={{ color: MUTED }}>{post.excerpt}</p>}
                    <div className="flex items-center gap-3 text-xs pt-2" style={{ color: MUTED }}>
                      {post.authorName && <span>{post.authorName}</span>}
                      {post.readTime && <span>{post.readTime} min read</span>}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: BLUE }}>Read Article →</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: LIGHT_BG }} className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Ready to Get Started?</h2>
          <p style={{ color: MUTED }}>Request a free quote or upload photos of your property for a more detailed assessment.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <BlueBtn href={`${siteBase}/quote`}>Request a Free Quote</BlueBtn>
            <OutlineBtn href={`${siteBase}/visualiser`}>Render Visualiser</OutlineBtn>
          </div>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOG POST PAGE
// ─────────────────────────────────────────────────────────────────────────────

function BlogPostPage({ tenantSlug, slug }: { tenantSlug: string; slug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { data: post, isLoading } = useGetPublicBlogPost(tenantSlug, slug);
  const { tenant, settings } = (siteData as any) || {};
  const p = post as any;

  return (
    <div>
      <PageSEO title={p ? `${p.title} | AMO Rendering` : "Blog | AMO Rendering"} description={p?.excerpt || "Rendering advice and tips from AMO Rendering — specialists in silicone render, monocouche and EWI across Essex and London."}/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>

      {isLoading ? <Spinner/> : p ? (
        <>
          {p.heroImageUrl && <img src={p.heroImageUrl} alt={p.title} className="w-full h-64 object-cover"/>}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <article className="lg:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
                      <a href={`${siteBase}/blog`} className="font-semibold hover:text-[#1F8CFF]">← Blog</a>
                      <span>/</span>
                      <span className="font-semibold uppercase tracking-wide" style={{ color: BLUE }}>Rendering Guide</span>
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: TEXT }}>{p.title}</h1>
                    <div className="flex items-center gap-4 text-sm" style={{ color: MUTED }}>
                      {p.authorName && <span>By {p.authorName}</span>}
                      {p.readTime && <span>{p.readTime} min read</span>}
                      {p.publishedAt && <span>{new Date(p.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                    </div>
                    {p.excerpt && <p className="text-lg font-medium leading-relaxed border-l-4 pl-4" style={{ color: TEXT, borderColor: BLUE }}>{p.excerpt}</p>}
                  </div>
                  <div className="prose prose-slate max-w-none leading-relaxed" style={{ color: TEXT }}>{p.content}</div>
                  <div className="rounded-2xl p-8 text-center space-y-4" style={{ backgroundColor: LIGHT_BG }}>
                    <h3 className="text-xl font-bold" style={{ color: TEXT }}>Ready to transform your property?</h3>
                    <p className="text-sm" style={{ color: MUTED }}>Upload property photos for a free rendering quote from AMO.</p>
                    <BlueBtn href={`${siteBase}/quote`}>Request a Free Quote</BlueBtn>
                  </div>
                </article>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-4 bg-white shadow-sm">
                    <h3 className="font-bold" style={{ color: TEXT }}>Get A Free Quote</h3>
                    <p className="text-sm" style={{ color: MUTED }}>Upload photos of your property and tell us about the finish you want.</p>
                    <BlueBtn href={`${siteBase}/quote`} className="w-full">Request Quote</BlueBtn>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-3 bg-white">
                    <h3 className="font-bold text-sm" style={{ color: TEXT }}>Our Services</h3>
                    {STATIC_SERVICES.map(s => (
                      <a key={s.slug} href={`${siteBase}/services/${s.slug}`} className="block text-sm py-2 border-b border-slate-100 last:border-0 hover:text-[#1F8CFF] transition-colors" style={{ color: MUTED }}>{s.name}</a>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-6 space-y-3 bg-white">
                    <h3 className="font-bold text-sm" style={{ color: TEXT }}>More Guides</h3>
                    <a href={`${siteBase}/blog`} className="block text-sm font-semibold" style={{ color: BLUE }}>← Back to all guides</a>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </>
      ) : <div className="p-8 text-center" style={{ color: MUTED }}>Post not found</div>}

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE PAGE
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ["Terraced house","Semi-detached","Detached","End-of-terrace","Bungalow","Commercial property","Flat / apartment block","Other"];
const SURFACE_TYPES = ["Existing render","Pebbledash","Brick","Block","Other / not sure"];
const TIMEFRAMES = ["As soon as possible","Within 1 month","1–3 months","3–6 months","Planning stage"];

function QuotePage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};
  const mutation = useSubmitQuoteRequest();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postcode: '',
    serviceInterest: '', notes: '', propertyType: '', existingSurface: '', desiredFinish: '', timeframe: '',
    photoUrls: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);
  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [field]: e.target.value });
  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F8CFF] focus:border-[#1F8CFF] transition";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ data: { ...form, tenantSlug } } as any);
      setSubmitted(true);
    } catch {}
  };

  return (
    <div>
      <PageSEO title="Get a Free Rendering Quote | AMO Rendering — Essex & London" description="Request a free rendering quote from AMO Rendering. Upload photos of your property and we'll recommend the right render system."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Request A Rendering Quote" title="Request A Rendering Quote" subtitle="Tell us about your property and upload photos so AMO Rendering can assess the work and recommend the right render system."/>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Intro aside */}
            <aside className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-7 space-y-5 bg-white shadow-sm">
                <h2 className="text-xl font-bold" style={{ color: TEXT }}>Get A Clearer Starting Point</h2>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>The more detail you provide, the easier it is for AMO to understand your exterior walls, current surface and desired finish.</p>
                <ul className="space-y-3">
                  {["Upload front, side and rear photos","Tell us your existing surface","Select the service you are interested in","Add your postcode and timeframe"].map(b => (
                    <li key={b} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: BLUE }}><CheckIcon color="white"/></div>
                      <span className="text-sm" style={{ color: TEXT }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-7 space-y-4 text-white" style={{ backgroundColor: NAVY }}>
                <h3 className="font-bold">What Happens Next?</h3>
                <div className="space-y-3">
                  {[{ n: 1, text: "AMO reviews your photos and property details." },{ n: 2, text: "A suitable rendering option is recommended." },{ n: 3, text: "You receive a quote based on the work required." }].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: BLUE }}>{s.n}</div>
                      <p className="text-sm text-slate-300">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="text-center space-y-5 py-16">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: BLUE + "20" }}>
                    <svg className="w-8 h-8" style={{ color: BLUE }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Quote Request Received</h2>
                  <p style={{ color: MUTED }}>Thank you. We'll review your request and be in touch within 24 hours.</p>
                  <BlueBtn href={siteBase || '/'}>Back to Home</BlueBtn>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                  <h2 className="font-bold text-lg" style={{ color: TEXT }}>Your Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls} style={{ color: MUTED }}>Full name *</label><input required className={inputCls} placeholder="Full name" value={form.firstName + (form.lastName ? ' ' + form.lastName : '')} onChange={e => { const parts = e.target.value.split(' '); setForm({ ...form, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') }); }}/></div>
                    <div><label className={labelCls} style={{ color: MUTED }}>Phone number *</label><input required className={inputCls} placeholder="Phone number" value={form.phone} onChange={f('phone')}/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls} style={{ color: MUTED }}>Email address</label><input type="email" className={inputCls} placeholder="Email address" value={form.email} onChange={f('email')}/></div>
                    <div><label className={labelCls} style={{ color: MUTED }}>Postcode *</label><input required className={inputCls} placeholder="Postcode" value={form.postcode} onChange={f('postcode')}/></div>
                  </div>
                  <div><label className={labelCls} style={{ color: MUTED }}>Property address</label><input className={inputCls} placeholder="Street address" value={form.address} onChange={f('address')}/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls} style={{ color: MUTED }}>Property type</label>
                      <select className={inputCls} value={form.propertyType} onChange={f('propertyType')}>
                        <option value="">Select type...</option>
                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} style={{ color: MUTED }}>Service required</label>
                      <select className={inputCls} value={form.serviceInterest} onChange={f('serviceInterest')}>
                        <option value="">Select service...</option>
                        {["Silicone Rendering","Monocouche Rendering","K Rend","External Wall Insulation","Pebbledash Removal","Render Repairs","Not sure"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls} style={{ color: MUTED }}>Existing surface</label>
                      <select className={inputCls} value={form.existingSurface} onChange={f('existingSurface')}>
                        <option value="">Select...</option>
                        {SURFACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} style={{ color: MUTED }}>Desired finish</label>
                      <select className={inputCls} value={form.desiredFinish} onChange={f('desiredFinish')}>
                        <option value="">Select...</option>
                        {["Smooth modern finish","Textured finish","Coloured render","Insulated render","Not sure"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: MUTED }}>Preferred timeframe</label>
                    <select className={inputCls} value={form.timeframe} onChange={f('timeframe')}>
                      <option value="">Select...</option>
                      {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls} style={{ color: MUTED }}>Additional notes</label><textarea rows={3} className={inputCls} placeholder="Anything else about your property or project..." value={form.notes} onChange={f('notes')}/></div>
                  <ImageUpload
                    label="Property photos (recommended — helps us quote accurately)"
                    hint="Upload front, side or rear views · JPG or PNG · max 10MB"
                    onUploaded={url => setForm({ ...form, photoUrls: [url] })}
                  />
                  <button type="submit" disabled={mutation.isPending} className="w-full rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: BLUE }}>
                    {mutation.isPending ? 'Submitting...' : 'Submit Quote Request'}
                  </button>
                  {mutation.isError && <p className="text-sm text-red-600 text-center">Something went wrong. Please try again or call us directly.</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT PAGE
// ─────────────────────────────────────────────────────────────────────────────

function ContactPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};
  const mutation = useSubmitContact();
  const [form, setForm] = useState({ senderName: '', senderEmail: '', senderPhone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F8CFF] transition";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ data: { ...form, tenantSlug } } as any);
      setSubmitted(true);
    } catch {}
  };

  return (
    <div>
      <PageSEO title="Contact AMO Rendering | Rendering Specialists — Essex & London" description="Get in touch with AMO Rendering to discuss your property and rendering options. Based in Grays, Thurrock — serving Essex and London."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Contact AMO Rendering" title="Contact AMO Rendering" subtitle="Speak to AMO Rendering about silicone rendering, K Rend, EWI, pebbledash removal or render repairs across Essex and London."/>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Contact details */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 p-7 space-y-5 bg-white shadow-sm">
                <h2 className="text-xl font-bold" style={{ color: TEXT }}>Contact Details</h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold" style={{ color: TEXT }}>Email</p>
                    <a href="mailto:info@amorendering.co.uk" className="hover:text-[#1F8CFF] transition-colors" style={{ color: MUTED }}>info@amorendering.co.uk</a>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: TEXT }}>Direct Contact</p>
                    <a href="mailto:mark@amorendering.co.uk" className="hover:text-[#1F8CFF] transition-colors" style={{ color: MUTED }}>mark@amorendering.co.uk</a>
                  </div>
                  {settings?.phone && (
                    <div>
                      <p className="font-semibold" style={{ color: TEXT }}>Phone</p>
                      <a href={`tel:${settings.phone}`} className="hover:text-[#1F8CFF] transition-colors" style={{ color: MUTED }}>{settings.phone}</a>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: TEXT }}>Location</p>
                    <p style={{ color: MUTED }}>Based in Grays, Thurrock. Serving Essex and London.</p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: TEXT }}>Services</p>
                    <p style={{ color: MUTED }}>Silicone rendering, K Rend, monocouche, EWI, pebbledash removal and repairs.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-7 space-y-4 bg-white">
                <h3 className="font-bold" style={{ color: TEXT }}>Prefer to Send Photos?</h3>
                <p className="text-sm" style={{ color: MUTED }}>Use the quote form to upload photos of your property and we'll provide a more accurate quote.</p>
                <BlueBtn href={`${siteBase}/quote`}>Request a Photo Quote</BlueBtn>
              </div>

              <div className="rounded-2xl p-7 space-y-4 text-white" style={{ backgroundColor: NAVY }}>
                <h3 className="font-bold">Areas We Cover</h3>
                <div className="flex flex-wrap gap-2">
                  {["Grays","Thurrock","Essex","London","Basildon","Romford"].map(a => (
                    <span key={a} className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300">{a}</span>
                  ))}
                </div>
                <a href={`${siteBase}/areas`} className="block text-sm font-semibold" style={{ color: "#8EC8FF" }}>View All Areas →</a>
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="text-center space-y-4 py-12">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: BLUE + "20" }}>
                    <svg className="w-6 h-6" style={{ color: BLUE }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: TEXT }}>Message Sent</h3>
                  <p className="text-sm" style={{ color: MUTED }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                  <h3 className="font-bold text-lg" style={{ color: TEXT }}>Send A Message</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Name *</label><input required className={inputCls} placeholder="Name" value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })}/></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Phone</label><input className={inputCls} placeholder="Phone" value={form.senderPhone} onChange={e => setForm({ ...form, senderPhone: e.target.value })}/></div>
                  </div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Email</label><input type="email" className={inputCls} placeholder="Email" value={form.senderEmail} onChange={e => setForm({ ...form, senderEmail: e.target.value })}/></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Reason for enquiry</label>
                    <select className={inputCls} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                      <option value="">Select...</option>
                      {["Quote request","Service question","Existing project","General enquiry"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Message *</label><textarea required rows={5} className={inputCls} placeholder="How can AMO help?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}/></div>
                  <button type="submit" disabled={mutation.isPending} className="w-full rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: BLUE }}>
                    {mutation.isPending ? 'Sending...' : 'Send Message'}
                  </button>
                  {mutation.isError && <p className="text-sm text-red-600 text-center">Something went wrong. Please try again or call us directly.</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VISUALISER PAGE
// ─────────────────────────────────────────────────────────────────────────────

function VisualiserPage({ tenantSlug }: { tenantSlug: string }) {
  const siteBase = useSiteBase();
  const { data: siteData } = useGetPublicSite(tenantSlug);
  const { tenant, settings } = (siteData as any) || {};
  const mutation = useCreateVisualiserRequest();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', colourPreference: '', notes: '', photoUrls: [] as string[] });
  const [submitted, setSubmitted] = useState(false);
  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F8CFF] transition";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ data: { ...form, tenantSlug } } as any);
      setSubmitted(true);
    } catch {}
  };

  return (
    <div>
      <PageSEO title="Render Visualiser | AMO Rendering — See Your Property Transformed" description="Upload a photo of your property and AMO Rendering will show you what new render could look like. Free visualisation service — Essex and London."/>
      <TopBar/>
      <SiteNav tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <PageHero tenantSlug={tenantSlug} crumb="Render Visualiser Request" title="Render Visualiser Request" subtitle="Upload your property photos, choose a render finish and tell AMO what exterior look you want to achieve."/>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Colour/finish panel */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 p-7 space-y-6 bg-white shadow-sm">
                <h2 className="text-xl font-bold" style={{ color: TEXT }}>Choose Your Finish Direction</h2>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>This service helps AMO understand your preferred style. Upload photos and choose a finish and colour direction.</p>

                <div>
                  <h3 className="font-bold text-sm mb-3" style={{ color: TEXT }}>Popular colour directions</h3>
                  <div className="flex gap-3">
                    {[
                      { name: "White", hex: "#F5F5F0", border: "#D1D5DB" },
                      { name: "Light Grey", hex: "#D4D4D4", border: "#9CA3AF" },
                      { name: "Cream", hex: "#FEF3C7", border: "#D97706" },
                      { name: "Sand", hex: "#E8D5B0", border: "#92400E" },
                    ].map(c => (
                      <div key={c.name} className="text-center space-y-1">
                        <div className="w-12 h-12 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c.hex, borderColor: c.border }}/>
                        <p className="text-xs" style={{ color: MUTED }}>{c.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-3" style={{ color: TEXT }}>Finish types</h3>
                  <ul className="space-y-2">
                    {["Smooth silicone render","Textured K Rend style","Coloured monocouche render","Insulated render finish"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: BLUE }}/>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl p-7 space-y-4 text-white" style={{ backgroundColor: NAVY }}>
                <h3 className="font-bold">How The Visualiser Works</h3>
                <div className="space-y-3">
                  {[{ n: 1, text: "Upload a clear photo of your property's exterior." },{ n: 2, text: "Choose a render finish and colour direction." },{ n: 3, text: "AMO applies the chosen finish digitally to your photo." },{ n: 4, text: "You receive a visualisation to help decide." }].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: BLUE }}>{s.n}</div>
                      <p className="text-sm text-slate-300">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="text-center space-y-5 py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: BLUE + "20" }}>
                    <svg className="w-8 h-8" style={{ color: BLUE }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: TEXT }}>Request Received</h2>
                  <p style={{ color: MUTED }}>We'll create a visualisation of your property and send it to you within 48 hours.</p>
                  <BlueBtn href={siteBase || '/'}>Back to Home</BlueBtn>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                  <h3 className="font-bold text-lg" style={{ color: TEXT }}>Submit Visualiser Request</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>First name *</label><input required className={inputCls} placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}/></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Last name *</label><input required className={inputCls} placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}/></div>
                  </div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Email *</label><input required type="email" className={inputCls} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Phone</label><input className={inputCls} placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Property address</label><input className={inputCls} placeholder="Property address or postcode" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Preferred colour direction</label>
                    <select className={inputCls} value={form.colourPreference} onChange={e => setForm({ ...form, colourPreference: e.target.value })}>
                      <option value="">Select...</option>
                      {["White / off-white","Light grey","Cream / sand","Dark grey","Not sure — open to suggestions"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <ImageUpload
                    label="Property photo (strongly recommended)"
                    hint="Upload a clear front view of your property · JPG or PNG · max 10MB"
                    onUploaded={url => setForm({ ...form, photoUrls: [url] })}
                  />
                  <div><label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Describe the look you want</label><textarea rows={3} className={inputCls} placeholder="Tell us what exterior look you want to achieve..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}/></div>
                  <button type="submit" disabled={mutation.isPending} className="w-full rounded-lg py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: BLUE }}>
                    {mutation.isPending ? 'Submitting...' : 'Submit Visualiser Request'}
                  </button>
                  {mutation.isError && <p className="text-sm text-red-600 text-center">Something went wrong. Please try again or call us directly.</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter tenant={tenant} settings={settings} tenantSlug={tenantSlug}/>
      <MobileBar tenantSlug={tenantSlug} phone={settings?.phone}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────────

export default function PublicSiteApp({ forcedSlug, forcedBase }: { forcedSlug?: string; forcedBase?: string } = {}) {
  const params = useParams<{ tenantSlug: string }>();
  const tenantSlug = forcedSlug || params.tenantSlug || '';
  const siteBase = forcedBase !== undefined ? forcedBase : `/site/${tenantSlug}`;
  return (
    <SiteBaseCtx.Provider value={siteBase}>
    <WouterRouter base={siteBase}>
      <Switch>
        <Route path="/" component={() => <HomePage tenantSlug={tenantSlug}/>}/>
        <Route path="/services" component={() => <ServicesPage tenantSlug={tenantSlug}/>}/>
        <Route path="/services/:slug" component={({ params: p }) => <ServiceDetailPage tenantSlug={tenantSlug} slug={p.slug}/>}/>
        <Route path="/areas" component={() => <AreasPage tenantSlug={tenantSlug}/>}/>
        <Route path="/areas/:slug" component={({ params: p }) => <AreaDetailPage tenantSlug={tenantSlug} slug={p.slug}/>}/>
        <Route path="/gallery" component={() => <GalleryPage tenantSlug={tenantSlug}/>}/>
        <Route path="/case-studies" component={() => <CaseStudiesPage tenantSlug={tenantSlug}/>}/>
        <Route path="/case-studies/:slug" component={({ params: p }) => <CaseStudyDetailPage tenantSlug={tenantSlug} slug={p.slug}/>}/>
        <Route path="/reviews" component={() => <ReviewsPage tenantSlug={tenantSlug}/>}/>
        <Route path="/faqs" component={() => <FaqsPage tenantSlug={tenantSlug}/>}/>
        <Route path="/blog" component={() => <BlogListPage tenantSlug={tenantSlug}/>}/>
        <Route path="/blog/:slug" component={({ params: p }) => <BlogPostPage tenantSlug={tenantSlug} slug={p.slug}/>}/>
        <Route path="/quote" component={() => <QuotePage tenantSlug={tenantSlug}/>}/>
        <Route path="/contact" component={() => <ContactPage tenantSlug={tenantSlug}/>}/>
        <Route path="/visualiser" component={() => <VisualiserPage tenantSlug={tenantSlug}/>}/>
        <Route component={() => <HomePage tenantSlug={tenantSlug}/>}/>
      </Switch>
    </WouterRouter>
    </SiteBaseCtx.Provider>
  );
}
