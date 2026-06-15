import { useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useAuth, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe, setAuthTokenGetter, getGetMeQueryKey, useResolveTenantDomain } from "@workspace/api-client-react";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL || undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#1F8CFF",
    colorBackground: "#0F1923",
    colorInputBackground: "#1A2535",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#94a3b8",
    colorNeutral: "#ffffff",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "bg-[#0F1923] border border-white/10 shadow-2xl",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-slate-400",
    formButtonPrimary: "bg-[#1F8CFF] hover:bg-[#1a7ae6] text-white font-semibold",
    formFieldInput: "bg-[#1A2535] border-white/10 text-white placeholder:text-slate-500 focus:border-[#1F8CFF]",
    formFieldLabel: "text-slate-300 font-medium",
    dividerLine: "bg-white/10",
    dividerText: "text-slate-500",
    socialButtonsBlockButton: "bg-[#1A2535] border-white/10 text-white hover:bg-[#243048]",
    socialButtonsBlockButtonText: "text-white",
    footerActionText: "text-slate-400",
    footerActionLink: "text-[#1F8CFF] hover:text-[#60afff]",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-[#1F8CFF]",
  },
};

function AuthTokenSetup() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const uid = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== uid) qc.clear();
      prevRef.current = uid;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex bg-[#0A121C]">
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-gradient-to-br from-[#0A121C] via-[#0d1a2e] to-[#0A121C] border-r border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1F8CFF]/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1F8CFF]/5 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-[#1F8CFF] flex items-center justify-center font-bold text-white text-sm">L</div>
            <span className="text-white font-bold text-xl tracking-tight">LaunchFlow</span>
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#1F8CFF]/10 border border-[#1F8CFF]/20 rounded-full px-4 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1F8CFF]" />
              <span className="text-[#1F8CFF] text-xs font-semibold tracking-wider uppercase">Home Improvement Platform</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              The operating system for trades businesses
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Websites, CRM, quoting, project management, and customer portals — everything under your brand.
            </p>
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: "🌐", label: "Professional public website", desc: "Full marketing site with services, gallery & lead capture" },
            { icon: "📋", label: "CRM & quote management", desc: "Convert leads to signed quotes in minutes" },
            { icon: "👤", label: "Customer portal", desc: "Self-service portal for project tracking & communication" },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <div className="text-white font-semibold text-sm">{f.label}</div>
                <div className="text-slate-500 text-xs mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#0A121C]">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#1F8CFF] flex items-center justify-center font-bold text-white text-xs">L</div>
          <span className="text-white font-bold text-lg tracking-tight">LaunchFlow</span>
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} LaunchFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthLayout>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthLayout>
  );
}

function RoleRouter() {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const { data: user, isLoading, isError } = useGetMe();
  const [syncing, setSyncing] = useState(false);
  const syncAttempted = useRef(false);

  useEffect(() => {
    if (!isError || syncing || syncAttempted.current || !clerkUser) return;
    syncAttempted.current = true;
    setSyncing(true);
    (async () => {
      try {
        const token = await getToken();
        await fetch("/api/auth/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
            firstName: clerkUser.firstName ?? undefined,
            lastName: clerkUser.lastName ?? undefined,
          }),
        });
        await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      } catch {
        // sync failed silently
      } finally {
        setSyncing(false);
      }
    })();
  }, [isError, syncing, clerkUser, getToken, qc]);

  if (isLoading || syncing) return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Setting up your account…</div>;
  if (!user) return <Redirect to="/portal" />;
  if (user.role === 'SUPER_ADMIN') return <Redirect to="/admin" />;
  if (user.role === 'TENANT_ADMIN' || user.role === 'STAFF') return <Redirect to="/dashboard" />;
  return <Redirect to="/portal" />;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><RoleRouter /></Show>
      <Show when="signed-out"><LandingPage /></Show>
    </>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="font-bold text-xl tracking-tight">LaunchFlow</div>
        <div className="flex items-center gap-3">
          <a href={`${basePath}/sign-in`} className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</a>
          <a href={`${basePath}/sign-up`} className="inline-flex h-9 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-medium text-white shadow hover:bg-orange-400 transition-colors">Get started</a>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-8">
        <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-400 font-medium">
          Built for home improvement professionals
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          The operating system<br />for home improvement<br />businesses
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Websites, CRM, quotes, projects, customer portal — everything a modern trades business needs, white-labelled and ready to go.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href={`${basePath}/sign-up`} className="inline-flex h-12 items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-semibold text-white shadow-lg hover:bg-orange-400 transition-colors">
            Start free trial
          </a>
          <a href={`${basePath}/site/amo-rendering`} className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-transparent px-8 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
            View demo site
          </a>
        </div>
        <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          {[
            { title: "Public Website", desc: "Professional tenant websites with services, gallery, blog, and lead capture — all managed from your dashboard." },
            { title: "CRM & Operations", desc: "Leads, quotes, projects, and customers in one place. Convert enquiries to invoices in seconds." },
            { title: "Customer Portal", desc: "Give your customers a self-service portal to track their project, view quotes, and send messages." },
          ].map(f => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lazy-loaded zone components
import { lazy, Suspense } from "react";
const DashboardApp = lazy(() => import("@/zones/dashboard/DashboardApp"));
const PortalApp = lazy(() => import("@/zones/portal/PortalApp"));
const AdminApp = lazy(() => import("@/zones/admin/AdminApp"));
const PublicSiteApp = lazy(() => import("@/zones/public/PublicSiteApp"));

function ZoneLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <img src="/amo-logo-icon.png" alt="Loading" className="w-16 h-16 object-contain" />
        <svg className="absolute inset-0 w-24 h-24 animate-spin" viewBox="0 0 96 96" fill="none">
          <circle cx="48" cy="48" r="44" stroke="#1F8CFF" strokeWidth="4" strokeLinecap="round" strokeDasharray="69 207"/>
        </svg>
      </div>
    </div>
  );
}

function DomainRouteGuard({ children }: { children: React.ReactNode }) {
  const hostname = window.location.hostname;
  const isKnownHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('.repl') ||
    hostname.includes('.replit');

  const { data, isLoading, isError } = useResolveTenantDomain(
    { host: hostname },
    { query: { enabled: !isKnownHost, retry: false, staleTime: Infinity, gcTime: Infinity } as any }
  );

  if (!isKnownHost && isLoading) return <ZoneLoader />;

  const slug = (data as any)?.slug;
  if (!isKnownHost && !isError && slug) {
    return (
      <Suspense fallback={<ZoneLoader />}>
        <PublicSiteApp forcedSlug={slug} forcedBase="" />
      </Suspense>
    );
  }

  return <>{children}</>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <AuthTokenSetup />
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <DomainRouteGuard>
            <Suspense fallback={<ZoneLoader />}>
              <Switch>
                <Route path="/" component={HomeRedirect} />
                <Route path="/sign-in/*?" component={SignInPage} />
                <Route path="/sign-up/*?" component={SignUpPage} />
                <Route path="/dashboard/*?" component={DashboardApp} />
                <Route path="/portal/*?" component={PortalApp} />
                <Route path="/admin/*?" component={AdminApp} />
                <Route path="/site/:tenantSlug/*?" component={(_p: any) => <PublicSiteApp />} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </DomainRouteGuard>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
      <Toaster />
    </WouterRouter>
  );
}

export default App;
