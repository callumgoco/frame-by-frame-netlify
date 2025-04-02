const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { comment, imagePath } = data;

    // Validate required fields
    if (!comment || comment.trim() === '') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Comment cannot be empty' })
      };
    }

    // Store the comment in Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('comments')
      .insert([{
        comment: comment.trim(),
        image_path: imagePath || null,
        timestamp: new Date().toISOString(),
        user_id: 1  // Default user ID
      }]);

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to save comment' })
      };
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('General error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Server error' })
    };
  }
}; 