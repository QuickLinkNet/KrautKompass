// Typen der KrautKompass-API (siehe api/routes/api.php)

export type Role = 'admin' | 'member';
export type Visibility = 'private' | 'group';
/** „Würdest du sie wieder nehmen?“ */
export type Again = 'yes' | 'maybe' | 'no';

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
  /** Optionale Funktionen, abhängig von der Server-Konfiguration */
  features?: { passwordReset: boolean };
  /** Nur gesetzt, wenn in der Server-Konfiguration hinterlegt */
  /** Anbieter für Impressum/Datenschutz (aus der Server-.env), leer solange nicht gesetzt */
  legal?: { name?: string; street?: string; city?: string; email?: string; phone?: string };
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
  /** Auf der eigenen Merkliste */
  favorite: boolean;
  /** Häufigste Wirkungen laut Gruppenbewertungen (nur in der Liste) */
  topEffects?: string[];
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
  /** Blütenqualität, Skala wie die übrigen Einzelwerte */
  quality: number | null;
  again: Again | null;
  effects: string[];
  sideEffects: string[];
  method: string | null;
  notes: string | null;
  visibility: Visibility;
  consumedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** „Das berichtet die Runde“ – nur aus geteilten Bewertungen */
export interface GroupSummary {
  count: number;
  averages: Record<'taste' | 'aroma' | 'effect' | 'quality', number | null>;
  effects: { key: string; count: number }[];
}

export interface RatingInput {
  overall: number;
  taste?: number | null;
  aroma?: number | null;
  effect?: number | null;
  quality?: number | null;
  again?: Again | null;
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
  /** Obergrenzen für die Schieberegler (aufgerundet, in %) */
  thcMax: number;
  cbdMax: number;
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
