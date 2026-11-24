// Typen der KrautKompass-API (siehe api/routes/api.php)

export type Role = 'admin' | 'member';
export type Visibility = 'private' | 'group';

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  status: 'active' | 'disabled';
  created_at: string;
  last_login_at: string | null;
}

export interface Requirement {
  key: string;
  label: string;
  ok: boolean;
}

export interface SystemStatus {
  app: string;
  version: string;
  installed: boolean;
  instanceName: string;
  csrfToken: string;
  user: User | null;
  requirements?: Requirement[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  shortName: string | null;
  category: string;
  producer: string | null;
  strain: string | null;
  genetic: string | null;
  dominance: string | null;
  thc: number | null;
  cbd: number | null;
  irradiated: boolean | null;
  available: boolean;
  terpenes: string[];
  imageUrl: string | null;
  thumbUrl: string | null;
  rating: { average: number | null; count: number };
}

export interface ProductDetails extends Product {
  description: string | null;
  origin: string | null;
  grower: string | null;
  price: number | null;
  shopUrl: string;
  syncedAt: string | null;
}

export interface Rating {
  id: number;
  productId: number;
  productName: string | null;
  productThumbUrl: string | null;
  author: { id: number; name: string | null };
  isMine: boolean;
  overall: number;
  taste: number | null;
  aroma: number | null;
  effect: number | null;
  effects: string[];
  sideEffects: string[];
  method: string | null;
  notes: string | null;
  visibility: Visibility;
  consumedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingInput {
  overall: number;
  taste?: number | null;
  aroma?: number | null;
  effect?: number | null;
  effects?: string[];
  side_effects?: string[];
  method?: string | null;
  notes?: string | null;
  visibility: Visibility;
  consumed_at?: string | null;
}

export interface Option {
  key: string;
  label: string;
}

export interface Meta {
  scaleMax: number;
  effects: Option[];
  sideEffects: Option[];
  methods: Option[];
}

export interface Facets {
  producers: string[];
  genetics: string[];
  terpenes: string[];
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; perPage: number; total: number; pageCount: number };
}

export interface Invite {
  id: number;
  code: string;
  role: Role;
  note: string | null;
  expires_at: string;
  used_at: string | null;
  used_by_name: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface SyncRun {
  id: number;
  trigger: string;
  status: 'running' | 'success' | 'failed';
  stats: Record<string, number | string[]>;
  error: string | null;
  started_at: string;
  finished_at: string | null;
}
