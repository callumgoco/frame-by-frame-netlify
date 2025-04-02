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
    'Content-Type': 'application/json'
  };

  // Only accept GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Query all comments from Supabase
    const { data: comments, error } = await supabase
      .from('comments')
      .select('comment')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error querying comments:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Database query failed' })
      };
    }

    // Extract just the comment text from each record
    const commentTexts = comments.map(c => c.comment);

    // Return the comments
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, comments: commentTexts })
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