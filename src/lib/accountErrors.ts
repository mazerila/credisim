/** Firebase error code → short key for the UI. */
export function errorKey(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'accErrCredentials', 'auth/wrong-password': 'accErrCredentials', 'auth/user-not-found': 'accErrCredentials',
    'auth/invalid-email': 'accErrEmail', 'auth/missing-email': 'accErrEmail',
    'auth/email-already-in-use': 'accErrInUse', 'auth/weak-password': 'accErrWeak', 'auth/missing-password': 'accErrWeak',
    'auth/too-many-requests': 'accErrTooMany', 'auth/network-request-failed': 'accErrNetwork',
    'auth/popup-closed-by-user': '', 'auth/cancelled-popup-request': '', 'auth/user-cancelled': '',
    'auth/account-exists-with-different-credential': 'accErrOtherMethod',
  };
  return code in map ? map[code] : 'accErrGeneric';
}
