import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { HorizontalTimeline } from '@/components/HorizontalTimeline';
import { RisksIcon } from '@/components/icons';
import { UnionIcon } from '@/components/icons/Union.icon';
import { Loader } from '@/components/Loader';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { Modal } from '@/components/Modal';
import { Timeline } from '@/components/Timeline';
import { Tooltip } from '@/components/Tooltip';
import { RiskDropdown } from '@/components/ui/RiskDropdown';
import { TabWrapper } from '@/components/ui/TabWrapper';
import { useMy } from '@/hooks';
import { useGetKev } from '@/hooks/kev';
import { useGetFile, useUploadFile } from '@/hooks/useFiles';
import { useReRunJob } from '@/hooks/useJobs';
import { useReportRisk, useUpdateRisk } from '@/hooks/useRisks';
import { DRAWER_WIDTH } from '@/sections/detailsDrawer';
import { AddAttribute } from '@/sections/detailsDrawer/AddAttribute';
import { Comment } from '@/sections/detailsDrawer/Comment';
import { DetailsDrawerHeader } from '@/sections/detailsDrawer/DetailsDrawerHeader';
import { DrawerList } from '@/sections/detailsDrawer/DrawerList';
import { JobStatus, Risk, RiskCombinedStatus, RiskHistory } from '@/types';
import { formatDate } from '@/utils/date.util';
import { sToMs } from '@/utils/date.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { generatePathWithSearch, useSearchParams } from '@/utils/url.util';

const getJobTimeline = ({
  status,
  updated = '',
}: {
  status?: JobStatus;
  updated?: string;
}) => {
  const description = `Last Checked: ${formatDate(updated)}`;
  return [
    {
      title: 'Idle',
      status: '',
    },
    {
      title: 'Queued',
      status: JobStatus.Queued,
    },
    {
      title: 'Scanning',
      status: JobStatus.Running,
    },
    ...(status === JobStatus.Fail
      ? [
          {
            title: 'Failed',
            status: JobStatus.Fail,
            className: 'bg-error',
          },
        ]
      : [
          {
            title: 'Completed',
            status: JobStatus.Pass,
          },
        ]),
  ].map(current => ({
    ...current,
    description: current.status === status ? description : '',
  }));
};

interface RiskDrawerProps {
  open: boolean;
  compositeKey: string;
}

export function RiskDrawer({ compositeKey, open }: RiskDrawerProps) {
  const navigate = useNavigate();
  const { removeSearchParams } = useSearchParams();

  const [, dns, name] = compositeKey.split('#');

  const referenceFilter = `#risk#${dns}#${name}`;

  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
  const [markdownValue, setMarkdownValue] = useState('');

  const { mutateAsync: reRunJob, status: reRunJobStatus } = useReRunJob();
  const { mutateAsync: updateRisk, isPending: isRiskFetching } =
    useUpdateRisk();
  const { mutateAsync: updateFile, status: updateFileStatus } = useUploadFile();
  const { mutateAsync: reportRisk, status: reportRiskStatus } = useReportRisk();

  const { data: risks = [], status: riskStatus } = useMy(
    {
      resource: 'risk',
      query: compositeKey,
    },
    { enabled: open }
  );

  const {
    data: definitionsFile,
    status: definitionsFileStatus,
    isFetching: isDefinitionsFileFetching,
  } = useGetFile(
    {
      name: `definitions/${name}`,
    },
    { enabled: open }
  );
  const { data: attributes } = useMy(
    {
      resource: 'attribute',
      query: referenceFilter,
    },
    {
      enabled: open,
    }
  );
  const {
    data: allAssetJobs = [],
    status: allAssetJobsStatus,
    refetch: refetchAllAssetJobs,
  } = useMy(
    {
      resource: 'job',
      query: `#${dns}`,
    },
    { enabled: open, refetchInterval: sToMs(10) }
  );
  const { data: knownExploitedThreats = [] } = useGetKev({ enabled: open });

  const definitionsFileValue =
    typeof definitionsFile === 'string'
      ? definitionsFile
      : JSON.stringify(definitionsFile);

  const isInitialLoading =
    riskStatus === 'pending' || definitionsFileStatus === 'pending';
  const risk: Risk = risks[0] || {};

  const jobForThisRisk = allAssetJobs.find(job => {
    return job.source === risk.source;
  });

  const jobTimeline = useMemo(() => {
    return getJobTimeline({
      status: jobForThisRisk?.status,
      updated: jobForThisRisk?.updated,
    });
  }, [jobForThisRisk?.status, jobForThisRisk?.updated]);

  const isJobRunningForThisRisk = useMemo(
    () =>
      jobForThisRisk &&
      [JobStatus.Running, JobStatus.Queued].includes(jobForThisRisk?.status),
    [jobForThisRisk]
  );

  const resetMarkdownValue = useCallback(() => {
    setMarkdownValue(isEditingMarkdown ? definitionsFileValue : '');
  }, [isEditingMarkdown]);

  useEffect(() => {
    resetMarkdownValue();
  }, [resetMarkdownValue]);

  const history = useMemo(() => {
    const riskHistory = risk.history || [];
    const noHistory = riskHistory.length === 0;

    const firstTrackedHistory: RiskHistory = {
      from: '',
      to: noHistory ? risk.status : risk.history[0].from,
      updated: risk.created,
    };

    return [firstTrackedHistory, ...riskHistory];
  }, [JSON.stringify(risk.history)]);

  async function handleUpdateComment(comment = '') {
    await updateRisk({
      comment,
      key: risk.key,
      name: risk.name,
      status: risk.status,
    });
  }

  return (
    <Drawer
      open={open}
      onClose={() => removeSearchParams(StorageKey.DRAWER_COMPOSITE_KEY)}
      onBack={() => navigate(-1)}
      minWidth={DRAWER_WIDTH}
      header={
        isInitialLoading ? null : (
          <DetailsDrawerHeader
            title={risk.name}
            subtitle={risk.dns}
            prefix={
              <div className="flex flex-row items-center space-x-1">
                <RisksIcon className="size-5" />
                {knownExploitedThreats.includes(risk.name) && (
                  <Tooltip
                    title={
                      <span>
                        This risk was found in the{' '}
                        <a
                          href={`https://nvd.nist.gov/vuln/detail/${risk.name}`}
                          className="underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          CISA Known Exploited Vulnerabilities catalog
                        </a>
                        , which helps organizations prioritize and manage
                        vulnerabilities that are actively being exploited.
                      </span>
                    }
                  >
                    <ExclamationCircleIcon className="size-5 text-error" />
                  </Tooltip>
                )}
              </div>
            }
            tag={
              <div className="flex text-default-light">
                <EyeIcon className="mr-2 size-5" />
                {formatDate(risk.updated)}
              </div>
            }
          />
        )
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="flex h-full flex-col gap-10">
          <div className="px-8">
            <HorizontalTimeline
              steps={jobTimeline}
              current={jobTimeline.findIndex(
                ({ status }) => status === jobForThisRisk?.status
              )}
            />
            <div className="flex justify-between">
              <RiskDropdown type="status" risk={risk} />
              <RiskDropdown type="severity" risk={risk} />
              <Button
                className="border-1 h-8 border border-default"
                startIcon={<DocumentTextIcon className="size-5" />}
                onClick={() => {
                  navigate(
                    generatePathWithSearch({
                      appendSearch: [[StorageKey.POE, `${dns}/${name}`]],
                    })
                  );
                }}
              >
                Proof of Exploit
              </Button>
              <Tooltip
                title={
                  risk.source
                    ? isJobRunningForThisRisk
                      ? 'Scanning in progress'
                      : ''
                    : 'On-Demand Scanning is only available for Automated Risks.'
                }
              >
                <Button
                  className="border-1 h-8 border border-default"
                  startIcon={<ArrowPathIcon className="size-5" />}
                  disabled={!risk.source || Boolean(isJobRunningForThisRisk)}
                  isLoading={
                    reRunJobStatus === 'pending' ||
                    allAssetJobsStatus === 'pending'
                  }
                  onClick={async () => {
                    await reRunJob({ capability: risk.source, dns: risk.dns });
                    refetchAllAssetJobs();
                  }}
                >
                  Scan Now
                </Button>
              </Tooltip>
            </div>
          </div>

          <TabGroup className="h-full">
            <TabList className="flex overflow-x-auto">
              {['Description', 'Attributes', 'Comment', 'History'].map(tab => (
                <TabWrapper key={tab}>{tab}</TabWrapper>
              ))}
            </TabList>
            <TabPanels className="size-full h-[calc(100%-220px)] overflow-auto">
              <TabPanel className="h-full p-6">
                <Loader
                  isLoading={
                    isDefinitionsFileFetching || reportRiskStatus === 'pending'
                  }
                  className="h-6"
                >
                  <Modal
                    size="xl"
                    open={isEditingMarkdown}
                    onClose={() => {
                      setIsEditingMarkdown(false);
                    }}
                    title="Description & Remediation"
                    footer={{
                      text: 'Save',
                      isLoading: updateFileStatus === 'pending',
                      onClick: async () => {
                        await updateFile({
                          ignoreSnackbar: true,
                          name: `definitions/${name}`,
                          content: markdownValue,
                        });
                        setIsEditingMarkdown(false);
                      },
                    }}
                  >
                    <MarkdownEditor
                      height={'60vh'}
                      value={markdownValue}
                      onChange={value => {
                        setMarkdownValue(value || '');
                      }}
                      filePathPrefix="definitions/files"
                    />
                  </Modal>
                  <>
                    {definitionsFile && (
                      <MarkdownPreview
                        source={definitionsFileValue}
                        style={{
                          wordBreak: 'break-word',
                          minHeight: '20px',
                        }}
                      />
                    )}
                    {!definitionsFile && (
                      <div className="flex h-96 w-full flex-col items-center justify-center bg-layer1 text-center">
                        <UnionIcon className="size-16 text-default-light" />
                        <p className="mt-7 text-lg font-bold">
                          Generate Description & Remediation
                        </p>
                        <p className="mt-2">
                          Add a Description & Remediation to this Risk
                          <br />
                          using Praetorian’s Machine Learning.
                        </p>
                        <Button
                          className="mt-10"
                          startIcon={
                            <UnionIcon className="size-3 text-brand-light" />
                          }
                          styleType="primary"
                          onClick={() => {
                            reportRisk({ name });
                          }}
                        >
                          Generate Now
                        </Button>
                      </div>
                    )}
                  </>
                  <Button
                    styleType="text"
                    className="mt-4 p-2 font-bold"
                    endIcon={<PencilSquareIcon className="size-4" />}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsEditingMarkdown(true);
                    }}
                  >
                    Edit
                  </Button>
                </Loader>
              </TabPanel>
              <TabPanel className="h-full">
                <AddAttribute resourceKey={risk.key} />
                <div>
                  <DrawerList
                    allowEmpty={true}
                    items={attributes.map(data => ({
                      label: data.class,
                      value: data.name,
                      updated: data.updated,
                    }))}
                  />
                </div>
              </TabPanel>
              <TabPanel className="h-full p-6">
                <Comment
                  comment={risk.comment}
                  isLoading={isRiskFetching}
                  onSave={handleUpdateComment}
                />
              </TabPanel>
              <TabPanel className="h-full px-6">
                <Timeline
                  items={[
                    ...(history
                      ?.map((item, itemIndex) => {
                        const { title, updated } = getHistoryDiff(
                          item,
                          itemIndex === 0
                        );
                        return {
                          title,
                          description: updated,
                          icon:
                            itemIndex === 0 ? <CheckCircleIcon /> : undefined,
                        };
                      })
                      .reverse() || []),
                  ]}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </Loader>
    </Drawer>
  );
}

function getHistoryDiff(
  history: RiskHistory,
  isFirst: boolean
): {
  title: ReactNode;
  updated: string;
} {
  if (isFirst) {
    return {
      title: (
        <div className="whitespace-break-spaces">
          <p className="inline">
            <strong>First Tracked</strong>
            {EmptySpace}as{EmptySpace}
          </p>
          <RiskDropdown
            risk={{
              status: history.to as RiskCombinedStatus,
              key: '',
              comment: '',
            }}
            type={'severity'}
            styleType="chip"
          />
        </div>
      ),
      updated: formatDate(history.updated),
    };
  }

  const isStatusChanged =
    `${history.from?.[0]}${history.from?.[2]}` !==
    `${history.to?.[0]}${history.to?.[2]}`;
  const isSeverityChanged = history.from?.[1] !== history.to?.[1];
  const isBothChanged = isSeverityChanged && isStatusChanged;
  const by = history?.by;

  const severity = (
    <>
      <p className="inline">
        {by ? `${by} changed the Severity from` : `Severity changed from`}
        {EmptySpace}
      </p>
      <RiskDropdown
        risk={{
          status: history.from as RiskCombinedStatus,
          key: '',
          comment: '',
        }}
        type={'severity'}
        styleType="chip"
      />
      <p className="inline">
        {EmptySpace}to{EmptySpace}
      </p>
      <RiskDropdown
        risk={{
          status: history.to as RiskCombinedStatus,
          key: '',
          comment: '',
        }}
        type={'severity'}
        styleType="chip"
      />
    </>
  );

  const status = (
    <>
      <p className="inline">
        {isBothChanged ? (
          <>
            {EmptySpace}, and Status from{EmptySpace}
          </>
        ) : (
          <>
            {by ? `${by} changed the Status from` : 'Status changed from'}
            {EmptySpace}
          </>
        )}
      </p>
      <RiskDropdown
        risk={{
          status: history.from as RiskCombinedStatus,
          key: '',
          comment: '',
        }}
        type={'status'}
        styleType="chip"
      />
      <p className="inline-block">
        {EmptySpace}to{EmptySpace}
      </p>
      <RiskDropdown
        risk={{
          status: history.to as RiskCombinedStatus,
          key: '',
          comment: '',
        }}
        type={'status'}
        styleType="chip"
      />
    </>
  );

  return {
    title: (
      <div className="whitespace-break-spaces leading-7">
        {(isSeverityChanged || isBothChanged) && severity}
        {(isStatusChanged || isBothChanged) && status}
      </div>
    ),
    updated: formatDate(history.updated),
  };
}

const EmptySpace = ' ';
