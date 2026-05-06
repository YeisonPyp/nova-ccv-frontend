export interface AuditCandidate {
  id: number;
  tableName: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  auditEntity: string | null;
}
