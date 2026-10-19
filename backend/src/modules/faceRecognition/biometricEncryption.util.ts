/**
 * Biometric Data Encryption Utility
 * Provides encryption for face embeddings and biometric data
 */

import crypto from 'crypto';

class BiometricEncryption {
  private algorithm = 'aes-256-cbc';
  private keyLength = 32; // 256 bits
  private ivLength = 16; // 128 bits
  private saltLength = 32;

  /**
   * Generate encryption key from tenant-specific secret
   */
  private generateKey(tenantSecret: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      tenantSecret,
      salt,
      100000, // iterations
      this.keyLength,
      'sha256'
    );
  }

  /**
   * Encrypt biometric data
   */
  encrypt(data: string, tenantSecret: string): string {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      
      // Generate key
      const key = this.generateKey(tenantSecret, salt);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine all components: salt + iv + encrypted
      const combined = Buffer.concat([
        salt,
        iv,
        Buffer.from(encrypted, 'hex')
      ]);
      
      // Return as base64
      return combined.toString('base64');
      
    } catch (error) {
      throw new Error(`Biometric encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt biometric data
   */
  decrypt(encryptedData: string, tenantSecret: string): string {
    try {
      // Decode base64
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.slice(0, this.saltLength);
      const iv = combined.slice(this.saltLength, this.saltLength + this.ivLength);
      const encrypted = combined.slice(this.saltLength + this.ivLength);
      
      // Generate key
      const key = this.generateKey(tenantSecret, salt);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
      
    } catch (error) {
      throw new Error(`Biometric decryption failed: ${error}`);
    }
  }

  /**
   * Encrypt face embedding vector
   */
  encryptEmbedding(embedding: number[], tenantSecret: string): string {
    const embeddingString = JSON.stringify(embedding);
    return this.encrypt(embeddingString, tenantSecret);
  }

  /**
   * Decrypt face embedding vector
   */
  decryptEmbedding(encryptedEmbedding: string, tenantSecret: string): number[] {
    const embeddingString = this.decrypt(encryptedEmbedding, tenantSecret);
    return JSON.parse(embeddingString);
  }

  /**
   * Hash biometric data for verification (one-way)
   */
  hashBiometricData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export const biometricEncryption = new BiometricEncryption();
