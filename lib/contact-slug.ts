export const createContactSlug = (name: string, id: string) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = id.slice(-4);
  if (!base) {
    return `contact-${suffix}`;
  }
  return `${base}-${suffix}`;
};

export const matchesContactSlug = (
  slug: string,
  contact: { slug?: string; name: string; id: string }
) => {
  const normalized = slug.toLowerCase();
  if (contact.slug && contact.slug.toLowerCase() === normalized) {
    return true;
  }
  return createContactSlug(contact.name, contact.id).toLowerCase() === normalized;
};
