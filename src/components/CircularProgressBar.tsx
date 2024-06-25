import React from 'react';

function CircularProgressBar() {
  const radius = 50;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="absolute">
        <circle
          stroke="lightgray"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="mx-auto animate-lag-spin"
      >
        <circle
          stroke="gray"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    </div>
  );
}

export default CircularProgressBar;
