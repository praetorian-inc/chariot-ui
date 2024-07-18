import { BeakerIcon, HomeIcon, TrophyIcon } from '@heroicons/react/24/solid';

import { Modules } from '@/types';

export function useGetModules(): Record<
  Modules,
  {
    banner?: string;
    label: string;
    name: string;
    description: string;
    assets?: number;
    risks?: number;
    Icon?: React.ElementType;
  }
> {
  return {
    ASM: {
      banner: 'Banner text',
      Icon: BeakerIcon,
      label: 'Attack surface management',
      name: 'ASM',
      description: `Attack surface management (ASM) refers to the proactive approach of identifying, analyzing, and managing potential points of attack on an organization's IT infrastructure, applications, and networks. The goal of ASM is to minimize the attack surface, which is the sum of all possible entry points that an attacker can exploit to gain unauthorized access or cause damage.`,
      assets: 0,
      risks: 0,
    },
    BAS: {
      Icon: HomeIcon,
      label: 'Breach and Attack Simulation',
      name: 'BAS',
      description: `Breach and Attack Simulation (BAS) refers to a methodical approach used by organizations to simulate the tactics, techniques, and procedures (TTPs) of real-world attackers. The primary goal of BAS is to proactively assess the effectiveness of an organization's cybersecurity defenses by mimicking the behaviors and actions of potential threat actors.`,
      assets: 0,
      risks: 0,
    },
    CIS: {
      banner: 'Banner text',
      Icon: TrophyIcon,
      label: 'Attack surface management',
      name: 'CIS',
      description: 'Discover whats yours2',
      assets: 0,
      risks: 0,
    },
    CTI: {
      Icon: HomeIcon,
      label: 'Attack surface management',
      name: 'CTI',
      description: 'Discover whats yours3',
      risks: 0,
    },
    MSP: {
      Icon: TrophyIcon,
      label: 'Attack surface management',
      name: 'MSP',
      description: 'Discover whats yours4',
      assets: 0,
      risks: 0,
    },
  };
}
