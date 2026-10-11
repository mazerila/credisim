import { describe, expect, it } from 'vitest';
import { errorKey } from './accountErrors';

describe('account errors', () => {
  it('maps Firebase codes to messages, and stays silent when the user closes the popup', () => {
    expect(errorKey({ code: 'auth/invalid-credential' })).toBe('accErrCredentials');
    expect(errorKey({ code: 'auth/email-already-in-use' })).toBe('accErrInUse');
    expect(errorKey({ code: 'auth/popup-closed-by-user' })).toBe('');
    expect(errorKey({ code: 'auth/something-new' })).toBe('accErrGeneric');
    expect(errorKey(new Error('x'))).toBe('accErrGeneric');
  });
});
