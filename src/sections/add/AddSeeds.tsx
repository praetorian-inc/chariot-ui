import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

import { Button } from '@/components/Button';
import { Dropzone, Files } from '@/components/Dropzone';
import { Modal } from '@/components/Modal';
import { Tooltip } from '@/components/Tooltip';
import { create as createSeed, useBulkAddSeed } from '@/hooks/useSeeds';
import { useGlobalState } from '@/state/global.state';
import { IntegrationType } from '@/types';
import { AllowedSeedRegex, GetSeeds } from '@/utils/regex.util';
import { SeedsIcon } from '@/components/icons';

export const AddSeeds = () => {
  const {
    modal: {
      seed: { open: isOpen, onOpenChange },
    },
  } = useGlobalState();

  const [seedInput, setSeedInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { mutate: addSeed } = createSeed();
  const { mutate: bulkAddSeed } = useBulkAddSeed();

  const handleSubmitSeed = () => {
    if (seedInput.match(AllowedSeedRegex)) {
      try {
        const asset = seedInput;
        addSeed({ asset });
        setErrorMessage(''); // Clear error message on successful add
      } catch (error) {
        console.error(error);
      } finally {
        setSeedInput('');
        onClose();
      }
    } else {
      setErrorMessage(
        'Invalid Seed format. Please provide a supported format.'
      );
    }
  };

  const handleFilesDrop = (files: Files<'string'>): void => {
    onClose();

    const concatFiles = files.map(({ content }) => content).join('');
    const seedsString = GetSeeds(concatFiles, 500);
    const seeds = seedsString.map(seed => ({ asset: seed }));

    bulkAddSeed(seeds);
  };

  function onClose() {
    onOpenChange(false);
  }

  return (
    <Modal
      title="Add Seeds"
      icon={<SeedsIcon className="size-6 text-default-light" />}
      open={isOpen}
      onClose={onClose}
      size="xl"
    >
      <div className="flex flex-row space-y-6 p-2">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-xl font-medium text-gray-700">
              What is a Seed?
            </h3>
            <p className="mt-1 text-md text-gray-500">
              A seed can be a domain, IP address, CIDR range, GitHub
              organization, or integration. Add seeds directly, through
              integrations, or via file upload to start monitoring and
              discovering assets.
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500 bg-layer1 p-4 rounded-sm">
            For example, if you work for Acme Corporation, you might add seeds
            such as:
            <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
              <li>
                Domains: <code className="font-extrabold">acme.com</code>,{' '}
                <code className="font-extrabold">mail.acme.com</code>
              </li>
              <li>
                IP Addresses: <code className="font-extrabold">8.8.8.8</code>
              </li>
              <li>
                CIDR Ranges: <code className="font-extrabold">8.8.8.0/24</code>
              </li>
              <li>
                GitHub Organizations:{' '}
                <code className="font-extrabold">
                  https://github.com/acme-corp
                </code>
              </li>
              <li>
                Integrations: <code className="font-extrabold">NS1</code>,{' '}
                <code className="font-extrabold">AWS</code>
              </li>
            </ul>
          </p>
          <p className="mt-3 text-sm text-gray-500">
            We will monitor these seeds, discover any associated assets you may
            have missed, and identify risks, enhancing your security by
            mitigating threats early.
          </p>

          <div className="flex-1"></div>

          <form
            className="flex flex-col space-y-4"
            onSubmit={event => {
              event.preventDefault();
              handleSubmitSeed();
            }}
          >
            <div className="flex flex-col">
              <input
                id="seed-input"
                required
                type="text"
                placeholder="acme.com"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
                className="block w-full rounded-l-[2px] border border-gray-300 bg-layer0 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            {errorMessage && (
              <div className="text-sm text-red-500">{errorMessage}</div>
            )}
            <Button
              styleType="primary"
              type="submit"
              className="w-full py-2.5 text-sm font-semibold"
            >
              Add Seed
            </Button>
            <div className="mt-4 text-center text-xs text-gray-500">
              Please ensure you have the necessary permissions to scan the seeds
              you are adding.
            </div>
          </form>
        </div>
        <div className="px-10 text-center">
          <div className="relative m-auto ml-4 flex h-[400px] w-full">
            <div className=" w-px bg-gray-200"></div>
            <div className="absolute -left-[50%] top-[50%] w-full bg-layer0 text-center text-sm text-gray-300">
              or
            </div>
          </div>
        </div>
        <div>
          <Dropzone
            className="h-[330px]"
            type="string"
            onFilesDrop={handleFilesDrop}
            title={'Bulk Upload'}
            subTitle={`Add a document with a list of Domains, IP addresses, CIDR ranges, or GitHub organizations.`}
            maxFileSizeInMb={6}
            maxFileSizeMessage={
              <div className="flex items-center justify-center gap-1 text-xs italic text-gray-500">
                Uploads are limited to 500 seeds and 6MB.
                <Tooltip
                  title={
                    <div className="max-w-xs p-4">
                      The Chariot frontend allows 500 Seeds to be added at once.
                      For larger uploads, please use the{' '}
                      <Link
                        to={
                          'https://github.com/praetorian-inc/praetorian-cli/blob/main/README.md'
                        }
                        target={'_blank'}
                        rel={'noreferrer'}
                        className="underline"
                      >
                        Praetorian CLI
                      </Link>
                      .
                    </div>
                  }
                  placement="top"
                >
                  <Button styleType="none" className="p-0">
                    <InformationCircleIcon className="size-5 text-gray-400" />
                  </Button>
                </Tooltip>
              </div>
            }
            maxFileSizeErrorMessage={
              <span>
                Bulk uploads cannot exceed 500 Seeds or 6MB in file size. Get
                help{' '}
                <a
                  onClick={e => e.stopPropagation()}
                  href="https://docs.praetorian.com/hc/en-us/articles/25814362281627-Adding-and-Managing-Seeds"
                  className="cursor-pointer text-indigo-600"
                  target={'_blank'}
                  rel="noreferrer"
                >
                  formatting your Seed File.
                </a>
              </span>
            }
          />
        </div>
      </div>
    </Modal>
  );
};
