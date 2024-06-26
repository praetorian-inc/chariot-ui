import { InputProps } from '@/components/form/Input';
import { cn } from '@/utils/classname';

export interface DateProps {
  max?: string;
}

export const Date = (props: InputProps) => {
  return (
    <input
      type="date"
      className={cn('rounded-md border border-gray-300 p-2', props.className)}
      onChange={props.onChange}
      value={props.value}
      max={props.max}
    />
  );
};
