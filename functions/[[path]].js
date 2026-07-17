export async function onRequest(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    // Let Cloudflare Pages serve static files (index.html, favicon.svg)
    if (path === '/' || path === '/index.html' || path === '/favicon.svg') {
      // Return without handling - let Pages serve the static file
      return context.next();
    }

    // Parse dimensions from path (e.g., /640/480 or /400 for square)
    const parts = path.split('/').filter(Boolean);
    
    if (parts.length < 1) {
      return new Response('Invalid URL format. Use /width or /width/height', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const width = parseInt(parts[0]);
    const height = parts.length >= 2 ? parseInt(parts[1]) : width;
    const color = url.searchParams.get('color') || 'cccccc';
    const text = url.searchParams.get('text') || null;
    const transparent = url.searchParams.get('transparent') === 'true';
    const textColor = url.searchParams.get('textColor') || null;

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
    const svg = generateSVG(width, height, color, text, transparent, textColor);

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

function generateSVG(width, height, color, text, transparent, textColor) {
  // Use transparent background if requested, otherwise use color
  const hexColor = transparent ? 'transparent' : normalizeColor(color);
  
  // Use custom text color if provided, otherwise calculate based on background
  const finalTextColor = textColor ? normalizeColor(textColor) : (transparent ? '#333333' : getContrastColor(hexColor));
  
  // Use custom text or default to dimensions
  const displayText = text || `${width} x ${height}`;
  
  // Adjust font size based on text length
  const fontSize = text ? Math.min(width, height) / Math.max(text.length / 5, 5) : Math.min(width, height) / 10;

  // Handle newlines in text
  const lines = displayText.split('\n');
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  const startY = 50 - ((totalHeight / height) * 50);

  const textElements = lines.map((line, i) => 
    `<text x="50%" y="${startY + (i * lineHeight / height * 100)}%" font-family="Arial, sans-serif" font-size="${fontSize}" 
        fill="${finalTextColor}" text-anchor="middle" dominant-baseline="middle">
    ${line}
  </text>`
  ).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${transparent ? '' : `<rect width="100%" height="100%" fill="${hexColor}"/>`}
  ${textElements}
</svg>`;
}

function normalizeColor(color) {
  if (!color) return '#cccccc';
  
  // Check if it's already a hex color
  if (color.startsWith('#')) return color;
  
  // Check if it's a CSS color name
  const cssColors = {
    'transparent': 'transparent',
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#008000',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'gray': '#808080',
    'grey': '#808080',
    'brown': '#a52a2a',
    'cyan': '#00ffff',
    'magenta': '#ff00ff',
    'lime': '#00ff00',
    'navy': '#000080',
    'teal': '#008080',
    'olive': '#808000',
    'maroon': '#800000',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
    'indigo': '#4b0082',
    'violet': '#ee82ee',
    'beige': '#f5f5dc',
    'coral': '#ff7f50',
    'crimson': '#dc143c',
    'darkblue': '#00008b',
    'darkgreen': '#006400',
    'darkred': '#8b0000',
    'lightblue': '#add8e6',
    'lightgreen': '#90ee90',
    'lightgray': '#d3d3d3',
    'lightgrey': '#d3d3d3',
    'darkgray': '#a9a9a9',
    'darkgrey': '#a9a9a9'
  };
  
  const lowerColor = color.toLowerCase();
  if (cssColors[lowerColor]) {
    return cssColors[lowerColor];
  }
  
  // Assume it's a hex color without the # prefix
  return `#${color}`;
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
