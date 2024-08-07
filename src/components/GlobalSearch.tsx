import React, {
  ElementType,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRightIcon,
  DocumentIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Menu } from '@headlessui/react';

import { Chip } from '@/components/Chip';
import { Input, InputEvent } from '@/components/form/Input';
import { AssetsIcon, RisksIcon } from '@/components/icons';
import { Loader } from '@/components/Loader';
import { RiskDropdown } from '@/components/ui/RiskDropdown';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useScrollToElement } from '@/hooks/useScroll';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { useSearchContext } from '@/state/search';
import {
  Account,
  Asset,
  Job,
  MyFile,
  MyResource,
  ResourceLabels,
  Risk,
  RiskCombinedStatus,
  RiskSeverity,
  Search,
  SeverityDef,
} from '@/types';
import { cn } from '@/utils/classname';
import { getSeverityClass } from '@/utils/getSeverityClass.util';
import { getRoute } from '@/utils/route.util';
import { StorageKey } from '@/utils/storage/useStorage.util';
import { useSearchParams } from '@/utils/url.util';

const GlobalSearch = () => {
  const ref = useRef<HTMLDivElement>(null);

  const {
    search,
    debouncedSearch,
    update: onSearchChange,
    isGenericSearch,
  } = useSearchContext();

  const { removeSearchParams } = useSearchParams();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);

  const { data, status } = useGenericSearch(
    { query: debouncedSearch },
    { enabled: Boolean(isGenericSearch && debouncedSearch) }
  );

  const handleInputChange = (e: InputEvent): void => {
    onSearchChange(e.target.value);
  };

  const handleSelectChange = (resource: keyof MyResource | 'user') => {
    if (resource === 'user') {
      navigate({
        pathname: getRoute(['app', 'account']),
        search: `?${StorageKey.GENERIC_SEARCH}=${encodeURIComponent(search)}`,
      });
    } else {
      navigate({
        pathname: `/app/${resource}s`,
        search: `?${StorageKey.GENERIC_SEARCH}=${encodeURIComponent(search)}`,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocused(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <Input
        className={
          'placeholder:default-dark w-full rounded-3xl bg-header-dark text-header ring-header-dark md:w-[270px] lg:w-[320px] xl:w-[400px]'
        }
        name="search-bar"
        value={search}
        onChange={handleInputChange}
        placeholder="Search"
        startIcon={
          <MagnifyingGlassIcon className="size-4 stroke-header-light" />
        }
        endIcon={
          search ? (
            <span
              className="cursor-pointer"
              onClick={() => {
                removeSearchParams('q');
                onSearchChange('');
              }}
            >
              <XMarkIcon className="size-4 text-header-dark" />
            </span>
          ) : null
        }
        onFocus={() => setIsFocused(true)}
      />
      {isFocused && search?.length === 0 ? (
        <div className="font-default absolute right-0 top-10 z-10 w-[500px] rounded-sm bg-white p-4 text-sm text-black shadow-lg">
          <div className="mb-4 text-gray-700">
            <div className="mb-3">
              <span className="font-bold">Global Search:</span> Enter any term
              to find matching records beginning with that term.
            </div>
            <div className="mb-3">
              <span className="font-bold">Hash Search:</span> Start your search
              with <span className="font-bold">#</span> to filter records by DNS
              within the current page table.
            </div>
          </div>
          <div className="rounded-md bg-gray-100 p-3">
            <p className="mb-3 font-medium text-gray-800">Example searches:</p>
            <p>
              <span className="font-semibold">dev</span>: Find all records
              beginning with the term &quot;dev&quot;.
            </p>
            <p>
              <span className="font-semibold">#name</span>: Filter the current
              page table by &quot;name&quot;.
            </p>
            <p>
              <span className="font-semibold">dns:staging</span>: Search for
              assets with &quot;staging&quot; in the name.
            </p>
          </div>
        </div>
      ) : null}
      {isGenericSearch && isFocused && search?.length > 0 && (
        <SearchResultDropdown
          {...(data as unknown as Search)}
          isLoading={status === 'pending' || search !== debouncedSearch}
          onSelect={handleSelectChange}
          setIsFocused={setIsFocused}
        />
      )}
    </div>
  );
};

export const SeverityBadge = ({ severity }: { severity: RiskSeverity }) => {
  const className = getSeverityClass(severity);
  const label = SeverityDef[severity];

  return (
    <span
      className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: RiskCombinedStatus }) => {
  return (
    <RiskDropdown
      risk={{
        status,
        key: '',
        comment: '',
      }}
      type={'status'}
      styleType="chip"
      className="rounded-full"
    />
  );
};

const SearchResultDropdown: React.FC<Search> = ({
  onSelect,
  risks,
  files,
  assets,
  accounts,
  jobs,
  isLoading,
  setIsFocused,
}) => {
  const navigate = useNavigate();

  const { getRiskDrawerLink, getAssetDrawerLink } = getDrawerLink();

  const { search } = useSearchContext();
  const isEmpty =
    !risks && !files && !assets && !accounts && !jobs && search?.length > 0;

  const tags = [
    { title: ResourceLabels.asset, data: assets },
    { title: ResourceLabels.risk, data: risks },
    { title: ResourceLabels.file, data: files },
    { title: ResourceLabels.job, data: jobs },
    { title: ResourceLabels.user, data: accounts },
  ].filter(({ data = [] }) => data.length > 0);

  return (
    <div
      onClick={() => setIsFocused(false)}
      id="search-result"
      className="absolute z-10 mt-1 max-h-60 w-auto min-w-[440px] max-w-screen-sm overflow-auto rounded-[2px] bg-white text-sm shadow-lg"
    >
      <ul>
        {isLoading &&
          Array(5)
            .fill(0)
            .map((_, index) => (
              <li key={index} className="px-4 py-2 text-gray-600">
                <Loader isLoading className="h-5" />
              </li>
            ))}
        {isEmpty && !isLoading && (
          <li className="px-4 py-2 text-gray-600">
            No results found for <span className="font-semibold">{search}</span>
          </li>
        )}
        {!isLoading && (
          <>
            {/* Only show tags when there is more than one section */}
            {tags.length > 1 && (
              <li className="flex gap-4 px-4 py-2 font-semibold">
                {tags.map(({ title }) => (
                  <SearchResultDropdownTag title={title} key={title} />
                ))}
              </li>
            )}
            <SearchResultDropdownSeaction<Asset>
              title={ResourceLabels.asset}
              items={assets}
              onSelect={() => onSelect('asset')}
              Icon={AssetsIcon}
              onClick={item => {
                navigate(getAssetDrawerLink(item));
              }}
              row={item => (
                <div className="flex items-center space-x-2">
                  <span className="text-nowrap">{item.name}</span>
                  <ChevronRightIcon className="size-2" />
                  <span className="text-nowrap">{item.dns}</span>
                </div>
              )}
            />
            <SearchResultDropdownSeaction<Risk>
              title={ResourceLabels.risk}
              items={risks}
              onSelect={() => onSelect('risk')}
              Icon={RisksIcon}
              onClick={item => {
                navigate(getRiskDrawerLink(item));
              }}
              row={item => {
                const severity = item.status?.[1] as RiskSeverity;
                return (
                  <div className="flex items-center space-x-2">
                    <span className="text-nowrap">{item.name}</span>
                    <ChevronRightIcon className="size-2" />
                    <span className="text-nowrap">{item.dns}</span>
                    <StatusBadge status={item.status} />
                    <SeverityBadge severity={severity} />
                  </div>
                );
              }}
            />
            <SearchResultDropdownSeaction<MyFile>
              title={ResourceLabels.file}
              items={files}
              onSelect={() => onSelect('file')}
              Icon={DocumentIcon}
              row={item => item.name}
            />
            <SearchResultDropdownSeaction<Job>
              title={ResourceLabels.job}
              items={jobs}
              onSelect={() => onSelect('job')}
              Icon={DocumentIcon}
              row={item => `${item.source} (${item.status}) - ${item.dns}`}
            />
            <SearchResultDropdownSeaction<Account>
              title={ResourceLabels.user}
              items={accounts}
              onSelect={() => onSelect('user')}
              Icon={UserIcon}
              row={item => item.name}
            />
          </>
        )}
      </ul>
    </div>
  );
};

function SearchResultDropdownTag({ title }: { title: string }) {
  const { scrollToElement } = useScrollToElement({
    className: `search-${title}`,
  });

  return (
    <Chip
      className="cursor-pointer rounded-full px-2"
      style="default"
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        scrollToElement();
      }}
      key={title}
    >
      {title}
    </Chip>
  );
}

interface SearchResultDropdownSeactionInterface<TData> {
  title: string;
  items: TData[];
  onSelect?: () => void;
  row: (item: TData) => JSX.Element | string;
  Icon?: ElementType;
  onClick?: (item: TData) => void;
}

function SearchResultDropdownSeaction<TData extends { key: string }>({
  title = '',
  items = [],
  onSelect,
  row,
  Icon,
  onClick,
}: SearchResultDropdownSeactionInterface<TData>) {
  const [noOfVisibleItems, setNoOfVisibleItems] = useState(10);

  const hasMore = items.length > noOfVisibleItems;

  return items && items.length > 0 ? (
    <Menu>
      <SearchHeader onSelect={onSelect} className={`search-${title}`}>
        {title} ({items.length} found)
      </SearchHeader>

      {items.slice(0, noOfVisibleItems)?.map(item => (
        <Menu.Item key={item.key}>
          <div
            onClick={() => {
              onClick?.(item);
            }}
            className={cn(
              'flex w-full items-center px-4 py-2 ',
              onClick && 'cursor-pointer hover:bg-gray-100'
            )}
          >
            {Icon && (
              <div>
                <Icon className="mr-2 size-4 text-gray-400" />
              </div>
            )}
            <span className="text-gray-600">{row(item)}</span>
          </div>
        </Menu.Item>
      ))}
      {hasMore && (
        <Menu.Item key={`${title}-more`}>
          <div
            className="flex w-full cursor-pointer items-center px-4 py-2 font-medium text-gray-600 hover:bg-gray-200"
            onClick={event => {
              event.stopPropagation();
              setNoOfVisibleItems(items.length);
            }}
          >
            and {items.length - noOfVisibleItems} More
          </div>
        </Menu.Item>
      )}
    </Menu>
  ) : null;
}

function SearchHeader({
  className: classNameProp = '',
  onSelect,
  children,
}: PropsWithChildren<{ className?: string; onSelect?: () => void }>) {
  const className = cn(
    'w-full px-4 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-200',
    classNameProp
  );

  if (onSelect) {
    return (
      <button onClick={onSelect} className={className}>
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}

export default GlobalSearch;
