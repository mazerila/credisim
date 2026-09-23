import { describe, expect, it } from 'vitest';
import { scrubUrl } from './analytics';

describe('analytics URL scrubbing', () => {
  it('drops the simulation fragment but keeps page routes', () => {
    expect(scrubUrl('https://creditsimulator.web.app/#c=zABCdef-_')).toBe('https://creditsimulator.web.app/');
    expect(scrubUrl('https://creditsimulator.web.app/?lang=fr#s=eyJ2IjoxfQ')).toBe('https://creditsimulator.web.app/?lang=fr');
    expect(scrubUrl('https://creditsimulator.web.app/#learn/taeg')).toBe('https://creditsimulator.web.app/#learn/taeg');
    expect(scrubUrl('https://creditsimulator.web.app/#tools/check-offer')).toBe('https://creditsimulator.web.app/#tools/check-offer');
  });
  it('masks short-link ids', () => {
    expect(scrubUrl('https://creditsimulator.web.app/s/WZfbWgMV')).toBe('https://creditsimulator.web.app/s/:id');
    expect(scrubUrl('/s/WZfbWgMV?x=1')).toBe('/s/:id?x=1');
  });
  it('leaves other values alone', () => {
    expect(scrubUrl('credisim')).toBe('credisim');
    expect(scrubUrl('https://example.com/page')).toBe('https://example.com/page');
  });
});
