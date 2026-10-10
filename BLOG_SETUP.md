# Jekyll blog + Pages CMS

The site is now a Jekyll project. Existing home/about content remains in HTML; blog posts are Markdown. Pages CMS is a separate editor that saves changes into GitHub. GitHub Pages builds and serves the public website.

## 1. Publish the test

Review and commit the changes, then push them to the `main` branch of `NateDaveHill/official-maranatha-website`.

In the repository, open **Settings → Pages**:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**
- Save.

Use branch publishing for this setup: it runs GitHub's built-in Jekyll build after repository changes, including CMS edits. If you currently use a static upload workflow, switch to branch publishing and disable that old workflow so it does not compete with this deployment. Do not add `.nojekyll`.

Watch the Pages build in **Actions**. The expected project URL is:

https://natedavehill.github.io/official-maranatha-website/blog/

This URL assumes the repository uses its default GitHub Pages domain. The sample post is dated 6 October 2026 and can be edited or removed.

## 2. Connect Pages CMS

1. Open https://app.pagescms.org and sign in with GitHub.
2. Install the Pages CMS GitHub App on the account that owns this repository; select just this repository when granting access.
3. Open `official-maranatha-website` and choose `main`.
4. The committed `.pages.yml` supplies the editor configuration.
5. Open **Blogbeiträge** to edit, create, or delete posts, or **Blogseite** to edit the blog heading and introduction.

Post fields: title, date, publication switch, author, summary, optional cover image/description, and a rich-text body. Images uploaded through the editor are committed into `assets/uploads/`.

Save a test edit, wait for the Pages build, then reload the public blog. Saving to `main` publishes after a successful build. Turning **Veröffentlicht** off writes `published: false`, which excludes the post from the public site. Check this switch explicitly for every new post. Unpublished files remain in the Git repository and are readable if it is public.

Posts with future dates are excluded until a build occurs on or after their date. This setup does not automatically schedule daily builds. Use today's date when publishing immediately.

To let another editor contribute, grant the appropriate repository access and have them sign in to Pages CMS, or use Pages CMS collaborator invitations. Do not place access tokens in the website.

## 3. Local preview

Use a current Ruby installation (Ruby 3.3 or newer) and Bundler, rather than macOS's old system Ruby:

```sh
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000/official-maranatha-website/blog/ . A plain static server or opening the HTML file directly cannot render Jekyll templates.

To check a production build:

```sh
bundle exec jekyll build --strict_front_matter
```

## 4. Files to know

- `_config.yml`: Jekyll configuration, URL, base path, post layout defaults.
- `.pages.yml`: CMS forms and upload paths.
- `_posts/YYYY-MM-DD-title.md`: Markdown posts with YAML frontmatter.
- `_data/blog.yml`: editable blog heading and introduction.
- `blog/index.html`: list of published posts.
- `_layouts/blog.html`, `_layouts/post.html`: blog and post templates.
- `assets/blog.css`: responsive blog styling.
- `_includes/footer.html`: shared footer for all pages.

New posts get a dated filename automatically; the CMS date field controls publication date. No custom layout field is needed because Jekyll applies the post layout through `_config.yml`.

## Languages and unlisted testing

All pages share `_includes/header.html` with DE / EN / RU buttons. Translation data is embedded at build time; there is no runtime translation fetch or loading overlay. `_data/translations.json` is the single source for homepage, imprint, navigation, and footer translations: each key contains `de`, `en`, and `ru`. Edit `_data/translations.json` directly.

Russian translations are an initial draft, including informational translations of the existing legal text. Scripture wording is translated from the existing German text, not attributed to a Russian Bible edition. Have a Russian speaker review it before public release.

Blog heading/introduction translations are in `_data/blog.yml` and editable under Blogseite. Posts keep German title/description/body and optional `title_en`, `description_en`, `body_en`, `title_ru`, `description_ru`, `body_ru` fields, all available in Pages CMS. Missing translations fall back to German. The sample post has all three languages. Choosing a language updates the document language, URL, navigation links, and saved preference.

The Blog link opens a coming-soon page with a temporary password popup. `_data/blog-access.yml` sets the throwaway password. An empty password disables unlocking. This is a VISUAL GATE ONLY: posts are built publicly and can be read in the page source. Never use a real account password or confidential content. The gate covers blog and post pages, and remembers access for the current browser tab via sessionStorage.

Local preview of the actual blog:

```sh
bundle exec jekyll serve --config _config.yml,_config.preview.yml
```

When ready to publish: set `blog_public: true` and remove the robots meta tag from `_layouts/blog.html`.

Jekyll is required: it renders shared includes, templates, translation data, and Markdown posts. The root footer compatibility page and old translation JSON endpoint have been removed because the site no longer uses them. `_data/translations.json` and `_includes/footer.html` are the sources to edit.

## 5. If you use a custom domain

Before publishing on a root custom domain, change `_config.yml` to use that domain as `url` and set `baseurl: ""`. Change `.pages.yml` media output to `/assets/uploads`. Update image URLs in existing posts (including inline images) that contain the old repository prefix. Keep any existing GitHub Pages custom-domain/CNAME settings.

## Official references

- https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll
- https://pagescms.org/docs/quick-start/
- https://pagescms.org/docs/configuration/content/
