const enc = new TextEncoder();
const dec = new TextDecoder();

export async function deriveKeyFromPassword(
  password: string,
  saltBase64: string | null = null
) {
  const salt = saltBase64
    ? Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));

  const pwKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    pwKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  return { key, salt: btoa(String.fromCharCode(...Array.from(salt))) };
}

// Accept JSON object
export async function encryptJSON(
  obj: Record<string, unknown>,
  password: string
) {
  const { key, salt } = await deriveKeyFromPassword(password, null);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = enc.encode(JSON.stringify(obj));

  const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const ciphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuf)));

  return { ciphertext, iv: btoa(String.fromCharCode(...Array.from(iv))), salt };
}

export async function decryptJSON(
  ciphertextB64: string,
  ivB64: string,
  saltB64: string,
  password: string
) {
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));

  const pwKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    pwKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['decrypt']
  );

  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  const text = dec.decode(plainBuf);
  return JSON.parse(text);
}
