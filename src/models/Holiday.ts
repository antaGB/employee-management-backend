import { RowDataPacket } from 'mysql2';

export interface Holiday extends RowDataPacket {
    id?: number;        
    holiday_date: Date;
    name: string;
    is_national: boolean;
}