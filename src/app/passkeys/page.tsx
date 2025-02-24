'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function PasskeyRegistrationPage() {
  const [error, setError] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<any[]>([]);

  useEffect(() => {
    // Fetch existing passkeys
    async function fetchPasskeys() {
      try {
        const response = await fetch('/api/passkeys');
        if (response.ok) {
          const data = await response.json();
          setPasskeys(data);
        }
      } catch (err) {
        setError('Failed to fetch passkeys');
      }
    }
    fetchPasskeys();
  }, []);

  async function registerNewPasskey() {
    try {
      // Trigger passkey registration
      const result = await signIn('passkey', {
        redirect: false,
        action: 'register',
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Refresh passkey list
        const response = await fetch('/api/passkeys');
        const data = await response.json();
        setPasskeys(data);
      }
    } catch (err) {
      setError('Passkey registration failed');
    }
  }

  async function removePasskey(passkeyId: string) {
    try {
      const response = await fetch(`/api/passkeys/${passkeyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        setPasskeys(passkeys.filter((pk) => pk.id !== passkeyId));
      } else {
        setError('Failed to remove passkey');
      }
    } catch (err) {
      setError('Error removing passkey');
    }
  }

  return (
    <div>
      <h1>Passkey Management</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={registerNewPasskey}>Register New Passkey</button>

      <h2>Registered Passkeys</h2>
      {passkeys.length === 0 ? (
        <p>No passkeys registered</p>
      ) : (
        <ul>
          {passkeys.map((passkey) => (
            <li key={passkey.id}>
              {passkey.id}
              <button onClick={() => removePasskey(passkey.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
