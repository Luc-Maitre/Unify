import { AWARENESS_SHEET_URL } from './config';

export interface AwarenessContent {
  title: string;
  description: string;
  visible: boolean;
}

export async function fetchAwareness(): Promise<AwarenessContent | null> {
  if (!AWARENESS_SHEET_URL) return null;

  try {
    const url = `${AWARENESS_SHEET_URL}?_=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json() as Partial<AwarenessContent>;
    if (!data.title || !data.description) return null;

    return { title: data.title, description: data.description, visible: data.visible !== false };
  } catch {
    return null;
  }
}
