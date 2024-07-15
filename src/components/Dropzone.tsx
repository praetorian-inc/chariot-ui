import { PropsWithChildren } from 'react';
import { useDropzone } from 'react-dropzone';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

import { Snackbar } from '@/components/Snackbar';
import { cn } from '@/utils/classname';

type FileReadType = 'string' | 'arrayBuffer';

export type FileResult<T extends FileReadType> = T extends 'string'
  ? string
  : ArrayBuffer;

export type Files<T extends FileReadType> = {
  content: FileResult<T>;
  file: File;
}[];

interface Props<T extends FileReadType> extends PropsWithChildren {
  onFilesDrop: (files: Files<T>) => void;
  validate?: (content: FileResult<T>, file: File) => boolean;
  title?: string;
  subTitle?: string;
  className?: string;
  type: T;
}

export function Dropzone<T extends FileReadType>(props: Props<T>) {
  const {
    onFilesDrop,
    validate,
    title = 'Drop files here',
    subTitle = 'Suggest file types: TXT, CSV, JSON, or XML',
    children,
    className,
  } = props;

  const handleDrop = (files: File[]): void => {
    const fileValue: Files<T> = [];

    files.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = () => {
        const content = reader.result as FileResult<T>;
        const isValid = validate ? validate(content, file) : true;
        if (isValid) {
          fileValue.push({ content, file });
        } else {
          handleError();
        }

        if (files.length - 1 === index && fileValue.length > 0) {
          onFilesDrop(fileValue);
        }
      };
      reader.onerror = handleError;

      if (props.type === 'string') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  function handleError() {
    Snackbar({
      title: 'Cannot process the file you have uploaded.',
      description: '',
      variant: 'error',
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          'mt-4 flex flex-col items-center justify-center border-2 border-dashed border-default bg-primary bg-opacity-5 p-4 hover:bg-opacity-10 h-60 rounded hover:cursor-pointer',
          isDragActive ? 'bg-opacity-10' : '',
          className
        )}
      >
        <input {...getInputProps()} />
        {children}
        {!children && (
          <>
            <div>
              <PlusCircleIcon className="size-20 text-disabled" />
            </div>
            <h3 className="my-2 font-semibold">{title}</h3>
            <p className="text-center">{subTitle}</p>
          </>
        )}
      </div>
    </>
  );
}
