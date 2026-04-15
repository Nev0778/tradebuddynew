// API client for the SocialsUnited backend
// The base URL is set via VITE_API_URL env var; falls back to localhost for dev

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

// ─── Auth token storage ───────────────────────────────────────────────────────

const TOKEN_KEY = 'su_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { error?: string };
      message = body.error ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  businessName: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const auth = {
  signup: (email: string, password: string, businessName: string) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, businessName }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  me: () =>
    request<AuthUser>('/auth/me'),
};

// ─── Credentials ──────────────────────────────────────────────────────────────

export interface ApiCredentials {
  facebook: { appId: string; appSecret: string; pageAccessToken: string; pageId: string };
  whatsapp: { phoneNumberId: string; accessToken: string; webhookVerifyToken: string; businessAccountId: string };
  twilio: { accountSid: string; authToken: string; phoneNumber: string };
}

export const credentials = {
  get: () => request<ApiCredentials>('/credentials'),
  save: (creds: ApiCredentials) =>
    request<{ ok: boolean }>('/credentials', {
      method: 'PUT',
      body: JSON.stringify(creds),
    }),
};

// ─── Conversations ────────────────────────────────────────────────────────────

export interface ApiMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  direction: 'incoming' | 'outgoing';
  text: string;
  channel_type: string;
  channel_msg_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiConversation {
  id: string;
  user_id: string;
  channel_type: string;
  channel_id: string;
  contact_name: string;
  contact_id: string;
  page_name: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  last_message: ApiMessage | null;
}

export const conversations = {
  list: () => request<ApiConversation[]>('/conversations'),

  getMessages: (conversationId: string) =>
    request<ApiMessage[]>(`/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, text: string) =>
    request<ApiMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  markRead: (conversationId: string) =>
    request<{ ok: boolean }>(`/conversations/${conversationId}/read`, { method: 'PATCH' }),
};

// ─── User ─────────────────────────────────────────────────────────────────────

export const user = {
  updateProfile: (businessName: string) =>
    request<{ ok: boolean }>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ businessName }),
    }),
};
