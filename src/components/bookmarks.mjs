export const STORAGE_KEY = 'mona-bookmarks';
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/** @typedef {{ url: string, slug: string }} Bookmark */

/** @param {string} input */
export function normalizeUrl(input) {
  const value = input.trim();
  if (!value) throw new Error('Enter a link to save.');

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value);
  const hasPort = /^[^/?#:\s]+:\d+(?:[/?#]|$)/.test(value);
  const candidate = value.startsWith('//')
    ? `https:${value}`
    : hasScheme && !hasPort ? value : `https://${value}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('Enter a valid web URL, such as example.com.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
    throw new Error('Only HTTP and HTTPS web links can be saved.');
  }
  return url.href;
}

/** @param {unknown} value @returns {value is Bookmark} */
function isBookmark(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  if (!('url' in value) || !('slug' in value)) return false;
  if (typeof value.url !== 'string' || typeof value.slug !== 'string') return false;
  if (!/^mona-[0-9A-Za-z]{4,8}$/.test(value.slug)) return false;
  try {
    return normalizeUrl(value.url) === value.url;
  } catch {
    return false;
  }
}

/**
 * @param {string | null} stored
 * @returns {{ bookmarks: Bookmark[], recovered: boolean }}
 */
export function loadBookmarks(stored) {
  if (stored === null || stored.trim() === '') return { bookmarks: [], recovered: false };
  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return { bookmarks: [], recovered: true };
  }
  if (!Array.isArray(parsed)) return { bookmarks: [], recovered: true };
  /** @type {Bookmark[]} */
  const bookmarks = [];
  const slugs = new Set();
  for (const value of parsed) {
    if (!isBookmark(value) || slugs.has(value.slug)) continue;
    bookmarks.push({ url: value.url, slug: value.slug });
    slugs.add(value.slug);
  }
  return { bookmarks, recovered: bookmarks.length !== parsed.length };
}

/** @param {Bookmark} bookmark */
export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

/** @param {Bookmark[]} bookmarks @param {() => number} random */
export function generateSlug(bookmarks, random = Math.random) {
  const space = BASE62.length ** 4;
  const used = new Set(bookmarks.map((bookmark) => bookmark.slug));
  const start = Math.floor(random() * space);
  for (let offset = 0; offset < space; offset++) {
    let number = (start + offset) % space;
    let suffix = '';
    for (let digit = 0; digit < 4; digit++) {
      suffix = BASE62[number % BASE62.length] + suffix;
      number = Math.floor(number / BASE62.length);
    }
    const slug = `mona-${suffix}`;
    if (!used.has(slug)) return slug;
  }
  throw new Error('All short slugs are in use. Clear some bookmarks before adding another.');
}
