import { RowDataPacket } from 'mysql2';

export interface Leave extends RowDataPacket {
  id: number;
  employee_id: number;

  start_date: string; 
  end_date: string;

  type: 'annual' | 'sick' | 'unpaid' | 'special';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';

  reason?: string | null;

  approved_by?: number | null;
  approved_at?: Date | null;

  created_at: Date;
  updated_at: Date | null;
}