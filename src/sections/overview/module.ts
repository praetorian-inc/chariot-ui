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
      description: `ASM (Address Space Manipulation) attack exploits vulnerabilities in memory address space handling, aiming to gain unauthorized access or execute malicious code within a program's memory.`,
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
