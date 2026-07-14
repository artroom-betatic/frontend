export function getCleanTagQuery(tag: string) {
  return tag.trim().replace(/^#+/, "");
}

export function getTagSearchHref(tag: string) {
  return `/search?q=${encodeURIComponent(getCleanTagQuery(tag))}`;
}
