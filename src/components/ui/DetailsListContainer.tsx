import { ReactNode } from 'react';
import { Link, To } from 'react-router-dom';

import { Accordian } from '@/components/Accordian';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { Loader } from '@/components/Loader';
import { Tooltip } from '@/components/Tooltip';

interface DetailsContainerProps {
  list: {
    label: string;
    value: ReactNode;
    to?: To;
    onClick?: () => void;
    tooltip?: string;
  }[];
  title: string;
  isLoading?: boolean;
}
export function DetailsListContainer(props: DetailsContainerProps) {
  return (
    <Accordian title={props.title} fixed>
      <div className="flex flex-col gap-8">
        {props.list.map(({ label, value, to, onClick, tooltip }, index) => {
          return (
            <Loader key={index} isLoading={props.isLoading} className="h-7">
              {value && (
                <div className="flex flex-col gap-1">
                  <Tooltip title={tooltip}>
                    {!to && (
                      <div
                        className="break-all text-lg font-extrabold"
                        onClick={onClick}
                      >
                        {typeof value === 'string' ? (
                          <CopyToClipboard textToCopy={value?.toString()}>
                            {value}
                          </CopyToClipboard>
                        ) : (
                          value
                        )}
                      </div>
                    )}
                    {to && (
                      <CopyToClipboard textToCopy={value?.toString()}>
                        <Link
                          className="break-all text-lg font-extrabold text-brand"
                          to={to}
                          onClick={onClick}
                        >
                          {value}
                        </Link>
                      </CopyToClipboard>
                    )}
                  </Tooltip>
                  {label && <div className="text-default-light">{label}</div>}
                </div>
              )}
            </Loader>
          );
        })}
      </div>
    </Accordian>
  );
}
