export default function generateSlug(name) {
  let slug = name.toLowerCase();

  slug = slug.replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  slug = encodeURIComponent(slug);

  return slug;
}
