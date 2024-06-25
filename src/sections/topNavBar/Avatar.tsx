import React, { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

import { useGetProfilePictureUrl } from '@/hooks/profilePicture';

interface Props {
  email: string;
  className?: string;
}

const Avatar: React.FC<Props> = ({ email, className }: Props) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const { data: profilePictureUrl } = useGetProfilePictureUrl({ email });

  return (
    <>
      {profilePictureUrl && !imageLoadError ? (
        <img
          src={profilePictureUrl.url}
          onError={() => setImageLoadError(true)}
          alt="User Avatar"
          className={className}
        />
      ) : (
        <div className="relative flex items-center justify-center rounded-[2px] text-sm font-medium text-default-light ring-inset focus:z-10 focus:outline-0 disabled:cursor-not-allowed disabled:bg-default-light disabled:text-default-light">
          <UserIcon className="size-5 text-lg" />
        </div>
      )}
    </>
  );
};

export default Avatar;
