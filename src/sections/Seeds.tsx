import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownOnSquareStackIcon,
  ArrowUturnLeftIcon,
  PauseIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { isFQDN, isIP, isIPRange } from 'validator';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Input } from '@/components/form/Input';
import { Modal } from '@/components/Modal';
import { showBulkSnackbar, Snackbar } from '@/components/Snackbar';
import { Table } from '@/components/table/Table';
import { ActionsWithRowSelection, Columns } from '@/components/table/types';
import { AddSeeds } from '@/components/ui/AddSeeds';
import Counts from '@/components/ui/Counts';
import { useModifyAccount, useMy } from '@/hooks';
import { useCounts } from '@/hooks/useCounts';
import { useFilter } from '@/hooks/useFilter';
import { change as changeSeed, useDeleteSeed } from '@/hooks/useSeeds';
import { useMergeStatus } from '@/utils/api';
import { partition } from '@/utils/array.util';
import {
  AvailableIntegrations,
  IntegrationsMeta,
} from '@/utils/availableIntegrations';
import { exportContent } from '@/utils/download.util';

import { Account, RiskScanMessage, Seed, SeedStatus } from '../types';

import { useOpenDrawer } from './detailsDrawer/useOpenDrawer';

const isFrozen = (item: Seed) => {
  return item?.status[0] === SeedStatus.Frozen;
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
  const { openSeed } = useOpenDrawer();
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

  const handleFreezeToggle = (seed: Seed) => {
    if (isFrozen(seed)) {
      updateSeed({ key: seed.key, status: SeedStatus.Active });
    } else {
      updateSeed({ key: seed.key, status: SeedStatus.Frozen });
    }
  };

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
      cell: 'highlight',
      copy: true,
      onClick: item => {
        openSeed(item);
      },
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
      label: 'Freeze',
      icon: <PauseIcon className="size-5" />,
      disabled: seeds => seeds.length === 0,
      onClick: seeds => {
        const showBulk = showBulkSnackbar(seeds.length);
        seeds.forEach(seed => {
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
      label: 'Activate',
      icon: <ArrowUturnLeftIcon className="size-5" />,
      disabled: seeds => seeds.length === 0,
      onClick: seeds => {
        const showBulk = showBulkSnackbar(seeds.length);
        seeds.forEach(seed => {
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
                    title: `${seeds.length} seeds will resume scanning`,
                    description: RiskScanMessage.Start,
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
              { seed: seed.dns, showSnackbar: !showBulk },
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
        counters={
          <Counts
            stats={stats}
            type="seeds"
            selected={filter}
            onClick={(label: string) => {
              if (label === filter && label !== '') {
                setFilter('');
              } else {
                setFilter(label);
              }
            }}
          />
        }
        rowActions={{
          items: [
            {
              label: data => (isFrozen(data) ? 'Activate' : 'Freeze'),
              icon: data => {
                return (
                  <>
                    {isFrozen(data) ? (
                      <ArrowUturnLeftIcon className="size-5" />
                    ) : (
                      <PauseIcon className="size-5" />
                    )}
                  </>
                );
              },
              onClick: seeds => {
                handleFreezeToggle(seeds[0]);
              },
            },
            {
              label: 'Delete',
              icon: <TrashIcon className="size-5" />,
              onClick: seeds => {
                if (isIntegration(seeds[0])) {
                  setIntegrationSeed(seeds[0]);
                } else {
                  mutateAsync(
                    { seed: seeds[0].dns },
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
