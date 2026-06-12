import 'reflect-metadata';
import { validate } from './env.validation';

describe('env.validation', () => {
  const STRONG_SECRET = '0123456789abcdef0123456789abcdef';

  it('passes with a strong 32+ char JWT_SECRET', () => {
    expect(() => validate({ JWT_SECRET: STRONG_SECRET })).not.toThrow();
  });

  it('fails when JWT_SECRET is missing', () => {
    expect(() => validate({})).toThrow(/JWT_SECRET/);
  });

  it('fails when JWT_SECRET is shorter than 32 characters', () => {
    expect(() => validate({ JWT_SECRET: 'too-short-secret' })).toThrow(/JWT_SECRET/);
  });

  it('rejects the legacy 28-char default secret', () => {
    // The old hardcoded fallback was 'default-dev-secret-change-me' (28 chars).
    expect('default-dev-secret-change-me'.length).toBeLessThan(32);
    expect(() => validate({ JWT_SECRET: 'default-dev-secret-change-me' })).toThrow(/JWT_SECRET/);
  });
});
