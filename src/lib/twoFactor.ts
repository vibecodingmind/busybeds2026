import crypto from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;

function base32Encode(buffer: Buffer): string {
  let bits = '';
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0');
  }
  let result = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    result += BASE32_CHARS[parseInt(bits.substring(i, i + 5), 2)];
  }
  return result;
}

function generateSecret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  return base32Encode(bytes);
}

function generateTOTP(secret: string, time?: number): string {
  const timeCounter = Math.floor((time || Date.now() / 1000) / TOTP_PERIOD);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(timeCounter / 0x100000000), 0);
  buffer.writeUInt32BE(timeCounter & 0xffffffff, 4);

  // Decode base32 secret
  let bits = '';
  for (const char of secret) {
    const val = BASE32_CHARS.indexOf(char.toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const key = Buffer.alloc(Math.ceil(bits.length / 8));
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    key[i >> 3] = parseInt(bits.substring(i, i + 8), 2);
  }

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24 |
    (hmac[offset + 1] & 0xff) << 16 |
    (hmac[offset + 2] & 0xff) << 8 |
    (hmac[offset + 3] & 0xff)) % Math.pow(10, TOTP_DIGITS);

  return code.toString().padStart(TOTP_DIGITS, '0');
}

export function verifyTOTP(secret: string, code: string, window = 1): boolean {
  const now = Math.floor(Date.now() / 1000);
  for (let i = -window; i <= window; i++) {
    const time = now + i * TOTP_PERIOD;
    if (generateTOTP(secret, time) === code) return true;
  }
  return false;
}

export function setupTOTP(email: string): { secret: string; otpauthUrl: string } {
  const secret = generateSecret();
  const otpauthUrl = `otpauth://totp/BusyBeds:${encodeURIComponent(email)}?secret=${secret}&issuer=BusyBeds`;
  return { secret, otpauthUrl };
}

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}
