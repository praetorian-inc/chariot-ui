import { Integrations } from '@/sections/overview/Module';

export const AvailableIntegrations = Object.values(Integrations)
  .filter(integration => integration.id && integration.connected)
  .map(integration => integration.id) as string[];
