import { forwardRef } from 'react';

import { Header } from '@/sections/AuthenticatedApp';
import { cn } from '@/utils/classname';

import Footer from './Footer';

export const Body = forwardRef(function Paper(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & { footer?: boolean; header?: boolean },
  ref?: React.Ref<HTMLDivElement>
) {
  const { footer = true, header = true, ...rest } = props;
  return (
    <div
      {...rest}
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
