import { BeakerIcon, HomeIcon, TrophyIcon } from '@heroicons/react/24/solid';

import { Module, ModuleMeta } from '@/types';

export const Modules: Record<Module, Omit<ModuleMeta, 'risks' | 'status'>> = {
  ASM: {
    banner: 'Comprehensive Insight',
    Icon: BeakerIcon,
    label: 'Attack Surface Management',
    name: 'ASM',
    description: `Attack surface management (ASM) refers to the proactive approach of identifying, analyzing, and managing potential points of attack on an organization&apos;s IT infrastructure, applications, and networks. The goal of ASM is to minimize the attack surface, which is the sum of all possible entry points that an attacker can exploit to gain unauthorized access or cause damage.`,
    categoryDescription: (
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
  },
  BAS: {
    Icon: HomeIcon,
    label: 'Breach & Attack Simulation',
    name: 'BAS',
    description: `Breach and Attack Simulation (BAS) uses automated tools to continuously simulate real-world cyber attacks, helping organizations identify vulnerabilities, improve threat detection, and enhance their overall security posture.`,
    categoryDescription: (
      <div className="p-4">
        <h3 className="text-xl font-semibold">Breach & Attack Simulation</h3>
        <p className="mt-2">
          Breach and Attack Simulation (BAS) employs automated tools to
          replicate real-world cyber attacks. This continuous simulation helps
          your organization identify vulnerabilities, enhance threat detection,
          and strengthen your overall security posture.
        </p>
      </div>
    ),
  },
  CIS: {
    banner: 'Trusted Benchmarks',
    Icon: TrophyIcon,
    label: 'Center for Internet Security',
    name: 'CIS',
    description: `CIS provides essential cybersecurity benchmarks and guidelines, helping organizations protect against threats and improve their security posture.`,
    categoryDescription: (
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
  },
  CTI: {
    Icon: HomeIcon,
    label: 'Cyber Threat Intelligence',
    name: 'CTI',
    description: `CTI collects and analyzes cyber threat information to help organizations proactively defend against and respond to attacks.`,
    categoryDescription: (
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
  },
  MSP: {
    Icon: TrophyIcon,
    label: 'Managed Service Provider',
    name: 'MSP',
    description: `Our Managed Service Provider (MSP) offers comprehensive IT services, including network, application, infrastructure, and security management, ensuring efficient and secure operation of your organization&apos;s IT systems.`,
    categoryDescription: (
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
  },
};

export function useGetModules(): Record<Module, ModuleMeta> {
  return {
    ASM: {
      ...Modules.ASM,
      risks: 0,
      status: 'pending',
    },
    BAS: {
      ...Modules.BAS,
      risks: 0,
      status: 'pending',
    },
    CIS: {
      ...Modules.CIS,
      risks: 0,
      status: 'pending',
    },
    CTI: {
      ...Modules.CTI,
      risks: 0,
      status: 'pending',
    },
    MSP: {
      ...Modules.MSP,
      risks: 0,
      status: 'pending',
    },
  };
}
