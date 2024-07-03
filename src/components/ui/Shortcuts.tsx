import { ChevronUpIcon } from '@heroicons/react/24/outline';

export const Shortcuts = ({ value = '' }: { value: string }) => {
  return (
    <p className="rounded border border-gray-400 px-2 py-0 text-[10px] text-gray-400">
      <ChevronUpIcon className="-mt-1 inline-block size-4" />
      {value}
    </p>
  );
};

const ShortcutsArr = [
  ['Control', 'A', 'Assets'],
  ['Control', 'R', 'Risk'],
  ['Control', 'J', 'Jobs'],
];

export const ShortcutsHelper = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto"
      onClick={onClose}
      onKeyDown={onClose}
    >
      <div className="min-w-100 flex min-h-full items-center justify-center p-4 text-center ">
        <div className="w-900 flex flex-col gap-10 rounded-lg bg-gray-600 px-8 py-4 text-white">
          {ShortcutsArr.map(([metaKey, value, page]) => (
            <div key={page} className="flex justify-between gap-10">
              <p>
                {metaKey} + {value}
              </p>
              <p>{page}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
