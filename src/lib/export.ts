import type { Result } from './engine';

/**
 * Repayment schedule as CSV. Excel in French, German, Spanish and Italian expects ";" and
 * decimal commas; English Excel "," and dots. A BOM makes Excel read UTF-8 correctly.
 */
export function scheduleCsv(r: Result, lang: string, headers: string[]): string {
  const comma = lang !== 'en';
  const sep = comma ? ';' : ',';
  const num = (v: number) => {
    const s = v.toFixed(2);
    return comma ? s.replace('.', ',') : s;
  };
  const hasPtz = !!r.ptz;
  const lines = [headers.filter((_, i) => hasPtz || i !== 5).join(sep)];
  for (const m of r.rows) {
    const cells = [String(m.k), num(m.payment + m.insurance), num(m.interest + (m.accrued ?? 0)), num(m.capital), num(m.insurance)];
    if (hasPtz) cells.push(num(m.ptz ?? 0));
    cells.push(num(m.balance));
    lines.push(cells.join(sep));
  }
  return '﻿' + lines.join('\r\n') + '\r\n';
}

/** Offer a text file to the browser. Returns false where downloads are blocked (e.g. sandboxed previews). */
export function download(filename: string, content: string, type = 'text/csv;charset=utf-8'): boolean {
  try {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

// ---------- saved simulations (this browser only) ----------

export interface Saved {
  id: string;
  name: string;
  /** ISO date */
  at: string;
  /** share-link fragment, without "#" */
  hash: string;
}

const KEY = 'credisim.saved';

export function listSaved(): Saved[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => x && typeof x.hash === 'string' && typeof x.name === 'string') : [];
  } catch {
    return [];
  }
}

function write(list: Saved[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
    return true;
  } catch {
    return false;
  }
}

export function saveSimulation(name: string, hash: string): Saved[] {
  const item: Saved = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name.trim() || new Date().toLocaleString(), at: new Date().toISOString(), hash: hash.replace(/^#/, '') };
  const list = [item, ...listSaved()];
  write(list);
  return list;
}

export function deleteSaved(id: string): Saved[] {
  const list = listSaved().filter((x) => x.id !== id);
  write(list);
  return list;
}
