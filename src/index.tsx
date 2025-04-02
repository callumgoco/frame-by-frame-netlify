import React from 'react';
import { createRoot } from 'react-dom/client';
import Carousel from './components/Carousel';

// Sample images array - replace with actual image URLs
const images = [
  '/path/to/image1.jpg',
  '/path/to/image2.jpg',
  '/path/to/image3.jpg'
];

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Carousel images={images} />
    </React.StrictMode>
  );
} 