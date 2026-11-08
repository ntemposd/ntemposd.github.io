import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultPath = '/og/dimitrios-ntempos-site-b2-1200x630.jpg';
const defaultUrl = `https://ntemposd.me${defaultPath}`;
const defaultAlt =
  'Dimitrios Ntempos, Technical Product Manager. Integrations, Data and AI. Pastel post-it sketches on dotted paper. ntemposd.me';

function metas(html) {
  return [...html.matchAll(/<meta\b([^>]*)>/gi)].map((match) => {
    const attrs = {};
    for (const attr of match[1].matchAll(/([:\w-]+)="([^"]*)"/g)) attrs[attr[1]] = attr[2];
    return attrs;
  });
}

function values(html, key) {
  return metas(html)
    .filter((tag) => tag.property === key || tag.name === key)
    .map((tag) => tag.content);
}

function readDist(rel) {
  const file = path.join(root, 'dist', rel);
  assert.ok(fs.existsSync(file), rel);
  return fs.readFileSync(file, 'utf8');
}

test('the site card is the attached JPEG at 1200 by 630', async () => {
  const file = path.join(root, 'public', defaultPath);
  const bytes = fs.readFileSync(file);
  const meta = await sharp(bytes).metadata();
  assert.equal(meta.format, 'jpeg');
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  const copied = fs.readFileSync(path.join(root, 'dist', defaultPath));
  assert.deepEqual(copied, bytes);
});

test('the five main pages share one absolute default card', () => {
  for (const rel of [
    'index.html',
    'about/index.html',
    'projects/index.html',
    'essays/index.html',
    'links/index.html',
  ]) {
    const html = readDist(rel);
    assert.deepEqual(values(html, 'og:image'), [defaultUrl], rel);
    assert.deepEqual(values(html, 'twitter:image'), [defaultUrl], rel);
    assert.deepEqual(values(html, 'twitter:card'), ['summary_large_image'], rel);
    assert.deepEqual(values(html, 'og:image:width'), ['1200'], rel);
    assert.deepEqual(values(html, 'og:image:height'), ['630'], rel);
    assert.deepEqual(values(html, 'og:image:type'), ['image/jpeg'], rel);
    assert.deepEqual(values(html, 'og:image:alt'), [defaultAlt], rel);
    assert.deepEqual(values(html, 'twitter:image:alt'), [defaultAlt], rel);
  }
});

test('the not-found page does not advertise the site card', () => {
  const html = readDist('404.html');
  assert.deepEqual(values(html, 'og:image'), []);
  assert.deepEqual(values(html, 'twitter:image'), []);
  assert.deepEqual(values(html, 'og:image:width'), []);
  assert.deepEqual(values(html, 'og:image:alt'), []);
  assert.deepEqual(values(html, 'twitter:card'), ['summary']);
});

test('each essay keeps its own image and does not inherit default image details', () => {
  const postsDir = path.join(root, 'src/content/posts');
  const files = fs.readdirSync(postsDir).filter((name) => name.endsWith('.md'));
  assert.ok(files.length >= 11);
  let webp = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const markdown = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const image = markdown.match(/^image:\s*"?([^"\n]+)"?/m)?.[1];
    assert.ok(image, slug);
    const html = readDist(path.join('essays', slug, 'index.html'));
    const og = values(html, 'og:image');
    const twitter = values(html, 'twitter:image');
    assert.equal(og.length, 1, slug);
    assert.deepEqual(twitter, og, slug);
    assert.deepEqual(values(html, 'twitter:card'), ['summary_large_image'], slug);
    assert.equal(og[0].startsWith('https://ntemposd.me/'), true, og[0]);
    assert.notEqual(og[0], defaultUrl, slug);
    for (const key of ['og:image:width', 'og:image:height', 'og:image:type', 'og:image:alt', 'twitter:image:alt']) {
      assert.deepEqual(values(html, key), [], `${slug} ${key}`);
    }

    if (/\.(png|jpe?g|gif)$/i.test(image)) {
      assert.equal(og[0], new URL(image, 'https://ntemposd.me').href, slug);
    } else if (/\.webp$/i.test(image)) {
      webp += 1;
      assert.match(og[0], /^https:\/\/ntemposd\.me\/_astro\/.+\.webp$/, slug);
      const asset = og[0].slice('https://ntemposd.me'.length);
      assert.ok(fs.existsSync(path.join(root, 'dist', asset)), asset);
    } else {
      assert.fail(`${slug} has an unexpected cover ${image}`);
    }
  }

  assert.ok(webp >= 1, 'expected a WebP essay cover');
});
