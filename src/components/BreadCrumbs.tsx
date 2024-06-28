import React from 'react';

export interface Breadcrumb {
  label: string;
  order: number;
  to?: string;
}

const pageTitles = {
  Seeds: 'Manage entry points to identify and monitor assets for scans.',
  Assets:
    'Track and manage discovered assets to ensure comprehensive security scanning and risk assessment.',
  Risks:
    'Identify, evaluate, and prioritize risks in your assets to protect your organization.',
  Integrations:
    'Configure and manage external service integrations to enhance your security monitoring capabilities.',
  Documents:
    'Store, share, and retrieve all documents, including reports, definitions, proof of exploits, and manually uploaded files.',
  Widgets: 'Create and customize dashboards to gain insights into your data.',
  'Organization Settings': 'Adjust settings specific to your organization.',
  Attributes: 'Manage additional metadata associated with assets.',
  References: 'Manage external references linked to your risks.',
  Jobs: 'Track the status and results of recent security scans from the past 24 hours.',
  Overview:
    "Monitor your organization's attack surface and review daily reports with critical findings and recommendations.",
};

export function BreadCrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  const currentPage = breadcrumbs[breadcrumbs.length - 1].label;
  return (
    <div className="flex flex-col pb-5 pt-9">
      <ul className="flex items-center">
        {breadcrumbs.map((breadcrumb, idx) => {
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <li className="mx-2 hidden text-2xl font-extralight text-default-light sm:inline">
                  /
                </li>
              )}
              <li
                className={`text-2xl font-bold ${idx === 0 && 'hidden sm:inline'}`}
              >
                {breadcrumb.label}
              </li>
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
