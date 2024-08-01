import {
  ArrowRightStartOnRectangleIcon,
  ChartBarSquareIcon,
  DocumentTextIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import { Dropdown } from '@/components/Dropdown';
import { Hexagon } from '@/components/Hexagon';
import { Loader } from '@/components/Loader';
import { Tooltip } from '@/components/Tooltip';
import { useGetCollaborators } from '@/hooks/collaborators';
import { useGetDisplayName } from '@/hooks/useAccounts';
import { useMy } from '@/hooks/useMy';
import Avatar from '@/sections/topNavBar/Avatar';
import { useAuth } from '@/state/auth';
import { getRoute } from '@/utils/route.util';

export const AccountDropdown: React.FC = () => {
  const { friend, me, startImpersonation, stopImpersonation, isImpersonating } =
    useAuth();

  const { data: myAccounts, status: myAccountsStatus } = useMy(
    {
      resource: 'account',
    },
    { doNotImpersonate: true }
  );

  const { data: impersonatedAccounts, status: impersonatedAccountsStatus } =
    useMy(
      {
        resource: 'account',
      },
      { enabled: isImpersonating }
    );

  const myDisplayName = useGetDisplayName(myAccounts);
  const friendDisplayName = useGetDisplayName(impersonatedAccounts);

  const { data: collaborators, status: collaboratorsStatus } =
    useGetCollaborators({ doNotImpersonate: true });

  return (
    <Dropdown
      className="rounded-[2px] p-0 text-base"
      styleType="none"
      menu={{
        className: 'w-64',
        items: [
          {
            label: 'Organization Settings',
            icon: <UserIcon />,
            to: getRoute(['app', 'account']),
          },
          {
            label: 'Divider',
            type: 'divider',
          },
          {
            className: 'bg-layer2',
            isLoading:
              collaboratorsStatus === 'pending' ||
              myAccountsStatus === 'pending',
            hide:
              collaboratorsStatus === 'error' ||
              (collaboratorsStatus === 'success' && collaborators.length === 0),
            label: myDisplayName ? (
              <Tooltip title={me}>{myDisplayName}</Tooltip>
            ) : (
              me
            ),
            icon: (
              <Avatar
                email={me}
                className="size-5 max-w-max scale-125 rounded-full"
              />
            ),
            value: myDisplayName || me,
            onClick: () => friend && stopImpersonation(),
          },
          ...collaborators.map(collaborator => ({
            label: (
              <Tooltip title={collaborator.email}>
                <span className="overflow-hidden text-ellipsis text-nowrap">
                  {collaborator.displayName || collaborator.email}
                </span>
              </Tooltip>
            ),
            icon: (
              <Avatar
                email={String(collaborator.email)}
                className="size-5 max-w-max scale-125 rounded-full"
              />
            ),
            value: collaborator.email,
            onClick: () =>
              startImpersonation(
                collaborator.email,
                collaborator.displayName ?? ''
              ),
          })),
          {
            label: 'Divider',
            type: 'divider',
            hide: collaborators.length === 0,
          },
          {
            label: 'Documents',
            icon: <DocumentTextIcon />,
            to: getRoute(['app', 'files']),
          },
          {
            label: 'Widgets',
            icon: <ChartBarSquareIcon />,
            to: getRoute(['app', 'widgets']),
          },
          {
            label: 'Report',
            labelSuffix: (
              <div className="mr-auto flex h-auto items-center">
                <p className="h-fit rounded-[4px] border border-header px-1 text-xs font-medium capitalize">
                  Beta
                </p>
              </div>
            ),
            icon: <DocumentTextIcon />,
            to: getRoute(['app', 'report']),
          },
          {
            label: 'Divider',
            type: 'divider',
          },
          {
            label: 'Log Out',
            icon: <ArrowRightStartOnRectangleIcon />,
            to: getRoute(['app', 'logout']),
          },
        ],
        value: friend || me,
      }}
    >
      <div className="flex h-5 flex-row items-center">
        <div className="mr-0 text-nowrap p-2 text-xs">
          <Loader
            isLoading={
              myAccountsStatus === 'pending' ||
              (isImpersonating && impersonatedAccountsStatus === 'pending')
            }
            className="h-[16px] w-20"
            styleType="header"
          >
            {friendDisplayName || friend || myDisplayName || me}
          </Loader>
        </div>
        <Hexagon>
          <Avatar className="scale-150" email={friend || me} />
        </Hexagon>
      </div>
    </Dropdown>
  );
};
