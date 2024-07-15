import { Tooltip } from '@/components/Tooltip';
import { cn } from '@/utils/classname';

interface Props {
  steps?: { title: string; description?: string; className?: string }[];
  current?: number;
  className?: string;
}

export const HorizontalTimeline = ({ steps = [], current = 0 }: Props) => {
  const stepCount = steps.length;
  const filled = current > -1 ? current : 0;

  return (
    <div className="relative mb-8 w-full">
      <div className="absolute top-[5px] z-0 h-[2px] w-full bg-default">
        <div
          className={'h-full bg-brand transition-all duration-1000'}
          style={{
            width: `${(filled * 100) / (stepCount - 1)}%`,
          }}
        />
      </div>

      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative z-10 flex items-center justify-center bg-layer0 px-1"
          >
            <Tooltip
              title={
                <div className="m-2 text-center">
                  <div className="font-bold">{step.title}</div>
                  {step.description && (
                    <div className="mt-1">{step.description}</div>
                  )}
                </div>
              }
              placement="top"
            >
              <div
                className={cn(
                  'size-3 rounded-full bg-default cursor-pointer mb-1',
                  filled >= index && 'bg-brand',
                  step.className
                )}
              />
              <span
                className={cn(
                  'absolute text-sm text-default font-medium',
                  index === 0 && 'left-0',
                  index > 0 && index < steps.length - 1 && 'left-[-25px]',
                  index === steps.length - 1 && 'right-0'
                )}
              >
                {step.title}
              </span>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};
