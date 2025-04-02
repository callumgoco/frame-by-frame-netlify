import json
import os
import base64
import math
import random
import numpy as np
import urllib.request
from io import BytesIO
import boto3
from PIL import Image
import cv2

# Initialize AWS S3 client for Supabase storage
s3 = boto3.client(
    's3',
    region_name=os.environ.get('SUPABASE_REGION', 'eu-central-1'),
    aws_access_key_id=os.environ.get('SUPABASE_ACCESS_KEY'),
    aws_secret_access_key=os.environ.get('SUPABASE_SECRET_KEY'),
    endpoint_url=os.environ.get('SUPABASE_STORAGE_URL')
)

def get_average_color(img):
    """Calculate the average color of an image."""
    average_color = np.average(np.average(img, axis=0), axis=0)
    average_color = np.around(average_color, decimals=-1)
    average_color = tuple(int(i) for i in average_color)
    return average_color

def get_closest_color(color, colors):
    """Find the closest color from a list of colors."""
    cr, cg, cb = color
    
    min_difference = float("inf")
    closest_color = None
    for c in colors:
        r, g, b = eval(c)
        difference = math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2)
        if difference < min_difference:
            min_difference = difference
            closest_color = eval(c)
    
    return closest_color

def download_image(url):
    """Download an image from a URL."""
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        image_data = response.read()
    return Image.open(BytesIO(image_data))

def handler(event, context):
    """AWS Lambda / Netlify Function handler."""
    # Set up CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Handle OPTIONS request (CORS preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Only handle POST requests
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse the request body
        body = json.loads(event.get('body', '{}'))
        image_url = body.get('imageUrl')
        art_style = body.get('artStyle', 'Synthetic_Cubism')
        
        if not image_url:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Image URL is required'})
            }
        
        # Validate art style
        valid_styles = ['Synthetic_Cubism', 'Impressionism', 'Pop_Art']
        if art_style not in valid_styles:
            art_style = 'Synthetic_Cubism'  # Default to Synthetic_Cubism
        
        # Download the image to process
        img = download_image(image_url)
        img = np.array(img)
        
        # Convert to BGR for OpenCV if needed
        if len(img.shape) == 3 and img.shape[2] == 4:  # RGBA
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
        elif len(img.shape) == 3 and img.shape[2] == 3:  # RGB
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        
        # Get image dimensions
        img_height, img_width = img.shape[:2]
        tile_height, tile_width = 30, 30
        num_tiles_h, num_tiles_w = img_height // tile_height, img_width // tile_width
        
        # Crop the image to fit the tiles exactly
        img = img[:tile_height * num_tiles_h, :tile_width * num_tiles_w]
        
        # Load the art style data (normally we'd get this from the database)
        # For this demo, we'll use a simplified approach
        # In production, you should fetch this from Supabase
        
        # Create a temporary dictionary to store the art data
        # In real implementation, fetch from Supabase
        art_data = {}
        
        # Generate random art data for demo
        # In production, fetch real images from Supabase storage
        for r in range(0, 256, 50):
            for g in range(0, 256, 50):
                for b in range(0, 256, 50):
                    color_key = str((r, g, b))
                    # In real implementation, these would be URLs to actual art images
                    art_data[color_key] = [f"https://placeholder.com/{art_style}/{r}_{g}_{b}.jpg"]
        
        # Process the image tile by tile
        tiles = []
        for y in range(0, img_height, tile_height):
            for x in range(0, img_width, tile_width):
                tiles.append((y, y + tile_height, x, x + tile_width))
        
        # Create a new image for the mosaic
        mosaic = np.zeros_like(img)
        mosaic_data = []
        
        for tile in tiles:
            y0, y1, x0, x1 = tile
            try:
                # Get average color of the tile
                average_color = get_average_color(img[y0:y1, x0:x1])
                
                # Find the closest color in our art data
                closest_color = get_closest_color(average_color, art_data.keys())
                
                # In a real implementation, download and resize the art image
                # For this demo, we'll just fill with the color
                mosaic[y0:y1, x0:x1] = closest_color
                
                # Store the tile data for the response
                mosaic_data.append({
                    'x': x0,
                    'y': y0,
                    'size': tile_width,
                    'color': closest_color,
                    'imagePath': random.choice(art_data[str(closest_color)])
                })
            except Exception as e:
                continue
        
        # Convert the mosaic image to base64 for the response
        _, buffer = cv2.imencode('.jpg', mosaic)
        mosaic_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Generate a unique filename for the result
        filename = f"{os.path.basename(image_url).split('.')[0]}_mosaic_{art_style}.jpg"
        
        # Upload the result to Supabase Storage
        # This is a simplified version - in production, use proper S3 credentials
        # s3.put_object(
        #     Bucket='your-supabase-bucket',
        #     Key=f"processed/{filename}",
        #     Body=buffer.tobytes(),
        #     ContentType='image/jpeg'
        # )
        
        # For demo purposes, we'll just return the base64 image
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'image': f"data:image/jpeg;base64,{mosaic_base64}",
                'tiles': mosaic_data
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        } 