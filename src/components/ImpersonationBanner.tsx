import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/state/auth';
import { useStorage } from '@/utils/storage/useStorage.util';

const ImpersonationBanner: React.FC = () => {
  const { friend, stopImpersonation } = useAuth();
  const [position, setPosition] = useStorage(
    { key: 'impersonationPosition' },
    {
      x: 0,
      y: -500,
    }
  );

  const bannerRef = useRef<HTMLDivElement>(null);

  if (!friend || !friend.email) {
    return null;
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = { ...position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = startPos.x + moveEvent.clientX - startX;
      const newY = startPos.y + moveEvent.clientY - startY;
      const banner = bannerRef.current;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (banner) {
        const bannerWidth = banner.offsetWidth;
        const bannerHeight = banner.offsetHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, screenWidth - bannerWidth)),
          y: Math.max(0, Math.min(newY, screenHeight - bannerHeight)),
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 z-[99999] flex items-center bg-brand px-4 py-1 text-xs text-white shadow-lg rounded-b-[2px]"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <button
        className="hover:bg-brand-hover mr-2 rounded-b-[2px] p-1 text-center"
        onClick={stopImpersonation}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <span className="text-nowrap">Viewing as:</span>
      <span className="ml-1 font-medium">
        {friend.displayName || friend.email}
      </span>
      {friend.displayName && <span className="ml-1">({friend.email})</span>}
      <div className="cursor-move ml-2 p-1" onMouseDown={handleMouseDown}>
        <span className="text-lg">≡</span>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
