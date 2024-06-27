interface Props {
  count: number;
  type: string;
  total?: number;
}

export const FilterCounts: React.FC<Props> = ({ count }: Props) => {
  return (
    <span className="ml-auto text-2xl font-bold">{`${count.toLocaleString()} Shown`}</span>
  );
};
