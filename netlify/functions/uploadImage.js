const { createClient } = require('@supabase/supabase-js');
const multipart = require('parse-multipart-data');
const { v4: uuidv4 } = require('uuid');

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // Parse the multipart form data
    const boundary = multipart.getBoundary(event.headers['content-type']);
    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary);
    
    // Find the file part
    const filePart = parts.find(part => part.name === 'image');
    
    if (!filePart) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'No file uploaded' })
      };
    }

    // Get the file metadata
    const fileData = filePart.data;
    const fileName = filePart.filename;
    
    // Check file type
    const fileType = filePart.type;
    if (!['image/jpeg', 'image/png'].includes(fileType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid file type. Only JPEG and PNG are supported.' })
      };
    }

    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    
    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('uploads')
      .upload(uniqueFileName, fileData, {
        contentType: fileType,
        cacheControl: '3600'
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to upload file to storage' })
      };
    }

    // Get the public URL for the uploaded file
    const { data: { publicURL } } = supabase
      .storage
      .from('uploads')
      .getPublicUrl(uniqueFileName);

    // Store metadata in the database
    const { data: dbData, error: dbError } = await supabase
      .from('uploads')
      .insert([{
        file_path: publicURL,
        timestamp: new Date().toISOString(),
        result_path: null,
        user_id: 1, // Default user ID
        file_size: fileData.length,
        status: 'pending',
        file_type: fileType
      }]);

    if (dbError) {
      console.error('Database insert error:', dbError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to save file metadata to database' })
      };
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'File uploaded successfully!',
        file: publicURL
      })
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