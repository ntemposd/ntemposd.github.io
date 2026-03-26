# ntemposd.me

Personal website built with Astro, using Notion as a headless CMS.

**Live site:** [https://ntemposd.me](https://ntemposd.me)

---

## Overview

This project implements a content pipeline:

- Content is created and managed in Notion  
- Fetched via the Notion API  
- Transformed into Markdown  
- Compiled into a static site during build time  

---

## System Design

A custom sync layer connects Notion to the site:

- Fetches structured content from Notion databases  
- Transforms Notion blocks into Markdown  
- Downloads and caches assets locally  
- Generates content collections for Astro  

This allows Notion to act as a CMS while keeping the site fully static.

---

## ✨ Features

- 📝 **Notion CMS** - Posts, projects, and experience sync from Notion databases via API
- 🖼️ **Image handling** - Downloads and caches images locally, preserves Notion captions as Markdown alt text
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

# Optional: customize date property name
NOTION_POSTS_DATE_PROP=Date
NOTION_POSTS_STRICT_DATE=true

# Site configuration (local .env)
SITE_BASE_URL=http://localhost:4321

# Optional: Google Analytics (only if you use GA)
PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Set Up Notion Databases

Create three Notion databases with the following structures:

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
│   └── sync-experience.ts
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

| Command                | Action                                              |
|:-----------------------|:----------------------------------------------------|
| `npm install`          | Install dependencies                                |
| `npm run dev`          | Start dev server + sync content                     |
| `npm run build`        | Build production site + sync content                |
| `npm run preview`      | Preview production build locally                    |
| `npm run sync:content` | Sync all content from Notion                        |
| `npm run sync:posts`   | Sync posts only                                     |
| `npm run format`       | Format code with Prettier                           |

---

## 🔄 Content Sync Workflow

Content is automatically synced from Notion during `dev` and `build`. To manually sync:

```bash
npm run sync:content
```

**How it works:**
1. Fetches published entries from Notion databases via API
2. Downloads images to `src/assets/posts/` and `public/posts/`
3. Converts Notion blocks to Markdown using `notion-to-md`
4. Generates frontmatter from database properties
5. Writes `.md` files to `src/content/posts/`

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
- `PUBLIC_GA_ID` (optional)

### GitHub Repository Variables (Settings → Environments → github-pages → Variables)

- `SITE_BASE_URL` (live URL, e.g., `https://<user>.github.io/<repo>` or your custom domain)

Push to `main` triggers automatic build and deploy.

---

## 🙋 Questions?

Feel free to open an issue or reach out via [ntemposd.me](https://ntemposd.me)

## 🙋 License

MIT
