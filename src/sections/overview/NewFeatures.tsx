import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import { Dropdown } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';

type Release = {
  id: number;
  name: string;
  body: string;
  html_url: string;
};

export const NewFeatures = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchReleases = async () => {
      const response = await fetch(
        'https://api.github.com/repos/praetorian-inc/chariot-ui/releases'
      );
      const data: Release[] = await response.json();
      setReleases(data);
      setSelectedRelease(data[0]);
    };

    fetchReleases();
  }, []);

  if (!selectedRelease) {
    return <div>Loading...</div>;
  }

  const { name, body, html_url } = selectedRelease;

  const truncatedBody = body.length > 300 ? `${body.slice(0, 300)}...` : body;

  return (
    <div className="rounded-[2px] bg-white p-6 shadow-md">
      <div className="list-inside list-disc text-gray-700">
        <Markdown className="prose">{truncatedBody}</Markdown>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Dropdown
          label={name}
          className="font-semibold"
          endIcon={<ChevronDownIcon className="size-3 stroke-[4px]" />}
          menu={{
            items: releases.map(release => ({
              label: release.name,
              value: release.name,
            })),
            onClick: value => {
              const release = releases.find(r => r.name === value);
              setSelectedRelease(release || null);
            },
            value: name,
          }}
        />
        <span className="text-sm italic">
          <a href={html_url} className="text-primary">
            View Release Notes
          </a>
        </span>
      </div>

      <Modal
        title={name}
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="prose">
          <Markdown>{body}</Markdown>
        </div>
      </Modal>
    </div>
  );
};
