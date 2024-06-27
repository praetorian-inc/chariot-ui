import React from 'react';

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
    <Modal title="Upload Document" open={isOpen} onClose={onClose}>
      <Dropzone
        type="arrayBuffer"
        onFilesDrop={handleFilesDrop}
        title="Click or drag and drop documents here."
        subTitle="Documents will be stored on S3."
        maxFileSizeInMb={6}
      />
    </Modal>
  );
};
