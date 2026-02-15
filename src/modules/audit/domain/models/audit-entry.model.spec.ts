import { AuditEntry } from './audit-entry.model';

describe('AuditEntry', () => {
  const validProps = {
    action: 'HTTP_REQUEST',
    resource: 'users',
    resourceId: '123',
    userId: 'user-1',
    userEmail: 'test@example.com',
    ipAddress: '127.0.0.1',
    method: 'GET',
    path: '/api/users',
    statusCode: 200,
    metadata: { key: 'value' },
    duration: 150,
  };

  describe('create', () => {
    it('should create an audit entry with all properties', () => {
      const entry = AuditEntry.create(validProps);

      expect(entry.id).toBeDefined();
      expect(entry.action).toBe('HTTP_REQUEST');
      expect(entry.resource).toBe('users');
      expect(entry.resourceId).toBe('123');
      expect(entry.userId).toBe('user-1');
      expect(entry.userEmail).toBe('test@example.com');
      expect(entry.ipAddress).toBe('127.0.0.1');
      expect(entry.method).toBe('GET');
      expect(entry.path).toBe('/api/users');
      expect(entry.statusCode).toBe(200);
      expect(entry.metadata).toEqual({ key: 'value' });
      expect(entry.duration).toBe(150);
      expect(entry.createdAt).toBeInstanceOf(Date);
    });

    it('should generate a unique id for each entry', () => {
      const entry1 = AuditEntry.create(validProps);
      const entry2 = AuditEntry.create(validProps);

      expect(entry1.id).not.toBe(entry2.id);
    });
  });

  describe('nullable fields', () => {
    it('should allow nullable resourceId, userId, userEmail, and metadata', () => {
      const entry = AuditEntry.create({
        action: 'HTTP_REQUEST',
        resource: 'health',
        ipAddress: '::1',
        method: 'GET',
        path: '/api/health',
        statusCode: 200,
        duration: 10,
      });

      expect(entry.resourceId).toBeUndefined();
      expect(entry.userId).toBeUndefined();
      expect(entry.userEmail).toBeUndefined();
      expect(entry.metadata).toBeUndefined();
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all fields', () => {
      const entry = AuditEntry.create(validProps);
      const json = entry.toJSON();

      expect(json).toEqual({
        id: entry.id,
        action: 'HTTP_REQUEST',
        resource: 'users',
        resourceId: '123',
        userId: 'user-1',
        userEmail: 'test@example.com',
        ipAddress: '127.0.0.1',
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        metadata: { key: 'value' },
        duration: 150,
        createdAt: expect.any(String) as unknown as string,
      });
    });

    it('should return createdAt as ISO string', () => {
      const entry = AuditEntry.create(validProps);
      const json = entry.toJSON();

      expect(() => new Date(json.createdAt)).not.toThrow();
    });
  });
});
