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

import { Input, InputEvent } from '@/components/form/Input';
import { AssetsIcon, AttributesIcon, RisksIcon } from '@/components/icons';
import { Loader } from '@/components/Loader';
import { RiskDropdown } from '@/components/ui/RiskDropdown';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { getAttributeDetails } from '@/sections/Attributes';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { useSearchContext } from '@/state/search';
import {
  Account,
  Asset,
  Attribute,
  Job,
  MyFile,
  MyResource,
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
  attributes,
  accounts,
  seeds,
  attribute,
  jobs,
  isLoading,
  setIsFocused,
}) => {
  const navigate = useNavigate();

  const { getRiskDrawerLink, getAssetDrawerLink } = getDrawerLink();

  const { search } = useSearchContext();
  const isEmpty =
    !risks &&
    !files &&
    !assets &&
    !attributes &&
    !accounts &&
    !seeds &&
    !attribute &&
    !jobs &&
    search?.length > 0;

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
            <SearchResultDropdownSeaction<Attribute>
              title="Attributes"
              items={attributes}
              onSelect={() => onSelect('attribute')}
              onClick={item => {
                navigate(getAttributeDetails(item).url);
              }}
              row={item => {
                const attDetail = getAttributeDetails(item);

                const icon =
                  attDetail.attributeType === 'asset' ? (
                    <AssetsIcon className="mr-2 size-4 text-gray-400" />
                  ) : (
                    <RisksIcon className="mr-2 size-4 text-gray-400" />
                  );

                return (
                  <div className="flex items-center space-x-2">
                    {icon}
                    <span className="text-nowrap">
                      {attDetail.name} ({attDetail.class})
                    </span>
                    <ChevronRightIcon className="size-2" />
                    <span className="text-nowrap">{attDetail.dns}</span>
                  </div>
                );
              }}
            />
            <SearchResultDropdownSeaction<Asset>
              title="Assets"
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
              title="Risks"
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
              title="Files"
              items={files}
              onSelect={() => onSelect('file')}
              Icon={DocumentIcon}
              row={item => item.name}
            />
            <SearchResultDropdownSeaction<Attribute>
              title="Attribute"
              items={attribute}
              Icon={AttributesIcon}
              onClick={item => {
                navigate(getAttributeDetails(item).url);
              }}
              row={item => {
                const attDetail = getAttributeDetails(item);

                return (
                  <div className="flex flex-nowrap items-center space-x-2">
                    <span className="text-nowrap">{attDetail.name}</span>
                    <span className="text-nowrap">({attDetail.class})</span>
                    <ChevronRightIcon className="size-2" />
                    <span className="text-nowrap">{attDetail.dns}</span>
                  </div>
                );
              }}
            />
            <SearchResultDropdownSeaction<Job>
              title="Jobs"
              items={jobs}
              onSelect={() => onSelect('job')}
              Icon={DocumentIcon}
              row={item => `${item.source} (${item.status}) - ${item.dns}`}
            />
            <SearchResultDropdownSeaction<Account>
              title="Users"
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
      <SearchHeader onSelect={onSelect}>
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
  onSelect,
  children,
}: PropsWithChildren<{ onSelect?: () => void }>) {
  const className =
    'w-full px-4 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-200';

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
