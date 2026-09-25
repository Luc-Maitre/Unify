import { AWARENESS_SHEET_URL } from './config';

export interface AwarenessContent {
  title: string;
  description: string;
}

export async function fetchAwareness(): Promise<AwarenessContent | null> {
  if (!AWARENESS_SHEET_URL) return null;

  try {
    const res = await fetch(AWARENESS_SHEET_URL);
    if (!res.ok) return null;

    const json = await res.json() as { record?: Partial<AwarenessContent> } & Partial<AwarenessContent>;
    const data = json.record ?? json;
    if (!data.title || !data.description) return null;

    return { title: data.title, description: data.description };
  } catch {
    return null;
  }
}
