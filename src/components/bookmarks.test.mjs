import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBookmark, generateSlug, loadBookmarks, normalizeUrl, STORAGE_KEY } from './bookmarks.mjs';

test('uses the required storage key', () => {
  assert.equal(STORAGE_KEY, 'mona-bookmarks');
});

test('normalizes URLs with and without HTTPS identically', () => {
  assert.equal(normalizeUrl('www.example.com'), normalizeUrl('https://www.example.com'));
  assert.equal(normalizeUrl(' example.com/path?q=yes#part '), 'https://example.com/path?q=yes#part');
  assert.equal(normalizeUrl('//example.com/path'), 'https://example.com/path');
  assert.equal(normalizeUrl('http://example.com/path'), 'http://example.com/path');
  assert.equal(normalizeUrl('localhost:4321/path'), 'https://localhost:4321/path');
});

test('rejects empty, invalid, and unsafe URLs', () => {
  for (const value of ['', '   ', 'not a url', 'https://', 'javascript:alert(1)', 'data:text/html,hello', 'ftp://example.com']) {
    assert.throws(() => normalizeUrl(value));
  }
});

test('recovers from missing, empty, corrupted, legacy, and non-array storage', () => {
  for (const value of [null, '', '   ', '{broken', 'null', '{}', '"example.com"', '42', 'true', '["https://example.com"]', '[{"originalUrl":"https://example.com","shortUrl":"old"}]']) {
    assert.deepEqual(loadBookmarks(value).bookmarks, []);
  }
  assert.equal(loadBookmarks('{broken').recovered, true);
  assert.deepEqual(loadBookmarks('[]'), { bookmarks: [], recovered: false });
});

test('drops malformed entries while preserving validated bookmarks', () => {
  const bookmark = { url: 'https://example.com/', slug: 'mona-7fk2' };
  const stored = JSON.stringify([
    null, [], 12, {}, { url: 1, slug: 'mona-1234' },
    { url: 'https://example.com/', slug: 12 },
    { url: 'javascript:alert(1)', slug: 'mona-1234' },
    { url: 'example.com', slug: 'mona-1234' },
    { url: 'https://example.com/', slug: '<script>' },
    { ...bookmark, extra: 'discarded' }, bookmark,
  ]);
  assert.deepEqual(loadBookmarks(stored), { bookmarks: [bookmark], recovered: true });
});

test('formats the exact visible URL and slug separator', () => {
  assert.equal(formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2');
});

test('generates short base62 slugs and resolves collisions', () => {
  const first = generateSlug([], () => 0);
  const second = generateSlug([{ url: 'https://example.com/', slug: first }], () => 0);
  assert.equal(first, 'mona-0000');
  assert.equal(second, 'mona-0001');
  assert.match(generateSlug([], () => 0.999999), /^mona-[0-9A-Za-z]{4}$/);
});
