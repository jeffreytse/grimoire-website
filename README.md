<div align="center">
  <a href="https://grimoire.jeffreytse.net">
    <img alt="grimoire" src="https://raw.githubusercontent.com/jeffreytse/grimoire/main/assets/banner.svg" width="700">
  </a>

  <p>The official documentation site for Grimoire —<br>the best practices skill system for AI coding assistants.</p>
  <br><h1>📖 Grimoire Website 📖</h1>
</div>

<p align="center">
  <a href="https://github.com/jeffreytse/grimoire-website/actions/workflows/pages.yml">
    <img src="https://github.com/jeffreytse/grimoire-website/actions/workflows/pages.yml/badge.svg"
      alt="Deploy to GitHub Pages" />
  </a>

  <a href="https://astro.build">
    <img src="https://img.shields.io/badge/built%20with-Astro-FF5D01"
      alt="Built with Astro" />
  </a>

  <a href="https://github.com/sponsors/jeffreytse">
    <img src="https://img.shields.io/static/v1?label=sponsor&message=%E2%9D%A4&logo=GitHub&link=&color=greygreen"
      alt="Donate (GitHub Sponsor)" />
  </a>

  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-greygreen.svg"
      alt="License: MIT" />
  </a>

  <a href="https://github.com/jeffreytse/grimoire">
    <img src="https://img.shields.io/badge/grimoire-main%20repo-blue"
      alt="Grimoire" />
  </a>
</p>

<div align="center">
  <h4>
    <a href="#-about">About</a> |
    <a href="#-development">Development</a> |
    <a href="#-project-structure">Structure</a> |
    <a href="#-contributing">Contributing</a> |
    <a href="#-license">License</a>
  </h4>
</div>

<div align="center">
  <sub>Built with ❤︎ by
  <a href="https://jeffreytse.net">jeffreytse</a> and
  <a href="https://github.com/jeffreytse/grimoire-website/graphs/contributors">contributors</a>
  </sub>
</div>
<br>

## 🌐 About

This is the source for [grimoire.jeffreytse.net](https://grimoire.jeffreytse.net) — the documentation and landing site for [Grimoire](https://github.com/jeffreytse/grimoire), a best practices skill system for AI coding assistants (Claude Code, GitHub Copilot CLI, Gemini CLI, OpenAI Codex, and more).

Built with [Astro](https://astro.build) and deployed to GitHub Pages.

## 🚀 Development

| Command          | Action                                     |
| :--------------- | :----------------------------------------- |
| `pnpm install`   | Install dependencies                       |
| `pnpm dev`       | Start local dev server at `localhost:4321` |
| `pnpm build`     | Build production site to `./dist/`         |
| `pnpm preview`   | Preview production build locally           |
| `pnpm astro ...` | Run Astro CLI commands                     |

## 📁 Project Structure

```text
/
├── public/                  # Static assets (favicon, robots.txt, sitemap)
├── src/
│   ├── components/          # Astro components (Nav, Footer, DomainsGrid, …)
│   ├── content/
│   │   └── docs/            # Markdown documentation pages
│   ├── layouts/             # Page layouts
│   ├── pages/               # Routes (index, claude, copilot, codex, gemini, …)
│   └── content.config.ts    # Content collection schema
├── astro.config.mjs
└── package.json
```

## 🤝 Contributing

1. Fork the repo
2. `pnpm install && pnpm dev`
3. Make changes — docs live in `src/content/docs/`, pages in `src/pages/`
4. `pnpm build` to verify no build errors
5. Open a pull request

See [CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md) for community guidelines.

## 📄 License

This project is licensed under the [MIT license](https://opensource.org/licenses/mit-license.php) © [Jeffrey Tse](https://jeffreytse.net)
