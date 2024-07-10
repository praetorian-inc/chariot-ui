import { PropsOf } from '@headlessui/react/dist/types';
import MDEditor from '@uiw/react-md-editor';
import { v4 as uuidv4 } from 'uuid';

import {
  AppMediaStoragePrefix,
  MarkdownPreview,
} from '@/components/markdown/MarkdownPreview';
import { useUploadFile } from '@/hooks/useFiles';
import { cn } from '@/utils/classname';
import { useStorage } from '@/utils/storage/useStorage.util';

export function MarkdownEditor(
  props: Omit<PropsOf<typeof MDEditor>, 'components' | 'onDrop'> & {
    filePathPrefix?: string;
  }
) {
  const { filePathPrefix = 'user-attachment' } = props;

  const { mutateAsync: updateFile } = useUploadFile();

  const [markdown, setMarkdown] = useStorage(
    { parentState: props.value, onParentStateChange: props.onChange },
    ''
  );

  return (
    <MDEditor
      {...props}
      value={markdown}
      onChange={value => {
        setMarkdown(value || '');
      }}
      className={cn('markdownSelection', props.className)}
      components={{
        preview: source => {
          return <MarkdownPreview source={source} />;
        },
      }}
      onDrop={async event => {
        if (event.dataTransfer.files.length > 0) {
          event.preventDefault();

          const uploadingImagePromise = Array(event.dataTransfer.items.length)
            .fill(0)
            .map(async (_, index) => {
              const file = event.dataTransfer.files.item(index);

              if (file) {
                const src = `${filePathPrefix}/${uuidv4()}`;

                await updateFile({
                  ignoreSnackbar: true,
                  name: src,
                  content: await file.arrayBuffer(),
                });

                return {
                  src,
                  alt: file.name,
                };
              }
            });

          const res = await Promise.all(uploadingImagePromise);

          const textToInsert = res
            .map(r => `![${r?.alt}](${AppMediaStoragePrefix}${r?.src})`)
            .join('\n');
          console.log('res', event.target);

          const textarea = event.target as HTMLTextAreaElement;

          const currentText = textarea.value;
          const cursorPosition = textarea.selectionStart;

          // Insert the text at the cursor position
          const newText =
            currentText.slice(0, cursorPosition) +
            textToInsert +
            currentText.slice(cursorPosition);

          // Update the textarea with the new text
          setMarkdown(newText);

          // Move the cursor to the end of the inserted text
          textarea.selectionStart = textarea.selectionEnd =
            cursorPosition + textToInsert.length;
        }
      }}
    />
  );
}
