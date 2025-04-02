import React from 'react';
import Carousel from './components/Carousel';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Frame By Frame</h1>
      </header>
      <main>
        <Carousel />
      </main>
    </div>
  );
};

export default App; 