import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import {
  ClipboardCheck,
  HistoryIcon,
  MessageSquare,
  NotepadText,
} from 'lucide-react';

import { Button } from '@/components/Button';
import { Drawer } from '@/components/Drawer';
import { HorizontalTimeline } from '@/components/HorizontalTimeline';
import { RisksIcon } from '@/components/icons';
import { getRiskSeverityIcon } from '@/components/icons/RiskSeverity.icon';
import { UnionIcon } from '@/components/icons/Union.icon';
import { Loader } from '@/components/Loader';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { Modal } from '@/components/Modal';
import { Timeline } from '@/components/Timeline';
import { Tooltip } from '@/components/Tooltip';
import { RiskDropdown } from '@/components/ui/RiskDropdown';
import { useMy } from '@/hooks';
import { useGetKev } from '@/hooks/kev';
import { useGetFile, useUploadFile } from '@/hooks/useFiles';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useBulkReRunJob, useJobsTimeline } from '@/hooks/useJobs';
import { useReportRisk, useUpdateRisk } from '@/hooks/useRisks';
import { DRAWER_WIDTH } from '@/sections/detailsDrawer';
import { Comment } from '@/sections/detailsDrawer/Comment';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import {
  EntityHistory,
  Risk,
  RiskCombinedStatus,
  RiskSeverity,
  SeverityDef,
} from '@/types';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/date.util';
import { sToMs } from '@/utils/date.util';
import { getSeverityClass } from '@/utils/getSeverityClass.util';
import { isManualORPRrovidedRisk } from '@/utils/risk.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { generatePathWithSearch, useSearchParams } from '@/utils/url.util';

interface RiskDrawerProps {
  open: boolean;
  compositeKey: string;
}

export function RiskDrawer({ compositeKey, open }: RiskDrawerProps) {
  const navigate = useNavigate();
  const { removeSearchParams } = useSearchParams();
  const { getRiskDrawerLink, getAssetDrawerLink } = getDrawerLink();

  const [, dns, name] = compositeKey.split('#');

  const attributesFilter = `source:#risk#${dns}#${name}`;

  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
  const [markdownValue, setMarkdownValue] = useState('');
  const { mutateAsync: bulkReRunJobs, status: reRunJobStatus } =
    useBulkReRunJob();
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
  const { data: attributesGenericSearch } = useGenericSearch(
    {
      query: attributesFilter,
      exact: true,
    },
    {
      enabled: open,
    }
  );
  const sourceKeys = useMemo(
    () =>
      (attributesGenericSearch?.attributes || [])
        .filter(
          ({ name, value }) =>
            name === 'source' &&
            (value.startsWith('#attribute') || value.startsWith('#asset'))
        )
        .map(attribute => attribute.value),
    [attributesGenericSearch]
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
  const { data: knownExploitedThreats = [] } = useGetKev();
  const { data: riskNameGenericSearch } = useGenericSearch(
    { query: name },
    { enabled: open }
  );

  const { risks: riskOccurrence = [] } = riskNameGenericSearch || {};
  const definitionsFileValue =
    typeof definitionsFile === 'string'
      ? definitionsFile
      : JSON.stringify(definitionsFile);

  const isInitialLoading =
    riskStatus === 'pending' || definitionsFileStatus === 'pending';
  const risk: Risk = risks[0] || {};

  const severityClass = getSeverityClass(risk.status?.[1]);
  const { jobsTimeline, jobsStatus, isJobsRunning } = useJobsTimeline({
    allAssetJobs,
    source: risk.source,
  });

  const resetMarkdownValue = useCallback(() => {
    setMarkdownValue(isEditingMarkdown ? definitionsFileValue : '');
  }, [isEditingMarkdown]);

  useEffect(() => {
    resetMarkdownValue();
  }, [resetMarkdownValue]);

  const history = useMemo(() => {
    const riskHistory = risk.history || [];
    const noHistory = riskHistory.length === 0;

    const firstTrackedHistory: EntityHistory = {
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
      className={cn(
        'w-full rounded-t-lg bg-zinc-100 pb-0 shadow-lg',
        severityClass
      )}
      footerClassname={'bg-zinc-200 bg-opacity-90'}
      header={
        isInitialLoading ? null : (
          <div className="flex w-full flex-col px-10 pb-0 pt-6">
            {/* Job Timeline and Actions */}
            <HorizontalTimeline
              steps={jobsTimeline}
              current={jobsTimeline.findIndex(
                ({ status }) => status === jobsStatus
              )}
              className={severityClass + ' brightness-90'}
            />
          </div>
        )
      }
    >
      <Loader isLoading={isInitialLoading} type="spinner">
        <div className="flex h-full flex-col gap-2 px-8 pt-0">
          <div className="grid grid-cols-2 gap-4">
            {/* Description & Remediation */}
            <div
              className={cn(
                'bg-white flex flex-col  p-8 transition-all rounded-lg hover:shadow-md'
              )}
            >
              <div className="mb-4 flex flex-row items-start space-x-1">
                <ClipboardCheck className="mt-1 size-12 text-gray-800" />
                <h3
                  className={cn(
                    'text-2xl font-semibold tracking-wide text-gray-900'
                  )}
                >
                  <div className="flex flex-col justify-start text-left">
                    <p className="text-2xl font-semibold text-gray-900">
                      {risk.name}{' '}
                      {knownExploitedThreats.includes(risk.name) && (
                        <span className="text-red-500">
                          [Known Exploited Threat]
                        </span>
                      )}
                    </p>
                    <p className="ml-1 text-sm font-normal text-gray-500">
                      via {risk.source} on {risk.dns}
                    </p>
                  </div>
                </h3>
              </div>
              <Loader
                isLoading={
                  isDefinitionsFileFetching || reportRiskStatus === 'pending'
                }
                className="h-6"
              >
                <Modal
                  size="xl"
                  open={isEditingMarkdown}
                  onClose={() => setIsEditingMarkdown(false)}
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
                  <div className="h-[60vh]">
                    <MarkdownEditor
                      value={markdownValue}
                      onChange={value => setMarkdownValue(value || '')}
                      filePathPrefix="definitions/files"
                    />
                  </div>
                </Modal>
                {definitionsFile ? (
                  <MarkdownPreview
                    source={definitionsFileValue}
                    style={{
                      padding: '0.75rem',
                      wordBreak: 'break-word',
                      minHeight: '20px',
                    }}
                  />
                ) : (
                  <div className="flex w-full flex-1 flex-col items-center justify-center text-center text-default">
                    <UnionIcon className="mt-8 size-16 text-default-light" />
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
                      onClick={() => reportRisk({ name })}
                    >
                      Generate Now
                    </Button>
                  </div>
                )}
                <Button
                  styleType="none"
                  className="mr-auto mt-4 pl-0 font-bold"
                  endIcon={<PencilSquareIcon className="size-5" />}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsEditingMarkdown(true);
                  }}
                >
                  Edit
                </Button>
              </Loader>
            </div>

            <div className="flex flex-col gap-4">
              {/* Actions Section */}
              <div className="flex flex-row justify-end space-x-3">
                <Tooltip placement="top" title="Change risk status">
                  <RiskDropdown
                    type="status"
                    risk={risk}
                    className="h-14 rounded-md border-none bg-white text-default"
                  />
                </Tooltip>
                <Tooltip placement="top" title="Change risk severity">
                  <RiskDropdown
                    type="severity"
                    risk={risk}
                    className={cn(
                      'transition-all h-15 rounded-md border-none',
                      severityClass,
                      'brightness-90'
                    )}
                  />
                </Tooltip>
                <Tooltip placement="top" title="View proof of exploit">
                  <Button
                    className="h-15 text-nowrap rounded-md border-none bg-white"
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
                </Tooltip>

                <Tooltip
                  placement="top"
                  title={
                    isInitialLoading
                      ? ''
                      : risk.source && !isManualORPRrovidedRisk(risk)
                        ? isJobsRunning
                          ? 'Scanning in progress'
                          : sourceKeys.length === 0
                            ? 'On-demand scanning is only available for risk which have a source attribute'
                            : 'Revalidate the risk'
                        : 'On-demand scanning is only available for automated risk discovery.'
                  }
                >
                  <Button
                    className="h-15 text-nowrap rounded-md border-none bg-white"
                    startIcon={<ArrowPathIcon className="size-5" />}
                    disabled={
                      isInitialLoading ||
                      sourceKeys.length === 0 ||
                      isManualORPRrovidedRisk(risk) ||
                      Boolean(isJobsRunning)
                    }
                    isLoading={
                      reRunJobStatus === 'pending' ||
                      allAssetJobsStatus === 'pending'
                    }
                    onClick={async () => {
                      await bulkReRunJobs(
                        sourceKeys.map(jobKey => ({
                          capability: risk.source,
                          jobKey,
                        }))
                      );
                      refetchAllAssetJobs();
                    }}
                  >
                    Scan Now
                  </Button>
                </Tooltip>
              </div>

              {/* Attributes Section */}
              <div
                className={cn(
                  ' bg-white p-8 transition-all rounded-lg hover:shadow-md'
                )}
              >
                <div className="mb-4 flex flex-row items-center space-x-1">
                  <NotepadText className="size-6 text-gray-800" />
                  <h3 className="text-2xl font-semibold tracking-wide text-gray-900">
                    Attributes
                  </h3>
                </div>

                <div className="space-y-4">
                  {attributesGenericSearch?.attributes?.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <p>No attributes added to this risk yet.</p>
                    </div>
                  ) : (
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr>
                          <th className="p-2 text-left text-sm font-medium text-gray-600">
                            Name
                          </th>
                          <th className="p-2 text-left text-sm font-medium text-gray-600">
                            Value
                          </th>
                          <th className="p-2 text-left text-sm font-medium text-gray-600">
                            Last Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributesGenericSearch?.attributes?.map(data => (
                          <tr
                            key={data.name}
                            className="hover: border-b border-gray-200 bg-white"
                          >
                            <td className="p-2 text-sm font-medium text-gray-800">
                              {data.name}
                            </td>
                            <td className=" break-all p-2 text-sm text-gray-500">
                              <span className="">
                                {data.value.startsWith('#asset') ? (
                                  <Link
                                    to={getAssetDrawerLink({
                                      dns: data.value.split('#')[3],
                                      name: data.value.split('#')[2],
                                    })}
                                    className="text-blue-500 hover:underline"
                                  >
                                    {data.value}
                                  </Link>
                                ) : data.value.startsWith('http') ? (
                                  <a
                                    href={data.value}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {data.value}
                                  </a>
                                ) : (
                                  data.value
                                )}
                              </span>
                            </td>
                            <td className="p-2 text-sm text-gray-500">
                              {formatDate(data.updated)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              {/* Comment Section */}
              <div
                className={cn(
                  'bg-white p-8 transition-all rounded-lg hover:shadow-md'
                )}
              >
                <div className="mb-4 flex flex-row items-center space-x-1">
                  <MessageSquare className="size-6 text-gray-800" />
                  <h3 className="text-2xl font-semibold tracking-wide text-gray-900">
                    Comments
                  </h3>
                </div>
                <Comment
                  comment={risk.comment}
                  isLoading={isRiskFetching}
                  onSave={handleUpdateComment}
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            {/* Occurrences Section */}
            <div
              className={cn(
                'bg-white p-8 transition-all rounded-lg hover:shadow-md'
              )}
            >
              <div className="mb-4 flex flex-row items-center space-x-1">
                <RisksIcon className="size-6 text-gray-800" />
                <h3 className="text-2xl font-semibold text-gray-900">
                  Occurrences
                </h3>
              </div>
              {riskOccurrence.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>No occurrences found.</p>
                </div>
              ) : (
                <table className="min-w-full table-auto text-default">
                  <thead>
                    <tr>
                      <th className="w-28 p-2 text-left text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-gray-600">
                        Name
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-gray-600">
                        DNS
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-gray-600">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskOccurrence.map(data => {
                      const riskSeverityKey = data.status?.[1] as RiskSeverity;

                      return (
                        <tr
                          key={data.dns}
                          className="hover: border-b border-gray-200 bg-white"
                        >
                          <td className="p-2 text-sm">
                            <div className="flex flex-row items-center space-x-1">
                              <Tooltip
                                title={
                                  SeverityDef[riskSeverityKey] + ' Severity'
                                }
                              >
                                {getRiskSeverityIcon(
                                  riskSeverityKey,
                                  'h-4 w-4 text-red-500'
                                )}
                              </Tooltip>
                              <p className="text-xs">
                                {SeverityDef[riskSeverityKey]}
                              </p>
                            </div>
                          </td>
                          <td className="p-2 text-sm font-medium text-blue-500">
                            <Link
                              to={getRiskDrawerLink({
                                dns: data.dns,
                                name: data.name,
                              })}
                              className="hover:underline"
                            >
                              {data.name}
                            </Link>
                          </td>
                          <td className="p-2 text-sm text-gray-500">
                            {data.dns}
                          </td>
                          <td className="p-2 text-sm text-gray-500">
                            {formatDate(data.updated)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* History Section */}
          <div
            className={cn(
              'bg-white p-8 mb-8 transition-all rounded-lg hover:shadow-md'
            )}
          >
            <div className="mb-4 flex flex-row items-center space-x-1">
              <HistoryIcon className="size-6 text-gray-800" />
              <h3 className="text-2xl font-semibold text-gray-900">History</h3>
            </div>
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
                      className: 'text-default',
                      icon:
                        itemIndex === 0 ? (
                          <RisksIcon className="stroke-1" />
                        ) : undefined,
                    };
                  })
                  .reverse() || []),
              ]}
            />
          </div>
        </div>
      </Loader>
    </Drawer>
  );
}

function getHistoryDiff(
  history: EntityHistory,
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
        {by ? (
          <span>
            {by} changed the <span className="font-semibold">Severity</span>{' '}
            from
          </span>
        ) : (
          <span>
            <span className="font-semibold">Severity</span> changed from
          </span>
        )}
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
            {EmptySpace}, and <span className="font-semibold">Status</span> from
            {EmptySpace}
          </>
        ) : (
          <>
            {by ? (
              <span>
                {by} changed the <span className="font-semibold">Status</span>{' '}
                from
              </span>
            ) : (
              <span>
                <span className="font-semibold">Status</span> changed from
              </span>
            )}
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
