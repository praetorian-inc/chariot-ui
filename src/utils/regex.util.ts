/* eslint-disable unused-imports/no-unused-vars */
export const Regex = {
  DOMAIN:
    /(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\.\w+)?/,
  IPV4: /(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/,
  IPV6: /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/,
  CIDR: /(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])/,
  GIT_ORG: /https:\/\/github\.com\/([a-zA-Z\d-]+)/,
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  CVE_ID: /CVE-\d{4}-\d{4,7}/,
  AWS_REGION_REGEX: /.*execute-api.(.*).amazonaws/,
  IMAGE: /.*\.(jpg|jpeg|png|gif|bmp)$/,
};

export const AllowedSeedRegex = new RegExp(
  `(${Regex.DOMAIN.source})|(${Regex.CIDR.source})|(${Regex.IPV4.source})|(${Regex.IPV6.source})|(${Regex.GIT_ORG.source})`,
  'g'
);

const seedRegex = {
  email: Regex.EMAIL,
  domain: Regex.DOMAIN,
  cidr: Regex.CIDR,
  ipv4: Regex.IPV4,
  ipv6: Regex.IPV6,
  gitOrg: Regex.GIT_ORG,
};

type seedRegexName = keyof typeof seedRegex;

/**
 *
 * @param file raw content of a uploaded file
 * @returns discovered seeds from the provided file
 */
export function GetSeeds(file: string, maxSeed: number): string[] {
  let rawText = file;
  const seeds: Record<seedRegexName, string[]> = {
    email: [],
    domain: [],
    cidr: [],
    ipv4: [],
    ipv6: [],
    gitOrg: [],
  };

  Object.entries(seedRegex).forEach(([label, regex]) => {
    const regexName = label as seedRegexName;

    rawText = rawText.replace(new RegExp(regex, 'g'), matchedValue => {
      const currentSeedValue = seeds[regexName];

      if (
        !currentSeedValue.includes(matchedValue) &&
        !checkMaxSeeds(seeds, maxSeed)
      ) {
        currentSeedValue.push(matchedValue);
      }

      return '';
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, ...restSeedTypes } = seeds;

  return Object.values(restSeedTypes).flatMap(x => x);
}

function checkMaxSeeds(
  seedByTypes: Record<seedRegexName, string[]>,
  maxSeed: number
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, ...restSeedTypes } = seedByTypes;

  return Object.values(restSeedTypes).flatMap(x => x).length >= maxSeed;
}
