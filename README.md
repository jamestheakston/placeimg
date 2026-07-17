# Placeimg

A free placeholder image service built with Cloudflare Pages Functions. Generate placeholder images on the fly with custom dimensions and colors.

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

### Local Testing

To test locally with Wrangler:
```bash
npx wrangler pages dev
```

Visit `http://localhost:8787` to test

## Deployment

### Deploy to Cloudflare Pages

1. Push your code to GitHub
2. Go to Cloudflare Dashboard → Pages → Create a project
3. Connect your GitHub repository
4. Build settings:
   - Build command: (leave empty)
   - Build output directory: (leave empty)
5. Deploy

Or use Wrangler CLI:

```bash
npx wrangler pages deploy
```

### Custom Domain

To use a custom domain like `placeimg.pages.dev`:

1. Go to your Pages project in Cloudflare Dashboard
2. Click "Custom domains"
3. Add your domain
4. Follow DNS instructions

## API Limits

- Maximum dimensions: 4000x4000
- Minimum dimensions: 1x1
- Cache duration: 1 year

## License

MIT
