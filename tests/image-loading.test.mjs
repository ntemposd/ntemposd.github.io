import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentImageLoading } from '../src/lib/image-loading.mjs';
import { applyLazyContentImages, readImageSize } from '../src/lib/rehype-lazy-content-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

test('markdown figures become lazy and keep their intrinsic box', () => {
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
  applyLazyContentImages(tree, root);
  const img = tree.children[0].properties;
  const file = path.join(root, 'public/posts/structural-patterns-in-product-management-img1.png');
  assert.equal(img.loading, 'lazy');
  assert.equal(img.fetchpriority, 'auto');
  assert.equal(img.src, '/posts/structural-patterns-in-product-management-img1.png');
  assert.deepEqual({ width: img.width, height: img.height }, readImageSize(file));
  assert.ok(img.width > 0 && img.height > 0);
});

test('an image that already opts into eager loading is left alone', () => {
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
  applyLazyContentImages(tree, root);
  assert.equal(tree.children[0].properties.loading, 'eager');
  assert.equal(tree.children[0].properties.fetchpriority, 'high');
});
