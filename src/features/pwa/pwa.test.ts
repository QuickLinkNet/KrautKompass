import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getState, initPwa, promptInstall } from './pwa';

function installEvent(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  const prompt = vi.fn(async () => {});
  return Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome }) });
}

describe('PWA-Zustand', () => {
  const win = Object.assign(new EventTarget(), { matchMedia: () => ({ matches: false }) });

  beforeAll(() => {
    vi.stubGlobal('window', win);
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/131', maxTouchPoints: 0 });
    initPwa();
  });

  it('erkennt Browser ohne Installation', () => {
    expect(getState()).toMatchObject({ standalone: false, ios: false, canPrompt: false, updateReady: false });
  });

  it('fängt das Installations-Angebot ab und nutzt es genau einmal', async () => {
    const event = installEvent('accepted');
    win.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(getState().canPrompt).toBe(true);

    await expect(promptInstall()).resolves.toBe(true);
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(getState().canPrompt).toBe(false);
    await expect(promptInstall()).resolves.toBe(false);
  });

  it('meldet abgelehnte Installation und danach installierte App', async () => {
    win.dispatchEvent(installEvent('dismissed'));
    await expect(promptInstall()).resolves.toBe(false);
    win.dispatchEvent(new Event('appinstalled'));
    expect(getState()).toMatchObject({ standalone: true, canPrompt: false });
  });
});
