import { getDrawerLink } from '@/sections/detailsDrawer/getDrawerLink';
import { Attribute } from '@/types';

export function getAttributeDetails(attribute: Attribute) {
  const [, , attributeType, dns, name] = attribute.key.split('#');

  const url =
    attributeType === 'asset'
      ? getDrawerLink().getAssetDrawerLink({ dns, name })
      : getDrawerLink().getRiskDrawerLink({ dns, name });

  return {
    attributeType,
    dns,
    name,
    parsedName: `${dns} (${name})`,
    class: attribute.class,
    url: url,
  };
}
