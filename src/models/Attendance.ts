import { RowDataPacket } from 'mysql2';

export interface Attendance extends RowDataPacket {
    id?: number;        
    employee_id: number;
    shift_id: number;
    work_date: string;
    clock_in: Date;
    clock_out?: Date | null;
    status: 'incomplete' | 'complete';
    created_at: Date;
}