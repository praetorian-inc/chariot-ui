import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownOnSquareStackIcon,
  ChevronDownIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { HorseIcon } from '@/components/icons/Horse.icon';
import { SpinnerIcon } from '@/components/icons/Spinner.icon';
import { MenuItemProps } from '@/components/Menu';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { FilterCounts } from '@/components/ui/FilterCounts';
import {
  RiskDropdown,
  riskStatusFilterOptions,
} from '@/components/ui/RiskDropdown';
import { useFilter } from '@/hooks/useFilter';
import { useMy } from '@/hooks/useMy';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import { Risk, RiskStatus, RiskStatusLabel, SeverityDef } from '@/types';
import { useMergeStatus } from '@/utils/api';
import { exportContent } from '@/utils/download.util';
import { Regex } from '@/utils/regex.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { generatePathWithSearch } from '@/utils/url.util';

const DownIcon = (
  <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
);

const getFilterLabel = (
  label = '',
  filter: string[],
  options: MenuItemProps[]
) => {
  const labels = filter.map(
    v => options.find(({ value }) => value === v)?.label || ''
  );
  return filter.length === 1 && filter[0] === ''
    ? `All ${label}`
    : labels.join(', ');
};

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
    statusFilter = [],
    severityFilter = [],
    classFilter = [],
    sourceFilter = [],
    knownExploitedThreats,
  }: {
    statusFilter?: string[];
    severityFilter?: string[];
    classFilter?: string[];
    sourceFilter?: string[];
    knownExploitedThreats?: string[];
  }
) => {
  let filteredRisks = risks;
  if (statusFilter?.filter(Boolean).length > 0) {
    filteredRisks = filteredRisks.filter(({ status }) =>
      statusFilter.includes(`${getStatus(status)}`)
    );
  }
  if (severityFilter?.filter(Boolean).length > 0) {
    filteredRisks = filteredRisks.filter(risk =>
      severityFilter?.includes(risk.status[1])
    );
  }
  if (classFilter?.filter(Boolean).length > 0) {
    filteredRisks = filteredRisks.filter(risk =>
      classFilter?.includes(risk.class)
    );
  }
  if (
    sourceFilter.length > 0 &&
    sourceFilter[0] === 'cisa_kev' &&
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
  const [statusFilter, setStatusesFilter] = useFilter<RiskStatus[]>(
    [RiskStatus.Opened],
    setSelectedRows
  );
  const [severityFilter, setSeverityFilter] = useFilter([''], setSelectedRows);
  const [classFilter, setClassFilter] = useFilter([''], setSelectedRows);
  const [sourceFilter, setSourceFilter] = useFilter([''], setSelectedRows);

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
      classFilter,
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
    classFilter,
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
        fixedWidth: 212,
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
        label: 'Asset',
        id: 'dns',
        className: 'w-full hidden md:table-cell',
        copy: true,
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
      {
        label: 'Proof',
        id: '',
        cell: risk => (
          <Link
            to={generatePathWithSearch({
              appendSearch: [[StorageKey.POE, `${risk.dns}/${risk.name}`]],
            })}
            className="cursor-pointer"
          >
            <DocumentTextIcon className="size-5 text-default-light" />
          </Link>
        ),
        align: 'center',
        fixedWidth: 70,
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

  const severityOptions = useMemo(
    () =>
      Object.entries(SeverityDef)
        .map(([value, label]) => ({
          label,
          labelSuffix: risksExceptSeverity.filter(
            ({ status }) => status[1] === value
          ).length,
          value,
        }))
        .reverse(),
    [risksExceptSeverity]
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

  const classRisks = useMemo(
    () =>
      risksExceptSource.reduce(
        (acc, risk) => {
          acc[risk.class] = (acc[risk.class] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    [risksExceptSource]
  );

  const classOptions = [
    {
      label: 'Weakness',
      value: 'weakness',
      labelSuffix: classRisks.weakness ?? 0,
    },
    {
      label: 'Exposure',
      value: 'exposure',
      labelSuffix: classRisks.exposure ?? 0,
    },
    {
      label: 'Misconfiguration',
      value: 'misconfiguration',
      labelSuffix: classRisks.misconfiguration ?? 0,
    },
  ];

  function getRiskStausOptionWithCount(riskStatus: RiskStatus[]) {
    return riskStatus.map(riskStatus => {
      return {
        label: RiskStatusLabel[riskStatus],
        labelSuffix: risksExceptStatus
          .filter(
            ({ status }: { status: string }) => getStatus(status) === riskStatus
          )
          .length?.toLocaleString(),
        value: riskStatus,
      };
    });
  }

  return (
    <div className="flex w-full flex-col">
      <Table
        name={'risks'}
        filters={
          <div className="flex gap-4">
            <Dropdown
              styleType="header"
              label={getFilterLabel(
                'Statuses',
                statusFilter,
                riskStatusFilterOptions
              )}
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
                  ...getRiskStausOptionWithCount([
                    RiskStatus.Opened,
                    RiskStatus.Triaged,
                  ]),
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  ...getRiskStausOptionWithCount([
                    RiskStatus.Resolved,
                    RiskStatus.Rejected,
                    RiskStatus.FalsePositive,
                  ]),
                ],
                onSelect: selectedRows =>
                  setStatusesFilter(selectedRows as RiskStatus[]),
                value: statusFilter,
                multiSelect: true,
              }}
            />
            <Dropdown
              styleType="header"
              label={getFilterLabel(
                'Severities',
                severityFilter,
                severityOptions
              )}
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
                  ...severityOptions,
                ],
                onSelect: selectedRows => setSeverityFilter(selectedRows),
                value: severityFilter,
                multiSelect: true,
              }}
            />
            <Dropdown
              styleType="header"
              label={getFilterLabel('Classes', classFilter, classOptions)}
              endIcon={DownIcon}
              menu={{
                items: [
                  {
                    label: 'All Classes',
                    labelSuffix: risksExceptSeverity.length,
                    value: '',
                  },
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  ...classOptions,
                ],
                onSelect: selectedRows => setClassFilter(selectedRows),
                value: classFilter,
                multiSelect: true,
              }}
            />
            <Dropdown
              styleType="header"
              label={getFilterLabel('Sources', sourceFilter, [
                { label: 'CISA KEV', value: 'cisa_kev' },
              ])}
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
                onSelect: selectedRows => setSourceFilter(selectedRows),
                value: sourceFilter,
                multiSelect: true,
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
              ? `No risks have been found, but we're actively scanning for them.\nWe'll alert you if we find any.`
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
