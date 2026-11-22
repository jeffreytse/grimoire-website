// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Docs are authored with repo-relative links (`./config.md#anchor`) so they
// also work on GitHub. Rewrite them to site routes (`/docs/config/#anchor`).
function remarkDocsLinks() {
  const MD_LINK = /^(?:\.\/)?([\w-]+)\.md(#[\w-]+)?$/;
  /** @param {any} node */
  const walk = (node) => {
    if (node.type === 'link' && typeof node.url === 'string') {
      const m = node.url.match(MD_LINK);
      if (m) node.url = `/docs/${m[1]}/${m[2] ?? ''}`;
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };
  return walk;
}

export default defineConfig({
  site: 'https://grimoire.jeffreytse.net',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkDocsLinks],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
