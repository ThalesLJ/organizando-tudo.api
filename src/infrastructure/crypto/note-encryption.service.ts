import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class NoteEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private static readonly AAD = Buffer.from('additional-data', 'utf8');
  private static readonly SALT = 'salt';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  constructor(private readonly configService: ConfigService) {
    this.getKey();
  }

  encrypt(plainText: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(NoteEncryptionService.IV_LENGTH);
      const cipher = this.createLegacyCipher(key);
      cipher.setAAD(NoteEncryptionService.AAD);
      let encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch {
      throw new Error('Data encryption failed');
    }
  }

  decrypt(encryptedText: string): string {
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

      const key = this.getKey();
      const decipher = this.createLegacyDecipher(key);
      decipher.setAAD(NoteEncryptionService.AAD);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(payloadPart, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
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

  private createLegacyCipher(key: Buffer) {
    return (crypto as unknown as { createCipher: (algorithm: string, password: Buffer) => any }).createCipher(
      this.algorithm,
      key,
    );
  }

  private createLegacyDecipher(key: Buffer) {
    return (crypto as unknown as { createDecipher: (algorithm: string, password: Buffer) => any }).createDecipher(
      this.algorithm,
      key,
    );
  }
}
