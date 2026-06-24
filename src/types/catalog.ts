export const CONDITION_GRADES = ['Mint 9m+', 'Ding 6-8m', 'Damage 3-5m'] as const;
export type ConditionGrade = (typeof CONDITION_GRADES)[number];

export type PriceMap = Record<ConditionGrade, number | null>;

export interface CatalogItem {
  id: string;
  label: string;
  drug: string;
  ndc: string;
  isGroup: boolean;
  category: string;
  prices: PriceMap;
  notes: string;
}

export interface CatalogFeed {
  version: number;
  generatedAt: string;
  count: number;
  items: CatalogItem[];
  error?: string;
}

export interface LineItem {
  rowId: string; // internal React/list key — not submitted
  id: string;
  label: string;
  drug: string;
  ndc: string;
  isGroup: boolean;
  category: string;
  notes: string;
  prices: PriceMap; // retained so the buyer can switch condition in-row
  condition: ConditionGrade;
  rate: number | null; // null = catalog price was blank and not yet entered
  quantity: number;
  amount: number;
}

export interface SubmittedLineItem {
  id: string;
  label: string;
  drug: string;
  ndc: string;
  isGroup: boolean;
  category: string;
  condition: ConditionGrade;
  rate: number;
  quantity: number;
  amount: number;
  notes: string;
}
