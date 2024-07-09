import { useEffect, useState } from 'react';

interface Props {
  el: HTMLElement;
  minWidth?: number;
}

export const useResize = (props: Props) => {
  const { minWidth = 100, el } = props;
  const [size, setSize] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const { width, height } = el.getBoundingClientRect();
    setSize({
      x: getWidth(width),
      y: height,
    });
  }, [el]);

  const getWidth = (width: number) => {
    return width < minWidth ? minWidth : width;
  };

  const onMouseDown = (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
    const startSize = size;
    const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };
    document.body.classList.add('col-resize');

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      setSize(() => ({
        x: getWidth(startSize.x - startPosition.x + mouseMoveEvent.pageX),
        y: startSize.y - startPosition.y + mouseMoveEvent.pageY,
      }));
    }

    function onMouseUp() {
      document.body.classList.remove('col-resize');
      document.body.removeEventListener('mousemove', onMouseMove);
    }

    // Attach mousemove and mouseup event listeners to the body only after mousedown event
    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp, { once: true });
  };

  return {
    size,
    onMouseDown,
  };
};
