import React, { useEffect, useState } from 'react';

import { Loader } from '@/components/Loader';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { useOpenFile } from '@/hooks/useFiles';
import { getFileType } from '@/sections/Files';
import { ParsedFileTypes } from '@/types';

const FileViewer = ({
  fileName,
  onChange,
  onClose,
}: {
  fileName: string;
  onChange?: (value: string) => void;
  onClose: () => void;
}) => {
  const { mutate: getFileContent, data: fileContent } = useOpenFile();
  const [editorContent, setEditorContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fileType = fileName ? getFileType(fileName) : '';

  useEffect(() => {
    return () => {
      setEditorContent('');
      setImageUrl('');
    };
  }, []);

  useEffect(() => {
    if (fileName) {
      getFileContent({ name: fileName });
    }
  }, [fileName, getFileContent]);

  useEffect(() => {
    if (fileContent) {
      if (fileType === ParsedFileTypes.IMAGE) {
        setImageUrl(URL.createObjectURL(fileContent));
      } else if (fileType === ParsedFileTypes.PDF) {
        const blob = new Blob([fileContent], { type: 'application/pdf' });
        const blobURL = URL.createObjectURL(blob);
        window.open(blobURL);
        onClose();
      } else {
        // Handling non-image files, converting blob to text
        const reader = new FileReader();
        reader.onload = function (event) {
          if (event.target) {
            setEditorContent(event.target.result as string);
          }
        };
        reader.readAsText(fileContent);
      }
    }
  }, [fileContent, fileType]);
  // Rest of the code...

  // Conditional rendering based on content type
  if (!fileContent) {
    return <Loader isLoading />;
  }

  if (fileType === ParsedFileTypes.IMAGE) {
    return <img src={imageUrl} alt="File content" />;
  } else if (fileType === ParsedFileTypes.DOCUMENT) {
    return (
      <div className="h-[60vh]">
        <MarkdownEditor
          value={editorContent}
          onChange={value => {
            setEditorContent(value ?? '');
            onChange && onChange(value ?? '');
          }}
          filePathPrefix="proof-of-exploit/files"
        />
      </div>
    );
  }

  return null;
};

export default FileViewer;
