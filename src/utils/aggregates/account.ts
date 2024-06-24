import { isFQDN } from 'validator';

import { Account } from '@/types';
import { defineAggregate } from '@/utils/aggregates/aggregate';

const getDomainFromEmail = (email: string): string => {
  const domain = email.split('@')[1];
  if (domain === undefined) return '';
  return isFQDN(domain) ? domain : '';
};

const getFormattedDate = (isoDate: string): string => {
  return isoDate.split('T')[0];
};

/* 
  See the following link for more information on how to add new charts:
  https://github.com/praetorian-inc/chariot-ui?tab=readme-ov-file#adding-new-charts
*/
export const aggregates = {
  uniqueDomainNames: defineAggregate<Account>(
    'Unique domain names',
    account => getDomainFromEmail(account.member),
    'member',
    'count'
  ),
  numberOfAccountsOverTime: defineAggregate<Account>(
    'Number of Accounts Over Time',
    account => getFormattedDate(account.updated),
    'date',
    'cumulativeAccounts'
  ),
};
