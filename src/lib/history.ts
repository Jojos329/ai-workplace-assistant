export type HistoryEntry = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

const key = (feature: string) => `wpai:history:${feature}`;

export function loadHistory(feature: string): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(feature));
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(feature: string, entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(feature), JSON.stringify(entries.slice(0, 20)));
}

export function appendHistory(
  feature: string,
  entry: Omit<HistoryEntry, "id" | "createdAt">,
): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const next = [full, ...loadHistory(feature)].slice(0, 20);
  saveHistory(feature, next);
  return full;
}