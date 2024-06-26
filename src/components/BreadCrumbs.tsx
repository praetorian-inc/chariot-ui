import React from 'react';

export interface Breadcrumb {
  label: string;
  order: number;
  to?: string;
}

const pageTitles = {
  Seeds:
    'Add and manage entry points to discover and monitor assets for security scans.',
  Assets:
    'Track and manage discovered assets to ensure comprehensive security scanning and risk assessment.',
  Risks:
    'Identify, assess, and prioritize risks found in your assets to enhance security.',
  Integrations:
    "Identify, evaluate, and prioritize risks in your assets to safeguard your organization's security posture.",
  Documents:
    'Store, share, and retrieve all documents, including reports, definitions, proof of exploits, and manually uploaded files.',
  Widgets: 'Create and customize dashboards to gain insights into your data.',
  'Organization Settings': 'Adjust settings specific to your organization.',
  Attributes: 'Manage additional metadata associated with assets.',
  References: 'Manage external references linked to your risks.',
};

export function BreadCrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  const currentPage = breadcrumbs[breadcrumbs.length - 1].label;
  return (
    <div className="flex flex-col pt-9 pb-5">
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
      <p className="mt-1 text-md font-light text-gray-400">
        {currentPage in pageTitles &&
          pageTitles[currentPage as keyof typeof pageTitles]}
      </p>
    </div>
  );
}
