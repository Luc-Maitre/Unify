import { AWARENESS_SHEET_URL } from './config';

export interface AwarenessContent {
  title: string;
  description: string;
  visible: boolean;
}

export async function fetchAwareness(): Promise<AwarenessContent | null> {
  if (!AWARENESS_SHEET_URL) return null;

  try {
    const res = await fetch(AWARENESS_SHEET_URL, {
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;

    const envelope = await res.json() as { content?: string };
    if (!envelope.content) return null;
    const decoded = decodeURIComponent(escape(atob(envelope.content.replace(/\n/g, ''))));
    const data = JSON.parse(decoded) as Partial<AwarenessContent>;
    if (!data.title || !data.description) return null;

    return { title: data.title, description: data.description, visible: data.visible !== false };
  } catch {
    return null;
  }
}
