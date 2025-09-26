// Catch-all API route for all endpoints
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query, body } = req;
    const { slug } = query;
    
    // Construct the target URL
    const path = Array.isArray(slug) ? slug.join('/') : slug;
    let targetUrl = `${process.env.API_BASE_URL || 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1'}/${path}`;
    
    // Add query parameters
    const queryParams = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (key !== 'slug') {
        queryParams.append(key, query[key]);
      }
    });
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }
    
    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MaroKurukshetram-Web/1.0',
        'Accept': 'application/json',
        'X-Client-Type': req.headers['x-client-type'] || 'unknown',
        'X-User-Agent': req.headers['x-user-agent'] || req.headers['user-agent'] || 'unknown',
      },
    };

    // Add Authorization header if present
    if (req.headers.authorization) {
      requestOptions.headers['Authorization'] = req.headers.authorization;
    }

    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    console.log('Proxying request to:', targetUrl);
    console.log('Request method:', method);
    console.log('Request body:', body);
    console.log('Client type:', req.headers['x-client-type'] || 'unknown');
    console.log('User agent:', req.headers['user-agent'] || 'unknown');
    console.log('Original path:', path);
    console.log('Slug array:', slug);

    // Make the request to the external API
    const response = await fetch(targetUrl, requestOptions);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      // Try to parse error response as JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('Parsed error data:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON:', e);
        errorData = { message: errorText };
      }
      
      return res.status(response.status).json({
        error: 'API request failed',
        message: `API returned ${response.status}: ${response.statusText}`,
        status: response.status,
        type: 'API_ERROR',
        details: errorData
      });
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      status: 0,
      type: 'PROXY_ERROR'
    });
  }
}

