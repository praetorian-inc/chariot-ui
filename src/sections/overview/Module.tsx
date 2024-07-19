import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BeakerIcon, HomeIcon, TrophyIcon } from '@heroicons/react/24/solid';

import { Loader } from '@/components/Loader';
import { useMy } from '@/hooks';
import { useCounts } from '@/hooks/useCounts';
import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { Integrations } from '@/sections/overview/Integration';
import { Account, Integration, Module, ModuleMeta } from '@/types';
import { useMergeStatus } from '@/utils/api';
import { formatDate } from '@/utils/date.util';

export const Modules: Record<Module, Omit<ModuleMeta, 'risks' | 'status'>> = {
  ASM: {
    Icon: BeakerIcon,
    label: 'Attack Surface Management',
    name: 'ASM',
    description: `Attack surface management (ASM) refers to the proactive approach of identifying, analyzing, and managing potential points of attack on an organization&apos;s IT infrastructure, applications, and networks. The goal of ASM is to minimize the attack surface, which is the sum of all possible entry points that an attacker can exploit to gain unauthorized access or cause damage.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Attack Surface Management</h3>
        <p className="mt-2 text-default-light">
          Gain visibility into your expanding attack surface through continuous
          discovery, identification, and monitoring of your evolving digital
          landscape.
        </p>
      </div>
    ),
    integrations: [
      Integrations.github,
      Integrations.amazon,
      Integrations.ns1,
      Integrations.gcp,
      Integrations.azure,
      Integrations.gitlab,
    ],
  },
  BAS: {
    Icon: HomeIcon,
    label: 'Breach & Attack Simulation',
    name: 'BAS',
    description: `Breach and Attack Simulation (BAS) uses automated tools to continuously simulate real-world cyber attacks, helping organizations identify vulnerabilities, improve threat detection, and enhance their overall security posture.`,
    defaultTab: <BasDefaultTab />,
    integrations: [],
  },
  EDR: {
    Icon: TrophyIcon,
    label: 'Endpoint Detection and Response',
    name: 'EDR',
    description: `EDR provides essential cybersecurity benchmarks and guidelines, helping organizations protect against threats and improve their security posture.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">
          Endpoint Detection and Response
        </h3>
        <p className="mt-2 text-default-light">
          EDR provides essential benchmarks and guidelines to enhance your
          organization&quot;s cybersecurity and improve defenses against
          threats.
        </p>
      </div>
    ),
    integrations: [Integrations.crowdstrike],
  },
  CTI: {
    Icon: HomeIcon,
    label: 'Cyber Threat Intelligence',
    name: 'CTI',
    description: `CTI collects and analyzes cyber threat information to help organizations proactively defend against and respond to attacks.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Cyber Threat Intelligence</h3>
        <p className="mt-2 text-default-light">
          Chariot monitors emerging threats, including detailed analysis of new
          vulnerabilities, exploits, and attack vectors from a variety of
          trusted sources.
        </p>
      </div>
    ),
    integrations: [],
  },
  MSP: {
    Icon: TrophyIcon,
    label: 'Managed Service Provider',
    name: 'MSP',
    description: `Our Vulnerability Management (VM) offers comprehensive IT services, including network, application, infrastructure, and security management, ensuring efficient and secure operation of your organization's IT systems.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Workflows</h3>
        <p className="mt-2 text-default-light">
          Vulnerability Management (VM) identifies and manages security
          vulnerabilities in your IT infrastructure, integrating with various
          tools for efficient tracking and resolution.
        </p>
      </div>
    ),
    integrations: [
      Integrations.hook,
      Integrations.slack,
      Integrations.jira,
      Integrations.zulip,
    ],
  },
  VM: {
    Icon: TrophyIcon,
    label: 'Vulnerability Management',
    name: 'VM',
    description: `Our Vulnerability Management (VM) offers comprehensive IT services, including network, application, infrastructure, and security management, ensuring efficient and secure operation of your organization's IT systems.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-2xl font-semibold">Vulnerability Management</h3>
        <p className="mt-2 text-default-light">
          Vulnerability Management (VM) identifies and manages security
          vulnerabilities in your IT infrastructure, integrating with various
          tools for efficient tracking and resolution.
        </p>
      </div>
    ),
    integrations: [Integrations.nessus],
  },
};

export type IntegrationData = { isConnected: true; accounts: Account[] };

export type IntegrationsData = Record<Integration, IntegrationData>;

export function useGetModuleData(): {
  data: Record<
    Module,
    {
      noOfRisk: number;
      noOfAsset: number;
      status: string;
      enabled: boolean;
      assetAttributes: Array<{ key: string; value: string; updated: string }>;
      riskAttributes: Array<{ key: string; value: string }>;
      isLoading: boolean;
    }
  >;
  integrationsData: IntegrationsData;
  isLoading: boolean;
} {
  const { data: assetCount, status: assetCountStatus } = useCounts({
    resource: 'asset',
  });
  const { data: riskCount, status: riskCountStatus } = useCounts({
    resource: 'risk',
  });

  const { data: accounts, status: accountStatus } = useMy({
    resource: 'account',
  });
  const { data: basAttributes, status: basAttributesStatus } = useMy({
    resource: 'attribute',
    query: '#source#bas',
  });
  const { data: csAttributes, status: csAttributesStatus } = useMy({
    resource: 'attribute',
    query: 'source:crowdstrike',
  });
  const { data: kevAttributes, status: ctiAttributeStatus } = useMy({
    resource: 'attribute',
    query: '#source#kev',
  });

  const integrationsData = Object.fromEntries(
    Object.values(Integration).map(integration => {
      const isConnected =
        accountStatus !== 'pending' &&
        accounts.map(({ member }) => member).includes(integration);

      return [
        integration,
        {
          isConnected,
          accounts: isConnected
            ? accounts.filter(({ member }) => member === integration)
            : [],
        },
      ];
    })
  ) as IntegrationsData;

  function isIntegrationsConnected(module: Module) {
    const isConnected = Modules[module].integrations.find(integration => {
      return integrationsData[integration.id].isConnected;
    });

    return Boolean(isConnected);
  }

  const basAssetAttribute = basAttributes.filter(({ source }) => {
    return source.startsWith('#asset');
  });
  const basRiskAttribute = basAttributes.filter(({ source }) => {
    return source.startsWith('#risk');
  });

  const cisAssetAttribute = csAttributes.filter(({ source }) => {
    return source.startsWith('#asset');
  });
  const edrRiskAttribute = csAttributes.filter(({ source }) => {
    return source.startsWith('#risk');
  });

  const ctiAssetAttribute = kevAttributes.filter(({ source }) => {
    return source.startsWith('#asset');
  });
  const ctiRiskAttribute = kevAttributes.filter(({ source }) => {
    return source.startsWith('#risk');
  });

  const data = {
    ASM: {
      noOfRisk: assetCount
        ? Object.values(assetCount?.status || {}).reduce(
            (acc, val) => acc + val,
            0
          )
        : 0,
      noOfAsset: riskCount
        ? Object.values(riskCount?.status || {}).reduce(
            (acc, val) => acc + val,
            0
          )
        : 0,
      status: 'pending',
      enabled: true,
      assetAttributes: [],
      riskAttributes: [],
      isLoading:
        riskCountStatus === 'pending' || assetCountStatus === 'pending',
    },
    BAS: {
      noOfRisk: basRiskAttribute.length,
      noOfAsset: basAssetAttribute.length,
      status: 'pending',
      enabled: basAssetAttribute.length > 0,
      assetAttributes: basAssetAttribute,
      riskAttributes: basRiskAttribute,
      isLoading: basAttributesStatus === 'pending',
    },
    EDR: {
      noOfRisk: edrRiskAttribute.length,
      noOfAsset: cisAssetAttribute.length,
      status: 'pending',
      enabled: isIntegrationsConnected(Module.EDR),
      assetAttributes: cisAssetAttribute,
      riskAttributes: edrRiskAttribute,
      isLoading:
        csAttributesStatus === 'pending' || accountStatus === 'pending',
    },
    CTI: {
      noOfRisk: ctiRiskAttribute.length,
      noOfAsset: ctiAssetAttribute.length,
      status: 'pending',
      enabled: true,
      assetAttributes: ctiAssetAttribute,
      riskAttributes: ctiRiskAttribute,
      isLoading: ctiAttributeStatus === 'pending',
    },
    MSP: {
      noOfRisk: 0,
      noOfAsset: 0,
      status: 'pending',
      enabled: isIntegrationsConnected(Module.MSP),
      assetAttributes: [],
      riskAttributes: [],
      isLoading: accountStatus === 'pending',
    },
    VM: {
      noOfRisk: 0,
      noOfAsset: 0,
      status: 'pending',
      enabled: isIntegrationsConnected(Module.VM),
      assetAttributes: [],
      riskAttributes: [],
      isLoading: accountStatus === 'pending',
    },
  };

  return {
    data,
    integrationsData,
    isLoading:
      useMergeStatus(
        accountStatus,
        basAttributesStatus,
        csAttributesStatus,
        ctiAttributeStatus,
        assetCountStatus,
        riskCountStatus
      ) === 'pending',
  };
}

function BasDefaultTab() {
  const {
    data: { BAS },
    isLoading,
  } = useGetModuleData();

  const [sliderVlaue, setSliderValue] = useState(0);
  const navigate = useNavigate();
  const { getAssetDrawerLink } = getDrawerLink();

  return (
    <div className="p-4">
      <h3 className="text-2xl font-semibold">Breach & Attack Simulation</h3>
      <p className="mt-2 text-default-light">
        Proactively test your defenses against simulated real-world attacks.
      </p>
      <label htmlFor="bas-agents" className="mt-4 block">
        <p>How many agents would you like? {sliderVlaue}</p>
        <input
          id="bas-agents"
          type="range"
          name="bas-agents"
          min={0}
          max={20}
          step={1}
          value={sliderVlaue}
          onChange={e => setSliderValue(parseInt(e.target.value, 10))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-default [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none  [&::-webkit-slider-thumb]:rounded-full  [&::-webkit-slider-thumb]:!bg-brand "
        />
      </label>
      <div className="flex flex-col gap-2 pt-4">
        <h3 className="text-lg font-semibold">
          Installed Agents ({BAS.assetAttributes.length})
        </h3>
        <Loader isLoading={isLoading}>
          {BAS.assetAttributes.map((attribute, index) => {
            return (
              <button
                onClick={() => {
                  const assetKey = attribute.key.split('#')[5];
                  const link = getAssetDrawerLink({
                    dns: assetKey,
                    name: assetKey,
                  });
                  navigate(link);
                }}
                className="block text-left text-sm"
                key={index}
              >
                <span className="mr-1 font-medium text-brand">
                  {attribute.key.split('#')[5]}
                </span>{' '}
                added {formatDate(attribute.updated)}
              </button>
            );
          })}
        </Loader>
      </div>
    </div>
  );
}
