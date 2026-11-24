/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const css = read('./tokens.css');
const tokens = JSON.parse(read('../../design/tokens.json')) as {
  color: Record<string, string>;
  spacing: number[];
  radius: Record<string, number>;
  controlMinHeight: number;
  formMaxWidth: number;
};

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const cssVar = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();

describe('tokens.css ist synchron mit design/tokens.json', () => {
  it.each(Object.entries(tokens.color))('Farbe %s', (key, value) => {
    expect(cssVar(`token-color-${kebab(key)}`)?.toLowerCase()).toBe(value.toLowerCase());
  });

  it('Abstände, Radien und Formularmaße', () => {
    tokens.spacing.forEach((px, i) => expect(cssVar(`space-${i + 1}`)).toBe(`${px}px`));
    expect(cssVar('radius-sm')).toBe(`${tokens.radius.small}px`);
    expect(cssVar('radius-md')).toBe(`${tokens.radius.input}px`);
    expect(cssVar('radius-lg')).toBe(`${tokens.radius.card}px`);
    expect(cssVar('control-height')).toBe(`${tokens.controlMinHeight}px`);
    expect(cssVar('form-max-width')).toBe(`${tokens.formMaxWidth}px`);
  });

  it('enthält außerhalb der Rohwerte keine festen Farbwerte', () => {
    const semantic = css.split('\n').filter((line: string) => !line.includes('--token-color-') || !line.includes('#'));
    expect(semantic.join('\n')).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
