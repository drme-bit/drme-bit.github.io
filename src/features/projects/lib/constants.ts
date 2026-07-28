import { FiSettings, FiClock, FiX } from '@/shared/ui/atoms/Icon';
import type { IconType } from 'react-icons';

export interface StatusMeta {
  icon: IconType;
  cls: string;
  label: string;
}

export const STATUS_META: Record<string, StatusMeta> = {
  ACTIVE: { icon: FiSettings, cls: 'badge--active', label: 'in development' },
  PAUSED: { icon: FiClock, cls: 'badge--paused', label: 'on hold' },
  DEPRECATED: { icon: FiX, cls: 'badge--deprecated', label: 'deprecated' },
};
