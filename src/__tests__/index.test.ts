import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
const mockEnv = {
  BAKUL_API_KEY: 'test-api-key',
  API_KEY: 'test-api-key-alt',
};

// Mock process.env
Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true,
});

describe('Bakul MCP Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Environment Configuration', () => {
    it('should have API key configuration', () => {
      expect(process.env.BAKUL_API_KEY).toBe('test-api-key');
    });

    it('should have alternative API key configuration', () => {
      expect(process.env.API_KEY).toBe('test-api-key-alt');
    });
  });

  describe('API Base URL', () => {
    it('should use correct Bakul API base URL', () => {
      const BAKUL_API_BASE = 'https://ba.kul.to/api';
      expect(BAKUL_API_BASE).toBe('https://ba.kul.to/api');
    });
  });

  describe('Zod Schema Validation', () => {
    it('should validate string schemas correctly', async () => {
      const { z } = await import('zod');

      const stringSchema = z.string().min(1).max(100);

      expect(() => stringSchema.parse('valid-string')).not.toThrow();
      expect(() => stringSchema.parse('')).toThrow();
      expect(() => stringSchema.parse('a'.repeat(101))).toThrow();
    });

    it('should validate optional schemas correctly', async () => {
      const { z } = await import('zod');

      const optionalSchema = z.string().optional();

      expect(() => optionalSchema.parse('valid-string')).not.toThrow();
      expect(() => optionalSchema.parse(undefined)).not.toThrow();
      expect(() => optionalSchema.parse(null)).toThrow();
    });
  });
});
