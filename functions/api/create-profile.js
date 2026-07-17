export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { name, width, height, color } = data;
    
    // Validate inputs
    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid profile name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const profileId = generateProfileId(name);
    
    // Store profile in KV (you'll need to bind a KV namespace)
    if (env.PROFILES) {
      await env.PROFILES.put(profileId, JSON.stringify({
        name,
        width: parseInt(width) || 800,
        height: parseInt(height) || 600,
        color: color || 'cccccc',
        createdAt: new Date().toISOString()
      }));
    } else {
      // Fallback: return URL without storage (for now)
      console.warn('KV namespace not bound, profile not stored');
    }
    
    const profileUrl = `${new URL(request.url).origin}/profile/${profileId}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      url: profileUrl,
      profileId 
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

function generateProfileId(name) {
  // Generate a short ID from the profile name
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${cleanName}-${randomSuffix}`;
}
