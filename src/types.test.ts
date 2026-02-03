import { describe, it, expect } from 'vitest';
import { Task, User, EnterpriseAuthSubmit, OptimizeRequest } from './types';

describe('Type Schemas', () => {
  describe('Task Schema', () => {
    it('should validate a valid task', () => {
      const validTask = {
        name: 'Test Task',
        slug: 'test-task',
        description: 'A test task',
        completed: false,
        due_date: new Date().toISOString(),
      };
      expect(() => Task.parse(validTask)).not.toThrow();
    });

    it('should require required fields', () => {
      const invalidTask = {
        name: 'Test Task',
        // missing slug, due_date
      };
      expect(() => Task.parse(invalidTask)).toThrow();
    });
  });

  describe('User Schema', () => {
    it('should validate a valid user', () => {
      const validUser = {
        id: 'user-123',
        email: 'test@example.com',
        balance: 200,
      };
      expect(() => User.parse(validUser)).not.toThrow();
    });

    it('should accept any string as email (format validation not enforced)', () => {
      const userEmail = {
        id: 'user-123',
        email: 'any-string',
        balance: 0,
      };
      expect(() => User.parse(userEmail)).not.toThrow();
    });
  });

  describe('EnterpriseAuthSubmit Schema', () => {
    it('should validate a valid auth submission', () => {
      const validAuth = {
        user_id: 'user-123',
        company_name: 'Test Company Ltd.',
        credit_code: '91110000MA00000001',
        license_image_url: 'https://example.com/license.jpg',
      };
      expect(() => EnterpriseAuthSubmit.parse(validAuth)).not.toThrow();
    });

    it('should require 18-digit credit code', () => {
      const invalidAuth = {
        user_id: 'user-123',
        company_name: 'Test Company Ltd.',
        credit_code: '123', // too short
        license_image_url: 'https://example.com/license.jpg',
      };
      expect(() => EnterpriseAuthSubmit.parse(invalidAuth)).toThrow();
    });
  });

  describe('OptimizeRequest Schema', () => {
    it('should validate a valid optimize request', () => {
      const validRequest = {
        user_id: 'user-123',
        stl_file_url: 'https://example.com/model.stl',
      };
      expect(() => OptimizeRequest.parse(validRequest)).not.toThrow();
    });

    it('should require valid URI for stl_file_url', () => {
      const invalidRequest = {
        user_id: 'user-123',
        stl_file_url: 'not-a-uri',
      };
      expect(() => OptimizeRequest.parse(invalidRequest)).toThrow();
    });
  });
});