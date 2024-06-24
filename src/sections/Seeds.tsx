import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  ArrowDownOnSquareStackIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { isFQDN, isIP, isIPRange } from 'validator';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Dropdown } from '@/components/Dropdown';
import { Input } from '@/components/form/Input';
import { Modal } from '@/components/Modal';
import { showBulkSnackbar, Snackbar } from '@/components/Snackbar';
import { Table } from '@/components/table/Table';
import { ActionsWithRowSelection, Columns } from '@/components/table/types';
import { AddSeeds } from '@/components/ui/AddSeeds';
import { FilterCounts } from '@/components/ui/FilterCounts';
import { useModifyAccount, useMy } from '@/hooks';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';
import { change as changeSeed, useDeleteSeed } from '@/hooks/useSeeds';
import { useOpenDrawer } from '@/sections/detailsDrawer/useOpenDrawer';
import {
  Account,
  RiskScanMessage,
  Seed,
  SeedLabels,
  SeedStatus,
} from '@/types';
import { useMergeStatus } from '@/utils/api';
import { partition } from '@/utils/array.util';
import {
  AvailableIntegrations,
  IntegrationsMeta,
} from '@/utils/availableIntegrations';
import { exportContent } from '@/utils/download.util';

const isFrozen = (item: Seed) => {
  return item?.status[0] === SeedStatus.Frozen;
};

const isActive = (item: Seed) => {
  return item?.status[0] === SeedStatus.Active;
};

const Seeds: React.FC = () => {
  const {
    status: riskStatus,
    data: seeds = [],
    error,
    isFetchingNextPage,
    fetchNextPage,
    updateAllSubQueries,
  } = useMy({
    resource: 'seed',
    filterByGlobalSearch: true,
  });
  const { data: stats = {}, status: countsStatus } = useCounts({
    resource: 'seed',
    filterByGlobalSearch: true,
  });
  const { data: accounts, status: accountStatus } = useMy({
    resource: 'account',
  });

  const status = useMergeStatus(riskStatus, countsStatus, accountStatus);

  // Count clouds
  stats.cloud =
    (stats.amazon ?? 0) +
    (stats.azure ?? 0) +
    (stats.gcp ?? 0) +
    (stats.ns1 ?? 0) +
    (stats.crowdstrike ?? 0);

  const { mutateAsync } = useDeleteSeed();
  const { mutate: unlink, status: unlinkStatus } = useModifyAccount('unlink');
  const [integrationList] = partition(accounts as Account[], account =>
    AvailableIntegrations.includes(account.member)
  );

  const isIntegration = (seed: Seed) => {
    return integrationList.some(account => account.member === seed.dns);
  };

  const getIntegrationName = (seed: Seed | undefined) => {
    if (!seed) return;

    const account = IntegrationsMeta.find(account => account.name === seed.dns);

    return account?.displayName;
  };
  const { getSeedDrawerLink } = useOpenDrawer();
  const { mutate: updateSeed } = changeSeed();
  const [descriptionSeed, setDescriptionSeed] = useState<Seed>();
  const [integrationSeed, setIntegrationSeed] = useState<Seed>();
  const [comment, setComment] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filter, setFilter] = useFilter('', setSelectedRows);

  const [isAddSeedsDialogOpen, setIsAddSeedsDialogOpen] = useState(false);

  useEffect(() => {
    if (unlinkStatus === 'success') {
      updateAllSubQueries(previous => {
        if (previous) {
          return {
            ...previous,
            pages: previous.pages.map(page => {
              return page.filter(item => item.name !== integrationSeed?.dns);
            }),
          };
        }
        return previous;
      });
      setIntegrationSeed(undefined);
    }
  }, [unlinkStatus]);

  const handleAddDescription = async () => {
    await updateSeed({
      key: descriptionSeed?.key ?? '',
      comment,
    });
    setDescriptionSeed(undefined);
    setComment('');
  };

  const filteredSeeds = useMemo(() => {
    const computeFilteredSeeds = () => {
      if (filter === 'ipv4') {
        return seeds.filter((seed: Seed) => isIP(seed.dns, 4));
      } else if (filter === 'cidr') {
        return seeds.filter((seed: Seed) => isIPRange(seed.dns));
      } else if (filter === 'github') {
        return seeds.filter((seed: Seed) =>
          seed.dns.startsWith('https://github')
        );
      } else if (filter === 'domain') {
        return seeds.filter(
          (seed: Seed) =>
            isFQDN(seed.dns) && !seed.dns.startsWith('https://github')
        );
      } else if (filter === 'cloud') {
        const integrationNames = integrationList.map(i => i.member);
        return seeds.filter((seed: Seed) =>
          integrationNames.includes(seed.dns)
        );
      }
      return seeds;
    };

    return computeFilteredSeeds();
  }, [filter, JSON.stringify(seeds)]);

  const columns: Columns<Seed> = [
    {
      label: 'Seed Name',
      id: 'dns',
      className: 'w-full',
      copy: true,
      to: item => getSeedDrawerLink(item),
    },
    {
      label: 'Status',
      id: 'dns',
      className: 'hidden sm:table-cell',
      align: 'center',
      fixedWidth: 80,
      cell: (item: Seed) => {
        const isfrozen = isFrozen(item);
        return (
          <Chip style={isfrozen ? 'error' : 'primary'}>
            {isFrozen(item) ? 'Frozen' : 'Active'}
          </Chip>
        );
      },
    },
    {
      label: 'Added',
      id: 'updated',
      cell: 'date',
      className: 'hidden xl:table-cell',
    },
  ];

  const DataExistActionItems: ActionsWithRowSelection<Seed>['items'] = [
    {
      label: 'Status',
      icon: <PlayIcon className="size-5" />,
      disabled: (seeds: Seed[]) => seeds.length === 0,
      submenu: [
        {
          disabled: seeds => seeds.filter(seed => isActive(seed)).length === 0,
          label: 'Stop Scanning',
          icon: <PauseIcon className="size-5" />,
          onClick: seeds => {
            seeds.forEach(seed => {
              const showBulk = showBulkSnackbar(seeds.length);
              updateSeed(
                {
                  key: seed.key,
                  status: SeedStatus.Frozen,
                  showSnackbar: !showBulk,
                },
                {
                  onSuccess: () => {
                    if (showBulk) {
                      Snackbar({
                        title: `${seeds.length} seeds will be removed`,
                        description: RiskScanMessage.Stop,
                        variant: 'success',
                      });
                    }
                  },
                }
              );
            });
          },
        },
        {
          disabled: seeds => seeds.filter(seed => isFrozen(seed)).length === 0,
          label: 'Resume Scanning',
          icon: <PlayIcon className="size-5" />,
          onClick: seeds => {
            seeds.forEach(seed => {
              const showBulk = showBulkSnackbar(seeds.length);
              updateSeed(
                {
                  key: seed.key,
                  status: SeedStatus.Active,
                  showSnackbar: !showBulk,
                },
                {
                  onSuccess: () => {
                    if (showBulk) {
                      Snackbar({
                        title: `${seeds.length} seeds will be removed`,
                        description: RiskScanMessage.Stop,
                        variant: 'success',
                      });
                    }
                  },
                }
              );
            });
          },
        },
      ],
    },
    {
      label: 'Delete',
      icon: <TrashIcon className="size-5" />,
      disabled: seeds => seeds.length === 0,
      onClick: seeds => {
        const showBulk = showBulkSnackbar(seeds.length);
        seeds.forEach(seed => {
          if (isIntegration(seed)) {
            Snackbar({
              title: 'Cannot freeze integration seed',
              description: 'Please remove the integration',
              variant: 'error',
            });
          } else {
            mutateAsync(
              { seed: seed, showSnackbar: !showBulk },
              {
                onSuccess: () => {
                  setSelectedRows([]);
                  if (showBulk) {
                    Snackbar({
                      title: `${seeds.length} seeds removed`,
                      description: '',
                      variant: 'success',
                    });
                  }
                },
              }
            );
          }
        });
      },
    },
    {
      label: 'Export as JSON',
      onClick: () => exportContent(seeds, 'seeds'),
      icon: <ArrowDownOnSquareStackIcon className="size-5" />,
    },
    {
      label: 'Export as CSV',
      onClick: () => exportContent(seeds, 'seeds', 'csv'),
      icon: <ArrowDownOnSquareStackIcon className="size-5" />,
    },
  ];

  const actions: ActionsWithRowSelection<Seed> = {
    items: [
      {
        label: 'Add Seeds',
        icon: <PlusIcon className="size-5" />,
        onClick: () => {
          setIsAddSeedsDialogOpen(true);
        },
      },
      ...(seeds.length > 0 ? DataExistActionItems : []),
    ],
  };

  return (
    <div className="flex w-full flex-col">
      <Table
        filters={
          <div className="flex gap-4">
            <Dropdown
              styleType="header"
              label={filter ? `${SeedLabels[filter]}` : 'All Seeds'}
              endIcon={
                <ChevronDownIcon className="size-3 stroke-[4px] text-header-dark" />
              }
              menu={{
                items: [
                  {
                    label: 'All Seeds',
                    labelSuffix: seeds.length?.toLocaleString(),
                    value: '',
                  },
                  {
                    label: 'Divider',
                    type: 'divider',
                  },
                  ...Object.entries(SeedLabels).map(([key, label]) => {
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
            <FilterCounts count={filteredSeeds.length} type="Seeds" />
          </div>
        }
        rowActions={{
          items: [
            {
              label: 'Status',
              icon: <PlayIcon className="size-5" />,
              disabled: (seeds: Seed[]) => seeds.length === 0,
              submenu: [
                {
                  disabled: seeds =>
                    seeds.filter(seed => isFrozen(seed)).length > 0,
                  label: 'Stop Scanning',
                  icon: <PauseIcon className="size-5" />,
                  onClick: seeds => {
                    seeds.forEach(seed => {
                      updateSeed({ key: seed.key, status: SeedStatus.Frozen });
                    });
                  },
                },
                {
                  disabled: seeds =>
                    seeds.filter(seed => !isFrozen(seed)).length > 0,
                  label: 'Resume Scanning',
                  icon: <PlayIcon className="size-5" />,
                  onClick: seeds => {
                    seeds.forEach(seed => {
                      updateSeed({ key: seed.key, status: SeedStatus.Active });
                    });
                  },
                },
              ],
            },
            {
              label: 'Delete',
              icon: <TrashIcon className="size-5" />,
              onClick: seeds => {
                if (isIntegration(seeds[0])) {
                  setIntegrationSeed(seeds[0]);
                } else {
                  mutateAsync(
                    { seed: seeds[0] },
                    {
                      onSuccess: () => {
                        setSelectedRows([]);
                      },
                    }
                  );
                }
              },
            },
          ],
        }}
        actions={status === 'pending' ? undefined : actions}
        columns={columns}
        data={filteredSeeds}
        selection={{
          value: selectedRows,
          onChange: value => setSelectedRows(value),
        }}
        error={error}
        status={status}
        name="seeds"
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        noData={{
          title: 'No Seeds Found',
          description: (
            <p>
              To find risks on your indexed assets, start by{' '}
              <Button
                className="inline p-0 text-base"
                onClick={() => {
                  setIsAddSeedsDialogOpen(true);
                }}
                styleType="textPrimary"
              >
                adding a seed.
              </Button>
            </p>
          ),
        }}
      />
      <AddSeeds
        isOpen={isAddSeedsDialogOpen}
        onClose={() => {
          setIsAddSeedsDialogOpen(false);
        }}
      />
      <Modal
        title={
          descriptionSeed?.comment ? 'Update Description' : 'Add Description'
        }
        subtitle={`Seed : ${descriptionSeed?.dns}`}
        open={!!descriptionSeed}
        onClose={() => {
          setDescriptionSeed(undefined);
          setComment('');
        }}
        footer={{
          text: 'Add',
          onClick: handleAddDescription,
        }}
      >
        <form className="space-y-4">
          <Input
            label="Description"
            type={Input.Type.TEXT_AREA}
            value={comment}
            name="description"
            onChange={e => {
              const value = e.target.value;
              setComment(value);
            }}
          />
        </form>
      </Modal>
      <Modal
        title={`Remove ${getIntegrationName(integrationSeed)} Integration`}
        open={!!integrationSeed}
        onClose={() => {
          setIntegrationSeed(undefined);
        }}
        footer={{
          text: 'Continue',
          onClick: () => {
            const account = integrationList.find(
              account => account.member === integrationSeed?.class
            );
            if (account) {
              unlink({ username: account.member, config: account.config });
            }
          },
        }}
      >
        <p>Deleting this seed will remove the associated integration.</p>
      </Modal>
    </div>
  );
};

export default Seeds;
