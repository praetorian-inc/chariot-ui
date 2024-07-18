import { useState } from 'react';
import { BeakerIcon, HomeIcon, TrophyIcon } from '@heroicons/react/24/solid';

import { Loader } from '@/components/Loader';
import { useMy } from '@/hooks';
import { Integrations } from '@/sections/overview/Integration';
import { Account, Integration, Module, ModuleMeta } from '@/types';

export const Modules: Record<Module, Omit<ModuleMeta, 'risks' | 'status'>> = {
  ASM: {
    banner: 'Comprehensive Insight',
    Icon: BeakerIcon,
    label: 'Attack Surface Management',
    name: 'ASM',
    description: `Attack surface management (ASM) refers to the proactive approach of identifying, analyzing, and managing potential points of attack on an organization&apos;s IT infrastructure, applications, and networks. The goal of ASM is to minimize the attack surface, which is the sum of all possible entry points that an attacker can exploit to gain unauthorized access or cause damage.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-xl font-semibold">Attack Surface Management</h3>
        <p className="mt-2">
          Attack Surface Management (ASM) is a proactive strategy for
          identifying, analyzing, and managing potential attack points on your
          organization&apos;s IT infrastructure, applications, and networks. The
          goal is to minimize the attack surface, reducing the number of entry
          points that attackers can exploit.
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
  CIS: {
    banner: 'Trusted Benchmarks',
    Icon: TrophyIcon,
    label: 'Center for Internet Security',
    name: 'CIS',
    description: `CIS provides essential cybersecurity benchmarks and guidelines, helping organizations protect against threats and improve their security posture.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-xl font-semibold">Center for Internet Security</h3>
        <p className="mt-2">
          The Center for Internet Security (CIS) offers vital cybersecurity
          benchmarks and guidelines. These resources help organizations defend
          against threats and improve their security posture, ensuring a robust
          defense against cyber risks.
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
        <h3 className="text-xl font-semibold">Cyber Threat Intelligence</h3>
        <p className="mt-2">
          Cyber Threat Intelligence (CTI) gathers and examines cyber threat
          data. This intelligence enables organizations to proactively defend
          against potential attacks and effectively respond to security
          incidents.
        </p>
      </div>
    ),
    integrations: [],
  },
  MSP: {
    Icon: TrophyIcon,
    label: 'Managed Service Provider',
    name: 'MSP',
    description: `Our Managed Service Provider (MSP) offers comprehensive IT services, including network, application, infrastructure, and security management, ensuring efficient and secure operation of your organization&apos;s IT systems.`,
    defaultTab: (
      <div className="p-4">
        <h3 className="text-xl font-semibold">Managed Service Provider</h3>
        <p className="mt-2">
          Our Managed Service Provider (MSP) delivers all-encompassing IT
          services. These include network, application, infrastructure, and
          security management, ensuring your organization&apos;s IT systems
          operate efficiently and securely.
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
};

type IntegrationData = Record<
  Integration,
  { isConnected: true; accounts: Account[] }
>;

export function useGetModuleData(): {
  data: Record<
    Module,
    {
      noOfRisk: number;
      noOfAsset: number;
      status: string;
      enabled: boolean;
      assetAttributes: Array<{ key: string; value: string }>;
      riskAttributes: Array<{ key: string; value: string }>;
      isLoading: boolean;
    }
  >;
  integrationsData: IntegrationData;
  isLoading: boolean;
} {
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
  ) as IntegrationData;

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
  const cisRiskAttribute = csAttributes.filter(({ source }) => {
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
      noOfRisk: 0,
      noOfAsset: 0,
      status: 'pending',
      enabled: true,
      assetAttributes: [],
      riskAttributes: [],
      isLoading: true,
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
    CIS: {
      noOfRisk: cisRiskAttribute.length,
      noOfAsset: cisAssetAttribute.length,
      status: 'pending',
      enabled: isIntegrationsConnected(Module.CIS),
      assetAttributes: cisAssetAttribute,
      riskAttributes: cisRiskAttribute,
      isLoading:
        csAttributesStatus === 'pending' || accountStatus === 'success',
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
      isLoading: accountStatus === 'success',
    },
  };

  return {
    data,
    integrationsData,
    isLoading:
      accountStatus === 'success' ||
      basAttributesStatus === 'pending' ||
      csAttributesStatus === 'pending' ||
      ctiAttributeStatus === 'pending',
  };
}

function BasDefaultTab() {
  const {
    data: { BAS },
    isLoading,
  } = useGetModuleData();

  const [sliderVlaue, setSliderValue] = useState(0);

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold">Breach & Attack Simulation</h3>
      <p className="mt-2">
        Breach and Attack Simulation (BAS) employs automated tools to replicate
        real-world cyber attacks. This continuous simulation helps your
        organization identify vulnerabilities, enhance threat detection, and
        strengthen your overall security posture.
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

      <Loader isLoading={isLoading}>
        <div className="flex flex-col gap-2">
          {BAS.assetAttributes.map((attribute, index) => {
            return <div key={index}>{attribute.key.split('#')[5]}</div>;
          })}
        </div>
      </Loader>
    </div>
  );
}
