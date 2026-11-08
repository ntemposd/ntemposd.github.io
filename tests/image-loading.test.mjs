import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentImageLoading } from '../src/lib/image-loading.mjs';
import { applyLazyContentImages, readImageSize } from '../src/lib/rehype-lazy-content-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Sizes checked once with sharp's metadata and with Python's struct/header read,
// then written here as literals so the test does not call the helper for the expected value.
const knownSizes = {
  'public/posts/structural-patterns-in-product-management-img1.png': { width: 1724, height: 1876 },
  'public/posts/sxsw-accelerator-img1.jpg': { width: 1910, height: 1000 },
  'public/posts/early-stage-startup-websummit-img1.jpg': { width: 500, height: 375 },
  'src/assets/posts/skg-startup-hub.webp': { width: 1536, height: 1024 },
};

test('primary images stay eager and high priority', () => {
  assert.deepEqual(contentImageLoading(true), {
    loading: 'eager',
    fetchpriority: 'high',
  });
});

test('other images are lazy at normal priority', () => {
  assert.deepEqual(contentImageLoading(false), {
    loading: 'lazy',
    fetchpriority: 'auto',
  });
});

test('sharp metadata matches the known fixture sizes', async () => {
  for (const [rel, expected] of Object.entries(knownSizes)) {
    assert.deepEqual(await readImageSize(path.join(root, rel)), expected, rel);
  }
});

test('markdown figures become lazy and keep the known intrinsic box', async () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'img',
        properties: {
          src: '/posts/structural-patterns-in-product-management-img1.png',
          alt: '',
        },
        children: [],
      },
    ],
  };
  await applyLazyContentImages(tree, root);
  const img = tree.children[0].properties;
  assert.equal(img.loading, 'lazy');
  assert.equal(img.fetchpriority, 'auto');
  assert.equal(img.src, '/posts/structural-patterns-in-product-management-img1.png');
  assert.equal(img.width, 1724);
  assert.equal(img.height, 1876);
});

test('an image that already opts into eager loading is left alone', async () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'img',
        properties: { src: '/posts/example.png', loading: 'eager', fetchpriority: 'high' },
        children: [],
      },
    ],
  };
  await applyLazyContentImages(tree, root);
  assert.equal(tree.children[0].properties.loading, 'eager');
  assert.equal(tree.children[0].properties.fetchpriority, 'high');
});
