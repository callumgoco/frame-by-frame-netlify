# Frame By Frame - Netlify + Supabase Version

Frame By Frame is a web application that converts photos into mosaic-style artwork using different art styles (Synthetic Cubism, Impressionism, and Pop Art).

This version has been migrated from PHP (Fat-Free Framework) to a static site with Netlify Functions and Supabase for the backend.

## Features

- Upload images and convert them into mosaic art
- Choose from different art styles
- View gallery of generated artwork
- Add comments on artwork
- Mobile-friendly responsive design

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Netlify Functions (Node.js and Python)
- **Database**: Supabase
- **Storage**: Supabase Storage
- **Hosting**: Netlify

## Setup Instructions

### Prerequisites

- Netlify account
- Supabase account
- Node.js and npm installed locally

### Supabase Setup

1. Create a new Supabase project
2. Create the following tables in Supabase:

   **uploads Table**
   ```sql
   CREATE TABLE uploads (
     id SERIAL PRIMARY KEY,
     file_path TEXT NOT NULL,
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     result_path TEXT,
     user_id INTEGER DEFAULT 1,
     file_size INTEGER,
     status TEXT DEFAULT 'pending',
     file_type TEXT
   );
   ```

   **comments Table**
   ```sql
   CREATE TABLE comments (
     id SERIAL PRIMARY KEY,
     comment TEXT NOT NULL,
     image_path TEXT,
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     user_id INTEGER DEFAULT 1
   );
   ```

   **image_colors Table**
   ```sql
   CREATE TABLE image_colors (
     id SERIAL PRIMARY KEY,
     file_path TEXT UNIQUE NOT NULL,
     file_r INTEGER NOT NULL,
     file_g INTEGER NOT NULL,
     file_b INTEGER NOT NULL,
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **art_style_cache Table**
   ```sql
   CREATE TABLE art_style_cache (
     id SERIAL PRIMARY KEY,
     style_name TEXT UNIQUE NOT NULL,
     cache_data JSONB NOT NULL,
     last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Set up Supabase Storage buckets:
   - Create a bucket called `uploads` for user-uploaded images
   - Create a bucket called `processed` for mosaic output images
   - Create a bucket called `art-styles` with folders for each art style:
     - `art-styles/Synthetic_Cubism/`
     - `art-styles/Impressionism/`
     - `art-styles/Pop_Art/`
   - Upload your art style images to these folders

4. Set up storage bucket policies:
   - Make `uploads` and `processed` publicly accessible for read (but not write)
   - Make `art-styles` publicly accessible for read only

### Environment Variables

In your Netlify dashboard, set up the following environment variables:

```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_STORAGE_URL=your-supabase-storage-url
SUPABASE_ACCESS_KEY=your-supabase-access-key
SUPABASE_SECRET_KEY=your-supabase-secret-key
SUPABASE_REGION=your-supabase-region
```

### Local Development

1. Clone this repository:
   ```
   git clone <repository-url>
   cd frame-by-frame-netlify
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the Supabase client configuration:
   Open `scripts/supabase-client.js` and update the Supabase URL and anon key.

4. Start the local development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:8888`

### Deployment

1. Push your code to GitHub

2. Connect your GitHub repository to Netlify

3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.`

4. Set up the environment variables in the Netlify dashboard

5. Deploy your site

## Python Image Processing

The image processing is handled by a Python-based Netlify function. Ensure your Netlify site has the necessary Python runtime configuration.

## Customization

- Art styles can be customized by adding images to the corresponding Supabase Storage buckets
- UI elements can be modified in the HTML and CSS files
- Image processing parameters can be adjusted in the `processImage.py` function

## Credits

Originally developed by Callum O'Connor, Yipeng Zhang, and Yiran Dai for Dynamic Web Design.
