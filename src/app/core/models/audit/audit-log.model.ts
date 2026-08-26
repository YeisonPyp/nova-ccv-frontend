export interface AuditLog {
  id: number;
  op: string;
  userAgent: string;
  sessionId: string;
  ipAddress: string;
  entityName: string;
  user?: AuditLogUser;
  oldRegistry: string | null;
  newRegistry: string | null;
  createdAt: string;
}

export interface AuditLogUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}
