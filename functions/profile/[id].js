export async function onRequestGet(context) {
  const { params, env } = context;
  const profileId = params.id;
  
  try {
    // Fetch profile from KV
    if (!env.PROFILES) {
      return new Response('Profile storage not configured', { status: 503 });
    }
    
    const profileData = await env.PROFILES.get(profileId);
    
    if (!profileData) {
      return new Response('Profile not found', { status: 404 });
    }
    
    const profile = JSON.parse(profileData);
    
    // Generate SVG with profile settings
    const svg = generateSVG(profile.width, profile.height, profile.color);
    
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response('Error loading profile', { status: 500 });
  }
}

function generateSVG(width, height, color) {
  const hexColor = color.startsWith('#') ? color : `#${color}`;
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
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
