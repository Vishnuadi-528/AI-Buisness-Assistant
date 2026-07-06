'use strict';

// Must set env vars BEFORE requiring modules that read them at load time
process.env.DATABASE_URL        = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET   = 'test_access_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET  = 'test_refresh_secret_at_least_32_chars_long';
process.env.ANTHROPIC_API_KEY   = 'sk-ant-test-key';

const { signAccessToken, signRefreshToken, verifyRefreshToken, expiryDate } = require('../../src/utils/jwt');
const jwt = require('jsonwebtoken');

describe('JWT utilities', () => {
  const payload = { userId: 'user-uuid-123', email: 'test@example.com' };

  test('signAccessToken returns a valid JWT', () => {
    const token = signAccessToken(payload);
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.iss).toBe('ai-business-assistant');
  });

  test('signRefreshToken returns a valid JWT', () => {
    const token = signRefreshToken({ userId: payload.userId });
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  test('verifyRefreshToken verifies a token signed with the refresh secret', () => {
    const token = signRefreshToken({ userId: payload.userId });
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  test('verifyRefreshToken throws on tampered token', () => {
    const token = signRefreshToken({ userId: payload.userId });
    expect(() => verifyRefreshToken(token + 'tampered')).toThrow();
  });

  describe('expiryDate', () => {
    test('parses seconds correctly', () => {
      const before = Date.now();
      const date = expiryDate('30s');
      expect(date.getTime()).toBeGreaterThanOrEqual(before + 30000);
    });

    test('parses days correctly', () => {
      const before = Date.now();
      const date = expiryDate('7d');
      expect(date.getTime()).toBeGreaterThanOrEqual(before + 7 * 86400 * 1000);
    });

    test('throws on invalid format', () => {
      expect(() => expiryDate('invalid')).toThrow();
    });
  });
});
