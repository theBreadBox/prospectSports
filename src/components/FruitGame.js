import React from 'react';

const FruitGame = () => {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://imgflip.com/memegenerator" // Replace with your desired URL
        title="Full Screen Iframe"
        className="w-full h-full border-none"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default FruitGame;