export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    if (!targetUrl) {
      return new Response('Missing ?url= parameter', { status: 400 })
    }

    try {
      // Decode the URL if it's encoded
      const decodedUrl = decodeURIComponent(targetUrl)

      const response = await fetch(decodedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'identity',
          'Referer': decodedUrl,
          'Origin': request.headers.get('Origin') || '*'
        },
        redirect: 'follow'
      })

      // Clone the response headers
      const newHeaders = new Headers(response.headers)

      // Force CORS headers
      newHeaders.set('Access-Control-Allow-Origin', '*')
      newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      newHeaders.set('Access-Control-Allow-Headers', '*')
      newHeaders.set('Access-Control-Expose-Headers', '*')

      // Remove problematic headers
      newHeaders.delete('content-security-policy')
      newHeaders.delete('content-security-policy-report-only')
      newHeaders.delete('clear-site-data')
      newHeaders.delete('x-frame-options')

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
    } catch (err) {
      return new Response(JSON.stringify({
        error: 'Proxy error',
        message: err.message,
        url: targetUrl
      }), { 
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  }
}
