export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Serve the landing page for root
  if (path === '/' || path === '/index.html') {
    return new Response(getLandingPage(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
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

function getLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Placeimg - Free Placeholder Images</title>
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        h1 {
            color: #333;
        }

        p {
            color: #666;
        }

        section {
            background-color: #fff;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
        }

        a {
            color: #007BFF;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <section class="hero">
            <h1>Placeimg</h1>
            <p>Placeimg is a free service that provides placeholder images for web development and design. It's super easy to use and perfect for AI agents to provide placeholders for content in web applications. Once you've replaced the image with the actual path, you're good to go.</p>
        </section>

        <section class="usage">
            <h2>How to Use</h2>
            <table class="usage-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Example URL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Square</td>
                        <td><a href="/640/640" target="_blank">/640/640</a></td>
                    </tr>
                    <tr>
                        <td>Landscape</td>
                        <td><a href="/800/600" target="_blank">/800/600</a></td>
                    </tr>
                    <tr>
                        <td>Custom Color</td>
                        <td><a href="/640/480?color=333333" target="_blank">/640/480?color=333333</a></td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</body>
</html>`;
}
