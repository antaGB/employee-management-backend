import { RowDataPacket } from 'mysql2';

export interface Shift extends RowDataPacket {
    id?: number;        
    code: string;
    name: string;
    start_time: string;
    end_time: string;
    total_time: number;
    isOvernight: boolean;
    created_at?: Date;
}