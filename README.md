# Placeimg

A free placeholder image service built with Cloudflare Workers. Generate placeholder images on the fly with custom dimensions and colors.

## Features

- Dynamic placeholder image generation
- Custom dimensions (width x height)
- Custom background colors via URL parameter
- SVG format for crisp scaling
- Automatic text color contrast
- CDN caching for fast delivery

## Usage

### Basic Usage

```
/width/height
```

Examples:
- `/640/640` - 640x640 square image
- `/800/600` - 800x600 landscape image
- `/1920/1080` - 1920x1080 HD image

### Custom Colors

```
/width/height?color=hex
```

Examples:
- `/640/480?color=333333` - Dark gray background
- `/800/600?color=ff0000` - Red background
- `/500/500?color=00ff00` - Green background

## Development

### Prerequisites

- Node.js 18+
- Wrangler CLI

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start local development server:
```bash
npm run dev
```

3. Visit `http://localhost:8787` to test

## Deployment

### Deploy to Cloudflare Workers

1. Login to Cloudflare:
```bash
npx wrangler login
```

2. Deploy:
```bash
npm run deploy
```

3. Update your custom domain in `wrangler.toml` if needed

### Custom Domain

To use a custom domain like `placeimg.pages.dev`:

1. Add your domain in Cloudflare dashboard
2. Update `wrangler.toml` with your route pattern
3. Deploy again

## API Limits

- Maximum dimensions: 4000x4000
- Minimum dimensions: 1x1
- Cache duration: 1 year

## License

MIT
