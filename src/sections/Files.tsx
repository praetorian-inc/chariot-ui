import React, { useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  ArrowDownCircleIcon,
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { AddFile } from '@/components/ui/AddFile';
import { FilterCounts } from '@/components/ui/FilterCounts';
import { useDownloadFile, useMy } from '@/hooks';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';
import { FileLabels, MyFile } from '@/types';
import { useMergeStatus } from '@/utils/api';
import { sortByDate } from '@/utils/date.util';
import { useNavigate } from 'react-router-dom';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { RisksIcon } from '@/components/icons';
import { Modal } from '@/components/Modal';
import FileViewer from '@/components/FileViewer';

const Files: React.FC = () => {
  const navigate = useNavigate();
  const { getRiskDrawerLink, getProofOfExploitLink } = useOpenDrawer();
  const [filename, setFilename] = React.useState('');
  const [filetype, setFiletype] = React.useState('');
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

  function getLabel(item: MyFile) {
    const label = FileLabels[item.class];

    // Remove pluralization
    if (label.endsWith('s')) {
      return label.slice(0, -1);
    } else if (label.length) {
      return label;
    }
    return item.class;
  }

  const getAdditionaActions = (item: MyFile) => {
    if (item.class === 'proof') {
      const parts = item.name.split('/');
      const dns = parts.shift() ?? '';
      const name = parts.join('/') ?? '';
      const riskDrawerLink = getRiskDrawerLink({ dns, name });
      const poeLink = getProofOfExploitLink({ dns, name });

      return (
        <div className="flex flex-row mr-2">
          <Tooltip title="View Risk">
            <button
              onClick={() => navigate(riskDrawerLink)}
              className="p-0 m-0"
            >
              <RisksIcon className="size-5" />
            </button>
          </Tooltip>
          <Tooltip title="View Proof">
            <button onClick={() => navigate(poeLink)} className="px-1">
              <DocumentTextIcon className="size-5" />
            </button>
          </Tooltip>
        </div>
      );
    } else if (item.class === 'manual') {
      if (item.name.endsWith('png') || item.name.endsWith('jpg')) {
        return (
          <div className="flex flex-row mr-2">
            <Tooltip title="Preview Image">
              <button
                onClick={() => {
                  setFiletype('image');
                  setFilename(item.name);
                }}
              >
                <PhotoIcon className="size-5" />
              </button>
            </Tooltip>
          </div>
        );
      } else {
        return (
          <div className="flex flex-row mr-2">
            <Tooltip title="View File">
              <button
                onClick={() => {
                  setFiletype('text');
                  setFilename(item.name);
                }}
              >
                <DocumentIcon className="size-5" />
              </button>
            </Tooltip>
          </div>
        );
      }
    }
  };

  const columns: Columns<MyFile> = [
    {
      label: 'Class',
      id: 'class',
      className: 'w-1/5',
      cell: (item: MyFile) => getLabel(item),
    },
    {
      label: 'Document Name',
      id: 'name',
      className: 'w-full',
      cell: (item: MyFile) => {
        return (
          <div className="flex flex-row">
            {getAdditionaActions(item)}
            <span>{item.name}</span>
          </div>
        );
      },
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
        <div className="flex flex-row w-full justify-center">
          <Tooltip title={'Download'}>
            <button
              onClick={() => handleDownload(item)}
              className="block cursor-pointer"
            >
              <ArrowDownCircleIcon className="m-1 size-5 stroke-2" />
            </button>
          </Tooltip>
        </div>
      ),
      fixedWidth: 120,
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
        filters={
          <div className="flex gap-4">
            <Dropdown
              styleType="header"
              label={filter ? `${FileLabels[filter]}` : 'All Classes'}
              endIcon={
                <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
              }
              menu={{
                items: [
                  {
                    label: 'All Classes',
                    labelSuffix: files.length?.toLocaleString(),
                    value: '',
                  },
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  ...Object.entries(FileLabels).map(([key, label]) => {
                    return {
                      label,
                      labelSuffix: stats[key]?.toLocaleString() || 0,
                      value: key,
                    };
                  }),
                ],
                onClick: value => {
                  setFilter(value || '');
                },
                value: filter,
              }}
            />
            <FilterCounts
              count={filteredAndSortedFiles.length}
              type="Documents"
            />
          </div>
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
      <Modal
        open={filename.length > 0 && filetype.length > 0}
        onClose={() => setFilename('')}
        title="File Content"
      >
        <FileViewer fileName={filename} fileType={filetype} />
      </Modal>
    </div>
  );
};

export default Files;
