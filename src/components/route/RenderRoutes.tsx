import { ReactNode, Suspense, useEffect, useMemo } from 'react';
import {
  Route,
  RouteObject as ReactRouteObject,
  Routes,
} from 'react-router-dom';

import { useBreadCrumbsContext } from '@/state/breadcrumbs';
import { omit } from '@/utils/lodash.util';

type RouteObject = ReactRouteObject & { title?: string };

interface RenderRoutesProps<EnabledProps> {
  appRoutes: IRouteObj<EnabledProps>;
  conditions: EnabledProps;
  fallback?: ReactNode;
}

export function RenderRoutes<EnabledProps>(
  props: RenderRoutesProps<EnabledProps>
) {
  const { fallback, conditions, appRoutes } = props;

  const routeObjects = useMemo(() => {
    return getRouteObjects<EnabledProps>({
      routeObj: appRoutes,
      conditions,
    });
  }, [conditions, appRoutes]);

  return (
    <Suspense fallback={fallback}>
      <Routes>{renderRoutes(routeObjects)}</Routes>
    </Suspense>
  );
}

function renderRoutes(routeObjects: RouteObject[]) {
  return routeObjects.map((route, index) => {
    return (
      <Route
        key={index}
        path={route.path}
        element={<RenderTitleAndBreadcrumb route={route} />}
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    );
  });
}

function RenderTitleAndBreadcrumb(props: { route: RouteObject }) {
  const { route } = props;

  useEffect(() => {
    if (route.title) {
      document.title = `Chariot - ${route.title}`;
    }

    return () => {
      document.title = 'Chariot';
    };
  }, [route.title]);

  return (
    <>
      {route.title && <RenderBreadcrumb title={route.title} />}
      {route.element || null}
    </>
  );
}

function RenderBreadcrumb(props: { title: string }) {
  const { useBreadCrumb } = useBreadCrumbsContext();

  useBreadCrumb({ order: 2, label: props.title, className: 'flex-shrink-0' });

  return null;
}

function getRouteObjects<EnabledProps>(props: {
  routeObj: IRouteObj<EnabledProps>;
  conditions: EnabledProps;
}): RouteObject[] {
  const { routeObj, conditions } = props;

  if (!routeObj.enabled || routeObj.enabled(conditions)) {
    const isIterable = routeObj['*'];

    if (isIterable) {
      const routeEntries = Object.entries(routeObj);
      const hasDefault = routeObj['default'];

      return routeEntries
        .filter(([_key, value]) => {
          const route = value as IRouteExact<EnabledProps>;

          return !route.enabled || route.enabled(conditions);
        })
        .flatMap(([key, value]): RouteObject[] => {
          if (key === '*') {
            const fallbackRoute = { path: '*', element: value as ReactNode };
            const defaultRoute = { path: '', element: value as ReactNode };

            if (hasDefault) {
              return [fallbackRoute];
            }

            return [fallbackRoute, defaultRoute];
          }

          if (key === 'default') {
            const route = value as IRouteExact<EnabledProps>;

            return [
              {
                path: '',
                element: route.element,
                title: route.title,
              },
            ];
          }

          if ((value as IRouteObj<EnabledProps>)['*']) {
            return [
              {
                path: key,
                element: (value as IRouteObj<EnabledProps>).element,
                title: (value as IRouteObj<EnabledProps>).title,
                children: getRouteObjects({
                  routeObj: omit(
                    value as IRouteObj<EnabledProps>,
                    'element',
                    'enabled',
                    'title'
                  ) as IRouteObj<EnabledProps>,
                  conditions,
                }),
              },
            ];
          } else {
            const route = value as IRouteExact<EnabledProps>;

            return [{ path: key, element: route.element, title: route.title }];
          }
        });
    } else {
      return [];
    }
  }

  return [];
}

interface IRouteExact<EnabledProps> {
  enabled?: (props: EnabledProps) => boolean | undefined;
  element: ReactNode;
  title: string;
}

export interface IRouteObj<EnabledProps>
  extends Partial<IRouteExact<EnabledProps>> {
  default?: IRouteExact<EnabledProps>;
  element?: IRouteExact<EnabledProps>['element'];
  enabled?: IRouteExact<EnabledProps>['enabled'];
  '*': ReactNode;
  [key: string]:
    | IRouteObj<EnabledProps>
    | IRouteExact<EnabledProps>
    | IRouteExact<EnabledProps>['element']
    | IRouteExact<EnabledProps>['enabled'];
}
