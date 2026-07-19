import { describe, it, expect } from 'vitest';
import { CURRENCIES } from './currency.config';

describe('currency.config', () => {
  it('has currency definitions', () => {
    expect(CURRENCIES).toBeDefined();
    expect(Object.keys(CURRENCIES).length).toBeGreaterThan(0);
  });

  it('has USD currency with correct properties', () => {
    expect(CURRENCIES.USD).toBeDefined();
    expect(CURRENCIES.USD.symbol).toBe('$');
    expect(CURRENCIES.USD.name).toBe('US Dollar');
    expect(CURRENCIES.USD.exchangeRate).toBe(1);
  });

  it('has EUR currency', () => {
    expect(CURRENCIES.EUR).toBeDefined();
    expect(CURRENCIES.EUR.symbol).toBe('€');
  });

  it('has TRY currency', () => {
    expect(CURRENCIES.TRY).toBeDefined();
    expect(CURRENCIES.TRY.symbol).toBeDefined();
  });

  it('has GBP currency', () => {
    expect(CURRENCIES.GBP).toBeDefined();
    expect(CURRENCIES.GBP.symbol).toBe('£');
  });
});
