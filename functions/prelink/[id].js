export async function onRequestGet(context) {
  const { params, env, request } = context;
  const prelinkId = params.id;
  const url = new URL(request.url);
  
  try {
    // Fetch prelink from KV
    if (!env.PRELINKS) {
      return new Response('Prelink storage not configured', { status: 503 });
    }
    
    const prelinkData = await env.PRELINKS.get(prelinkId);
    
    if (!prelinkData) {
      return new Response('Prelink not found', { status: 404 });
    }
    
    const config = JSON.parse(prelinkData);
    
    // Allow query parameter overrides
    const text = url.searchParams.get('text') || config.text;
    const width = url.searchParams.get('width') || config.width;
    const height = url.searchParams.get('height') || config.height;
    const color = url.searchParams.get('color') || config.color;
    
    // If no defaults set and no overrides, return error
    if (!width || !height) {
      return new Response('This prelink requires width and height. Use ?width=800&height=600', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    // Generate SVG with settings
    const svg = generateSVG(parseInt(width), parseInt(height), color, text);
    
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response('Error loading prelink', { status: 500 });
  }
}

function generateSVG(width, height, color, text) {
  const hexColor = color ? (color.startsWith('#') ? color : `#${color}`) : '#cccccc';
  const textColor = getContrastColor(hexColor);
  const displayText = text || `${width} x ${height}`;
  const fontSize = text ? Math.min(width, height) / Math.max(text.length / 5, 5) : Math.min(width, height) / 10;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${hexColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" 
        fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
    ${displayText}
  </text>
</svg>`;
}

function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
