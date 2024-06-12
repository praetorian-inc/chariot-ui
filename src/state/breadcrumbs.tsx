import React, { createContext, useContext, useEffect, useState } from 'react';

import { Breadcrumb } from '@/components/BreadCrumbs';

// Define the context and its interface for selections
interface BreadCrumbsContextType {
  breadcrumbs: Breadcrumb[];
  useBreadCrumb(newBreadcrumbs: Breadcrumb): void;
}

const BreadCrumbsContext = createContext<BreadCrumbsContextType | undefined>(
  undefined
);

export const useBreadCrumbsContext = () => {
  const context = useContext(BreadCrumbsContext);
  if (!context) {
    throw new Error(
      'useBreadCrumbsContext must be used within a BreadCrumbsProvider'
    );
  }
  return context;
};

export const BreadCrumbsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  const useBreadCrumb = (breadcrumb: Breadcrumb) => {
    useEffect(() => {
      setBreadcrumbs(prevBreadcrumbs => {
        const newBreadcrumbs = [...prevBreadcrumbs];
        newBreadcrumbs[breadcrumb.order - 1] = breadcrumb;
        return newBreadcrumbs;
      });
    }, [breadcrumb.label, breadcrumb.order, breadcrumb.to]);
  };

  return (
    <BreadCrumbsContext.Provider value={{ breadcrumbs, useBreadCrumb }}>
      {children}
    </BreadCrumbsContext.Provider>
  );
};
