import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/** Width and height from sharp, the image library Astro already installs. */
export async function readImageSize(file) {
  try {
    const { width, height } = await sharp(file, { failOn: 'none' }).metadata();
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
}

function localImageFile(src, root) {
  if (typeof src !== 'string' || !src.startsWith('/posts/')) return null;
  const name = src.split('?')[0].split('/').pop();
  if (!name) return null;
  const candidates = [
    path.join(root, 'public', 'posts', name),
    path.join(root, 'src', 'assets', 'posts', name),
  ];
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}

async function walk(node, root, resolveSrc) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element' && node.tagName === 'img') {
    const props = node.properties ?? (node.properties = {});
    const originalSrc = props.src;
    if (!props.loading) {
      props.loading = 'lazy';
      if (!props.fetchpriority) props.fetchpriority = 'auto';
    }
    if (!props.width || !props.height) {
      const file = localImageFile(originalSrc, root);
      const size = file ? await readImageSize(file) : null;
      if (size) {
        props.width = size.width;
        props.height = size.height;
      }
    }
    if (typeof resolveSrc === 'function' && typeof originalSrc === 'string') {
      const next = resolveSrc(originalSrc);
      if (typeof next === 'string' && next.length > 0) props.src = next;
    }
  }
  for (const child of node.children ?? []) await walk(child, root, resolveSrc);
}

export async function applyLazyContentImages(tree, rootOrOptions = process.cwd()) {
  const options = typeof rootOrOptions === 'string' ? { root: rootOrOptions } : rootOrOptions ?? {};
  const root = options.root ?? process.cwd();
  await walk(tree, root, options.resolveSrc);
  return tree;
}

export function rehypeLazyContentImages(options = {}) {
  return (tree) => applyLazyContentImages(tree, options);
}
