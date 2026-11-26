import { api } from './client';
import type {
  Facets, GroupSummary, Invite, Meta, Paginated, Product, ProductDetails, Rating, RatingInput, Role, SyncRun, SystemStatus, User,
} from './types';

type UserResponse = { user: User; csrfToken: string };

export const systemApi = {
  status: () => api.get<SystemStatus>('/system/status'),
  install: (data: { instance_name: string; display_name: string; email: string; password: string }) =>
    api.post<UserResponse>('/system/install', data),
  meta: () => api.get<Meta>('/meta'),
};

export const authApi = {
  login: (email: string, password: string) => api.post<UserResponse>('/auth/login', { email, password }),
  logout: () => api.post<{ csrfToken: string }>('/auth/logout'),
  register: (data: { invite_code: string; display_name: string; email: string; password: string }) =>
    api.post<UserResponse>('/auth/register', data),
  forgotPassword: (email: string) => api.post<{ sent: boolean }>('/auth/password/forgot', { email }),
  resetPassword: (token: string, password: string) =>
    api.post<{ reset: boolean }>('/auth/password/reset', { token, password }),
  checkInvite: (code: string) => api.get<{ valid: boolean; expiresAt: string }>(`/invites/${encodeURIComponent(code)}`),
  updateProfile: (data: { display_name?: string; current_password?: string; new_password?: string }) =>
    api.patch<{ user: User }>('/auth/me', data),
};

export type ProductSort = 'popular' | 'rating' | 'thc' | 'thc_asc' | 'newest' | 'name';

export interface ProductQuery {
  q?: string;
  producer?: string;
  genetic?: string;
  terpene?: string;
  thcMin?: number;
  thcMax?: number;
  cbdMin?: number;
  cbdMax?: number;
  /** Mindest-Durchschnitt (Skala 1–10) */
  minRating?: number;
  /** Wirkungs-Schlüssel, ODER-verknüpft */
  effects?: string[];
  available?: boolean;
  favorites?: boolean;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
}

export interface ProductDetailResponse {
  product: ProductDetails;
  summary: GroupSummary;
  myRating: Rating | null;
  ratings: Rating[];
}

export const productApi = {
  list: ({ effects, ...query }: ProductQuery) =>
    api.get<Paginated<Product>>('/products', { ...query, effects: effects?.length ? effects.join(',') : undefined }),
  setFavorite: (id: number, favorite: boolean) =>
    favorite
      ? api.put<{ favorite: boolean }>(`/products/${id}/favorite`, {})
      : api.delete<{ favorite: boolean }>(`/products/${id}/favorite`),
  facets: () => api.get<Facets>('/products/facets'),
  show: (id: number) =>
    api.get<ProductDetailResponse>(`/products/${id}`),
  rate: (id: number, input: RatingInput) => api.put<{ rating: Rating }>(`/products/${id}/rating`, input),
  deleteRating: (id: number) => api.delete<void>(`/products/${id}/rating`),
};

export const ratingApi = {
  mine: () => api.get<{ items: Rating[] }>('/ratings/mine'),
  feed: (limit = 30) => api.get<{ items: Rating[] }>('/ratings/feed', { limit }),
};

export const adminApi = {
  users: () => api.get<{ items: User[] }>('/admin/users'),
  updateUser: (id: number, data: { role?: Role; status?: User['status'] }) =>
    api.patch<{ user: User }>(`/admin/users/${id}`, data),
  invites: () => api.get<{ items: Invite[] }>('/admin/invites'),
  createInvite: (data: { role?: Role; note?: string; valid_days?: number }) =>
    api.post<{ invite: Invite }>('/admin/invites', data),
  revokeInvite: (id: number) => api.delete<void>(`/admin/invites/${id}`),
  syncRuns: () => api.get<{ items: SyncRun[] }>('/admin/sync'),
  startSync: (force = false) =>
    api.post<{ stats: SyncRun['stats'] }>('/admin/sync', { force }, { timeoutMs: 10 * 60_000 }),
};
