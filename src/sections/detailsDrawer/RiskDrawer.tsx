import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import MDEditor from '@uiw/react-md-editor';

import { Accordian } from '@/components/Accordian';
import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { Dropdown } from '@/components/Dropdown';
import { HorizontalSplit } from '@/components/HorizontalSplit';
import { HorizontalTimeline } from '@/components/HorizontalTimeline';
import { UnionIcon } from '@/components/icons/Union.icon';
import { Loader } from '@/components/Loader';
import { Modal } from '@/components/Modal';
import { Timeline } from '@/components/Timeline';
import { Tooltip } from '@/components/Tooltip';
import { DetailsListContainer } from '@/components/ui/DetailsListContainer';
import { RiskDropdown } from '@/components/ui/RiskDropdown';
import { useMy } from '@/hooks';
import { useGetFile, useUploadFile } from '@/hooks/useFiles';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useReRunJob } from '@/hooks/useJobs';
import { useReportRisk, useUpdateRisk } from '@/hooks/useRisks';
import { Comment } from '@/sections/detailsDrawer/Comment';
import { DetailsDrawerHeader } from '@/sections/detailsDrawer/DetailsDrawerHeader';
import { JobStatus, Risk, RiskCombinedStatus, RiskHistory } from '@/types';
import { formatDate } from '@/utils/date.util';
import { sToMs } from '@/utils/date.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { generatePathWithSearch, useSearchParams } from '@/utils/url.util';

import { DRAWER_WIDTH } from '.';

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
      title: 'No Jobs Running',
      status: '',
    },
    {
      title: 'Job Queued',
      status: JobStatus.Queued,
    },
    {
      title: 'Job Running',
      status: JobStatus.Running,
    },
    ...(status === JobStatus.Fail
      ? [
          {
            title: 'Job Failed',
            status: JobStatus.Fail,
            className: 'bg-error',
          },
        ]
      : [
          {
            title: 'Job Complete',
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

  const referenceFilter = `#${dns}#${name}`;

  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
  const [markdownValue, setMarkdownValue] = useState('');

  const { mutateAsync: reRunJob, status: reRunJobStatus } = useReRunJob();
  const { mutateAsync: updateRisk } = useUpdateRisk();
  const { mutateAsync: updateFile, status: updateFileStatus } = useUploadFile();
  const { mutateAsync: reportRisk, status: reportRiskStatus } = useReportRisk();

  const {
    data: risks = [],
    status: riskStatus,
    isFetching: isRisksFetching,
  } = useMy(
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
  const { data: references } = useMy(
    {
      resource: 'ref',
      query: `#${dns}#${name}`,
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
  const { data: riskNameGenericSearch, status: riskNameGenericSearchStatus } =
    useGenericSearch({ query: name }, { enabled: open });

  const { risks: riskOccurrence = [] } = riskNameGenericSearch || {};

  const { data: threats } = useMy({
    resource: 'threat',
  });
  const knownExploitedThreats = useMemo(() => {
    return threats.map(threat => threat.name);
  }, [JSON.stringify(threats)]);

  const hostRef = references.find(ref => ref.class === 'host');
  const [ip, port] = hostRef?.name?.split(/:(?=[^:]*$)/) ?? '';
  const urlRefs = references.filter(ref => ref.class === 'url');
  const urlsImpacted = urlRefs.map(ref => ref.name);

  const definitionsFileValue =
    typeof definitionsFile === 'string'
      ? definitionsFile
      : JSON.stringify(definitionsFile);

  const isInitialLoading =
    riskStatus === 'pending' ||
    riskNameGenericSearchStatus === 'pending' ||
    definitionsFileStatus === 'pending';
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
      className={DRAWER_WIDTH}
      footer={
        <div className="flex gap-2">
          <Dropdown
            menu={{
              items: [
                {
                  label: 'Show References',
                  to: {
                    pathname: getRoute(['app', 'references']),
                    search: `?${StorageKey.HASH_SEARCH}=${encodeURIComponent(referenceFilter)}`,
                  },
                },
                {
                  label: 'Proof of Exploit',
                  to: generatePathWithSearch({
                    appendSearch: [[StorageKey.POE, `${dns}/${name}`]],
                  }),
                },
              ],
            }}
            label="Actions"
            className="ml-auto hover:bg-layer0"
            styleType="secondary"
          />
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
              styleType="primary"
              disabled={!risk.source || Boolean(isJobRunningForThisRisk)}
              isLoading={
                reRunJobStatus === 'pending' || allAssetJobsStatus === 'pending'
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
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="flex h-full flex-col gap-10">
          <DetailsDrawerHeader
            title={risk.name}
            subtitle={risk.dns}
            prefix={
              knownExploitedThreats.includes(risk.name) && (
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
              )
            }
          />
          <HorizontalTimeline
            steps={jobTimeline}
            current={jobTimeline.findIndex(
              ({ status }) => status === jobForThisRisk?.status
            )}
          />
          <HorizontalSplit
            leftContainer={
              <>
                <Accordian title="Risk History" contentClassName="pt-0">
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
                </Accordian>
                <Accordian
                  title="Description & Remediation"
                  titlerightContainer={
                    <Button
                      styleType="textPrimary"
                      className="p-0 text-xs font-bold"
                      endIcon={<ChevronRightIcon className="size-3" />}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsEditingMarkdown(true);
                      }}
                    >
                      Edit
                    </Button>
                  }
                >
                  <Loader
                    isLoading={
                      isDefinitionsFileFetching ||
                      reportRiskStatus === 'pending'
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
                      <MDEditor
                        className="markdownSelection"
                        height={'60vh'}
                        value={markdownValue}
                        onChange={value => {
                          setMarkdownValue(value || '');
                        }}
                      />
                    </Modal>
                    <>
                      {definitionsFile && (
                        <MDEditor.Markdown
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
                  </Loader>
                </Accordian>
              </>
            }
            rightContainer={
              <>
                <DetailsListContainer
                  title="Risk Details"
                  list={[
                    {
                      label: '',
                      value: (
                        <div className="flex gap-2 text-sm">
                          <RiskDropdown
                            type="status"
                            className="justify-center py-2"
                            risk={risk}
                          />
                          <RiskDropdown
                            type="severity"
                            className="justify-center py-2"
                            risk={risk}
                          />
                        </div>
                      ),
                    },
                    {
                      label: 'First Seen',
                      value: formatDate(risk.created),
                      tooltip: risk.created,
                    },
                    {
                      label: 'Last Seen',
                      value: formatDate(risk.updated),
                      tooltip: risk.updated,
                    },
                    { label: 'Asset', value: ip || '' },
                    { label: 'Port', value: port || '' },
                    {
                      label: `URL${urlsImpacted?.length > 1 ? 's' : ''} Impacted`,
                      value:
                        urlsImpacted?.length === 0
                          ? ''
                          : urlsImpacted?.map(url => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="cursor-hand block text-brand"
                              >
                                {url}
                              </a>
                            )),
                    },
                    {
                      label: 'Occurrences',
                      value: riskOccurrence.length.toString(),
                      to: {
                        pathname: getRoute(['app', 'risks']),
                        search: `?${StorageKey.GENERIC_SEARCH}=${encodeURIComponent(name)}`,
                      },
                    },
                  ]}
                />
                <Comment
                  comment={risk.comment}
                  isLoading={isRisksFetching}
                  onSave={handleUpdateComment}
                />
              </>
            }
          />
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
