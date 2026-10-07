import type { iconSizes } from '../lib/icon-assets';
import type { IconName } from '../lib/icon-sources';

export type IconSize = typeof iconSizes[number];
export type TIconProps = {
  name: IconName;
  size?: IconSize;
  color?: string;
  class?: string;
};
