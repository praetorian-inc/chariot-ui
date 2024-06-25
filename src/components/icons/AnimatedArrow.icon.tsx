import { ArrowRightIcon } from '@heroicons/react/24/outline';

export const AnimatedArrowIcon = ({ delay = '0s' }) => (
  <div className="icon-container relative">
    <ArrowRightIcon className="h-11 w-9 text-gray-300 absolute" />
    <ArrowRightIcon
      className="h-11 w-9 text-gray-400 absolute icon-mask"
      style={{ animationDelay: delay }}
    />
  </div>
);
