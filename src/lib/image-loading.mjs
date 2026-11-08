/**
 * Native loading for content images.
 * One above-the-fold hero or the first cover stays eager at high priority.
 * Every other card or figure is lazy at normal priority so the browser can
 * still fetch images that are already in or near the viewport.
 */
export function contentImageLoading(primary) {
  return primary
    ? { loading: 'eager', fetchpriority: 'high' }
    : { loading: 'lazy', fetchpriority: 'auto' };
}
