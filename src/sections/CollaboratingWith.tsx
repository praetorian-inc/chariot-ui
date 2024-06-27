import React, { useMemo } from 'react';
import { ArrowDownOnSquareStackIcon } from '@heroicons/react/24/solid';

import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { useGetCollaborators } from '@/hooks/collaborators';
import useRiskDetails from '@/hooks/useRiskDetails';
import { useAuth } from '@/state/auth';
import { exportContent } from '@/utils/download.util';

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

  const downloadRisks = async (email: string, filetype: 'json' | 'csv') => {
    const risks = await fetchRiskDetails(email);
    const filteredRisks = risks.filter(risk => risk.status[0] === 'O');
    exportContent(filteredRisks, `risk-detail-${email}.${filetype}`, filetype);
  };

  const columns: Columns<TableData> = [
    {
      label: 'User',
      id: 'displayName',
      cell: 'highlight',
      onClick: (row: TableData) =>
        startImpersonation(row.email, row.displayName ?? ''),
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
  ];

  return (
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
        rowActions={(data: TableData) => {
          return {
            menu: {
              items: [
                {
                  label: 'Export',
                  onClick: () => {
                    downloadRisks(data.email, 'json');
                  },
                  icon: <ArrowDownOnSquareStackIcon />,
                },
                {
                  label: 'Export (as csv)',
                  onClick: () => {
                    downloadRisks(data.email, 'csv');
                  },
                  icon: <ArrowDownOnSquareStackIcon />,
                },
              ],
            },
          };
        }}
      />
    </div>
  );
};
