import type { IconName } from '../../components/atoms/Icon/Icon';

const ICONS: Record<string, IconName> = { vaporizer: 'vaporizer', joint: 'joint', bong: 'bong', pfeife: 'pipe', edible: 'edible' };

/** Icon zur Konsumform (Schlüssel aus /api/meta), Blatt als Rückfall */
export const methodIcon = (key: string): IconName => ICONS[key] ?? 'leaf';
