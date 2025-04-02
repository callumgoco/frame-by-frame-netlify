import React, { useState } from 'react';

interface CarouselProps {
  images?: string[];
}

const Carousel: React.FC<CarouselProps> = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return <div>No images to display</div>;
  }

  return (
    <div className="carousel">
      <button onClick={handlePrev}>&lt;</button>
      <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
      <button onClick={handleNext}>&gt;</button>
    </div>
  );
};

export default Carousel; 