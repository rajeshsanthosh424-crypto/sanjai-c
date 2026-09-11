import { Item, Match, Claim, Message, Notification, ReportAbuse, User, SystemStats } from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),
  login: (email: string, password?: string) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, phone?: string) =>
    request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone }),
    }),
  switchUser: (userId: string) =>
    request<{ user: User }>('/api/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  // Items
  getItems: (params?: { type?: string; category?: string; status?: string; search?: string; reporterId?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.reporterId) q.set('reporterId', params.reporterId);
    return request<{ items: Item[] }>(`/api/items?${q.toString()}`);
  },
  getItemById: (id: string) => request<{ item: Item }>(`/api/items/${id}`),
  createItem: (itemData: Partial<Item>) =>
    request<{ item: Item; createdMatchesCount: number }>('/api/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),
  updateItem: (id: string, updates: Partial<Item>) =>
    request<{ item: Item }>(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteItem: (id: string) => request<{ success: boolean }>(`/api/items/${id}`, { method: 'DELETE' }),

  // Matches
  getMatches: (params?: { minScore?: number; userId?: string }) => {
    const q = new URLSearchParams();
    if (params?.minScore) q.set('minScore', params.minScore.toString());
    if (params?.userId) q.set('userId', params.userId);
    return request<{ matches: Match[] }>(`/api/matches?${q.toString()}`);
  },
  compareItems: (lostItemId: string, foundItemId: string) =>
    request<{
      result: {
        matchScore: number;
        breakdown: any;
        reasons: string[];
        aiSummary: string;
      };
    }>('/api/matches/compare', {
      method: 'POST',
      body: JSON.stringify({ lostItemId, foundItemId }),
    }),

  // Smart Search
  smartSearch: (query: string) =>
    request<{
      parsed: {
        type?: string;
        category?: string;
        color?: string;
        brand?: string;
        keywords: string[];
        locationHint?: string;
      };
      results: Item[];
    }>('/api/search/smart', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // AI Item Auto-Analysis
  analyzeItemAI: (data: { title?: string; description?: string; imageBase64?: string; mimeType?: string }) =>
    request<{
      analysis: {
        suggestedCategory: string;
        suggestedColor: string;
        suggestedBrand: string;
        suggestedTitle: string;
        enhancedDescription: string;
        identifyingTips: string[];
      };
    }>('/api/ai/analyze-item', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Claims
  getClaims: (userId?: string) => {
    const q = userId ? `?userId=${userId}` : '';
    return request<{ claims: Claim[] }>(`/api/claims${q}`);
  },
  createClaim: (claimData: {
    lostItemId: string;
    foundItemId: string;
    hiddenDetails: string;
    serialNumberProof?: string;
    proofImageUrl?: string;
    message?: string;
  }) =>
    request<{ claim: Claim }>('/api/claims', {
      method: 'POST',
      body: JSON.stringify(claimData),
    }),
  updateClaimStatus: (id: string, status: 'accepted' | 'rejected', resolutionNotes?: string) =>
    request<{ claim: Claim }>(`/api/claims/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes }),
    }),

  // Messaging
  getMessages: (threadId: string) => request<{ messages: Message[] }>(`/api/messages/${threadId}`),
  sendMessage: (threadId: string, recipientId: string, content: string) =>
    request<{ message: Message }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ threadId, recipientId, content }),
    }),

  // Notifications
  getNotifications: () => request<{ notifications: Notification[] }>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),

  // Abuse Report
  reportAbuse: (itemId: string, reason: string, details: string) =>
    request<{ report: ReportAbuse }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ itemId, reason, details }),
    }),

  // Admin
  getAdminStats: () => request<{ stats: SystemStats }>('/api/admin/stats'),
  getAdminReports: () => request<{ reports: ReportAbuse[] }>('/api/admin/reports'),
  resolveAdminReport: (id: string, status: string, action?: string) =>
    request<{ report: ReportAbuse }>(`/api/admin/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, action }),
    }),
  getAdminUsers: () => request<{ users: User[] }>('/api/admin/users'),
};
