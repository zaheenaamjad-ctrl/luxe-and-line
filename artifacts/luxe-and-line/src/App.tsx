import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { getAuthUser } from "@/lib/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Chatbot } from "@/components/Chatbot";
import { ScrollToTop } from "@/components/ScrollToTop";
import { setBaseUrl } from "@workspace/api-client-react";

// When VITE_API_BASE_URL is set (e.g. on Vercel pointing to the deployed API
// server), all API calls become absolute so they reach the correct backend.
// Falls back to relative /api/* paths when running on Replit (reverse-proxied).
const _apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (_apiBase) setBaseUrl(_apiBase);

// Lazy-load all pages so each route gets its own chunk
const Home = lazy(() => import("@/pages/Home").then((m) => ({ default: m.Home })));
const Shop = lazy(() => import("@/pages/Shop").then((m) => ({ default: m.Shop })));
const ProductDetail = lazy(() => import("@/pages/ProductDetail").then((m) => ({ default: m.ProductDetail })));
const Cart = lazy(() => import("@/pages/Cart").then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import("@/pages/Checkout").then((m) => ({ default: m.Checkout })));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation").then((m) => ({ default: m.OrderConfirmation })));
const About = lazy(() => import("@/pages/About").then((m) => ({ default: m.About })));
const Contact = lazy(() => import("@/pages/Contact").then((m) => ({ default: m.Contact })));
const Policy = lazy(() => import("@/pages/Policy").then((m) => ({ default: m.Policy })));
const Terms = lazy(() => import("@/pages/Terms").then((m) => ({ default: m.Terms })));
const Admin = lazy(() => import("@/pages/Admin").then((m) => ({ default: m.Admin })));
const Login = lazy(() => import("@/pages/Login").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("@/pages/Register").then((m) => ({ default: m.Register })));
const Reviews = lazy(() => import("@/pages/Reviews").then((m) => ({ default: m.Reviews })));
const NotFound = lazy(() => import("@/pages/not-found"));

// Blog pages
const HowToStyleStitchedSuits = lazy(() => import("@/pages/blog/HowToStyleStitchedSuits").then((m) => ({ default: m.HowToStyleStitchedSuits })));
const BestLevisJeansWomenUK = lazy(() => import("@/pages/blog/BestLevisJeansWomenUK").then((m) => ({ default: m.BestLevisJeansWomenUK })));
const LuxuryFashionGiftsUK = lazy(() => import("@/pages/blog/LuxuryFashionGiftsUK").then((m) => ({ default: m.LuxuryFashionGiftsUK })));
const KunafaChocolatesUK = lazy(() => import("@/pages/blog/KunafaChocolatesUK").then((m) => ({ default: m.KunafaChocolatesUK })));

// Location pages
const StitchedSuitsLondon = lazy(() => import("@/pages/locations/StitchedSuitsLondon").then((m) => ({ default: m.StitchedSuitsLondon })));
const LuxuryFashionManchester = lazy(() => import("@/pages/locations/LuxuryFashionManchester").then((m) => ({ default: m.LuxuryFashionManchester })));
const DesignerSuitsBirmingham = lazy(() => import("@/pages/locations/DesignerSuitsBirmingham").then((m) => ({ default: m.DesignerSuitsBirmingham })));
const BuySuitsOnlineLeeds = lazy(() => import("@/pages/locations/BuySuitsOnlineLeeds").then((m) => ({ default: m.BuySuitsOnlineLeeds })));
const StitchedSuitsUK = lazy(() => import("@/pages/locations/StitchedSuitsUK").then((m) => ({ default: m.StitchedSuitsUK })));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

const ADMIN_EMAILS = new Set(["syedimad348@gmail.com", "zaheenaamjad@gmail.com"]);

function AdminGuard({ component: Component }: { component: React.ComponentType }) {
  const hasAdminToken = !!localStorage.getItem("luxe_admin_token");
  const user = getAuthUser();
  const isAdmin = hasAdminToken || (user !== null && ADMIN_EMAILS.has(user.email));
  if (!isAdmin) return <Redirect to="/" />;
  return <Component />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 15,        // 15 minutes
    },
  },
});

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-confirmation/:id" component={OrderConfirmation} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/policy" component={Policy} />
          <Route path="/terms" component={Terms} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/admin">
            {() => <AdminGuard component={Admin} />}
          </Route>
          <Route path="/admin/dashboard">
            {() => <AdminGuard component={Admin} />}
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          {/* Blog pages */}
          <Route path="/blog/how-to-style-stitched-suits-uk-2026" component={HowToStyleStitchedSuits} />
          <Route path="/blog/best-levis-jeans-women-uk" component={BestLevisJeansWomenUK} />
          <Route path="/blog/luxury-fashion-gifts-uk" component={LuxuryFashionGiftsUK} />
          <Route path="/blog/kunafa-chocolates-uk-gift-guide" component={KunafaChocolatesUK} />
          {/* Location pages */}
          <Route path="/stitched-suits-london" component={StitchedSuitsLondon} />
          <Route path="/luxury-fashion-manchester" component={LuxuryFashionManchester} />
          <Route path="/designer-suits-birmingham" component={DesignerSuitsBirmingham} />
          <Route path="/buy-suits-online-leeds" component={BuySuitsOnlineLeeds} />
          <Route path="/stitched-suits-uk" component={StitchedSuitsUK} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
          <Chatbot />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
