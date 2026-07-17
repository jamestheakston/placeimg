export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const name = url.searchParams.get('name');
  
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  if (!cleanName) {
    return new Response(JSON.stringify({ error: 'Invalid name' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    let available = true;
    let suggestions = [];
    
    if (env.PRELINKS) {
      const existing = await env.PRELINKS.get(cleanName);
      available = !existing;
      
      if (!available) {
        suggestions = generateSuggestions(cleanName);
      }
    } else {
      // If KV not bound, assume available (for development)
      console.warn('KV namespace not bound, assuming name available');
    }
    
    return new Response(JSON.stringify({ available, suggestions }), {
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
