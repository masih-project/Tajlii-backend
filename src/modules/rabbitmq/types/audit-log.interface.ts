export interface IAuditLog {
  action: 'DELETE' | 'UPDATE' | 'CREATE';
  model: string;
  docId: string;
  doc?: any;
  userId?: string;
  adminId?: string;
  date: number;
}
