export const AUTH_CHANGE_EVENT = "luxe-auth-change";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem("customer_token", token);
  localStorage.setItem("customer_user", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuth(): void {
  localStorage.removeItem("customer_token");
  localStorage.removeItem("customer_user");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getAuthToken(): string | null {
  return localStorage.getItem("customer_token");
}

export function getAuthUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem("customer_user");
    if (!stored) return null;
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export async function verifySession(): Promise<AuthUser | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearAuth();
      return null;
    }
    const user = await res.json() as AuthUser;
    localStorage.setItem("customer_user", JSON.stringify(user));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return user;
  } catch {
    return null;
  }
}
