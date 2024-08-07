import { cn } from '@/utils/classname';

interface Props {
  steps?: { title: string; description?: string; className?: string }[];
  current?: number;
  className?: string;
}

function transformTextColorToBg(className: string): string {
  const textColorClass = className
    .split(' ')
    .find(cls => cls.startsWith('text-'));

  if (!textColorClass) return 'bg-gray-400';

  const bgColorClass = textColorClass.replace('text-', 'bg-');

  return className.replace(textColorClass, bgColorClass);
}

export const HorizontalTimeline = ({
  steps = [],
  current = 0,
  className = '',
}: Props) => {
  const stepCount = steps.length;
  const filled = current > -1 ? current : 0;

  return (
    <div className="relative mb-8 mt-2 w-full">
      <div
        className={cn(
          'absolute top-[5px] z-0 h-[2px] w-full bg-default',
          className
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-1000',
            transformTextColorToBg(className)
          )}
          style={{
            width: `${(filled * 100) / (stepCount - 1)}%`,
          }}
        />
      </div>

      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={
              'relative z-10 flex items-center justify-center bg-transparent px-1'
            }
          >
            <div
              className={cn(
                'size-3 rounded-full bg-default cursor-pointer mb-1',
                className,
                filled >= index && transformTextColorToBg(className),
                step.className
              )}
            />
            <span
              className={cn(
                'absolute text-sm font-semibold -bottom-6',
                index === 0 && 'left-0',
                index > 0 && index < steps.length - 1 && 'left-[-25px]',
                index === steps.length - 1 && 'right-0',
                className,
                'bg-transparent brightness-60 opacity-70 hover:'
              )}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
