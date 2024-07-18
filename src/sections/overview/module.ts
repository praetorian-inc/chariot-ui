import { BeakerIcon, HomeIcon, TrophyIcon } from '@heroicons/react/24/solid';

import { Module, ModuleMeta } from '@/types';

export const Modules: Record<Module, Omit<ModuleMeta, 'risks' | 'status'>> = {
  ASM: {
    banner: 'Banner text',
    Icon: BeakerIcon,
    label: 'Attack Surface Management',
    name: 'ASM',
    description: `Attack surface management (ASM) refers to the proactive approach of identifying, analyzing, and managing potential points of attack on an organization's IT infrastructure, applications, and networks. The goal of ASM is to minimize the attack surface, which is the sum of all possible entry points that an attacker can exploit to gain unauthorized access or cause damage.`,
  },
  BAS: {
    Icon: HomeIcon,
    label: 'Breach & Attack Simulation',
    name: 'BAS',
    description: `Breach and Attack Simulation (BAS) uses automated tools to continuously simulate real-world cyber attacks, helping organizations identify vulnerabilities, improve threat detection, and enhance their overall security posture.`,
  },
  CIS: {
    banner: 'Banner text',
    Icon: TrophyIcon,
    label: 'Center for Internet Security',
    name: 'CIS',
    description:
      'CIS provides essential cybersecurity benchmarks and guidelines, helping organizations protect against threats and improve their security posture.',
  },
  CTI: {
    Icon: HomeIcon,
    label: 'Cyber Threat Intelligence',
    name: 'CTI',
    description:
      'CTI collects and analyzes cyber threat information to help organizations proactively defend against and respond to attacks.',
  },
  MSP: {
    Icon: TrophyIcon,
    label: 'Managed Service Provider',
    name: 'MSP',
    description:
      "Our Managed Service Provider (MSP) offers comprehensive IT services, including network, application, infrastructure, and security management, ensuring efficient and secure operation of your organization's IT systems.",
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
