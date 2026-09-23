import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULTS, simulate } from './engine';
import { deleteSaved, listSaved, saveSimulation, scheduleCsv } from './export';

describe('CSV export', () => {
  const r = simulate({ ...DEFAULTS.mortgage, months: 12 });
  const head = ['Month', 'Payment', 'Interest', 'Capital', 'Insurance', 'PTZ', 'Remaining'];
  it('writes one line per month with French separators', () => {
    const csv = scheduleCsv(r, 'fr', head);
    const lines = csv.replace('﻿', '').trim().split('\r\n');
    expect(lines).toHaveLength(13);
    expect(lines[0]).toBe('Month;Payment;Interest;Capital;Insurance;Remaining');
    expect(lines[1].split(';')[2]).toMatch(/^\d+,\d{2}$/);
    expect(lines[12].split(';').at(-1)).toBe('0,00');
  });
  it('uses commas and dots in English', () => {
    const line = scheduleCsv(r, 'en', head).split('\r\n')[1];
    expect(line.split(',')).toHaveLength(6);
    expect(line.split(',')[1]).toMatch(/^\d+\.\d{2}$/);
  });
});

describe('saved simulations', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; }, clear: () => {}, key: () => null, length: 0,
    } as Storage;
  });
  it('saves, lists newest first and deletes', () => {
    saveSimulation('First', '#s=abc');
    const list = saveSimulation('Second', 's=def');
    expect(list.map((x) => x.name)).toEqual(['Second', 'First']);
    expect(list[1].hash).toBe('s=abc');
    expect(deleteSaved(list[0].id).map((x) => x.name)).toEqual(['First']);
    expect(listSaved()).toHaveLength(1);
  });
});
