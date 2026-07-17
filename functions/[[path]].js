export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Let Cloudflare Pages serve static files (index.html, favicon.svg)
  if (path === '/' || path === '/index.html' || path === '/favicon.svg') {
    // Return without handling - let Pages serve the static file
    return context.next();
  }

  // Handle profile routes
  if (path.startsWith('/profile/')) {
    return context.next();
  }

  // Parse dimensions from path (e.g., /640/480)
  const parts = path.split('/').filter(Boolean);
  
  if (parts.length < 2) {
    return new Response('Invalid URL format. Use /width/height or /width/height?color=hex', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const width = parseInt(parts[0]);
  const height = parseInt(parts[1]);
  const color = url.searchParams.get('color') || 'cccccc';

  // Validate dimensions
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return new Response('Invalid dimensions. Width and height must be positive numbers.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Limit max dimensions to prevent abuse
  if (width > 4000 || height > 4000) {
    return new Response('Dimensions too large. Maximum is 4000x4000.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Generate SVG placeholder image
  const svg = generateSVG(width, height, color);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function generateSVG(width, height, color) {
  // Ensure color has # prefix
  const hexColor = color.startsWith('#') ? color : `#${color}`;
  
  // Calculate text color based on background brightness
  const textColor = getContrastColor(hexColor);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${hexColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 10}" 
        fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
    ${width} x ${height}
  </text>
</svg>`;
}

function getContrastColor(hexColor) {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
