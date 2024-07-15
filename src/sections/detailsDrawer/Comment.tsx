import { useEffect, useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';

interface Props {
  comment: string;
  isLoading: boolean;
  onSave?: (comment: string) => Promise<void>;
  title?: string;
}

export const Comment: React.FC<Props> = ({ comment, onSave }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(comment);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setValue(comment);
    }
  }, [isEditing, comment]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave && (await onSave(value));
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {!isEditing && (
        <>
          {comment ? (
            <p className="whitespace-pre-wrap break-words">{comment}</p>
          ) : (
            <span className="italic text-gray-400">No comment provided.</span>
          )}
          <Button
            className="mt-2 pl-0 font-bold"
            styleType="none"
            onClick={() => setIsEditing(true)}
          >
            Edit <PencilSquareIcon className="size-5" />
          </Button>
        </>
      )}
      {isEditing && (
        <>
          <textarea
            id="message"
            rows={6}
            value={value}
            onChange={e => setValue(e.target.value)}
            className="block w-full rounded-sm border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 "
            placeholder="Write your thoughts here..."
          />
          <div className="mt-2 flex justify-end space-x-2">
            <Button onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </>
      )}
    </>
  );
};
