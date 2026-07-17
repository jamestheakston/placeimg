function getErrorHTML(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Placeimg</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .error-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
        }
        .error-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            color: #ef4444;
        }
        .error-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 12px 0;
        }
        .error-message {
            font-size: 14px;
            color: #666;
            margin: 0;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2 class="error-title">Just one small problem with that...</h2>
        <p class="error-message">${message}</p>
    </div>
</body>
</html>`;
}

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
    // Also supports /bgcolor/textcolor format
    // Also supports format extension like /640/480.png
    const parts = path.split('/').filter(Boolean);
    
    if (parts.length < 1) {
      return new Response(getErrorHTML('Invalid URL', 'Use /width or /width/height format'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check for format extension (e.g., .png, .jpg)
    let format = 'svg';
    const lastPart = parts[parts.length - 1];
    const formatMatch = lastPart.match(/(\.(png|jpg|jpeg|gif|webp|avif))$/i);
    if (formatMatch) {
      format = formatMatch[1].replace('.', '').toLowerCase();
      parts[parts.length - 1] = lastPart.replace(formatMatch[0], '');
    }

    // Check for retina scale (e.g., @2x, @3x)
    let scale = 1;
    const scaleMatch = parts[parts.length - 1].match(/@(\d)x$/i);
    if (scaleMatch) {
      scale = parseInt(scaleMatch[1]);
      parts[parts.length - 1] = parts[parts.length - 1].replace(scaleMatch[0], '');
    }

    // Check if first part is a dimension (number) or a color
    const firstPart = parseInt(parts[0]);
    let width, height, color, textColor, text, transparent, font;

    if (isNaN(firstPart)) {
      // Format: /bgcolor/textcolor
      color = parts[0];
      textColor = parts[1] || null;
      width = 800;
      height = 600;
      text = url.searchParams.get('text') || null;
      transparent = url.searchParams.get('transparent') === 'true';
      font = url.searchParams.get('font') || 'Arial';
    } else {
      // Format: /width or /width/height
      width = firstPart;
      height = parts.length >= 2 ? parseInt(parts[1]) : width;
      color = url.searchParams.get('color') || 'cccccc';
      text = url.searchParams.get('text') || null;
      transparent = url.searchParams.get('transparent') === 'true';
      textColor = url.searchParams.get('textColor') || null;
      font = url.searchParams.get('font') || 'Arial';
    }

    // Apply retina scale
    width = width * scale;
    height = height * scale;

    // Validate dimensions
    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) {
      return new Response(getErrorHTML('Invalid dimensions', 'Width and height must be positive numbers between 1 and 4000.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Limit max dimensions to prevent abuse
    if (width > 4000 || height > 4000) {
      return new Response(getErrorHTML('Dimensions too large', 'Maximum image size is 4000x4000 pixels. Please use smaller dimensions.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Generate SVG placeholder image
    const svg = generateSVG(width, height, color, text.replace(/\\n/g, '\n'), transparent, textColor, font);

    // Return SVG directly or convert to other format
    if (format === 'svg') {
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // For other formats, we'll need to convert SVG to raster
      // Since Cloudflare Workers don't have built-in image conversion,
      // we'll return the SVG with the appropriate Content-Type for now
      // In a production environment, you'd use a service like Cloudflare Images or an external API
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
          'X-Requested-Format': format,
        },
      });
    }
  } catch (error) {
    return new Response(getErrorHTML('Something went wrong', error.message), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function getErrorHTML(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Placeimg</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .error-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
        }
        .error-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            color: #ef4444;
        }
        .error-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 12px 0;
        }
        .error-message {
            font-size: 14px;
            color: #666;
            margin: 0;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2 class="error-title">Just one small problem with that...</h2>
        <p class="error-message">${message}</p>
    </div>
</body>
</html>`;
}

function generateSVG(width, height, color, text, transparent, textColor, font) {
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
    `<text x="50%" y="${startY + (i * lineHeight / height * 100)}%" font-family="${font}, Arial, sans-serif" font-size="${fontSize}" 
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
