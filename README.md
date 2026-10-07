# yulinchen-cs.github.io

Personal site of Yulin (Stephen) Chen — built with Jekyll and served by GitHub Pages.

## Editing content

The site is bilingual: English at `/` (default) and Chinese at `/zh/`, linked by the
EN / 中文 switch in the header. Both languages share the same templates.

| What | Where |
| --- | --- |
| Email, links, Google Scholar, portrait | `_config.yml` → `author` |
| Home page copy, UI labels, "Updated …" date (both languages) | `_data/i18n.yml` |
| Publications (home + CV); `finding_zh` / `summary_zh` for Chinese | `_data/publications.yml` |
| CV entries — English / Chinese | `_data/cv.yml` / `_data/cv_zh.yml` |
| Styles / dark mode / print / Chinese typography | `assets/yc/site.css` |

When you change something in English, update the Chinese counterpart too.
To add a downloadable PDF CV, save it as `files/cv.pdf`; a "PDF" link appears on both CV pages automatically.

## Structure

```
_layouts/yc.html          page shell
_includes/yc/lang.html    works out the current language and its strings
_includes/yc/home.html    home page body     ← index.html, zh/index.html
_includes/yc/cv.html      CV page body       ← cv.html, zh/cv.html
_includes/yc/             head, header, footer, publication + CV entry partials
assets/yc/                site.css, site.js (theme toggle, BibTeX copy, hero figure), favicon
```

## Running locally

```bash
bundle install
bundle exec jekyll serve
```
