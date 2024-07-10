import { useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { PropsOf } from '@headlessui/react/dist/types';
import MDEditor, { getCommands } from '@uiw/react-md-editor';
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutateAsync: updateFile } = useUploadFile();

  const [markdown, setMarkdown] = useStorage(
    { parentState: props.value, onParentStateChange: props.onChange },
    ''
  );

  const commands = getCommands();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileUpload,
  });

  const customCommands = commands.flatMap(command => {
    if (command.keyCommand === 'image') {
      return [
        command,
        {
          name: 'addImage',
          keyCommand: 'addImage',
          render: () => (
            <button className="p-1" {...getRootProps()}>
              <input {...getInputProps()} />
              <PhotoIcon className="-mt-px size-[14px] scale-110 " />
            </button>
          ),
          shortcuts: 'ctrlcmd+k',
          prefix: '![image](',
          suffix: ')',
          buttonProps: {
            title: 'Click to Add image',
          },
        },
      ];
    }

    return command;
  });

  async function handleFileUpload(files: File[]) {
    const uploadingImages = files
      .map((file): UploadingImage | undefined => {
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

      const textarea = (
        textareaRef.current as unknown as { textarea: HTMLTextAreaElement }
      )?.textarea as HTMLTextAreaElement;

      if (textarea) {
        const currentText = textarea.value || '';
        const cursorPosition = textarea.selectionStart || 0;

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
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    if (event.dataTransfer.files.length > 0) {
      event.preventDefault();

      const files = Array(event.dataTransfer.items.length)
        .fill(0)
        .map((_, index): File | null => {
          return event.dataTransfer.files.item(index);
        })
        .filter(x => x) as File[];

      handleFileUpload(files);
    }
  }

  return (
    <MDEditor
      {...props}
      ref={textareaRef}
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
      commandsFilter={command =>
        command.keyCommand !== 'image' ? command : false
      }
      commands={customCommands}
      onDrop={handleDrop}
    />
  );
}

interface UploadingImage {
  markdownText: string;
  mutate: () => Promise<void>;
}
