import {
  ArrowRightCircleIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  UserIcon,
} from '@heroicons/react/24/solid';

import { Dropdown } from '@/components/Dropdown';
import { Hexagon } from '@/components/Hexagon';
import { useGetCollaborators } from '@/hooks/collaborators';
import { useGetDisplayName } from '@/hooks/useAccounts';
import { useMy } from '@/hooks/useMy';
import Avatar from '@/sections/topNavBar/Avatar';
import { useAuth } from '@/state/auth';
import { getRoute } from '@/utils/route.util';

export const AccountDropdown: React.FC = () => {
  const { friend, me, startImpersonation, stopImpersonation } = useAuth();

  const { data: accounts, status: accountsStatus } = useMy(
    {
      resource: 'account',
    },
    { doNotImpersonate: true }
  );

  const displayName = useGetDisplayName(accounts);
  const { data: collaborators, status: collaboratorsStatus } =
    useGetCollaborators({ doNotImpersonate: true });

  return (
    <Dropdown
      className="w-[50px] rounded-[2px] p-0 text-base"
      styleType="none"
      menu={{
        className: 'w-64',
        items: [
          {
            label: 'Integrations',
            icon: <PuzzlePieceIcon />,
            to: getRoute(['app', 'integrations']),
          },
          {
            label: 'Documents',
            icon: <DocumentTextIcon />,
            to: getRoute(['app', 'files']),
          },
          {
            label: 'Divider',
            type: 'divider',
          },
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
            isLoading:
              collaboratorsStatus === 'pending' || accountsStatus === 'pending',
            hide:
              collaboratorsStatus === 'error' ||
              (collaboratorsStatus === 'success' && collaborators.length === 0),
            label: displayName || me,
            icon: (
              <Avatar
                email={me}
                className="size-5 max-w-max scale-125 rounded-full"
              />
            ),
            value: displayName || me,
            onClick: () => friend?.email && stopImpersonation(),
          },
          ...collaborators.map(collaborator => ({
            label: collaborator.displayName || collaborator.email,
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
            label: 'Log Out',
            icon: <ArrowRightCircleIcon />,
            to: getRoute(['app', 'logout']),
          },
        ],
        value: friend?.email || me,
      }}
    >
      <Hexagon>
        <Avatar className="scale-150" email={friend.email || me} />
      </Hexagon>
    </Dropdown>
  );
};
