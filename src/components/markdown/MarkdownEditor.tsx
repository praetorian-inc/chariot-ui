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

          const uploadingImages = Array(event.dataTransfer.items.length)
            .fill(0)
            .map((_, index): UploadingImage | undefined => {
              const file = event.dataTransfer.files.item(index);

              if (file) {
                if (/image\/.*/.test(file.type)) {
                  const id = uuidv4();
                  const src = `${filePathPrefix}/${id}`;

                  return {
                    markdownText: `![${file.name}](${AppMediaStoragePrefix}${src})`,
                    mutate: async () => {
                      await updateFile({
                        ignoreSnackbar: true,
                        name: src,
                        content: await file.arrayBuffer(),
                      });
                    },
                  };
                }
              }
            })
            .filter(x => x) as UploadingImage[];

          if (uploadingImages.length > 0) {
            const uploadingImagesPromise = uploadingImages.map(i => i.mutate());
            const uploadingImagesText = uploadingImages
              .map(i => i.markdownText)
              .join('\n');

            const uploadingId = uuidv4();
            const uploadingText = `Uploading ${uploadingId}`;

            const textarea = event.target as HTMLTextAreaElement;

            const currentText = textarea.value;
            const cursorPosition = textarea.selectionStart;

            // Insert the text at the cursor position
            const newText =
              currentText.slice(0, cursorPosition) +
              uploadingText +
              currentText.slice(cursorPosition);

            // Update the textarea with the new text
            setMarkdown(newText);

            // Move the cursor to the end of the inserted text
            textarea.selectionStart = textarea.selectionEnd =
              cursorPosition + uploadingText.length;

            await Promise.all(uploadingImagesPromise);

            setMarkdown(text => {
              return text.replace(uploadingText, uploadingImagesText);
            });
          }
        }
      }}
    />
  );
}

interface UploadingImage {
  markdownText: string;
  mutate: () => Promise<void>;
}
