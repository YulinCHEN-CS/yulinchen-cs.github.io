# yulinchen-cs.github.io

Personal site of Yulin (Stephen) Chen — built with Jekyll and served by GitHub Pages.

## Editing content

Almost everything lives in data files; you rarely need to touch HTML.

| What | Where |
| --- | --- |
| Name, email, links, portrait | `_config.yml` → `author` |
| "Updated …" date on the CV | `_config.yml` → `cv_updated` |
| Publications (home + CV) | `_data/publications.yml` |
| Education, experience, honours, skills | `_data/cv.yml` |
| Home page copy (About, Research, Contact) | `index.html` |
| Styles / dark mode / print | `assets/yc/site.css` |

To add a downloadable PDF CV, save it as `files/cv.pdf`; a "PDF" link appears on `/cv/` automatically.

## Structure

```
_layouts/yc.html        page shell
_includes/yc/           head, header, footer, publication + CV entry partials
index.html  cv.html  404.html
assets/yc/              site.css, site.js (theme toggle, BibTeX copy, hero figure), favicon
```

## Running locally

```bash
bundle install
bundle exec jekyll serve
```
