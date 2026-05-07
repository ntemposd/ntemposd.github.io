# ntemposd.me

Personal website built with Astro, using Notion as a headless CMS.

**Live site:** [https://ntemposd.me](https://ntemposd.me)

---

## Overview

This project implements a Notion-powered content pipeline:

- Writing and structured content are managed in Notion
- Posts and projects are transformed into Markdown
- Experience and working data are synced into local JSON files
- Astro compiles everything into a static site during build time

---

## System Design

A custom sync layer connects Notion to the site:

- Fetches structured content from Notion databases
- Transforms Notion blocks into Markdown
- Downloads and caches assets locally
- Generates Astro content or local JSON data depending on the content type

This allows Notion to act as a CMS while keeping the site fully static.

---

## ✨ Features

- 📝 **Notion CMS** - Posts, projects, experience, and working data sync from Notion databases via API
- 🖼️ **Image handling** - Downloads and caches images locally, preserves Notion captions as Markdown alt text
- 💼 **About page data sync** - Latest experience renders with date ranges, and craftsmanship cards are populated from a dedicated Notion database
- 🌓 **Dark mode** - System preference detection with manual toggle, persists to localStorage
- 📱 **Responsive nav** - Mobile hamburger menu, desktop horizontal nav
- 📧 **ButtonDown embed** - Newsletter subscription iframe on post pages
- 🎨 **Tailwind CSS** - Responsive styling with typography plugin for prose content
- 🔍 **SEO basics** - Sitemap generation and Open Graph meta tags

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19+ (recommended)
- npm or pnpm
- A Notion account with API integration

### 1. Clone and Install

```bash
git clone https://github.com/ntemposd/myastro.git
cd myastro
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Notion API
NOTION_SECRET=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_POSTS_DB_ID=your-posts-database-id
NOTION_PROJECTS_DB_ID=your-projects-database-id
NOTION_EXPERIENCE_DB_ID=your-experience-database-id
NOTION_WORKING_DB_ID=your-working-database-id

# Optional: customize date property name
NOTION_POSTS_DATE_PROP=Date
NOTION_POSTS_STRICT_DATE=true

# Site configuration (local .env)
SITE_BASE_URL=http://localhost:4321

# Optional: Google Analytics (only if you use GA)
PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Set Up Notion Databases

Create four Notion databases with the following structures:

#### Posts Database

- `Title` (title)
- `Published` (checkbox) or `Status` (select: "Published")
- `Date` (date)
- `Excerpt` (text)
- `Tags` (multi-select)
- `Slug` (text, optional - auto-generated from title if empty)
- `Image` (files or URL, optional)

#### Projects Database

- `Name` (title)
- `Type` (select)
- `Published` (checkbox)
- `Excerpt` (text)
- `Tags` (multi-select)
- `Link` (URL)
- `Image` (files or URL)

#### Experience Database

- `Role` (title)
- `Company` (text)
- `Start` (date)
- `End` (date, optional - leave empty for current)
- `Description` (text)
- `Location` (text, optional)

#### Working Database

- `Skill` (title or text)
- `Tools` (multi-select preferred, rich text also supported)
- `Description` (text)
- `Order` (number, optional)

### 4. Get Notion API Credentials

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration and copy the "Internal Integration Token"
3. Share your databases with the integration
4. Copy each database ID from the URL (the part after the workspace name and before the `?`)

### 5. Run Development Server

```bash
npm run dev
```

Opens at `http://localhost:4321`

---

## 📁 Project Structure

```
myastro/
├── public/    # Static assets served directly
│   ├── posts/    # Copied images for dev (avoid 404s)
│   └── robots.txt
├── scripts/    # Notion sync scripts
│   ├── sync-posts.ts
│   ├── sync-projects.ts
│   ├── sync-experience.ts
│   └── sync-working.ts
├── src/
│   ├── assets/    # Bundled images (hashed in prod)
│   │   ├── posts/
│   │   └── projects/
│   ├── components/
│   │   ├── Share.astro    # Social sharing buttons
│   │   └── MailingListSubscribe.astro    # Newsletter embed
│   ├── content/    # Content collections
│   │   ├── config.ts
│   │   ├── posts/    # Synced from Notion
│   │   ├── projects/
│   │   └── experience/
│   ├── data/
│   │   └── working/    # Synced JSON used by the about page craftsmanship section
│   ├── layouts/
│   │   └── Layout.astro    # Base layout with SEO
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── projects.astro
│   │   └── writing/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       └── global.css
└── package.json
```

---

## 🧞 Commands

| Command                | Action                               |
| :--------------------- | :----------------------------------- |
| `npm install`          | Install dependencies                 |
| `npm run dev`          | Start dev server + sync content      |
| `npm run build`        | Build production site + sync content |
| `npm run preview`      | Preview production build locally     |
| `npm run sync:content` | Sync all content from Notion         |
| `npm run sync:posts`   | Sync posts only                      |
| `npm run sync:working` | Sync working/craftsmanship data only |
| `npm run format`       | Format code with Prettier            |

---

## 🔄 Content Sync Workflow

Content is automatically synced from Notion during `dev` and `build`. To manually sync:

```bash
npm run sync:content
```

**How it works:**

1. Fetches entries from the posts, projects, experience, and working Notion databases via API
2. Downloads post and project images to `src/assets/...` and `public/posts/`
3. Converts post content blocks to Markdown using `notion-to-md`
4. Writes Markdown content to `src/content/posts/` and `src/content/projects/`
5. Writes ordered JSON data to `src/content/experience/_ordered.json` and `src/data/working/_ordered.json`

**Note:** Image captions from Notion sync as Markdown alt text (`![caption](url)`). The `public/posts/` copy prevents 404s during development before client-side URL rewriting kicks in.

---

## 🎨 Customization

### Update Site Metadata

Edit `src/layouts/Layout.astro` to change:

- Site title and description
- Open Graph images
- Google Analytics ID

### Styling

- Global styles: `src/styles/global.css`
- Tailwind config: `tailwind.config.ts`
- Typography (prose): Configured via `@tailwindcss/typography`

### ButtonDown Integration

1. Update your ButtonDown username in `src/components/MailingListSubscribe.astro`
2. The embed iframe will load from `https://buttondown.com/api/emails/embed-subscribe/[username]`

---

## 🚢 Deployment

Automatically deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

### Setup GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Configure repository secrets and variables (see below)

### GitHub Secrets (Settings → Secrets → Actions)

- `NOTION_SECRET`
- `NOTION_POSTS_DB_ID`
- `NOTION_PROJECTS_DB_ID`
- `NOTION_EXPERIENCE_DB_ID`
- `NOTION_WORKING_DB_ID`
- `PUBLIC_GA_ID` (optional)

### GitHub Repository Variables (Settings → Environments → github-pages → Variables)

- `SITE_BASE_URL` (live URL, e.g., `https://<user>.github.io/<repo>` or your custom domain)

Push to `main` triggers automatic build and deploy.

---

## 🙋 Questions?

Feel free to open an issue or reach out via [ntemposd.me](https://ntemposd.me)

## 🙋 License

MIT
