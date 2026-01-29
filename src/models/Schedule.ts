import { RowDataPacket } from 'mysql2';

export interface Schedule extends RowDataPacket {
    id?: number;
    employee_id: number;
    shift_id: number;
    work_date: Date;
    status: 'scheduled' | 'off' | 'holiday';
    notes: string;
    created_at: Date;
    updated_at: Date;
}