import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

type Release = {
  name: string;
  body: string;
  html_url: string;
};

export const NewFeatures = () => {
  const [releaseNotes, setReleaseNotes] = useState<Release | null>(null);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      const response = await fetch(
        'https://api.github.com/repos/praetorian-inc/chariot-ui/releases/latest'
      );
      const data: Release = await response.json();
      setReleaseNotes(data);
    };

    fetchLatestRelease();
  }, []);

  if (!releaseNotes) {
    return <div>Loading...</div>;
  }

  const { name, body, html_url } = releaseNotes;

  return (
    <div className="rounded-[2px] bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">{name}</h2>
      <div className="list-inside list-disc text-gray-700">
        <Markdown className="prose">{body}</Markdown>
        <a href={html_url} className="text-primary">
          Learn more
        </a>
      </div>
    </div>
  );
};
