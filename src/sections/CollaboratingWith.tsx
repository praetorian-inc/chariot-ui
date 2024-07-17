import React, { useMemo, useState } from 'react';
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { useGetCollaborators } from '@/hooks/collaborators';
import useRiskDetails from '@/hooks/useRiskDetails';
import { useAuth } from '@/state/auth';

interface TableData {
  displayName: string;
  email: string;
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export const CollaboratingWith = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [collaborator, setCollaborator] = React.useState<TableData>();
  const [showModal, setShowModal] = React.useState(false);
  const { startImpersonation } = useAuth();
  const fetchRiskDetails = useRiskDetails();
  const { data: collaborators, status } = useGetCollaborators({
    getRiskCounts: true,
  });

  const collaboratorsWithCount = useMemo(() => {
    return collaborators.map((collaborator): TableData => {
      const counts = { total: 0, low: 0, medium: 0, high: 0, critical: 0 };

      if (collaborator.counts) {
        Object.keys(collaborator.counts).forEach(key => {
          const val = collaborator.counts![key];

          // Hide non-open status and info severity risks
          // These were deemed not important enough to show in the table
          if (key[0] !== 'O' || key[1] === 'I') return;

          if (key.length === 2) {
            counts.total += val;
          }

          switch (key[1]) {
            case 'L':
              counts.low += val;
              break;
            case 'M':
              counts.medium += val;
              break;
            case 'H':
              counts.high += val;
              break;
            case 'C':
              counts.critical += val;
              break;
          }
        });
      }

      return {
        displayName: collaborator.displayName,
        email: collaborator.email,
        ...counts,
      };
    });
  }, [JSON.stringify(collaborators)]);

  const exportRisks = async (email: string) => {
    setIsDownloading(true);

    try {
      const { filename, fileData } = await fetchRiskDetails(email);
      const url = window.URL.createObjectURL(
        new Blob([fileData], { type: 'text/csv' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting risks:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const columns: Columns<TableData> = [
    {
      label: 'User',
      id: 'displayName',
      onClick: (row: TableData) =>
        startImpersonation(row.email, row.displayName ?? ''),
      cell: row => (
        <span className="text-brand">
          {row.displayName || row.email || '-'}
        </span>
      ),
    },
    {
      label: 'Total',
      id: 'total',
      fixedWidth: 80,
    },
    {
      label: 'Low',
      id: 'low',
      fixedWidth: 80,
    },
    {
      label: 'Medium',
      id: 'medium',
      fixedWidth: 80,
    },
    {
      label: 'High',
      id: 'high',
      fixedWidth: 80,
    },
    {
      label: 'Critical',
      id: 'critical',
      fixedWidth: 80,
    },
    {
      label: 'Export',
      id: 'total',
      fixedWidth: 100,
      cell: (row: TableData) => (
        <button
          onClick={() => {
            setCollaborator(row);
            setShowModal(true);
          }}
        >
          <ArrowDownCircleIcon className="size-5" />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="flex w-full flex-col">
        <Table
          className="border-none p-0 shadow-none"
          name="collaborators"
          columns={columns}
          data={collaboratorsWithCount}
          status={status}
          loadingRowCount={3}
          noData={{
            description: 'No collaborating organizations found.',
          }}
          isTableView={false}
          error={null}
        />
      </div>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div>{`${collaborator?.displayName || collaborator?.email}'s Export`}</div>
        }
        icon={<ArrowDownCircleIcon className="size-5" />}
        size="md"
      >
        <div className="flex flex-col space-y-4 p-4">
          <p className="text-xl font-semibold text-gray-700">
            Simplify your export process
          </p>
          <p className="text-md mb-3 text-gray-700">
            For a smoother experience, try our command line tool. You can
            install it with
            <code className="ml-1 inline-block rounded bg-gray-200 p-1 py-0.5">
              pip install praetorian-cli
            </code>
            . For more details, check the
            <a
              href="https://github.com/praetorian-inc/praetorian-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-brand hover:underline"
            >
              README
            </a>
            .
          </p>
          <div />
          <p className="text-sm text-gray-700">
            Click below to download all open risks for this organization.
          </p>
          <div className="flex flex-row space-x-2">
            <Button
              styleType="primary"
              onClick={() => collaborator && exportRisks(collaborator.email)}
              className="w-full"
              disabled={isDownloading ?? false}
            >
              Export Risks
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
