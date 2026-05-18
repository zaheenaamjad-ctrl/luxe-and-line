import { useState, useEffect } from "react";
import { useAdminLogin, useGetAdminDashboard, useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Package, TrendingUp, ShoppingBag, Clock, CheckCircle, XCircle, Send, PackageCheck, Users, Star } from "lucide-react";

const ADMIN_EMAILS = ["syedimad348@gmail.com", "zaheenaamjad@gmail.com", "luxeline26@gmail.com"];
const ADMIN_TOKEN = "luxe_admin_secret_token_2024";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    processing: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    shipped: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    delivered: "text-green-400 bg-green-400/10 border-green-400/30",
    cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
    verified: "text-green-400 bg-green-400/10 border-green-400/30",
    failed: "text-red-400 bg-red-400/10 border-red-400/30",
  };
  return (
    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border font-body ${colors[status] ?? "text-muted-foreground bg-muted border-border"}`}>
      {status}
    </span>
  );
}

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const adminLogin = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_EMAILS.includes(email)) {
      setError("Access denied. This portal is restricted.");
      return;
    }
    adminLogin.mutate(
      { data: { email } },
      {
        onSuccess: (result) => {
          if (result.success) {
            localStorage.setItem("luxe_admin_token", result.token);
            onLogin(result.token);
          } else {
            setError("Access denied.");
          }
        },
        onError: () => setError("Access denied."),
      }
    );
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
            {error && (
              <p className="text-destructive text-xs font-body">{error}</p>
            )}
            <button
              type="submit"
              data-testid="button-admin-login"
              disabled={adminLogin.isPending}
              className="w-full bg-primary text-primary-foreground py-4 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {adminLogin.isPending ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

type UserRow = { id: number; name: string; email: string; createdAt: string };
type ReviewRow = { id: number; customerName: string; customerEmail: string | null; rating: number; title: string | null; body: string; approved: boolean; createdAt: string; productId: number | null };

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const { data: dashboard } = useGetAdminDashboard();
  const { data: orders } = useListOrders({});
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<"orders" | "users" | "reviews">("orders");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) {
      setLoadingUsers(true);
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data: UserRow[]) => setUsers(data))
        .catch(() => {})
        .finally(() => setLoadingUsers(false));
    }
    if (activeTab === "reviews" && reviews.length === 0) {
      setLoadingReviews(true);
      fetch("/api/admin/reviews", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data: ReviewRow[]) => setReviews(data))
        .catch(() => {})
        .finally(() => setLoadingReviews(false));
    }
  }, [activeTab, token, users.length, reviews.length]);

  const handleStatusUpdate = (orderId: number) => {
    const status = selectedStatus[orderId];
    if (!status) return;
    updateStatus.mutate(
      { id: orderId, data: { status, paymentStatus: null } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }) }
    );
  };

  const handlePaymentUpdate = (orderId: number, paymentStatus: string) => {
    updateStatus.mutate(
      { id: orderId, data: { status: orders?.find(o => o.id === orderId)?.status ?? "pending", paymentStatus } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }) }
    );
  };

  const statCards = [
    { label: "Total Orders", value: dashboard?.totalOrders ?? 0, icon: ShoppingBag },
    { label: "Pending Orders", value: dashboard?.pendingOrders ?? 0, icon: Clock },
    { label: "Total Revenue", value: `£${(dashboard?.totalRevenue ?? 0).toFixed(2)}`, icon: TrendingUp },
    { label: "Products", value: dashboard?.totalProducts ?? 0, icon: Package },
    { label: "Customers", value: (dashboard as unknown as { totalUsers?: number })?.totalUsers ?? 0, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-50">
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
        <h1 className="font-serif text-3xl text-foreground mb-8">Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground">{label}</p>
                <Icon size={16} className="text-primary" />
              </div>
              <p className="font-serif text-2xl text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 mb-6 border-b border-border">
          {(["orders", "users", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs uppercase tracking-widest font-body transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab === "orders" && <ShoppingBag size={11} className="inline mr-1.5" />}
              {tab === "users" && <Users size={11} className="inline mr-1.5" />}
              {tab === "reviews" && <Star size={11} className="inline mr-1.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-card border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <h2 className="font-serif text-lg text-foreground">All Orders</h2>
              <span className="text-xs font-body text-muted-foreground">({orders?.length ?? 0} total)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                    <th className="px-6 py-3 text-left">Order ID</th>
                    <th className="px-6 py-3 text-left">Customer</th>
                    <th className="px-6 py-3 text-left">Total</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Payment</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders ?? []).map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-testid={`row-order-${order.id}`}>
                      <td className="px-6 py-4 font-body text-xs text-primary">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-body text-sm text-foreground">{order.customerName}</p>
                        <p className="font-body text-xs text-muted-foreground">{order.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-serif text-sm text-primary">£{order.total.toFixed(2)}</td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4"><StatusBadge status={order.paymentStatus} /></td>
                      <td className="px-6 py-4 font-body text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <select
                              data-testid={`select-status-${order.id}`}
                              value={selectedStatus[order.id] ?? order.status}
                              onChange={(e) => setSelectedStatus(s => ({ ...s, [order.id]: e.target.value }))}
                              className="bg-background border border-border text-xs font-body text-foreground px-2 py-1 focus:border-primary focus:outline-none"
                            >
                              {["pending","processing","shipped","delivered","cancelled"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              data-testid={`button-update-status-${order.id}`}
                              onClick={() => handleStatusUpdate(order.id)}
                              className="bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-wider font-body hover:bg-primary/90"
                            >
                              Update
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <button
                              data-testid={`button-verify-payment-${order.id}`}
                              onClick={() => handlePaymentUpdate(order.id, "verified")}
                              className="flex items-center gap-1 text-[10px] font-body text-green-400 hover:text-green-300 transition-colors border border-green-400/30 hover:border-green-300/50 px-2 py-1"
                            >
                              <CheckCircle size={9} /> Payment OK
                            </button>
                            <button
                              data-testid={`button-fail-payment-${order.id}`}
                              onClick={() => handlePaymentUpdate(order.id, "failed")}
                              className="flex items-center gap-1 text-[10px] font-body text-red-400 hover:text-red-300 transition-colors border border-red-400/30 hover:border-red-300/50 px-2 py-1"
                            >
                              <XCircle size={9} /> Failed
                            </button>
                            <button
                              data-testid={`button-dispatch-${order.id}`}
                              onClick={() => updateStatus.mutate({ id: order.id, data: { status: "shipped", paymentStatus: null } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }) })}
                              className="flex items-center gap-1 text-[10px] font-body text-blue-400 hover:text-blue-300 transition-colors border border-blue-400/30 hover:border-blue-300/50 px-2 py-1"
                            >
                              <Send size={9} /> Dispatched
                            </button>
                            <button
                              data-testid={`button-received-${order.id}`}
                              onClick={() => updateStatus.mutate({ id: order.id, data: { status: "delivered", paymentStatus: null } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }) })}
                              className="flex items-center gap-1 text-[10px] font-body text-purple-400 hover:text-purple-300 transition-colors border border-purple-400/30 hover:border-purple-300/50 px-2 py-1"
                            >
                              <PackageCheck size={9} /> Received
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(orders ?? []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-body text-sm">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-card border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <h2 className="font-serif text-lg text-foreground">Registered Customers</h2>
              <span className="text-xs font-body text-muted-foreground">({users.length} total)</span>
            </div>
            {loadingUsers ? (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase tracking-widest font-body text-muted-foreground">
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-6 py-4 font-body text-xs text-primary">#{user.id}</td>
                        <td className="px-6 py-4 font-body text-sm text-foreground">{user.name}</td>
                        <td className="px-6 py-4 font-body text-xs text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4 font-body text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-GB")}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-body text-sm">
                          No registered customers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="bg-card border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <h2 className="font-serif text-lg text-foreground">Customer Reviews</h2>
              <span className="text-xs font-body text-muted-foreground">({reviews.length} total)</span>
            </div>
            {loadingReviews ? (
              <div className="px-6 py-12 text-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
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
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-muted-foreground/30"}`}>★</span>
                            ))}
                          </div>
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
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-body text-sm">
                          No reviews submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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

  if (!token) {
    return <AdminLogin onLogin={setToken} />;
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
