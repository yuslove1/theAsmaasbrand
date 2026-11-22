// Isomorphic (Edge middleware + Node route handlers) signed session helper.
// Uses Web Crypto so the same code runs in both runtimes without extra deps.

export const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
  return secret
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes)
  let str = ''
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=')
  const str = atob(b64)
  const arr = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i)
  return arr
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_DURATION_MS
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp })).buffer as ArrayBuffer)
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${toBase64Url(sig)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  try {
    const key = await getKey()
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sig).buffer as ArrayBuffer,
      new TextEncoder().encode(payload)
    )
    if (!valid) return false
    const { exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)))
    return typeof exp === 'number' && Date.now() < exp
  } catch {
    return false
  }
}

// Route-handler guard: true only when the request carries a valid admin session cookie.
// The cookie is httpOnly + SameSite=Lax, so it is never readable from page JS and is not
// sent on cross-site POST/PUT/DELETE requests.
export async function isAdminRequest(req: { cookies: { get(name: string): { value: string } | undefined } }): Promise<boolean> {
  return verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}
