export function normalizeContactFormUrl(value: string | undefined) {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export const contactFormUrl = normalizeContactFormUrl(import.meta.env.VITE_CONTACT_FORM_URL);
