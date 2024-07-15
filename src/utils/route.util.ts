import { TAppRoutes } from '@/app/AppRoute';
import { IRouteObj } from '@/components/route/RenderRoutes';

type TData = TAppRoutes;

type ExcludeFallback<TData> = Exclude<
  keyof TData,
  '*' | 'default' | 'element' | 'enabled' | 'title'
>;

export function getRoute<
  TKey1 extends ExcludeFallback<TData>,
  TKey2 extends ExcludeFallback<TData[TKey1]>,
  TKey3 extends ExcludeFallback<TData[TKey1][TKey2]>,
  TKey4 extends ExcludeFallback<TData[TKey1][TKey2][TKey3]>,
>(
  path: [TKey1, TKey2, TKey3, TKey4]
): `${TKey1}/${TKey2 extends string ? TKey2 : never}/${TKey3 extends string
  ? TKey3
  : never}/${TKey4 extends string ? TKey4 : never}`;

// eslint-disable-next-line no-redeclare
export function getRoute<
  TKey1 extends ExcludeFallback<TData>,
  TKey2 extends ExcludeFallback<TData[TKey1]>,
  TKey3 extends ExcludeFallback<TData[TKey1][TKey2]>,
>(
  path: [TKey1, TKey2, TKey3]
): `${TKey1}/${TKey2 extends string ? TKey2 : never}/${TKey3 extends string
  ? TKey3
  : never}`;

// eslint-disable-next-line no-redeclare
export function getRoute<
  TKey1 extends ExcludeFallback<TData>,
  TKey2 extends ExcludeFallback<TData[TKey1]>,
>(path: [TKey1, TKey2]): `${TKey1}/${TKey2 extends string ? TKey2 : never}`;

// eslint-disable-next-line no-redeclare
export function getRoute<TKey1 extends ExcludeFallback<TData>>(
  path: [TKey1]
): TKey1;

// eslint-disable-next-line no-redeclare
export function getRoute(path: string[]): string {
  return `/${path.join('/')}`;
}

export function validateRoutes<EnabledProps>(routes: IRouteObj<EnabledProps>) {
  return routes;
}
