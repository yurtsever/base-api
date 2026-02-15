import { Password } from './password.value-object';

describe('Password Value Object', () => {
  describe('createFromPlaintext', () => {
    it('should create password with valid input', () => {
      const password = Password.createFromPlaintext('StrongP@ss1');
      expect(password.value).toBe('StrongP@ss1');
      expect(password.isHashed).toBe(false);
    });

    it('should throw for short password', () => {
      expect(() => Password.createFromPlaintext('Ab1@')).toThrow('at least 8 characters');
    });

    it('should throw for empty password', () => {
      expect(() => Password.createFromPlaintext('')).toThrow('at least 8 characters');
    });

    it('should throw for password without uppercase', () => {
      expect(() => Password.createFromPlaintext('strongp@ss1')).toThrow('uppercase');
    });

    it('should throw for password without lowercase', () => {
      expect(() => Password.createFromPlaintext('STRONGP@SS1')).toThrow('lowercase');
    });

    it('should throw for password without digit', () => {
      expect(() => Password.createFromPlaintext('StrongP@ss')).toThrow('digit');
    });

    it('should throw for password without special character', () => {
      expect(() => Password.createFromPlaintext('StrongPass1')).toThrow('special character');
    });
  });

  describe('createFromHash', () => {
    it('should create password from hash', () => {
      const hash = '$2b$12$somehashedvalue';
      const password = Password.createFromHash(hash);
      expect(password.value).toBe(hash);
      expect(password.isHashed).toBe(true);
    });
  });
});
