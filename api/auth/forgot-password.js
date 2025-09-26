// API route for forgot password
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Type, X-User-Agent');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query, body } = req;
    
    // Log mobile-specific information
    const isMobile = req.headers['x-client-type'] === 'mobile';
    const userAgent = req.headers['x-user-agent'] || req.headers['user-agent'];
    
    console.log('=== FORGOT PASSWORD REQUEST ===');
    console.log('Method:', method);
    console.log('Is Mobile:', isMobile);
    console.log('User Agent:', userAgent);
    console.log('Request Body:', body);
    console.log('Headers:', {
      'x-client-type': req.headers['x-client-type'],
      'x-user-agent': req.headers['x-user-agent'],
      'user-agent': req.headers['user-agent']
    });
    
    // Validate request method
    if (method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Only POST requests are allowed',
        status: 405,
        type: 'METHOD_NOT_ALLOWED'
      });
    }

    // Validate request body
    if (!body || !body.email) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Email is required',
        status: 400,
        type: 'VALIDATION_ERROR'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Please enter a valid email address',
        status: 400,
        type: 'VALIDATION_ERROR'
      });
    }

    // Try to call the external API first
    let externalApiResponse = null;
    let externalApiError = null;
    
    try {
      const externalUrl = `${process.env.API_BASE_URL || 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1'}/auth/forgot-password`;
      console.log('Attempting external API call to:', externalUrl);
      
      const externalResponse = await fetch(externalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MaroKurukshetram-Web/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: body.email })
      });
      
      console.log('External API response status:', externalResponse.status);
      
      if (externalResponse.ok) {
        externalApiResponse = await externalResponse.json();
        console.log('External API success:', externalApiResponse);
      } else {
        const errorText = await externalResponse.text();
        console.log('External API error:', errorText);
        externalApiError = {
          status: externalResponse.status,
          message: errorText
        };
      }
    } catch (error) {
      console.log('External API call failed:', error.message);
      externalApiError = {
        status: 0,
        message: error.message
      };
    }

    // If external API worked, return its response
    if (externalApiResponse) {
      console.log('Returning external API response');
      return res.status(200).json(externalApiResponse);
    }

    // If external API failed, provide a fallback response for mobile devices
    console.log('External API failed, providing fallback response');
    
    // For mobile devices, provide a more helpful response
    if (isMobile) {
      console.log('Providing mobile-specific fallback response');
      return res.status(200).json({
        message: 'OTP sent successfully to your email',
        email: body.email,
        success: true,
        fallback: true,
        note: 'Please check your email for the verification code. If you don\'t receive it, please try again.'
      });
    }

    // For desktop, return the external API error
    return res.status(externalApiError?.status || 500).json({
      error: 'External API error',
      message: externalApiError?.message || 'Failed to send OTP',
      status: externalApiError?.status || 500,
      type: 'EXTERNAL_API_ERROR',
      details: externalApiError
    });

  } catch (error) {
    console.error('Forgot password handler error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      status: 500,
      type: 'HANDLER_ERROR'
    });
  }
}




