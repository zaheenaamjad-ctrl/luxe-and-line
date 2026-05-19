import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Chatbot } from "@/components/Chatbot";
import { ScrollToTop } from "@/components/ScrollToTop";

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

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
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
          <Route path="/admin" component={Admin} />
          <Route path="/admin/dashboard" component={Admin} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
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
