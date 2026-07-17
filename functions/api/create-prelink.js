export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { name, text, width, height, color } = data;
    
    // Validate name
    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid prelink name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Clean the name
    const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    if (!cleanName) {
      return new Response(JSON.stringify({ error: 'Invalid name - must contain letters or numbers' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check if name already exists
    if (env.PRELINKS) {
      const existing = await env.PRELINKS.get(cleanName);
      if (existing) {
        // Generate suggestions
        const suggestions = generateSuggestions(cleanName);
        return new Response(JSON.stringify({ error: 'Name already taken', suggestions }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Store prelink
      await env.PRELINKS.put(cleanName, JSON.stringify({
        text: text || null,
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
        color: color || null,
        createdAt: new Date().toISOString()
      }));
    } else {
      console.warn('KV namespace not bound, prelink not stored');
    }
    
    const prelinkUrl = `${new URL(request.url).origin}/prelink/${cleanName}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      url: prelinkUrl,
      name: cleanName 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function generateSuggestions(name) {
  const suggestions = [];
  const suffixes = ['1', '2', '3', '-link', '-img', '-placeholder', '-2024'];
  
  for (const suffix of suffixes) {
    suggestions.push(`${name}${suffix}`);
    if (suggestions.length >= 3) break;
  }
  
  return suggestions;
}
