import React, { PropsWithChildren, useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

import { Tooltip } from '@/components/Tooltip';
import { cn } from '@/utils/classname';
import { copyToClipboard } from '@/utils/copyToClipboard.util';

interface CopyToClipboardProps extends PropsWithChildren {
  hideCopyIcon?: boolean;
  className?: string;
  textToCopy?: string;
}

export function CopyToClipboard(props: CopyToClipboardProps) {
  const { hideCopyIcon, children, className, textToCopy } = props;

  const [copied, setCopied] = useState(false);
  const textToCopyFromChildren =
    textToCopy || getTextToCopyFromChildren(children);

  return (
    <div className={cn('flex items-center group')}>
      <div className="flex overflow-hidden">{children}</div>
      {!hideCopyIcon && textToCopyFromChildren && (
        <div className={className}>
          <Tooltip title={copied ? 'Copied to Clipboard' : ''}>
            <ClipboardDocumentIcon
              className="invisible ml-1 size-5 cursor-pointer text-gray-400 hover:text-gray-500 group-hover:visible"
              onClick={e => {
                e.stopPropagation();
                copyToClipboard(textToCopyFromChildren);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function getTextToCopyFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children.trim();
  }

  if (React.isValidElement(children)) {
    if (typeof children.props?.text === 'string') {
      return children.props?.text.trim();
    }

    if (
      typeof children.props?.children === 'object' &&
      Array.isArray(children.props?.children)
    ) {
      return getTextToCopyFromChildren(children.props?.children[0]);
    }

    return getTextToCopyFromChildren(children.props?.children);
  }

  return '';
}
