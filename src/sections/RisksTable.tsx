import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDownIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  Bars2Icon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { RisksIcon } from '@/components/icons';
import { HorseIcon } from '@/components/icons/Horse.icon';
import { getRiskSeverityIcon } from '@/components/icons/RiskSeverity.icon';
import { getRiskStatusIcon } from '@/components/icons/RiskStatus.icon';
import { SpinnerIcon } from '@/components/icons/Spinner.icon';
import { MenuItemProps } from '@/components/Menu';
import { Table } from '@/components/table/Table';
import { Columns } from '@/components/table/types';
import { Tooltip } from '@/components/Tooltip';
import { ClosedStateModal } from '@/components/ui/ClosedStateModal';
import { riskStatusFilterOptions } from '@/components/ui/RiskDropdown';
import { useGetKev } from '@/hooks/kev';
import { useFilter } from '@/hooks/useFilter';
import { useMy } from '@/hooks/useMy';
import { useBulkUpdateRisk } from '@/hooks/useRisks';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { useGlobalState } from '@/state/global.state';
import {
  Risk,
  RiskSeverity,
  RiskStatus,
  RiskStatusLabel,
  SeverityDef,
} from '@/types';
import { useMergeStatus } from '@/utils/api';
import { Regex } from '@/utils/regex.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { generatePathWithSearch } from '@/utils/url.util';

const DownIcon = (
  <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
);

export const getFilterLabel = (
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
  if (knownExploitedThreats && knownExploitedThreats.length > 0) {
    return risks.filter(risk => {
      const parsedCVEIDFromRisk = Regex.CVE_ID.exec(risk.name)?.[0];

      return (
        parsedCVEIDFromRisk &&
        knownExploitedThreats.includes(parsedCVEIDFromRisk)
      );
    });
  }
  return [];
};

const getFilteredRisks = (
  risks: Risk[],
  {
    statusFilter = [],
    severityFilter = [],
    sourceFilter = [],
    knownExploitedThreats,
  }: {
    statusFilter?: string[];
    severityFilter?: string[];
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
  const { getRiskDrawerLink } = getDrawerLink();
  const updateRisk = useBulkUpdateRisk();

  const {
    modal: { risk },
  } = useGlobalState();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [statusFilter, setStatusesFilter] = useFilter<RiskStatus[]>(
    [RiskStatus.Opened],
    'risk-status',
    setSelectedRows
  );
  const [severityFilter, setSeverityFilter] = useFilter(
    [''],
    'risk-severity',
    setSelectedRows
  );

  const [sourceFilter, setSourceFilter] = useFilter(
    [''],
    'risk-source',
    setSelectedRows
  );

  const [isClosedSubStateModalOpen, setIsClosedSubStateModalOpen] =
    useState(false);

  const { data: knownExploitedThreats = [], status: threatsStatus } =
    useGetKev();

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
        cell: (risk: Risk) => {
          const riskStatusKey =
            `${risk.status?.[0]}${risk.status?.[2] || ''}` as RiskStatus;
          const riskSeverityKey = risk.status?.[1] as RiskSeverity;

          const statusIcon = getRiskStatusIcon(riskStatusKey);
          const severityIcon = getRiskSeverityIcon(riskSeverityKey);

          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-default">
                <Tooltip title={RiskStatusLabel[riskStatusKey] || 'Cloed'}>
                  {statusIcon}
                </Tooltip>
                <Tooltip title={SeverityDef[riskSeverityKey]}>
                  {severityIcon}
                </Tooltip>
              </div>
              <span>{risk.name}</span>
            </div>
          );
        },
      },
      {
        label: 'Status',
        id: 'status',
        className: 'text-left',
        fixedWidth: 200,
        cell: (risk: Risk) => {
          const riskStatusKey =
            `${risk.status?.[0]}${risk.status?.[2] || ''}` as RiskStatus;
          return <span>{RiskStatusLabel[riskStatusKey]}</span>;
        },
      },
      // {
      //   label: 'Severity',
      //   id: 'status',
      //   fixedWidth: 140,
      //   cell: (risk: Risk) => {
      //     return (
      //       <RiskDropdown type="severity" risk={risk} className="w-[120px]" />
      //     );
      //   },
      // },
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
          <Tooltip title="View Proof">
            <Link
              to={generatePathWithSearch({
                appendSearch: [[StorageKey.POE, `${risk.dns}/${risk.name}`]],
              })}
              className="cursor-pointer"
            >
              <DocumentTextIcon className="size-5 text-default-light" />
            </Link>
          </Tooltip>
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
        resize={true}
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
                    RiskStatus.Triaged,
                    RiskStatus.Opened,
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
              label={getFilterLabel('Threat Intel', sourceFilter, [
                { label: 'CISA KEV', value: 'cisa_kev' },
              ])}
              endIcon={DownIcon}
              menu={{
                items: [
                  {
                    label: 'All Threat Intel',
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
          </div>
        }
        primaryAction={() => {
          return {
            label: 'Configure',
            startIcon: <PlusIcon className="size-5" />,
            icon: <RisksIcon className="size-5" />,
            onClick: () => {
              risk.onOpenChange(true);
            },
          };
        }}
        actions={(selectedRows: Risk[]) => {
          return {
            menu: {
              items: [
                {
                  label: 'Status',
                  type: 'label',
                },
                {
                  label: RiskStatusLabel[RiskStatus.Triaged],
                  icon: getRiskStatusIcon(RiskStatus.Triaged),
                  onClick: () =>
                    updateRisk({
                      selectedRows,
                      status: RiskStatus.Triaged,
                    }),
                },
                {
                  label: RiskStatusLabel[RiskStatus.Opened],
                  icon: getRiskStatusIcon(RiskStatus.Opened),
                  onClick: () =>
                    updateRisk({
                      selectedRows,
                      status: RiskStatus.Opened,
                    }),
                },
                {
                  label: 'Closed',
                  icon: getRiskStatusIcon(RiskStatus.Resolved),
                  onClick: () => {
                    setIsClosedSubStateModalOpen(true);
                  },
                },
                {
                  label: 'Severity',
                  type: 'label',
                },
                {
                  label: 'Critical',
                  icon: <ChevronDoubleUpIcon />,
                  onClick: () =>
                    updateRisk({
                      selectedRows,
                      severity: RiskSeverity.Critical,
                    }),
                },
                {
                  label: 'High',
                  icon: <ChevronUpIcon />,
                  onClick: () =>
                    updateRisk({
                      selectedRows,
                      severity: RiskSeverity.High,
                    }),
                },
                {
                  label: 'Medium',
                  icon: <Bars2Icon />,
                  onClick: () =>
                    updateRisk({
                      selectedRows,
                      severity: RiskSeverity.Medium,
                    }),
                },
                {
                  label: 'Low',
                  icon: <ChevronDownIcon />,
                  onClick: () =>
                    updateRisk({
                      selectedRows,
                      severity: RiskSeverity.Low,
                    }),
                },
                {
                  label: 'Informational',
                  icon: <ChevronDoubleDownIcon />,
                  onClick: () =>
                    updateRisk({
                      selectedRows,
                      severity: RiskSeverity.Info,
                    }),
                },
              ],
            },
          };
        }}
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
      />
      <ClosedStateModal
        isOpen={isClosedSubStateModalOpen}
        onClose={() => setIsClosedSubStateModalOpen(false)}
        onStatusChange={({ status }) => {
          updateRisk({
            selectedRows: selectedRows
              .map(i => filteredRisks[Number(i)])
              .filter(Boolean),
            status,
          });
        }}
      />
    </div>
  );
}
