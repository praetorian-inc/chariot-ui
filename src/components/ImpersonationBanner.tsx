import React, { useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/state/auth';
import { useStorage } from '@/utils/storage/useStorage.util';
import { Bars3Icon } from '@heroicons/react/20/solid';
import { Tooltip } from '@/components/Tooltip';

const ImpersonationBanner: React.FC = () => {
  const { friend, stopImpersonation } = useAuth();
  const [position, setPosition] = useStorage(
    { key: 'impersonationPosition' },
    {
      x: -500, // Default to -500 initially; this will be updated on mount
      y: 0,
    }
  );

  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (banner && position.x === -500) {
      const screenWidth = window.innerWidth;
      const bannerWidth = banner.offsetWidth;
      const centerPositionX = (screenWidth - bannerWidth) / 2;
      setPosition({ ...position, x: centerPositionX });
    }
  }, [setPosition, bannerRef.current]);

  if (!friend || !friend.email) {
    return null;
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    const startX = event.clientX;
    const startPos = { ...position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = startPos.x + moveEvent.clientX - startX;
      const banner = bannerRef.current;
      const screenWidth = window.innerWidth;

      if (banner) {
        const bannerWidth = banner.offsetWidth;

        setPosition({
          x: Math.max(0, Math.min(newX, screenWidth - bannerWidth)),
          y: 0,
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
        className="hover:bg-brand-dark mr-2 rounded-b-[4px] p-1 text-center"
        onClick={stopImpersonation}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <span className="text-nowrap">Viewing:</span>
      <span className="ml-1 font-semibold">
        {friend.displayName ? (
          <Tooltip placement="bottom" title={friend.email}>
            {friend.displayName}
          </Tooltip>
        ) : (
          friend.email
        )}
      </span>
      <div
        className="cursor-move ml-2 hover:bg-brand-dark rounded-b-[4px] p-1 "
        onMouseDown={handleMouseDown}
      >
        <span className="text-lg">
          <Bars3Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
