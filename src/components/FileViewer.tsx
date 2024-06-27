import { Loader } from '@/components/Loader';
import { useOpenFile } from '@/hooks/useFiles';
import { Editor } from '@monaco-editor/react';
import React, { useEffect, useState } from 'react';

const FileViewer = ({
  fileName,
  fileType,
}: {
  fileName: string;
  fileType: string;
}) => {
  const { mutate: getFileContent, data: fileContent } = useOpenFile();
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    if (fileName) {
      getFileContent({ name: fileName });
    }
  }, [fileName, getFileContent]);

  useEffect(() => {
    if (fileContent) {
      if (fileType === 'image') {
        // Handling image files
        const url = URL.createObjectURL(fileContent);
        setEditorContent('');
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

  // Conditional rendering based on content type
  let renderedContent: JSX.Element | null = null;
  if (fileContent) {
    if (fileType === 'image') {
      const url = URL.createObjectURL(fileContent);
      renderedContent = <img src={url} alt="Loaded content" />;
    }
  }

  // Rest of the code...

  // Conditional rendering based on content type
  if (!fileContent) {
    return <Loader isLoading />;
  }

  if (fileType === 'image') {
    const url = URL.createObjectURL(fileContent);
    return <img src={url} alt="File content" />;
  } else {
    return (
      <div className="h-52">
        <Editor
          height="100%"
          language="text" // Change this based on the expected content type of text files
          value={editorContent}
          options={{
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    );
  }
};

export default FileViewer;
