import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class NoteEncryptionService {
  private readonly logger = new Logger(NoteEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private static readonly AAD = Buffer.from('additional-data', 'utf8');
  private static readonly SALT = 'salt';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  constructor(private readonly configService: ConfigService) {
    this.getKey();
  }

  encrypt(plainText: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(NoteEncryptionService.IV_LENGTH);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      cipher.setAAD(NoteEncryptionService.AAD);
      let encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch {
      throw new Error('Data encryption failed');
    }
  }

  decrypt(encryptedText: string, context?: { noteId?: string; field?: string }): string {
    try {
      const [ivPart, authTagPart, payloadPart] = encryptedText.split(':');
      if (!ivPart || !authTagPart || !payloadPart) {
        throw new Error('Invalid encrypted note format');
      }

      const iv = Buffer.from(ivPart, 'hex');
      if (iv.length !== NoteEncryptionService.IV_LENGTH) {
        throw new Error('Invalid encrypted note format');
      }
      const authTag = Buffer.from(authTagPart, 'hex');
      if (authTag.length !== NoteEncryptionService.AUTH_TAG_LENGTH) {
        throw new Error('Invalid encrypted note auth tag');
      }

      const key = this.getKey();
      try {
        return this.decryptWithIv(key, iv, authTag, payloadPart);
      } catch (modernError) {
        try {
          return this.decryptLegacyPasswordMode(key, authTag, payloadPart);
        } catch (legacyError) {
          const modernReason = modernError instanceof Error ? modernError.message : 'unknown';
          const legacyReason = legacyError instanceof Error ? legacyError.message : 'unknown';
          throw new Error(
            `Unable to decrypt note in current or legacy mode (current=${modernReason}; legacy=${legacyReason})`,
          );
        }
      }
    } catch (error) {
      const diagnostics = this.getEncryptedTextDiagnostics(encryptedText);
      const target = `noteId=${context?.noteId ?? 'unknown'} field=${context?.field ?? 'unknown'}`;
      const reason = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Failed to decrypt note field (${target}) reason=${reason} diagnostics=${diagnostics}`);
      throw new Error('Data decryption failed');
    }
  }

  private getKey(): Buffer {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    return crypto.scryptSync(secret, NoteEncryptionService.SALT, NoteEncryptionService.KEY_LENGTH);
  }

  private decryptWithIv(key: Buffer, iv: Buffer, authTag: Buffer, payload: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAAD(NoteEncryptionService.AAD);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(payload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private decryptLegacyPasswordMode(key: Buffer, authTag: Buffer, payload: string): string {
    const ivLengths = [12, 16];
    let lastError: unknown = new Error('Legacy decrypt failed');

    for (const legacyIvLength of ivLengths) {
      try {
        const material = this.evpBytesToKey(key, NoteEncryptionService.KEY_LENGTH, legacyIvLength);
        const decipher = crypto.createDecipheriv(this.algorithm, material.key, material.iv);
        decipher.setAAD(NoteEncryptionService.AAD);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(payload, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Legacy decrypt failed');
  }

  private evpBytesToKey(password: Buffer, keyLength: number, ivLength: number): { key: Buffer; iv: Buffer } {
    let accumulated = Buffer.alloc(0);
    let previous = Buffer.alloc(0);

    while (accumulated.length < keyLength + ivLength) {
      const hash = crypto.createHash('md5');
      hash.update(previous);
      hash.update(password);
      previous = hash.digest();
      accumulated = Buffer.concat([accumulated, previous]);
    }

    return {
      key: accumulated.subarray(0, keyLength),
      iv: accumulated.subarray(keyLength, keyLength + ivLength),
    };
  }

  private getEncryptedTextDiagnostics(value: string): string {
    const parts = value.split(':');
    const ivPart = parts[0] ?? '';
    const authTagPart = parts[1] ?? '';
    const payloadPart = parts[2] ?? '';

    return JSON.stringify({
      partsCount: parts.length,
      ivLength: ivPart.length,
      authTagLength: authTagPart.length,
      payloadLength: payloadPart.length,
      ivIsHex: this.isHex(ivPart),
      authTagIsHex: this.isHex(authTagPart),
      payloadIsHex: this.isHex(payloadPart),
      hasUppercaseHex: /[A-F]/.test(value),
    });
  }

  private isHex(value: string): boolean {
    return value.length > 0 && value.length % 2 === 0 && /^[0-9a-f]+$/i.test(value);
  }
}
