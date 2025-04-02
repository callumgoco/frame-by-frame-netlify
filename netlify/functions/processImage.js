const sharp = require('sharp');
const fetch = require('node-fetch');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createCanvas, loadImage } = require('canvas');

// Initialize AWS S3 client for Supabase storage
const s3 = new S3Client({
  region: process.env.SUPABASE_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.SUPABASE_ACCESS_KEY,
    secretAccessKey: process.env.SUPABASE_SECRET_KEY
  },
  endpoint: process.env.SUPABASE_STORAGE_URL
});

// Helper function to get average color of an image buffer
async function getAverageColor(buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let totalR = 0, totalG = 0, totalB = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
  }

  const pixelCount = (data.length / info.channels);
  const avgR = Math.round(totalR / pixelCount / 10) * 10;
  const avgG = Math.round(totalG / pixelCount / 10) * 10;
  const avgB = Math.round(totalB / pixelCount / 10) * 10;

  return [avgR, avgG, avgB];
}

// Helper function to find closest color
function getClosestColor(color, colors) {
  const [cr, cg, cb] = color;
  
  let minDifference = Infinity;
  let closestColor = null;
  
  for (const c of colors) {
    const [r, g, b] = JSON.parse(c);
    const difference = Math.sqrt(
      Math.pow(r - cr, 2) + 
      Math.pow(g - cg, 2) + 
      Math.pow(b - cb, 2)
    );
    
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

// Main handler function
exports.handler = async (event, context) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { imageUrl, artStyle = 'Synthetic_Cubism' } = body;

    if (!imageUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image URL is required' })
      };
    }

    // Validate art style
    const validStyles = ['Synthetic_Cubism', 'Impressionism', 'Pop_Art'];
    if (!validStyles.includes(artStyle)) {
      artStyle = 'Synthetic_Cubism'; // Default
    }

    // Download and process the image
    const imageBuffer = await downloadImage(imageUrl);
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();

    // Set tile dimensions
    const tileWidth = 30;
    const tileHeight = 30;
    const numTilesW = Math.floor(width / tileWidth);
    const numTilesH = Math.floor(height / tileHeight);

    // Crop image to fit tiles exactly
    const croppedImage = await image
      .extract({
        left: 0,
        top: 0,
        width: tileWidth * numTilesW,
        height: tileHeight * numTilesH
      })
      .toBuffer();

    // Create art data (simplified version - in production, fetch from Supabase)
    const artData = {};
    for (let r = 0; r < 256; r += 50) {
      for (let g = 0; g < 256; g += 50) {
        for (let b = 0; b < 256; b += 50) {
          const colorKey = JSON.stringify([r, g, b]);
          artData[colorKey] = [`https://placeholder.com/${artStyle}/${r}_${g}_${b}.jpg`];
        }
      }
    }

    // Process tiles
    const mosaicData = [];
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < height; y += tileHeight) {
      for (let x = 0; x < width; x += tileWidth) {
        try {
          // Extract and process tile
          const tileBuffer = await sharp(croppedImage)
            .extract({
              left: x,
              top: y,
              width: tileWidth,
              height: tileHeight
            })
            .toBuffer();

          // Get average color
          const averageColor = await getAverageColor(tileBuffer);
          const closestColor = getClosestColor(averageColor, Object.keys(artData));

          // Draw the color on canvas
          ctx.fillStyle = `rgb(${closestColor.join(',')})`;
          ctx.fillRect(x, y, tileWidth, tileHeight);

          // Store tile data
          mosaicData.push({
            x,
            y,
            size: tileWidth,
            color: closestColor,
            imagePath: artData[JSON.stringify(closestColor)][0]
          });
        } catch (error) {
          console.error('Error processing tile:', error);
          continue;
        }
      }
    }

    // Convert canvas to buffer
    const mosaicBuffer = canvas.toBuffer('image/jpeg');
    const mosaicBase64 = mosaicBuffer.toString('base64');

    // Generate filename
    const filename = `${imageUrl.split('/').pop().split('.')[0]}_mosaic_${artStyle}.jpg`;

    // Return the result
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
      body: JSON.stringify({ error: error.message })
    };
  }
}; 