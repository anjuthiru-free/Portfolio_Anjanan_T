# Prime Renders — Portfolio Site

Static site for Anjanan Thirukkumar / Prime Renders.

## File structure
```
portfolio/
├── index.html     — page content & structure
├── style.css       — all styling
├── script.js       — nav, scroll effects, scrubber, portfolio admin
├── images/         — put photos & thumbnails here, reference as images/yourfile.jpg
├── videos/         — put video files here, reference as videos/yourfile.mp4
└── assets/         — icons, favicon, misc files
```

## Deploy on GitHub Pages
1. Create a new GitHub repo (e.g. `prime-renders`).
2. Upload everything inside this `portfolio/` folder to the repo root (index.html, style.css, script.js, and the three subfolders).
3. In the repo, go to **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
5. GitHub gives you a live URL like `https://yourusername.github.io/prime-renders/` within a minute or two.
6. To use your own domain: in **Settings → Pages**, add it under **Custom domain**, then create a `CNAME` record at your domain registrar pointing to `yourusername.github.io`. GitHub will auto-generate a `CNAME` file in your repo.

## Updating the site later
Just edit the files locally and re-upload (or `git push` if you clone the repo), same as any static site — no build step needed.

## Important note on the admin/portfolio-upload feature
The original file used a Claude-artifact-only `window.storage` API, which doesn't exist on a real website. I've swapped it for the browser's `localStorage` so the site still works standalone — but that means:

- Projects added through the **Admin** panel are saved **only in the browser/device where you added them**. Other visitors (or you, on a different device) won't see them.
- The admin passcode (`primerenders2026` in `script.js` — change it before sharing) is visible to anyone who views the page source. It's fine for casually hiding the "Add Project" button, but it is **not real security** — don't rely on it to protect anything sensitive.

**For a portfolio meant to look the same for every visitor**, the simplest fix is to skip the admin/localStorage flow entirely and hand-edit the `DEFAULT_PROJECTS` array near the top of the storage section in `script.js`, adding your projects directly, e.g.:
```js
const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    title: 'Summer Promo Reel',
    category: 'video',
    tag: '.MP4',
    desc: 'Short promotional edit for a local brand.',
    thumb: 'images/summer-promo-thumb.jpg',
    videoUrl: 'https://youtube.com/...',
    createdAt: Date.now()
  }
];
```
These always show for every visitor, with no admin login needed. If you want a real multi-device admin system later (add projects from your phone and have them show up for everyone), that needs a small backend — happy to help set one up (e.g. Firebase, Supabase) when you're ready.
