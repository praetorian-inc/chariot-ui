import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { cn } from '@/utils/classname';

export const AnimatedArrowIcon = ({ className = '', delay = '0s' }) => (
  <div className={cn('icon-container relative', className)}>
    <ArrowRightIcon className="absolute h-11 w-9 text-gray-300" />
    <ArrowRightIcon
      className="icon-mask absolute h-11 w-9 text-gray-400"
      style={{ animationDelay: delay }}
    />
  </div>
);
