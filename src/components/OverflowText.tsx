import React, { useEffect, useRef, useState } from 'react';
import { Placement } from '@floating-ui/react';

import { Tooltip } from '@/components/Tooltip';

interface OverflowTextProps {
  text: string;
  className?: string;
  truncateType?: 'center' | 'end';
  placement?: Placement;
}

export const OverflowText = (props: OverflowTextProps) => {
  const {
    text = '',
    className,
    truncateType = 'end',
    placement = 'bottom',
  } = props;

  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);

  const start = String(text).slice(0, text.length / 2);
  const end = String(text).slice(text.length / 2, text.length);

  useEffect(() => {
    if (textElementRef && textElementRef.current) {
      const style = window.getComputedStyle(textElementRef.current);
      const textWidth = getTextWidth(text, style.font);
      const isOverflow =
        Math.floor(textWidth) > textElementRef.current.clientWidth;

      setIsOverflow(isOverflow);
    }
  }, [textElementRef]);

  return (
    <Tooltip title={isOverflowed ? text : ''} placement={placement}>
      <div
        ref={textElementRef}
        className={`overflow-hidden text-ellipsis ${className}`}
      >
        {truncateType === 'center' && (
          <div className="flex">
            <div className="w-fit overflow-hidden text-ellipsis">{start}</div>
            <div className="flex w-fit justify-end overflow-hidden">{end}</div>
          </div>
        )}
        {truncateType === 'end' && (
          <>
            {/* This empty div is to override default behaviour of Safari that shows the title tooltip */}
            <div></div>
            {text}
          </>
        )}
      </div>
    </Tooltip>
  );
};

function getTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context) {
    context.font = font || getComputedStyle(document.body).font;
  }

  return context ? context?.measureText(text).width : 0;
}
