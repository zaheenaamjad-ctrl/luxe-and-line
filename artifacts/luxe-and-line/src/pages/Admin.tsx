import { useState, useEffect, useCallback } from "react";
import {
  LogOut, Package, TrendingUp, ShoppingBag, Clock, CheckCircle, XCircle,
  Users, Star, BarChart2, Pencil, Trash2, Plus, ChevronDown, ChevronUp,
  Mail, ToggleLeft, ToggleRight, RefreshCw, AlertTriangle,
} from "lucide-react";

const ADMIN_EMAILS = ["syedimad348@gmail.com", "zaheenaamjad@gmail.com"];
const ADMIN_TOKEN = "luxe_admin_secret_token_2024";

type AdminTab = "overview" | "orders" | "customers" | "products" | "reviews";

interface DashboardData {
  totalOrders: number; pendingOrders: number; dispatchedOrders: number;
  deliveredOrders: number; cancelledOrders: number; totalRevenue: number;
  revenueThisMonth: number; revenueLastMonth: number; ordersThisWeek: number;
  totalUsers: number; totalReviews: number; totalProducts: number;
  recentOrders: OrderRow[]; ordersByStatus: Record<string, number>;
}
interface OrderRow {
  id: number; customerName: string; customerEmail: string; customerPhone: string;
  address: string; city?: string | null; postCode?: string | null; notes?: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number; status: string; paymentStatus: string; paymentMethod: string; createdAt: string;
}
interface CustomerRow {
  id: number; name: string; email: string; createdAt: string;
  orderCount: number; totalSpent: number;
}
interface ProductRow {
  id: number; name: string; category: string; price: number; description: string;
  images: string[]; sizes: string[]; colors: string[];
  inStock: boolean; featured: boolean; deliveryIncluded: boolean;
}
interface ReviewRow {
  id: number; customerName: string; customerEmail: string | null; rating: number;
  title: string | null; body: string; approved: boolean; createdAt: string; productId: number | null;
}
interface AnalyticsData {
  dailyStats: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; count: number; revenue: number }[];
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  { value: "processing", label: "Processing", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  { value: "shipped", label: "Dispatched", color: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  { value: "delivered", label: "Delivered", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  { value: "cancelled", label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/30" },
];

const EMAIL_STATUSES = new Set(["processing", "shipped", "out_for_delivery", "delivered", "cancelled"]);

const CATEGORIES = ["shalwar-kameez", "jeans", "wallets", "food"];

function statusLabel(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status);
  const color = opt?.color ?? (
    status === "verified" ? "text-green-400 bg-green-400/10 border-green-400/30" :
    status === "failed" ? "text-red-400 bg-red-400/10 border-red-400/30" :
    status === "approved" ? "text-green-400 bg-green-400/10 border-green-400/30" :
    status === "hidden" ? "text-muted-foreground bg-muted/20 border-border" :
    "text-muted-foreground bg-muted/20 border-border"
  );
  const label = opt?.label ?? status;
  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border font-body whitespace-nowrap ${color}`}>
      {label}
    </span>
  );
}

function adminFetch(path: string, options: RequestInit = {}) {
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...(options.headers ?? {}),
    },
  });
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />;
}

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setError("Access denied. This portal is restricted.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json() as { success: boolean; token: string };
      if (result.success) {
        localStorage.setItem("luxe_admin_token", result.token);
        onLogin(result.token);
      } else {
        setError("Incorrect email or password.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-3">Restricted Access</p>
          <h1 className="font-serif text-4xl text-foreground mb-2">Admin Portal</h1>
          <div className="luxury-divider w-24 mx-auto" />
        </div>
        <div className="bg-card border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">Admin Email</label>
              <input
                type="email"
                data-testid="input-admin-email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Enter admin email"
                required
                className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter password"
                required
                className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            {error && <p className="text-destructive text-xs font-body">{error}</p>}
            <button
              type="submit"
              data-testid="button-admin-login"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ token }: { token: string }) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setFetchError("");
    Promise.all([
      adminFetch("/api/admin/dashboard").then((r) => {
        if (!r.ok) throw new Error(`Dashboard ${r.status}`);
        return r.json();
      }),
      adminFetch("/api/admin/analytics").then((r) => {
        if (!r.ok) throw new Error(`Analytics ${r.status}`);
        return r.json();
      }),
    ]).then(([d, a]: [DashboardData, AnalyticsData]) => {
      setDashboard(d); setAnalytics(a);
    }).catch((err: unknown) => {
      setFetchError(`Failed to load dashboard: ${err instanceof Error ? err.message : "network error"}. Check your connection and try again.`);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="py-20 text-center"><Spinner /></div>;
  if (fetchError) return (
    <div className="py-20 text-center space-y-4">
      <p className="text-red-400 font-body text-sm">{fetchError}</p>
      <button onClick={load} className="px-4 py-2 border border-border text-xs font-body text-muted-foreground hover:text-foreground transition-colors">Retry</button>
    </div>
  );
  if (!dashboard) return null;

  const statCards = [
    { label: "Total Orders", value: dashboard.totalOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Pending", value: dashboard.pendingOrders, icon: Clock, color: "text-yellow-400" },
    { label: "Dispatched", value: dashboard.dispatchedOrders, icon: Package, color: "text-purple-400" },
    { label: "Delivered", value: dashboard.deliveredOrders, icon: CheckCircle, color: "text-green-400" },
    { label: "Revenue (All)", value: `£${dashboard.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
    { label: "Customers", value: dashboard.totalUsers, icon: Users, color: "text-blue-400" },
  ];

  const last14 = analytics?.dailyStats.slice(-14) ?? [];
  const maxRev = Math.max(...last14.map((s) => s.revenue), 1);
  const maxOrders = Math.max(...last14.map((s) => s.orders), 1);

  const statusTotal = Object.values(dashboard.ordersByStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border p-5">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[9px] uppercase tracking-widest font-body text-muted-foreground leading-tight">{label}</p>
              <Icon size={14} className={color} />
            </div>
            <p className={`font-serif text-xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue this month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6">
          <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-4">Revenue — This Month</p>
          <p className="font-serif text-3xl text-primary mb-1">£{dashboard.revenueThisMonth.toFixed(2)}</p>
          {dashboard.revenueLastMonth > 0 && (
            <p className="text-xs font-body text-muted-foreground">
              vs £{dashboard.revenueLastMonth.toFixed(2)} last month
              {" "}
              <span className={dashboard.revenueThisMonth >= dashboard.revenueLastMonth ? "text-green-400" : "text-red-400"}>
                ({dashboard.revenueThisMonth >= dashboard.revenueLastMonth ? "+" : ""}
                {(((dashboard.revenueThisMonth - dashboard.revenueLastMonth) / dashboard.revenueLastMonth) * 100).toFixed(0)}%)
              </span>
            </p>
          )}
          <p className="text-xs font-body text-muted-foreground mt-1">{dashboard.ordersThisWeek} orders this week</p>

          {/* Mini bar chart — last 14 days revenue */}
          {last14.length > 0 && (
            <div className="mt-6">
              <p className="text-[9px] uppercase tracking-widest font-body text-muted-foreground mb-3">Daily Revenue (last 14 days)</p>
              <div className="flex items-end gap-1 h-16">
                {last14.map((s) => {
                  const pct = (s.revenue / maxRev) * 100;
                  return (
                    <div key={s.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full rounded-sm transition-all duration-300"
                        style={{
                          height: `${Math.max(pct, 2)}%`,
                          background: s.revenue > 0 ? "hsl(270,80%,65%)" : "hsl(var(--muted))",
                          opacity: s.revenue > 0 ? 0.8 : 0.3,
                        }}
                      />
                      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-card border border-border px-2 py-1 text-[10px] font-body text-foreground whitespace-nowrap z-10">
                        {s.date.slice(5)}: £{s.revenue.toFixed(0)} · {s.orders}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-border p-6">
          <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-4">Orders by Status</p>
          <div className="space-y-3">
            {STATUS_OPTIONS.map(({ value, label, color }) => {
              const count = dashboard.ordersByStatus[value] ?? 0;
              const pct = Math.round((count / statusTotal) * 100);
              return (
                <div key={value}>
                  <div className="flex justify-between text-[10px] font-body mb-1">
                    <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
                    <span className="text-foreground">{count} <span className="text-muted-foreground/50">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: color.includes("yellow") ? "#facc15" : color.includes("blue") ? "#60a5fa" :
                          color.includes("purple") ? "#c084fc" : color.includes("orange") ? "#fb923c" :
                          color.includes("green") ? "#4ade80" : "#f87171",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {analytics && analytics.topProducts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-3">Top Products</p>
              <div className="space-y-2">
                {analytics.topProducts.map((p) => (
                  <div key={p.name} className="flex justify-between text-xs font-body">
                    <span className="text-foreground truncate max-w-[60%]">{p.name}</span>
                    <span className="text-muted-foreground">{p.count} sold · £{p.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily orders chart */}
      {last14.length > 0 && (
        <div className="bg-card border border-border p-6">
          <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-4">Daily Orders (last 14 days)</p>
          <div className="flex items-end gap-1.5 h-20">
            {last14.map((s) => {
              const pct = (s.orders / maxOrders) * 100;
              return (
                <div key={s.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-sm transition-all duration-300"
                    style={{
                      height: `${Math.max(pct, 3)}%`,
                      background: s.orders > 0 ? "hsl(43,65%,50%)" : "hsl(var(--muted))",
                      opacity: s.orders > 0 ? 0.85 : 0.3,
                    }}
                  />
                  <span className="text-[9px] font-body text-muted-foreground/50">{s.date.slice(8)}</span>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-card border border-border px-2 py-1 text-[10px] font-body text-foreground whitespace-nowrap z-10">
                    {s.date.slice(5)}: {s.orders} orders
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-card border border-border">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-serif text-lg text-foreground">Recent Orders</h2>
          <button onClick={load} className="text-muted-foreground hover:text-foreground transition-colors"><RefreshCw size={14} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Payment</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentOrders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-6 py-3 font-body text-xs text-primary">#{o.id}</td>
                  <td className="px-6 py-3">
                    <p className="font-body text-sm text-foreground">{o.customerName}</p>
                    <p className="font-body text-xs text-muted-foreground">{o.customerEmail}</p>
                  </td>
                  <td className="px-6 py-3 font-serif text-sm text-primary">£{o.total.toFixed(2)}</td>
                  <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-6 py-3"><StatusBadge status={o.paymentStatus} /></td>
                  <td className="px-6 py-3 font-body text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ token }: { token: string }) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [emailSentFor, setEmailSentFor] = useState<Set<number>>(new Set());
  const [updating, setUpdating] = useState<Set<number>>(new Set());

  const load = useCallback(() => {
    setLoading(true);
    setFetchError("");
    adminFetch("/api/orders")
      .then((r) => { if (!r.ok) throw new Error(`Orders ${r.status}`); return r.json(); })
      .then((data: OrderRow[]) => setOrders(data))
      .catch((err: unknown) => {
        setFetchError(`Failed to load orders: ${err instanceof Error ? err.message : "network error"}.`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = async (orderId: number, status: string, paymentStatus?: string) => {
    setUpdating((s) => new Set([...s, orderId]));
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus: paymentStatus ?? null }),
      });
      if (res.ok) {
        const updated = await res.json() as OrderRow;
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updated } : o));
        if (EMAIL_STATUSES.has(status)) {
          setEmailSentFor((s) => new Set([...s, orderId]));
          setTimeout(() => setEmailSentFor((s) => { const n = new Set(s); n.delete(orderId); return n; }), 4000);
        }
      }
    } catch { /* ignore */ } finally {
      setUpdating((s) => { const n = new Set(s); n.delete(orderId); return n; });
    }
  };

  const updatePayment = async (orderId: number, paymentStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    await updateStatus(orderId, order.status, paymentStatus);
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-body border transition-colors ${filterStatus === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map(({ value, label }) => {
          const count = orders.filter((o) => o.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-body border transition-colors ${filterStatus === value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {label} ({count})
            </button>
          );
        })}
        <button onClick={load} className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1.5"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Spinner /></div>
      ) : fetchError ? (
        <div className="py-20 text-center space-y-4">
          <p className="text-red-400 font-body text-sm">{fetchError}</p>
          <button onClick={load} className="px-4 py-2 border border-border text-xs font-body text-muted-foreground hover:text-foreground transition-colors">Retry</button>
        </div>
      ) : (
        <div className="bg-card border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                  <th className="px-4 py-3 text-left w-8"></th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-testid={`row-order-${order.id}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedRow === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-primary">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-body text-sm text-foreground">{order.customerName}</p>
                        <p className="font-body text-xs text-muted-foreground">{order.customerEmail}</p>
                        <p className="font-body text-xs text-muted-foreground">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 font-serif text-sm text-primary">£{order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={order.status} />
                          {emailSentFor.has(order.id) && (
                            <span className="flex items-center gap-1 text-[9px] font-body text-green-400 border border-green-400/30 px-1.5 py-0.5">
                              <Mail size={9} /> Email sent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <div className="flex gap-1.5">
                            <select
                              data-testid={`select-status-${order.id}`}
                              value={selectedStatus[order.id] ?? order.status}
                              onChange={(e) => setSelectedStatus((s) => ({ ...s, [order.id]: e.target.value }))}
                              className="bg-background border border-border text-[11px] font-body text-foreground px-2 py-1 focus:border-primary focus:outline-none flex-1"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              data-testid={`button-update-status-${order.id}`}
                              onClick={() => updateStatus(order.id, selectedStatus[order.id] ?? order.status)}
                              disabled={updating.has(order.id)}
                              className="bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-wider font-body hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                            >
                              {updating.has(order.id) ? "..." : "Update"}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <button
                              data-testid={`button-verify-payment-${order.id}`}
                              onClick={() => updatePayment(order.id, "verified")}
                              disabled={order.paymentStatus === "verified"}
                              className="flex items-center gap-1 text-[10px] font-body text-green-400 hover:text-green-300 border border-green-400/30 px-2 py-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <CheckCircle size={9} /> Verify Payment
                            </button>
                            <button
                              data-testid={`button-fail-payment-${order.id}`}
                              onClick={() => updatePayment(order.id, "failed")}
                              disabled={order.paymentStatus === "failed"}
                              className="flex items-center gap-1 text-[10px] font-body text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <XCircle size={9} /> Failed
                            </button>
                          </div>
                          {EMAIL_STATUSES.has(selectedStatus[order.id] ?? order.status) && (
                            <p className="text-[9px] font-body text-muted-foreground/60 flex items-center gap-1">
                              <Mail size={8} /> Customer will be emailed on update
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRow === order.id && (
                      <tr key={`${order.id}-expand`} className="border-b border-border/50 bg-muted/10">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-2">Items Ordered</p>
                              <div className="space-y-1.5">
                                {(order.items ?? []).map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm font-body">
                                    <span className="text-foreground">{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                                    <span className="text-primary">£{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-sm font-body pt-2 border-t border-border/50 font-semibold">
                                  <span className="text-foreground">Total</span>
                                  <span className="text-primary">£{order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-2">Delivery Details</p>
                              <p className="text-sm font-body text-foreground">{order.customerName}</p>
                              <p className="text-xs font-body text-muted-foreground">{order.address}</p>
                              {order.city && <p className="text-xs font-body text-muted-foreground">{order.city}</p>}
                              {order.postCode && <p className="text-xs font-body text-muted-foreground">{order.postCode}</p>}
                              <p className="text-xs font-body text-muted-foreground mt-2">Payment: {order.paymentMethod}</p>
                              {order.notes && <p className="text-xs font-body text-muted-foreground mt-1 italic">Note: {order.notes}</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground font-body text-sm">
                      No orders {filterStatus !== "all" ? `with status "${statusLabel(filterStatus)}"` : "yet"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomersTab({ token }: { token: string }) {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalSpent" | "orderCount">("createdAt");

  const loadCustomers = useCallback(() => {
    setLoading(true);
    setFetchError("");
    adminFetch("/api/admin/users")
      .then((r) => { if (!r.ok) throw new Error(`Users ${r.status}`); return r.json(); })
      .then((data: CustomerRow[]) => setCustomers(data))
      .catch((err: unknown) => {
        setFetchError(`Failed to load customers: ${err instanceof Error ? err.message : "network error"}.`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void loadCustomers(); }, [loadCustomers]);

  const sorted = [...customers].sort((a, b) => {
    if (sortBy === "totalSpent") return b.totalSpent - a.totalSpent;
    if (sortBy === "orderCount") return b.orderCount - a.orderCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="bg-card border border-border">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-lg text-foreground">Registered Customers</h2>
          <span className="text-xs font-body text-muted-foreground">({customers.length} total)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Sort:</span>
          {(["createdAt", "orderCount", "totalSpent"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-[10px] font-body uppercase tracking-wider px-2 py-1 border transition-colors ${sortBy === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {key === "createdAt" ? "Newest" : key === "orderCount" ? "Orders" : "Spent"}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="py-12 text-center"><Spinner /></div>
      ) : fetchError ? (
        <div className="py-12 text-center space-y-4">
          <p className="text-red-400 font-body text-sm">{fetchError}</p>
          <button onClick={loadCustomers} className="px-4 py-2 border border-border text-xs font-body text-muted-foreground hover:text-foreground transition-colors">Retry</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Orders</th>
                <th className="px-6 py-3 text-left">Total Spent</th>
                <th className="px-6 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-6 py-4 font-body text-xs text-primary">#{c.id}</td>
                  <td className="px-6 py-4 font-body text-sm text-foreground">{c.name}</td>
                  <td className="px-6 py-4 font-body text-xs text-muted-foreground">{c.email}</td>
                  <td className="px-6 py-4 font-body text-sm text-foreground">{c.orderCount}</td>
                  <td className="px-6 py-4 font-serif text-sm text-primary">
                    {c.totalSpent > 0 ? `£${c.totalSpent.toFixed(2)}` : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4 font-body text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-body text-sm">
                    No registered customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface ProductFormState {
  name: string; category: string; price: string; description: string;
  images: string; sizes: string; colors: string;
  inStock: boolean; featured: boolean; deliveryIncluded: boolean;
}

const emptyForm = (): ProductFormState => ({
  name: "", category: "shalwar-kameez", price: "", description: "",
  images: "", sizes: "", colors: "", inStock: true, featured: false, deliveryIncluded: true,
});

function ProductModal({
  product, onClose, onSave,
}: {
  product: ProductRow | null;
  onClose: () => void;
  onSave: (data: Partial<ProductRow>) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormState>(
    product
      ? {
          name: product.name, category: product.category, price: String(product.price),
          description: product.description, images: product.images.join("\n"),
          sizes: product.sizes.join(", "), colors: product.colors.join(", "),
          inStock: product.inStock, featured: product.featured, deliveryIncluded: product.deliveryIncluded,
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError("Name and price are required."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({
        name: form.name, category: form.category, price: parseFloat(form.price),
        description: form.description,
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        inStock: form.inStock, featured: form.featured, deliveryIncluded: form.deliveryIncluded,
      });
      onClose();
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <h3 className="font-serif text-lg text-foreground">{product ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><XCircle size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-1.5">Product Name *</label>
              <input
                type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-1.5">Category *</label>
              <select
                value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-1.5">Price (£) *</label>
              <input
                type="number" step="0.01" min="0" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required
                className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-1.5">Image URLs (one per line)</label>
            <textarea
              value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
              rows={3} placeholder="https://images.unsplash.com/..."
              className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none resize-none placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-1.5">Sizes (comma-separated)</label>
              <input
                type="text" value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                placeholder="XS, S, M, L, XL"
                className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-1.5">Colors (comma-separated)</label>
              <input
                type="text" value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                placeholder="White, Navy, Rose"
                className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-6">
            {(["inStock", "featured", "deliveryIncluded"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span className="text-[10px] uppercase tracking-wider font-body text-muted-foreground">
                  {key === "inStock" ? "In Stock" : key === "featured" ? "Featured" : "Delivery Included"}
                </span>
              </label>
            ))}
          </div>

          {error && <p className="text-red-400 text-xs font-body">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border text-muted-foreground text-xs uppercase tracking-wider font-body hover:text-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-body hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductsTab({ token }: { token: string }) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [editProduct, setEditProduct] = useState<ProductRow | null | "new">(null);
  const [deleting, setDeleting] = useState<Set<number>>(new Set());
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  const load = useCallback(() => {
    setLoading(true);
    setFetchError("");
    adminFetch("/api/admin/products")
      .then((r) => { if (!r.ok) throw new Error(`Products ${r.status}`); return r.json(); })
      .then((data: ProductRow[]) => setProducts(data))
      .catch((err: unknown) => {
        setFetchError(`Failed to load products: ${err instanceof Error ? err.message : "network error"}.`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleField = async (product: ProductRow, field: "inStock" | "featured") => {
    setToggling((s) => new Set([...s, product.id]));
    try {
      const res = await adminFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: !product[field] }),
      });
      if (res.ok) {
        const updated = await res.json() as ProductRow;
        setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, ...updated } : p));
      }
    } catch { /* ignore */ } finally {
      setToggling((s) => { const n = new Set(s); n.delete(product.id); return n; });
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting((s) => new Set([...s, id]));
    try {
      await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ } finally {
      setDeleting((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  const handleSave = async (data: Partial<ProductRow>) => {
    if (editProduct === "new") {
      const res = await adminFetch("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
      const created = await res.json() as ProductRow;
      setProducts((prev) => [...prev, created]);
    } else if (editProduct) {
      const res = await adminFetch(`/api/admin/products/${editProduct.id}`, { method: "PATCH", body: JSON.stringify(data) });
      const updated = await res.json() as ProductRow;
      setProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...updated } : p));
    }
  };

  const categoryColors: Record<string, string> = {
    "shalwar-kameez": "text-pink-400 border-pink-400/30 bg-pink-400/10",
    "jeans": "text-blue-400 border-blue-400/30 bg-blue-400/10",
    "wallets": "text-amber-400 border-amber-400/30 bg-amber-400/10",
    "food": "text-orange-400 border-orange-400/30 bg-orange-400/10",
  };

  return (
    <>
      {editProduct !== null && (
        <ProductModal
          product={editProduct === "new" ? null : editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleSave}
        />
      )}
      <div className="bg-card border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg text-foreground">Products</h2>
            <span className="text-xs font-body text-muted-foreground">({products.length} total)</span>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="text-muted-foreground hover:text-foreground transition-colors p-1.5"><RefreshCw size={14} /></button>
            <button
              onClick={() => setEditProduct("new")}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-[10px] uppercase tracking-widest font-body hover:bg-primary/90 transition-colors"
            >
              <Plus size={12} /> Add Product
            </button>
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center"><Spinner /></div>
        ) : fetchError ? (
          <div className="py-12 text-center space-y-4">
            <p className="text-red-400 font-body text-sm">{fetchError}</p>
            <button onClick={load} className="px-4 py-2 border border-border text-xs font-body text-muted-foreground hover:text-foreground transition-colors">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Featured</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">#{p.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-body text-sm text-foreground max-w-[200px] truncate">{p.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border font-body ${categoryColors[p.category] ?? "text-muted-foreground border-border"}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-serif text-sm text-primary">£{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleField(p, "inStock")}
                        disabled={toggling.has(p.id)}
                        className="flex items-center gap-1 text-[10px] font-body transition-colors disabled:opacity-50"
                        title="Toggle stock"
                      >
                        {p.inStock
                          ? <><ToggleRight size={18} className="text-green-400" /> <span className="text-green-400">In Stock</span></>
                          : <><ToggleLeft size={18} className="text-red-400" /> <span className="text-red-400">Out of Stock</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleField(p, "featured")}
                        disabled={toggling.has(p.id)}
                        className="flex items-center gap-1 text-[10px] font-body transition-colors disabled:opacity-50"
                        title="Toggle featured"
                      >
                        {p.featured
                          ? <><ToggleRight size={18} className="text-primary" /> <span className="text-primary">Featured</span></>
                          : <><ToggleLeft size={18} className="text-muted-foreground" /> <span className="text-muted-foreground">No</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="flex items-center gap-1 text-[10px] font-body text-blue-400 hover:text-blue-300 border border-blue-400/30 px-2 py-1 transition-colors"
                        >
                          <Pencil size={9} /> Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={deleting.has(p.id)}
                          className="flex items-center gap-1 text-[10px] font-body text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={9} /> {deleting.has(p.id) ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-body text-sm">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function ReviewsTab({ token }: { token: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [acting, setActing] = useState<Set<number>>(new Set());

  const loadReviews = useCallback(() => {
    setLoading(true);
    setFetchError("");
    adminFetch("/api/admin/reviews")
      .then((r) => { if (!r.ok) throw new Error(`Reviews ${r.status}`); return r.json(); })
      .then((data: ReviewRow[]) => setReviews(data))
      .catch((err: unknown) => {
        setFetchError(`Failed to load reviews: ${err instanceof Error ? err.message : "network error"}.`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void loadReviews(); }, [loadReviews]);

  const approve = async (id: number, approved: boolean) => {
    setActing((s) => new Set([...s, id]));
    try {
      await adminFetch(`/api/admin/reviews/${id}/approve`, { method: "PATCH", body: JSON.stringify({ approved }) });
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved } : r));
    } catch { /* ignore */ } finally {
      setActing((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setActing((s) => new Set([...s, id]));
    try {
      await adminFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ } finally {
      setActing((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  return (
    <div className="bg-card border border-border">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <h2 className="font-serif text-lg text-foreground">Customer Reviews</h2>
        <span className="text-xs font-body text-muted-foreground">({reviews.length} total)</span>
      </div>
      {loading ? (
        <div className="py-12 text-center"><Spinner /></div>
      ) : fetchError ? (
        <div className="py-12 text-center space-y-4">
          <p className="text-red-400 font-body text-sm">{fetchError}</p>
          <button onClick={loadReviews} className="px-4 py-2 border border-border text-xs font-body text-muted-foreground hover:text-foreground transition-colors">Retry</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Rating</th>
                <th className="px-6 py-3 text-left">Review</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <p className="font-body text-sm text-foreground">{r.customerName}</p>
                    <p className="font-body text-xs text-muted-foreground">{r.customerEmail ?? "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-muted-foreground/30"}`}>★</span>
                      ))}
                    </div>
                    <p className="text-[10px] font-body text-muted-foreground mt-0.5">{r.rating}/5</p>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    {r.title && <p className="font-body text-xs text-foreground font-semibold mb-1">{r.title}</p>}
                    <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.body}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.approved ? "approved" : "hidden"} />
                  </td>
                  <td className="px-6 py-4 font-body text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {!r.approved ? (
                        <button
                          onClick={() => approve(r.id, true)}
                          disabled={acting.has(r.id)}
                          className="flex items-center gap-1 text-[10px] font-body text-green-400 hover:text-green-300 border border-green-400/30 px-2 py-1 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle size={9} /> Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => approve(r.id, false)}
                          disabled={acting.has(r.id)}
                          className="flex items-center gap-1 text-[10px] font-body text-yellow-400 hover:text-yellow-300 border border-yellow-400/30 px-2 py-1 disabled:opacity-50 transition-colors"
                        >
                          <AlertTriangle size={9} /> Hide
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(r.id)}
                        disabled={acting.has(r.id)}
                        className="flex items-center gap-1 text-[10px] font-body text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={9} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-body text-sm">
                    No reviews submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const tabs: { key: AdminTab; label: string; icon: React.ComponentType<{ size: number; className?: string }> }[] = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "customers", label: "Customers", icon: Users },
    { key: "products", label: "Products", icon: Package },
    { key: "reviews", label: "Reviews", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg text-primary">LUXE & LINE</span>
          <span className="text-[10px] uppercase tracking-widest font-body text-muted-foreground border border-border px-3 py-1">Admin</span>
        </div>
        <button
          data-testid="button-logout"
          onClick={onLogout}
          className="text-xs font-body text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab navigation */}
        <div className="flex gap-0 mb-8 border-b border-border overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-[10px] uppercase tracking-widest font-body transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === key
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab token={token} />}
        {activeTab === "orders" && <OrdersTab token={token} />}
        {activeTab === "customers" && <CustomersTab token={token} />}
        {activeTab === "products" && <ProductsTab token={token} />}
        {activeTab === "reviews" && <ReviewsTab token={token} />}
      </div>
    </div>
  );
}

export function Admin() {
  const [token, setToken] = useState<string>(() => localStorage.getItem("luxe_admin_token") ?? "");

  const handleLogout = () => {
    localStorage.removeItem("luxe_admin_token");
    setToken("");
  };

  if (!token) return <AdminLogin onLogin={setToken} />;
  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
