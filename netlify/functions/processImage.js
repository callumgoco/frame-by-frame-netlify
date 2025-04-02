const sharp = require('sharp');
const fetch = require('node-fetch');
const { createCanvas, loadImage } = require('canvas');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS Headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Helper function to get average color from buffer
async function getAverageColor(buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += 3) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  const pixelCount = (info.width * info.height);
  return [
    Math.round(r / pixelCount),
    Math.round(g / pixelCount),
    Math.round(b / pixelCount)
  ];
}

// Helper function to get closest color
function getClosestColor(targetColor, colors) {
  const [tr, tg, tb] = targetColor;
  let minDifference = Infinity;
  let closestColor = null;

  // Color perception weights
  const weights = {
    r: 0.3,  // Red weight
    g: 0.59, // Green weight
    b: 0.11  // Blue weight
  };

  for (const colorStr of colors) {
    const [r, g, b] = JSON.parse(colorStr);
    
    // Calculate weighted color difference
    const rDiff = (r - tr) * weights.r;
    const gDiff = (g - tg) * weights.g;
    const bDiff = (b - tb) * weights.b;
    
    const difference = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    
    if (difference < minDifference) {
      minDifference = difference;
      closestColor = [r, g, b];
    }
  }

  return closestColor;
}

// Helper function to download image
async function downloadImage(url) {
  const response = await fetch(url);
  return await response.buffer();
}

exports.handler = async (event, context) => {
  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    const { imageUrl, artStyle = 'Synthetic_Cubism' } = JSON.parse(event.body);

    // Fetch image data
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    // Calculate tile dimensions (maintain aspect ratio)
    const tileWidth = 30;
    const tileHeight = 30;

    // Ensure dimensions are multiples of tile size
    const adjustedWidth = Math.floor(width / tileWidth) * tileWidth;
    const adjustedHeight = Math.floor(height / tileHeight) * tileHeight;

    // Crop image to adjusted dimensions
    const croppedImage = await sharp(imageBuffer)
      .resize(adjustedWidth, adjustedHeight, { fit: 'cover' })
      .toBuffer();

    // Get art style images from Supabase
    const { data: artData, error: artError } = await supabase
      .from('image_colors')
      .select('*')
      .eq('art_style', artStyle);

    if (artError) {
      throw new Error('Failed to fetch art style data');
    }

    // Create lookup table for colors
    const colorLookup = {};
    artData.forEach(item => {
      const colorKey = JSON.stringify([item.r, item.g, item.b]);
      if (!colorLookup[colorKey]) {
        colorLookup[colorKey] = [];
      }
      colorLookup[colorKey].push(item.file_path);
    });

    // Process tiles
    const mosaicData = [];
    const canvas = createCanvas(adjustedWidth, adjustedHeight);
    const ctx = canvas.getContext('2d');

    // Process tiles in a grid
    for (let y = 0; y < adjustedHeight; y += tileHeight) {
      for (let x = 0; x < adjustedWidth; x += tileWidth) {
        try {
          // Extract tile
          const tileBuffer = await sharp(croppedImage)
            .extract({
              left: x,
              top: y,
              width: tileWidth,
              height: tileHeight
            })
            .toBuffer();

          // Get average color
          const avgColor = await getAverageColor(tileBuffer);
          const closestColor = getClosestColor(avgColor, Object.keys(colorLookup));
          
          if (closestColor) {
            const colorKey = JSON.stringify(closestColor);
            const availableImages = colorLookup[colorKey];
            
            if (availableImages && availableImages.length > 0) {
              // Randomly select an image from available ones
              const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
              
              // Store tile data for interactivity
              mosaicData.push({
                x,
                y,
                size: tileWidth,
                imagePath: randomImage
              });

              // Load and draw the tile image
              const tileImage = await loadImage(randomImage);
              ctx.drawImage(tileImage, x, y, tileWidth, tileHeight);
            }
          }
        } catch (error) {
          console.error('Error processing tile:', error);
          continue;
        }
      }
    }

    // Convert canvas to buffer and base64
    const mosaicBuffer = canvas.toBuffer('image/jpeg');
    const mosaicBase64 = mosaicBuffer.toString('base64');

    // Return the processed image and tile data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        image: `data:image/jpeg;base64,${mosaicBase64}`,
        tiles: mosaicData
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}; 