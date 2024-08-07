import { useEffect, useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Type } from '@/components/form/Input';
import { InputText } from '@/components/form/InputText';

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
            <p className="whitespace-pre-wrap break-words text-default">
              {comment}
            </p>
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
          <InputText
            type={Type.TEXT_AREA}
            name="message"
            value={value}
            onChange={e => setValue(e.target.value)}
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
