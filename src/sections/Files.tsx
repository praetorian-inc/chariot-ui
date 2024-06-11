import React, { useMemo } from 'react';
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { AddFile } from '@/components/ui/AddFile';
import Counts from '@/components/ui/Counts';
import { useDownloadFile, useMy } from '@/hooks';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';
import { useMergeStatus } from '@/utils/api';
import { sortByDate } from '@/utils/date.util';

import { MyFile } from '../types';

const Files: React.FC = () => {
  const {
    status: fileStatus,
    data: files = [],
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useMy({
    resource: 'file',
    filterByGlobalSearch: true,
  });
  const { data: stats = {}, status: statsStatus } = useCounts({
    resource: 'file',
    filterByGlobalSearch: true,
  });

  const status = useMergeStatus(fileStatus, statsStatus);

  const [filter, setFilter] = useFilter('');

  const filteredFiles = useMemo(() => {
    if (filter) {
      return files.filter((file: MyFile) => file.class === filter);
    }
    return files;
  }, [filter, JSON.stringify(files)]);

  const [isUploadFileDialogOpen, setIsUploadFileDialogOpen] =
    React.useState(false);
  const sortedFiles = sortByDate(filteredFiles);
  const filteredAndSortedFiles = sortedFiles.filter(
    file => !file.name.endsWith('/')
  );

  const { mutate: downloadFile } = useDownloadFile();

  function handleDownload(item: MyFile) {
    downloadFile({ name: item.name });
  }

  const columns: Columns<MyFile> = [
    {
      label: 'Document Name',
      id: 'name',
      className: 'w-full',
    },
    // {
    //   label: 'File Type',
    //   id: 'type',
    // },
    {
      label: 'Added By',
      id: 'username',
      className: 'w-1/2',
    },
    {
      label: 'Added',
      id: 'updated',
      cell: 'date',
    },
    {
      label: 'Actions',
      id: '',
      cell: (item: MyFile) => (
        <Tooltip title={'Download'}>
          <button
            onClick={() => handleDownload(item)}
            className="m-auto block cursor-pointer"
          >
            <ArrowDownCircleIcon className="m-1 size-5 stroke-2" />
          </button>
        </Tooltip>
      ),
      fixedWidth: 80,
      align: 'center',
    },
  ];

  return (
    <div className="flex w-full flex-col">
      <Table
        columns={columns}
        data={filteredAndSortedFiles}
        error={error}
        status={status}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        counters={
          <Counts
            stats={stats}
            onClick={(label: string) => {
              if (label === filter && label !== '') {
                setFilter('');
              } else {
                setFilter(label);
              }
            }}
            selected={filter}
            type="files"
          />
        }
        actions={{
          items: [
            {
              label: 'Upload Document',
              onClick: () => {
                setIsUploadFileDialogOpen(true);
              },
            },
          ],
        }}
        name="documents"
        noData={{
          title: 'No Documents Found',
          description: (
            <p>
              No documents have been attached to your account yet.
              <br />
              Remedy that by{' '}
              <Button
                className="inline p-0 text-base"
                onClick={() => {
                  setIsUploadFileDialogOpen(true);
                }}
                styleType="textPrimary"
              >
                Uploading a file now
              </Button>
            </p>
          ),
        }}
      />
      <AddFile
        isOpen={isUploadFileDialogOpen}
        onClose={() => setIsUploadFileDialogOpen(false)}
      />
    </div>
  );
};

export default Files;
