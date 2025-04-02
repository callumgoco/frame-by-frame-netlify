const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Array of valid art styles
const validStyles = ['Synthetic_Cubism', 'Impressionism', 'Pop_Art'];

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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the art style from query parameters
    const params = new URLSearchParams(event.queryStringParameters);
    const artStyle = params.get('style') || 'Synthetic_Cubism';

    // Validate the art style to prevent security issues
    if (!validStyles.includes(artStyle)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid art style' })
      };
    }

    // Check if we have the data cached in Supabase
    const { data: cachedData, error: cacheError } = await supabase
      .from('art_style_cache')
      .select('cache_data')
      .eq('style_name', artStyle)
      .single();

    // If we have cache and no error, return it
    if (cachedData && !cacheError) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cachedData.cache_data)
      };
    }

    // Otherwise, we need to calculate the data
    // Get all images from the requested art style bucket
    const { data: images, error: listError } = await supabase
      .storage
      .from('art-styles')
      .list(artStyle, {
        limit: 1000,
        offset: 0
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return {
        statusCode: 500,
        headers, 
        body: JSON.stringify({ error: 'Failed to retrieve image list' })
      };
    }

    // Filter for only image files
    const imageFiles = images.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png'].includes(ext);
    });

    // Process each image to get its average color (use cached data if available)
    const imageData = await Promise.all(
      imageFiles.map(async file => {
        // Get the public URL for the image
        const { data: { publicURL } } = supabase
          .storage
          .from('art-styles')
          .getPublicUrl(`${artStyle}/${file.name}`);

        // Try to get color data from the cache
        const { data: colorData, error: colorError } = await supabase
          .from('image_colors')
          .select('file_r, file_g, file_b')
          .eq('file_path', publicURL)
          .single();

        if (colorData && !colorError) {
          // Return cached color data
          return {
            file_path: publicURL,
            file_r: colorData.file_r,
            file_g: colorData.file_g,
            file_b: colorData.file_b
          };
        }

        // For new images, we'd normally calculate the RGB values here,
        // but since we can't do image processing in this function directly,
        // we'll use a default placeholder value
        // In a real implementation, we would either:
        // 1. Use a separate process to pre-calculate these values
        // 2. Call another function that uses image processing libraries

        // Using default placeholder values for demo purposes
        const defaultRgb = {
          file_r: Math.floor(Math.random() * 256),
          file_g: Math.floor(Math.random() * 256),
          file_b: Math.floor(Math.random() * 256)
        };

        // Store these values in the cache for future use
        await supabase
          .from('image_colors')
          .insert([{
            file_path: publicURL,
            file_r: defaultRgb.file_r,
            file_g: defaultRgb.file_g,
            file_b: defaultRgb.file_b
          }]);

        return {
          file_path: publicURL,
          file_r: defaultRgb.file_r,
          file_g: defaultRgb.file_g,
          file_b: defaultRgb.file_b
        };
      })
    );

    // Save the result to the cache
    await supabase
      .from('art_style_cache')
      .upsert([{
        style_name: artStyle,
        cache_data: imageData,
        last_updated: new Date().toISOString()
      }], { onConflict: 'style_name' });

    // Return the image data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(imageData)
    };

  } catch (error) {
    console.error('General error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
}; 