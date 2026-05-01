export type IncidentType =
  | 'deepfake'
  | 'prompt-injection'
  | 'data-leak'
  | 'bias'
  | 'hallucination'
  | 'attack'
  | 'scam'
  | 'misinformation'
  | 'privacy'
  | 'other';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type HypeStatus = 'pending' | 'confirmed' | 'busted' | 'partial';

export type GraveyardReason = 'shutdown' | 'acquired' | 'pivot';

export interface Incident {
  id: string;
  title: string;
  slug: string;
  summary: string;
  source_url: string;
  source_name: string;
  published_at: string;
  incident_type: IncidentType;
  severity: Severity;
  country: string | null;
  tags: string[];
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  published_at: string;
  category: string;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  launched_at: string;
  created_at: string;
}

export interface GraveyardEntry {
  id: string;
  name: string;
  description: string;
  shutdown_date: string;
  reason: GraveyardReason;
  acquired_by: string | null;
  notes: string;
  created_at: string;
}

export interface HypeItem {
  id: string;
  prediction: string;
  predicted_by: string;
  predicted_at: string;
  reality: string | null;
  status: HypeStatus;
  verdict_date: string | null;
  created_at: string;
}
