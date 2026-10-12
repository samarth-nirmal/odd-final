# ODD MANGO — Photography & Film Portfolio

A bespoke, immersive portfolio website for ODD MANGO showcasing photography, motion direction, and sound-driven visual storytelling.

## Deploying to GitHub Pages

You have two easy ways to deploy this portfolio to GitHub Pages:

### Method 1: Automatic Deployment via GitHub Actions (Recommended)

1. Push this repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. That's it! Every time you push changes to `main` (or `master`), GitHub Actions will automatically build and publish your site at:
   ```
   https://<your-username>.github.io/<repository-name>/
   ```

### Method 2: Manual Deployment with `npm run deploy`

1. If you haven't already, install dependencies:
   ```bash
   npm install
   ```
2. Run the deploy command:
   ```bash
   npm run deploy
   ```
3. In your GitHub repository **Settings** → **Pages**, set the branch to `gh-pages` and root folder `/`.

## Local Development

```bash
# Start local dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
