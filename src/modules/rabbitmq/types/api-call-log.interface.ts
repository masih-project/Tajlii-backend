export interface IApiCallLog {
  date: number;
  ip: string;
  userId?: string;
  adminId?: string;
  method: string;
  url: string;
  success: boolean;
  status: number;
  req: any;
  res?: any;
  err?: any;
}
