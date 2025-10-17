import React, { useState } from 'react';

const Map = () => {
  const [viewBox, setViewBox] = useState('0 0 800 600');

  const handleZoom = (e) => {
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    const newWidth = width * (e.deltaY > 0 ? 1.1 : 0.9);
    const newHeight = height * (e.deltaY > 0 ? 1.1 : 0.9);
    const newX = x + (width - newWidth) / 2;
    const newY = y + (height - newHeight) / 2;
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
  };

  return (
    <svg
      width="100%"
      height="500px"
      viewBox={viewBox}
      onWheel={handleZoom}
      style={{ border: '1px solid black' }}
    >
      <rect x="100" y="100" width="100" height="100" fill="lightblue" />
      <rect x="300" y="200" width="150" height="100" fill="lightgreen" />
      <circle cx="500" cy="400" r="50" fill="lightcoral" />
    </svg>
  );
};

export default Map;