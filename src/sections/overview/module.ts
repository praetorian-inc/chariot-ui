import { Modules } from '@/types';

export function useGetModules(): Record<
  Modules,
  {
    label: string;
    name: string;
    description: string;
    assets?: number;
    risks?: number;
  }
> {
  return {
    ASM: {
      label: 'Attack surface management',
      name: 'ASM',
      description: 'Discover whats yours',
      assets: 0,
      risks: 0,
    },
    BAS: {
      label: 'Attack surface management',
      name: 'BAS',
      description: 'Discover whats yours1',
      assets: 0,
      risks: 0,
    },
    CIS: {
      label: 'Attack surface management',
      name: 'CIS',
      description: 'Discover whats yours2',
      assets: 0,
      risks: 0,
    },
    CTI: {
      label: 'Attack surface management',
      name: 'CTI',
      description: 'Discover whats yours3',
      risks: 0,
    },
    MSP: {
      label: 'Attack surface management',
      name: 'MSP',
      description: 'Discover whats yours4',
      assets: 0,
      risks: 0,
    },
  };
}
