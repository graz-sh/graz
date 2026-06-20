# Cloudflare Pages Deployment Guide

## Node.js Version Issue

This project requires **Node.js 20.18.0 or higher**. By default, Cloudflare Pages may use Node.js 18, which causes the build to fail with this error:

```
ReferenceError: File is not defined
  at Object.<anonymous> (.../undici/lib/web/webidl/index.js:531:48)
```

## Required Configuration

### Set Environment Variable in Cloudflare Pages

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **Workers & Pages** → Your Pages project
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   - **Variable name**: `NODE_VERSION`
   - **Value**: `20.18.0`
   - **Environments**: Apply to both **Production** and **Preview**
5. Click **Save**
6. **Redeploy** your site (go to Deployments → Retry deployment)

### Build Configuration

The build settings in Cloudflare Pages should be:

- **Build command**: `pnpm --filter=docs run build:all`
- **Build output directory**: `docs/build`
- **Root directory**: (leave empty or set to root)

## Verification

After setting the `NODE_VERSION` environment variable, the build log should show:

```
Detected the following tools from environment: nodejs@20.18.0, pnpm@...
Installing nodejs 20.18.0
```

Instead of nodejs@18.20.8.

## Alternative: Use Cloudflare Wrangler (CLI)

If you prefer to deploy via CLI instead of automatic GitHub deployments:

```bash
# Install Wrangler
npm install -g wrangler

# Build the docs
pnpm --filter=docs run build:all

# Deploy to Cloudflare Pages
wrangler pages deploy docs/build --project-name=your-project-name
```

## Troubleshooting

If you still see Node.js 18 being used:

1. Double-check that the `NODE_VERSION` environment variable is set correctly
2. Make sure you've redeployed after setting the variable
3. Check the build logs to verify the Node.js version being detected
4. Clear Cloudflare's build cache by going to Settings → Advanced → Clear build cache

## Files That Specify Node Version

This repository has multiple files specifying the Node.js version:

- `.nvmrc` - for nvm users
- `.node-version` - for asdf and other version managers
- `package.json` - engines field (for package managers)

However, **Cloudflare Pages requires the environment variable** to work correctly.
