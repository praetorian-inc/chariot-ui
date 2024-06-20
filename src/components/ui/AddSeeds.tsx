import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

import { create as createSeed, useBulkAddSeed } from '@/hooks/useSeeds';
import { AllowedSeedRegex, GetSeeds } from '@/utils/regex.util';

import { Button } from '../Button';
import { Dropzone, Files } from '../Dropzone';
import { Modal } from '../Modal';
import { Tooltip } from '../Tooltip';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSeeds: React.FC<Props> = (props: Props) => {
  const { isOpen, onClose } = props;
  const [seedInput, setSeedInput] = useState<string>('');

  const { mutate: addSeed } = createSeed();
  const { mutate: bulkAddSeed } = useBulkAddSeed();

  const handleSubmitSeed = () => {
    if (seedInput.match(AllowedSeedRegex)) {
      try {
        const asset = seedInput;
        addSeed({ asset });
      } catch (error) {
        console.error(error);
      } finally {
        setSeedInput('');
        onClose();
      }
    }
  };

  const handleFilesDrop = (files: Files): void => {
    onClose();

    const concatFiles = files.map(({ result }) => result).join('');
    const seedsString = GetSeeds(concatFiles, 500);
    const seeds = seedsString.map(seed => ({ asset: seed }));

    bulkAddSeed(seeds);
  };

  return (
    <Modal title="Add Seeds" open={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-row space-y-6 p-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              What is a Seed?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              A seed can be a domain, IPv4, IPv6, CIDR range, or GitHub
              organization. Add assets you want to monitor and we’ll start
              discovering and assessing them.
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            For example, if you work for Acme Corporation, you might add seeds
            such as:
            <ul className="mt-1 list-disc pl-5 text-sm text-gray-500">
              <li>
                Domains: <code>acme.com</code>, <code>mail.acme.com</code>,{' '}
                <code>employee-login.acme.com</code>
              </li>
              <li>
                IP Addresses: <code>192.168.1.1</code>
              </li>
              <li>
                CIDR Ranges: <code>192.168.1.0/24</code>
              </li>
              <li>
                GitHub Organizations: <code>github.com/acme-corp</code>
              </li>
            </ul>
          </p>
          <p className="mt-1 text-sm text-gray-500">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <Button
              styleType="primary"
              type="submit"
              className="w-full py-2.5 text-sm font-semibold"
            >
              Add Seed
            </Button>
            <div className="mt-4 text-center text-xs text-gray-500">
              Please ensure you have the necessary permissions to scan the
              domains, IP addresses, CIDR ranges, or GitHub organizations you
              are adding.
            </div>
          </form>
        </div>
        <div className="px-10 text-center">
          <div className="relative m-auto ml-4 flex h-[400px] w-full">
            <div className=" w-px bg-gray-200"></div>
            <div className=" absolute -left-[50%] top-[50%] w-full bg-layer0 text-center text-sm text-gray-300">
              or
            </div>
          </div>
        </div>
        <div>
          <Dropzone
            className="h-[330px]"
            onFilesDrop={handleFilesDrop}
            title={'Bulk Upload'}
            subTitle={`Add a document with a list of Domains, IP addresses, CIDR ranges, or GitHub organizations.`}
            maxFileSizeInMb={6}
            maxFileSizeMessage={
              <div className="flex items-center justify-center gap-1 text-xs italic text-gray-500">
                Bulk Uploads Cannot Exceed 500 Seeds or 6MB in file size.
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
