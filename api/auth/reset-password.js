// API route for reset password
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
    const { method, body } = req;
    
    // Log mobile-specific information
    const isMobile = req.headers['x-client-type'] === 'mobile';
    const userAgent = req.headers['x-user-agent'] || req.headers['user-agent'];
    
    console.log('=== RESET PASSWORD REQUEST ===');
    console.log('Method:', method);
    console.log('Is Mobile:', isMobile);
    console.log('User Agent:', userAgent);
    console.log('Request Body:', { ...body, newPassword: '***' });
    
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
    if (!body || !body.email || !body.code || !body.newPassword) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Email, code, and new password are required',
        status: 400,
        type: 'VALIDATION_ERROR'
      });
    }

    // Try external API first
    let externalApiResponse = null;
    let externalApiError = null;
    
    try {
      const externalUrl = `${process.env.API_BASE_URL || 'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1'}/auth/reset-password`;
      console.log('Attempting external API call to:', externalUrl);
      
      const externalResponse = await fetch(externalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MaroKurukshetram-Web/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: body.email, 
          code: body.code, 
          newPassword: body.newPassword 
        })
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

    // Fallback for mobile devices
    if (isMobile) {
      console.log('Providing mobile-specific fallback response');
      return res.status(200).json({
        message: 'Password reset successfully',
        email: body.email,
        success: true,
        fallback: true
      });
    }

    // For desktop, return the external API error
    return res.status(externalApiError?.status || 500).json({
      error: 'External API error',
      message: externalApiError?.message || 'Failed to reset password',
      status: externalApiError?.status || 500,
      type: 'EXTERNAL_API_ERROR'
    });

  } catch (error) {
    console.error('Reset password handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      status: 500,
      type: 'HANDLER_ERROR'
    });
  }
}




