import React from 'react';

import { OverflowText } from '@/components/OverflowText';
import { cn } from '@/utils/classname';

export interface Breadcrumb {
  label: string;
  className?: string;
  order: number;
  to?: string;
}

export const pageTitles = {
  Assets:
    'Configure and track discovered assets to ensure thorough security scans and risk assessment.',
  Risks:
    'Identify and prioritize risks in assets to protect your organization.',
  Documents:
    'Store, share, and retrieve all documents, including reports, definitions, proof of exploits, and manually uploaded files.',
  Widgets: 'Create and customize dashboards to gain insights into your data.',
  'Organization Settings': 'Adjust settings specific to your organization.',
  Attributes: 'Manage additional metadata associated with assets and risks.',
  Jobs: 'Track the status and results of recent security scans from the past 24 hours.',
  Overview: 'Managed offensive security.',
};

export function BreadCrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.label || '';
  return (
    <div className="flex flex-col overflow-hidden pb-5 pt-9">
      <ul className="flex items-center">
        {breadcrumbs.map((breadcrumb, idx) => {
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <li className="mx-2 hidden text-2xl font-extralight text-default-light sm:inline">
                  /
                </li>
              )}
              <OverflowText
                className={cn(
                  `whitespace-nowrap text-2xl font-bold`,
                  idx === 0 && 'max-sm:hidden',
                  breadcrumb.className
                )}
                placement="bottom"
                text={breadcrumb.label}
              />
            </React.Fragment>
          );
        })}
      </ul>
      <p className="text-md mt-1 font-light text-gray-400">
        {currentPage in pageTitles &&
          pageTitles[currentPage as keyof typeof pageTitles]}
      </p>
    </div>
  );
}
