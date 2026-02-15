import { Email } from './email.value-object';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = Email.create('User@Example.COM');
    expect(email.value).toBe('user@example.com');
  });

  it('should normalize email to lowercase', () => {
    const email = Email.create('John.Doe@Gmail.Com');
    expect(email.value).toBe('john.doe@gmail.com');
  });

  it('should trim whitespace', () => {
    const email = Email.create('  user@example.com  ');
    expect(email.value).toBe('user@example.com');
  });

  it('should throw for invalid email', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email address');
  });

  it('should throw for empty string', () => {
    expect(() => Email.create('')).toThrow('Invalid email address');
  });

  it('should throw for email without domain', () => {
    expect(() => Email.create('user@')).toThrow('Invalid email address');
  });

  it('should support equality check', () => {
    const email1 = Email.create('user@example.com');
    const email2 = Email.create('USER@example.com');
    expect(email1.equals(email2)).toBe(true);
  });

  it('should detect inequality', () => {
    const email1 = Email.create('user1@example.com');
    const email2 = Email.create('user2@example.com');
    expect(email1.equals(email2)).toBe(false);
  });
});
