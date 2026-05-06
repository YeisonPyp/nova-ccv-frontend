export interface AuditLog {
  id: number;
  op: string;
  userAgent: string;
  sessionId: string;
  userId: number;
  ipAddress: string;
  entityName: string;
  oldRegistry: string | null;
  newRegistry: string | null;
  createdAt: string;
}
