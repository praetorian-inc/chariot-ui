import React from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';

import { Dropzone, Files } from '@/components/Dropzone';
import { Modal } from '@/components/Modal';
import { useUploadFile } from '@/hooks';
import { useGlobalState } from '@/state/global.state';

export const AddFile = () => {
  const {
    modal: {
      file: { open: isOpen, onOpenChange },
    },
  } = useGlobalState();
  const { mutate: uploadFile } = useUploadFile();

  const handleFilesDrop = (files: Files<'arrayBuffer'>): void => {
    onClose();

    files.forEach(({ content, file }) => {
      uploadFile({
        name: file.name,
        content,
      });
    });
  };

  function onClose() {
    onOpenChange(false);
  }

  return (
    <Modal
      title="Add Document"
      open={isOpen}
      onClose={onClose}
      icon={<DocumentIcon className="size-6 text-default-light" />}
    >
      <Dropzone
        type="arrayBuffer"
        onFilesDrop={handleFilesDrop}
        title="Click or drag and drop documents here."
        subTitle="Documents will be stored on S3."
      />
    </Modal>
  );
};
