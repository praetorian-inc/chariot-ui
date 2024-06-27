import { forwardRef, ReactNode } from 'react';

import Footer from '@/components/ui/Footer';
import { Header } from '@/sections/AuthenticatedApp';
import { cn } from '@/utils/classname';

export const Body = forwardRef(function Paper(
  props: {
    footer?: boolean;
    header?: boolean;
    className?: string;
    children?: ReactNode;
  },
  ref?: React.Ref<HTMLDivElement>
) {
  const { footer = true, header = true } = props;

  return (
    <div
      ref={ref}
      className={
        'flex size-full flex-col justify-between overflow-x-auto rounded-[2px]'
      }
      id="body"
      style={{ overflowAnchor: 'none' }}
    >
      <div>
        {header && <Header />}
        <div
          className={cn(
            'mx-auto w-full max-w-screen-xl rounded-sm',
            props.className
          )}
          style={{ marginTop: header ? -16 : 0 }}
        >
          {props.children}
        </div>
      </div>
      {footer && <Footer />}
    </div>
  );
});
