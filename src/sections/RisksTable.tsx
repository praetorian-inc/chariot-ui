import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownOnSquareStackIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { HorseIcon } from '@/components/icons/Horse.icon';
import { SpinnerIcon } from '@/components/icons/Spinner.icon';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { FilterCounts } from '@/components/ui/FilterCounts';
import { RiskDropdown, riskStatusOptions } from '@/components/ui/RiskDropdown';
import { useFilter } from '@/hooks/useFilter';
import { useMy } from '@/hooks/useMy';
import { useMergeStatus } from '@/utils/api';
import { exportContent } from '@/utils/download.util';
import { Regex } from '@/utils/regex.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { generatePathWithSearch } from '@/utils/url.util';

import { Risk, RiskSeverity, SeverityDef } from '../types';

import { useOpenDrawer } from './detailsDrawer/useOpenDrawer';

const DownIcon = (
  <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
);

const getStatus = (status: string) => (status[0] || '') + (status[2] || '');

const getFilteredRisksByCISA = (
  risks: Risk[],
  knownExploitedThreats?: string[]
) => {
  let filteredRisks = risks;
  if (knownExploitedThreats && knownExploitedThreats.length > 0) {
    filteredRisks = filteredRisks.filter(risk => {
      const matchedCVEID = Regex.CVE_ID.exec(risk.name)?.[0];

      return (
        (matchedCVEID && knownExploitedThreats.includes(matchedCVEID)) ||
        knownExploitedThreats.includes(risk.name)
      );
    });
  }
  return filteredRisks;
};

const getFilteredRisks = (
  risks: Risk[],
  {
    statusFilter,
    severityFilter,
    sourceFilter,
    knownExploitedThreats,
  }: {
    statusFilter?: string;
    severityFilter?: string;
    sourceFilter?: string;
    knownExploitedThreats?: string[];
  }
) => {
  let filteredRisks = risks;
  if (statusFilter) {
    filteredRisks = filteredRisks.filter(
      ({ status }) => `${getStatus(status)}` === statusFilter
    );
  }
  if (severityFilter) {
    filteredRisks = filteredRisks.filter(
      risk => risk.status[1] === severityFilter
    );
  }
  if (
    sourceFilter === 'cisa_kev' &&
    knownExploitedThreats &&
    knownExploitedThreats.length > 0
  ) {
    filteredRisks = getFilteredRisksByCISA(
      filteredRisks,
      knownExploitedThreats
    );
  }
  return filteredRisks;
};

export function Risks() {
  const { getRiskDrawerLink } = useOpenDrawer();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useFilter('', setSelectedRows);
  const [statusFilter, setStatusesFilter] = useFilter('', setSelectedRows);
  const [sourceFilter, setSourceFilter] = useFilter('', setSelectedRows);

  const { data: threats, status: threatsStatus } = useMy({
    resource: 'threat',
  });
  const {
    data: risks = [],
    status: risksStatus,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useMy({
    resource: 'risk',
    filterByGlobalSearch: true,
  });

  const status = useMergeStatus(risksStatus, threatsStatus);

  const knownExploitedThreats = useMemo(() => {
    return threats.map(threat => threat.name);
  }, [JSON.stringify(threats)]);

  const filteredRisks = useMemo(() => {
    let filteredRisks = risks;
    filteredRisks = getFilteredRisks(risks, {
      statusFilter,
      severityFilter,
      sourceFilter,
      knownExploitedThreats,
    });

    const sortOrder = ['C', 'H', 'M', 'L', 'I'];
    filteredRisks = filteredRisks.sort((a, b) => {
      return (
        sortOrder.indexOf(a.status[1]) - sortOrder.indexOf(b.status[1]) ||
        new Date(b.updated).getTime() - new Date(a.updated).getTime()
      );
    });
    return filteredRisks;
  }, [
    severityFilter,
    statusFilter,
    sourceFilter,
    JSON.stringify(risks),
    JSON.stringify(knownExploitedThreats),
  ]);

  const columns: Columns<Risk> = useMemo(
    () => [
      {
        label: 'Risk Name',
        id: 'name',
        to: (item: Risk) => getRiskDrawerLink(item),
        className: 'w-full',
        copy: true,
      },
      {
        label: 'Status',
        id: 'status',
        className: 'text-left',
        fixedWidth: 200,
        cell: (risk: Risk, selectedRowsData?: Risk[]) => {
          return (
            <div className="border-1 flex justify-start ">
              <RiskDropdown
                type="status"
                risk={risk}
                selectedRowsData={selectedRowsData}
              />
            </div>
          );
        },
      },
      {
        label: 'Severity',
        id: 'status',
        fixedWidth: 120,
        cell: (risk: Risk, selectedRowsData?: Risk[]) => {
          return (
            <RiskDropdown
              type="severity"
              risk={risk}
              selectedRowsData={selectedRowsData}
            />
          );
        },
      },
      {
        label: 'DNS',
        id: 'dns',
        className: 'w-full hidden md:table-cell',
        copy: true,
      },
      {
        label: 'POE',
        id: '',
        cell: risk => (
          <Link
            to={generatePathWithSearch({
              appendSearch: [[StorageKey.POE, `${risk.dns}/${risk.name}`]],
            })}
            className="cursor-pointer"
          >
            <ChatBubbleLeftIcon className="size-5 text-default-light" />
          </Link>
        ),
        align: 'center',
        fixedWidth: 56,
      },
      {
        label: 'First Seen',
        id: 'created',
        cell: 'date',
        className: 'hidden lg:table-cell',
      },
      {
        label: 'Last Seen',
        id: 'updated',
        cell: 'date',
        className: 'hidden lg:table-cell',
      },
    ],
    []
  );

  const risksExceptSeverity = useMemo(
    () =>
      getFilteredRisks(risks, {
        statusFilter,
        sourceFilter,
        knownExploitedThreats,
      }),
    [risks, statusFilter, sourceFilter, JSON.stringify(knownExploitedThreats)]
  );
  const risksExceptStatus = useMemo(
    () =>
      getFilteredRisks(risks, {
        severityFilter,
        sourceFilter,
        knownExploitedThreats,
      }),
    [risks, severityFilter, sourceFilter, JSON.stringify(knownExploitedThreats)]
  );
  const risksExceptSource = useMemo(
    () => getFilteredRisks(risks, { severityFilter, statusFilter }),
    [risks, severityFilter, statusFilter]
  );

  return (
    <div className="flex w-full flex-col">
      <Table
        name={'risks'}
        filters={
          <div className="flex gap-4">
            <Dropdown
              styleType="header"
              label={
                statusFilter
                  ? `${riskStatusOptions.find(option => option.value === statusFilter)?.label}`
                  : 'All Statuses'
              }
              endIcon={DownIcon}
              menu={{
                items: [
                  {
                    label: 'All Statuses',
                    labelSuffix: risksExceptStatus.length?.toLocaleString(),

                    value: '',
                  },
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  ...riskStatusOptions.map(option => ({
                    ...option,
                    label: option.label,
                    labelSuffix: risksExceptStatus
                      .filter(
                        ({ status }: { status: string }) =>
                          getStatus(status) === option.value
                      )
                      .length?.toLocaleString(),
                  })),
                ],
                onClick: value => {
                  setStatusesFilter(value || '');
                },
                value: statusFilter,
              }}
            />
            <Dropdown
              styleType="header"
              label={
                severityFilter
                  ? `${SeverityDef[severityFilter as RiskSeverity]}`
                  : 'All Severities'
              }
              endIcon={DownIcon}
              menu={{
                items: [
                  {
                    label: 'All Severities',
                    labelSuffix: risksExceptSeverity.length,
                    value: '',
                  },
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  ...Object.entries(SeverityDef)
                    .map(([value, label]) => ({
                      label,
                      labelSuffix: risksExceptSeverity.filter(
                        ({ status }) => status[1] === value
                      ).length,
                      value,
                    }))
                    .reverse(),
                ],
                onClick: value => {
                  setSeverityFilter(value || '');
                },
                value: severityFilter,
              }}
            />
            <Dropdown
              styleType="header"
              label={sourceFilter === 'cisa_kev' ? 'CISA KEV' : 'All Sources'}
              endIcon={DownIcon}
              menu={{
                items: [
                  {
                    label: 'All Sources',
                    labelSuffix: risksExceptSource.length,
                    value: '',
                  },
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  {
                    label: 'CISA KEV',
                    labelSuffix: getFilteredRisksByCISA(
                      risksExceptSource,
                      knownExploitedThreats
                    ).length,
                    value: 'cisa_kev',
                  },
                ],
                onClick: value => {
                  setSourceFilter(value || '');
                },
                value: sourceFilter,
              }}
            />
            <FilterCounts count={filteredRisks.length} type="Risks" />
          </div>
        }
        columns={columns}
        data={filteredRisks}
        status={status}
        error={error}
        selection={{ value: selectedRows, onChange: setSelectedRows }}
        noData={{
          title: risks?.length > 0 ? 'Scanning for Risks' : 'No Risks Found',
          description:
            risks.length > 0
              ? `None of these Risks have been found, but we're actively scanning for them.\nWe'll alert you if we find any.`
              : `Congratulations! Your Assets look safe, secure, and properly configured.\nWe'll continue to watch them to ensure nothing changes.`,
          icon:
            risks.length > 0 ? (
              <SpinnerIcon className="size-[100px]" />
            ) : (
              <HorseIcon />
            ),
        }}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        actions={{
          items: [
            {
              label: 'Export as JSON',
              onClick: () => exportContent(risks, 'risks'),
              icon: <ArrowDownOnSquareStackIcon className="size-5" />,
            },
            {
              label: 'Export as CSV',
              onClick: () => exportContent(risks, 'risks', 'csv'),
              icon: <ArrowDownOnSquareStackIcon className="size-5" />,
            },
          ],
        }}
      />
    </div>
  );
}
